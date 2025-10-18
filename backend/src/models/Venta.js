const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: false
  },
  clienteNombre: {
    type: String,
    trim: true,
    default: 'Persona General'
  },
  clienteDNI: {
    type: String,
    trim: true,
    default: null
  },
  personaGeneral: {
    type: Boolean,
    default: true
  },
  productos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VentaProducto',
      required: false
    }
  ],
  fecha: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'El total no puede ser negativo']
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venta', ventaSchema);
