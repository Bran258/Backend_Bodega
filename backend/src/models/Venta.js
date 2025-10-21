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
  subtotal: {         // suma de todos los productos antes de impuestos
  type: Number,
  required: true,
  default: 0,
  min: [0, 'El subtotal no puede ser negativo']
  },
  igv: {              // monto del IGV
    type: Number,
    required: true,
    default: 0,
    min: [0, 'El IGV no puede ser negativo']
  },
  aplicarIGV: {      // si se aplica IGV o no
    type: Boolean,
    default: true
  },
  porcentajeIGV: {   // porcentaje de IGV
    type: Number,
    default: 18
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
  },
  motivoDesactivacion: { 
    type: String, 
    trim: true, 
    default: null 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venta', ventaSchema);
