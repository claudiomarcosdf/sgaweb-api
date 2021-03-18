const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const empresaSchema = mongoose.Schema({
  codigo: { type: Number, unique: 'O código da empresa {VALUE} já existe!' },
  sigla: { type: String, unique: 'A Sigla {VALUE} está existe!' },
  nome: { type: String, unique: 'A Empresa {VALUE} está existe!' }
});

empresaSchema.plugin(beautifyUnique);
module.exports = mongoose.model('empresa', empresaSchema);
