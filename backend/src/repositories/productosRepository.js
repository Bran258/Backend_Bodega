const Producto = require('../models/Producto');

const obtenerTodos = async () => {
  return await Producto.find();
};

const crear = async (datos) => {
  const nuevoProducto = new Producto(datos);
  return await nuevoProducto.save();
};

module.exports = {
  obtenerTodos,
  crear
};
