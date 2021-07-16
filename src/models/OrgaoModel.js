const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const orgaoSchema = mongoose.Schema({
  codigo: { type: String, unique: 'O código do órgão {VALUE} já existe!' },
  sigla: { type: String, unique: 'A Sigla {VALUE} está existe!' },
  nome: { type: String, unique: 'O Órgão {VALUE} está existe!' }
});

orgaoSchema.plugin(beautifyUnique);
module.exports = mongoose.model('orgao', orgaoSchema);
