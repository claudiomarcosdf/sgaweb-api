const mongoose = require('mongoose');

const cpfDuplicadoSchema = mongoose.Schema({
  cpf: { type: String },
  total: { type: Number },
  ids: []
});

module.exports = mongoose.model('cpfs-duplicados', cpfDuplicadoSchema);