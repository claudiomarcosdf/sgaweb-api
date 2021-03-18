const mongoose = require('mongoose');

mongoose.Error.messages.general.required = "O atributo '{PATH}' é obrigatório!";
mongoose.Error.messages.Number.min =
  "O valor '{VALUE}' informado é menor que o limite mínimo de '{MIN}'!";
mongoose.Error.messages.Number.max =
  "O valor '{VALUE}' informado é maior que o limite máximo de '{MAX}'!";
mongoose.Error.messages.String.enum =
  "O valor '{VALUE}' não está entre as opções válidas: '{ENUMVALUES}'!";
mongoose.Error.messages.Number.enum =
  "O valor '{VALUE}' não está entre as opções válidas: '{ENUMVALUES}'!";
mongoose.Error.messages.String.minlength =
  "A quantidade de caracteres em '{VALUE}' é menor que o limite mínimo de '{MINLENGTH}'!";
mongoose.Error.messages.String.maxlength =
  "A quantidade de caracteres em '{VALUE}' é maior que o limite máximo de '{MAXLENGTH}'!";
module.exports = mongoose.Error;
