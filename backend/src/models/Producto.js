const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoria: { type: String, required: true },
  proveedor: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
