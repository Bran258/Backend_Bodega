// repositories/ventaProductoRepository.js
const mongoose = require('mongoose');
const Venta = require('../models/Venta');
const VentaProducto = require('../models/VentaProducto');
const Producto = require('../models/Producto');
const IGV = require('../models/VentaIGV');

// 🔹 Función auxiliar: recalcula el total de una venta
const recalcularTotalVenta = async (ventaId) => {
  const productos = await VentaProducto.find({ venta: ventaId });
  const nuevoTotal = productos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
  await Venta.findByIdAndUpdate(ventaId, { total: nuevoTotal });
};

// Obtener todos los registros de productos vendidos (solo de ventas activas)
const obtenerTodos = async (estado) => {
  try {
    let match = {};
    if (estado === 'activa') match.estado = true;
    if (estado === 'desactivada') match.estado = false;

    const ventasProductos = await VentaProducto.find()
      .populate({
        path: 'venta',
        select: 'fecha total estado motivoDesactivacion clienteNombre clienteDNI personaGeneral',
        match
      })
      .populate('producto', 'nombre precio');

    // Filtrar solo los registros con venta válida
    return ventasProductos
      .filter(vp => vp.venta !== null)
      .map(vp => ({
        _id: vp._id,
        producto: vp.producto,
        cantidad: vp.cantidad,
        precioUnitario: vp.precioUnitario,
        subtotal: vp.subtotal,
        venta: {
          _id: vp.venta._id,
          fecha: vp.venta.fecha,
          total: vp.venta.total,
          estado: vp.venta.estado,
          motivoDesactivacion: vp.venta.motivoDesactivacion,
          cliente: vp.venta.personaGeneral
            ? 'Persona General'
            : `${vp.venta.clienteNombre} (DNI: ${vp.venta.clienteDNI || 'N/A'})`
        }
      }));
  } catch (error) {
    throw new Error('Error al obtener los productos de ventas: ' + error.message);
  }
};

// Ventas activas
const obtenerVentasActivas = async () => {
  return await VentaProducto.find()
    .populate({
      path: 'venta',
      select: 'fecha total estado',
      match: { estado: true }
    })
    .populate('producto', 'nombre precio')
    .then(res => res.filter(vp => vp.venta !== null));
};

// Ventas desactivadas
const obtenerVentasDesactivadas = async () => {
  return await VentaProducto.find()
    .populate({
      path: 'venta',
      select: 'fecha total estado motivoDesactivacion',
      match: { estado: false }
    })
    .populate('producto', 'nombre precio')
    .then(res => res.filter(vp => vp.venta !== null));
};

// Obtener un producto de venta por su ID
const obtenerPorId = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const ventaProducto = await VentaProducto.findById(id)
      .populate('venta', 'fecha total estado')
      .populate('producto', 'nombre precio');

    if (!ventaProducto) {
      throw new Error('Producto de venta no encontrado');
    }

    if (!ventaProducto.venta?.estado) {
      throw new Error('La venta asociada está desactivada');
    }

    return ventaProducto;
  } catch (error) {
    throw new Error('Error al obtener el producto de venta: ' + error.message);
  }
};

// Crear una nueva venta

const crearVenta = async (datos) => {
  try {
    const { 
      clienteId, 
      clienteNombre, 
      clienteDNI, 
      personaGeneral = true, 
      productos,
      aplicarIGV = true,      
      porcentajeIGV = 18      
    } = datos;

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new Error('La venta debe contener al menos un producto');
    }

    // Crear venta inicial
    const nuevaVenta = new Venta({
      clienteId: clienteId || null,
      clienteNombre: clienteNombre || (personaGeneral ? 'Persona General' : undefined),
      clienteDNI: clienteDNI || (personaGeneral ? null : undefined),
      personaGeneral: !!personaGeneral,
      productos: [],
      subtotal: 0,
      igv: 0,
      total: 0
    });

    await nuevaVenta.save();

    let subtotal = 0;

    // Recorrer productos y crear VentaProducto
    for (const item of productos) {
      const { productoId, nombre, cantidad } = item;

      if (typeof cantidad !== 'number' || cantidad <= 0) {
        throw new Error(`Cantidad inválida para el producto ${productoId || nombre}`);
      }

      let producto;

      if (productoId) {
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
          throw new Error(`productoId inválido: ${productoId}`);
        }
        producto = await Producto.findById(productoId);
      } else if (nombre) {
        producto = await Producto.findOne({ nombre });
      } else {
        throw new Error('Se debe proporcionar productoId o nombre para cada producto');
      }

      if (!producto) {
        throw new Error(`Producto no encontrado: ${productoId || nombre}`);
      }

      // Validar stock
      if (typeof producto.stock === 'number' && producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
      }

      const precioUnitario = producto.precio;
      const subtotalProducto = cantidad * precioUnitario;

      // Crear registro de VentaProducto
      const nuevoVP = new VentaProducto({
        venta: nuevaVenta._id,
        producto: producto._id,
        cantidad,
        precioUnitario,
        subtotal: subtotalProducto
      });

      await nuevoVP.save();

      nuevaVenta.productos.push(nuevoVP._id);
      subtotal += subtotalProducto;

      // Actualizar stock y activar/desactivar producto
      if (typeof producto.stock === 'number') {
        producto.stock -= cantidad;
        producto.estado = producto.stock > 0;
        await producto.save();
      }
    }

    // Calcular IGV según decisión del usuario
    const montoIGV = aplicarIGV ? subtotal * (porcentajeIGV / 100) : 0;

    // Guardar totales en Venta
    nuevaVenta.subtotal = subtotal;
    nuevaVenta.igv = montoIGV;
    nuevaVenta.total = subtotal + montoIGV;
    await nuevaVenta.save();

    // Guardar en modelo IGV
    await IGV.create({
      venta: nuevaVenta._id,
      aplicar: aplicarIGV,
      porcentaje: porcentajeIGV,
      monto: montoIGV
    });

    // Devolver venta completa con productos poblados
    return await Venta.findById(nuevaVenta._id)
      .populate({
        path: 'productos',
        populate: { path: 'producto', select: 'nombre precio stock estado' }
      });

  } catch (error) {
    throw new Error('Error al crear la venta: ' + error.message);
  }
};


// Actualizar un producto dentro de una venta
const actualizar = async (ventaId, productosActualizados) => {
  try {
    const venta = await Venta.findById(ventaId).populate({
      path: 'productos',
      populate: { path: 'producto', select: 'nombre precio stock estado' }
    });
    if (!venta) throw new Error('Venta no encontrada');

    let total = 0;

    for (const item of productosActualizados) {
      const { productoId, cantidad } = item;

      if (!mongoose.Types.ObjectId.isValid(productoId)) {
        throw new Error(`productoId inválido: ${productoId}`);
      }
      if (typeof cantidad !== 'number' || cantidad <= 0) {
        throw new Error(`Cantidad inválida para producto ${productoId}`);
      }

      let vp = await VentaProducto.findOne({ venta: ventaId, producto: productoId }).populate('producto');
      const producto = await Producto.findById(productoId);
      if (!producto) throw new Error(`Producto no encontrado: ${productoId}`);

      if (vp) {
        // Ajustar stock según diferencia
        const diferencia = cantidad - vp.cantidad;

        if (diferencia > 0 && producto.stock < diferencia) {
          throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
        }

        producto.stock -= diferencia;

        // 🔹 Activar/desactivar automáticamente según stock
        producto.estado = producto.stock > 0;

        await producto.save();

        vp.cantidad = cantidad;
        vp.subtotal = cantidad * vp.precioUnitario;
        await vp.save();

      } else {
        // Nuevo producto agregado
        if (producto.stock < cantidad) {
          throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
        }

        const nuevoVP = new VentaProducto({
          venta: venta._id,
          producto: producto._id,
          cantidad,
          precioUnitario: producto.precio,
          subtotal: cantidad * producto.precio
        });

        await nuevoVP.save();
        venta.productos.push(nuevoVP._id);

        producto.stock -= cantidad;

        // 🔹 Activar/desactivar automáticamente según stock
        producto.estado = producto.stock > 0;

        await producto.save();
      }
    }

    // Recalcular total
    const productosEnVenta = await VentaProducto.find({ venta: ventaId });
    total = productosEnVenta.reduce((sum, p) => sum + (p.subtotal || 0), 0);

    venta.total = total;
    await venta.save();

    return await Venta.findById(ventaId).populate({
      path: 'productos',
      populate: { path: 'producto', select: 'nombre precio stock estado' }
    });

  } catch (error) {
    throw new Error('Error al actualizar la venta: ' + error.message);
  }
};

// Desactivar una venta (lógica)
const desactivar = async (ventaId, motivo) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ventaId)) {
      throw new Error('ID de venta inválido');
    }

    const venta = await Venta.findById(ventaId);
    if (!venta) throw new Error('Venta no encontrada');

    venta.estado = false;
    venta.motivoDesactivacion = motivo || 'No especificado';
    await venta.save();

    // Recalcular total si es necesario
    await recalcularTotalVenta(ventaId);

    return { message: 'Venta desactivada correctamente', motivo: venta.motivoDesactivacion };
  } catch (error) {
    throw new Error('Error al desactivar la venta: ' + error.message);
  }
};



module.exports = {
  obtenerTodos,
  obtenerVentasActivas,
  obtenerVentasDesactivadas,
  obtenerPorId,
  crearVenta,
  actualizar,
  desactivar
};

