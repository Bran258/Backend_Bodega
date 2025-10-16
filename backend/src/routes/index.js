const express = require('express');
const router = express.Router();

// Importar subrutas
const productosRouter = require('./productos/Productos');
//const proveedoresRouter = require('./proveedores/proveedores');
//const ventasRouter = require('./ventas/ventas');
//const comprasRouter = require('./compras/compras');

// Usar rutas
router.use('/productos', productosRouter);
//router.use('/proveedores', proveedoresRouter);
//router.use('/ventas', ventasRouter);
//router.use('/compras', comprasRouter);

// Ruta raíz de la API
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la bodega 🍷' });
});

module.exports = router;


