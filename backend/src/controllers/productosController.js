const productosRepository = require('../repositories/productosRepository');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await productosRepository.obtenerTodos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

exports.crearProducto = async (req, res) => {
  try {
    const producto = await productosRepository.crear(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

