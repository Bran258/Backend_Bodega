// models/CompraProveedor.js
const mongoose = require('mongoose');

const CompraProveedorSchema = new mongoose.Schema({
  numeroPedido: { type: String, required: true }, // reemplaza factura por "Número de Pedido"
  fechaCompra: { type: Date, required: true },
  fechaEntrega: { type: Date },
  proveedor: { type: String, required: true },
  productos: [
    {
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true },
      precioUnitario: { type: Number, required: true },
      subtotal: { type: Number, required: true },
    },
  ],
  totalCompra: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
}, { timestamps: true });

module.exports = mongoose.model('CompraProveedor', CompraProveedorSchema);
