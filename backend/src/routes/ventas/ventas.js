// routes/ventas/ventas.js
const express = require('express');
const router = express.Router();
const ventasProductosController = require('../../controllers/ventasProductosController');

// === Rutas para productos de las ventas ===

router.get('/lista', ventasProductosController.obtenerVentasProductos);
router.get('/producto/:id', ventasProductosController.obtenerVentaProductoPorId);
router.post('/crear_venta', ventasProductosController.crearVenta);
router.put('/actualizar_producto/:id', ventasProductosController.actualizarProductoEnVenta);
router.patch('/desactivar_venta/:id', ventasProductosController.desactivarVenta);


module.exports = router;
