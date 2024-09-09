const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const orgaoSchema = mongoose.Schema({
  nome: { type: String, unique: 'O Órgão {VALUE} está existe!' }
});

orgaoSchema.plugin(beautifyUnique);
module.exports = mongoose.model('orgaos', orgaoSchema);
