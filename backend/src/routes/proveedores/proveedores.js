// routes/compras/comprasProveedor.js
const express = require('express');
const router = express.Router();
const compraProveedorController = require('../../controllers/compraProveedorController');

// === Rutas para compras a proveedores ===
router.get('/lista_pedidos', compraProveedorController.listarCompras);
router.get('/pedido/:numeroPedido', compraProveedorController.obtenerCompraPorNumeroPedido);
router.post('/crear_pedido', compraProveedorController.crearCompra);
router.put('/actualizar/:id', compraProveedorController.actualizarCompra);
router.patch('/cancelar/:numeroPedido', compraProveedorController.cancelarCompra);

module.exports = router;
