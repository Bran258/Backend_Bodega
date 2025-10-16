const express = require('express');
const router = express.Router();
const productosController = require('../../controllers/productosController');

// GET /api/productos
router.get('/lista_productos', productosController.obtenerProductos);

// POST /api/productos
router.post('/crear', productosController.crearProducto);

// PUT /api/productos/:id
//router.put('/:id', productosController.actualizarProducto);

// DELETE /api/productos/:id
//router.delete('/:id', productosController.eliminarProducto);

module.exports = router;
