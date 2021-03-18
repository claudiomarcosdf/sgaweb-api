const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { generateMatricula } = require('../common/helpers');

const contatos = {
  celular1: { type: String, required: true },
  celular2: { type: String },
  telefoneresidencia: { type: String },
  telefonetrabalho: { type: String },
  email: { type: String }
};

const endereco = {
  cep: { type: String },
  logradouro: { type: String },
  cidade: { type: String },
  bairro: { type: String },
  estado: { type: String },
  contatos: { type: contatos }
};

const dadosPessoais = new mongoose.Schema({
  dtnascimento: { type: Date, required: true },
  cpf: { type: String, required: true },
  rg: { type: String },
  sexo: { type: String, enum: ['Masculino', 'Feminino'] },
  estadocivil: {
    type: String,
    enum: ['Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'Divorciado(a)']
  }
});

const empresa = {
  sigla: { type: String, required: true },
  nome_empresa: { type: String },
  orgao: { type: String },
  funcao: { type: String },
  dtadmissao: { type: Date },
  aposentado: { type: Boolean, default: false }
};

const associadoSchema = mongoose.Schema({
  matricula: {
    type: String,
    unique: 'A matrícula {VALUE} está sendo usada por outro associado!'
  },
  matsindicato: {
    type: String,
    unique: 'A matrícula {VALUE} está existe!'
  },
  nome: { type: String, required: true },
  dtfiliacao: { type: Date, default: Date.now },
  dados_pessoais: { type: dadosPessoais },
  endereco: { type: endereco },
  status: {
    type: String,
    upperCase: true,
    enum: ['ATIVO', 'INATIVO'],
    default: 'ATIVO'
  },
  inativoAt: { type: Date },
  empresa: { type: empresa }
});

associadoSchema.pre('save', function () {
  if (!this.matsindicato) this.matsindicato = generateMatricula(13);
});

associadoSchema.plugin(beautifyUnique);
module.exports = mongoose.model('associado', associadoSchema);
