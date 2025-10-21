// repositories/productosRepository.js

const Producto = require('../models/Producto');

// Obtener todos los productos activos
const obtenerTodos = async () => {
  try {
    return await Producto.find({ estado: true });
  } catch (error) {
    throw new Error('Error al obtener los productos: ' + error.message);
  }
};

// Obtener un producto por su ID
const obtenerPorId = async (id) => {
  try {
    return await Producto.findById(id);
  } catch (error) {
    throw new Error('Error al obtener el producto: ' + error.message);
  }
};

// Obtener un producto por nombre (coincidencia parcial, insensible a mayúsculas)
const obtenerPorNombre = async (nombre) => {
  try {
    return await Producto.find({
      nombre: { $regex: nombre, $options: "i" }, // búsqueda parcial, insensible a mayúsculas
      //estado: true, // solo productos activos
    });
  } catch (error) {
    throw new Error('Error al obtener el producto por nombre: ' + error.message);
  }
};



// Crear un nuevo producto
const crear = async (datos) => {
  try {
    const nuevoProducto = new Producto({
      nombre: datos.nombre,
      precio: datos.precio,
      stock: datos.stock,
      categoria: datos.categoria,
      proveedor: datos.proveedor || null, // opcional
      estado: true
    });

    await nuevoProducto.save();
    return nuevoProducto;
  } catch (error) {
    throw new Error('Error al crear el producto: ' + error.message);
  }
};

// Actualizar un producto existente
const actualizar = async (id, datos) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      {
        nombre: datos.nombre,
        precio: datos.precio,
        stock: datos.stock,
        categoria: datos.categoria,
        proveedor: datos.proveedor,
      },
      { new: true, runValidators: true }
    );

    return productoActualizado;
  } catch (error) {
    throw new Error('Error al actualizar el producto: ' + error.message);
  }
};

// Desactivar un producto (eliminación lógica)
const desactivar = async (id) => {
  try {
    const productoDesactivado = await Producto.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    );
    return productoDesactivado;
  } catch (error) {
    throw new Error('Error al desactivar el producto: ' + error.message);
  }
};

// Activar un producto
const activar = async (id) => {
  return await Producto.findByIdAndUpdate(
    id,
    { estado: true },
    { new: true, runValidators: true }
  ).lean();
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorNombre,
  crear,
  actualizar,
  desactivar,
  activar,
};

