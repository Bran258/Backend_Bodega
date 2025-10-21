const mongoose = require('mongoose');

const igvSchema = new mongoose.Schema({
  venta: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: true },
  aplicar: { type: Boolean, default: true },
  porcentaje: { type: Number, default: 18 },
  monto: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('IGV', igvSchema);
