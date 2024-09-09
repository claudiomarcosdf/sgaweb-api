const mongoose = require('mongoose');

const recebimentoSchema = mongoose.Schema({
  orgao: { type: String },
  ano: { type: String, min: 4, max: 4 },
  mes: { type: String, min: 2, max: 2 },
  matricula: { type: String },
  cpf: { type: String },
  nome: { type: String },
  controle: { type: String, min: 3, max: 3 },
  lotacao: { type: String },
  rubrica: { type: String },
  parcela: { type: String, min: 3, max: 3 }, //parcela
  valor: { type: Number },
});

module.exports = mongoose.model('recebimento', recebimentoSchema);
