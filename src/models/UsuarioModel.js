const { model, Schema } = require('mongoose');

const usuarioSchema = Schema({
  nome: String,
  email: String,
  senha: String,
  createdAt: String,
  perfis: [],
  resetLink: { data: String, default: '' }
});

module.exports = model('Usuario', usuarioSchema);
