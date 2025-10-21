// controllers/compraProveedorController.js
const compraRepository = require('../repositories/compraProveedorRepository');

exports.crearCompra = async (req, res) => {
  try {
    const compra = await compraRepository.crearCompra(req.body);
    res.status(201).json({ message: 'Compra registrada correctamente', compra });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.listarCompras = async (req, res) => {
  try {
    const compras = await compraRepository.listarCompras();
    res.status(200).json(compras);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerCompraPorNumeroPedido = async (req, res) => {
  try {
    const compra = await compraRepository.obtenerCompraPorNumeroPedido(req.params.numeroPedido);
    if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });
    res.status(200).json(compra);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.actualizarCompra = async (req, res) => {
  try {
    const compra = await compraRepository.actualizarCompra(req.params.id, req.body);
    res.status(200).json({ message: 'Compra actualizada', compra });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.cancelarCompra = async (req, res) => {
  try {
    const compra = await compraRepository.cancelarCompra(req.params.numeroPedido);
    if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });

    res.status(200).json({ 
      message: 'Compra cancelada correctamente', 
      compra 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
