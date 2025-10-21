// repositories/compraProveedorRepository.js
const CompraProveedor = require('../models/CompraProveedor');


const generarNumeroPedido = async () => {
  // Buscar la última compra ordenada por fecha de creación
  const ultimaCompra = await CompraProveedor.findOne().sort({ createdAt: -1 });

  if (!ultimaCompra) return 'PED-01'; // Si no hay ninguna compra, empezamos en PED-01

  // Extraer el número del pedido
  const ultimoNumero = parseInt(ultimaCompra.numeroPedido.split('-')[1], 10);
  const nuevoNumero = (ultimoNumero + 1).toString().padStart(2, '0'); // Asegura dos dígitos
  return `PED-${nuevoNumero}`;
};

const crearCompra = async (compraData) => {
  // Generar número de pedido automático
  const numeroPedido = await generarNumeroPedido();

  // Calcular subtotales y total
  let totalCompra = 0;
  const productosConSubtotal = compraData.productos.map(p => {
    const subtotal = p.cantidad * p.precioUnitario;
    totalCompra += subtotal;
    return { ...p, subtotal };
  });

  const nuevaCompra = new CompraProveedor({
    ...compraData,
    numeroPedido,
    productos: productosConSubtotal,
    totalCompra
  });

  return await nuevaCompra.save();
};


const listarCompras = async () => {
  return await CompraProveedor.find();
};

const obtenerCompraPorNumeroPedido = async (numeroPedido) => {
  return await CompraProveedor.findOne({ numeroPedido });
};

const actualizarCompra = async (id, compraData) => {
  let totalCompra = 0;
  const productosConSubtotal = compraData.productos.map(p => {
    const subtotal = p.cantidad * p.precioUnitario;
    totalCompra += subtotal;
    return { ...p, subtotal };
  });

  return await CompraProveedor.findByIdAndUpdate(
    id,
    { ...compraData, productos: productosConSubtotal, totalCompra },
    { new: true }
  );
};

const cancelarCompra = async (numeroPedido) => {
  // Buscar la compra por numeroPedido y actualizar estado
  return await CompraProveedor.findOneAndUpdate(
    { numeroPedido },
    { estado: 'cancelado' },
    { new: true }
  );
};
module.exports = {
  crearCompra,
  listarCompras,
  obtenerCompraPorNumeroPedido,
  actualizarCompra,
  cancelarCompra
};
