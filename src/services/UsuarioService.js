const Usuario = require('../models/UsuarioModel');
const CreateError = require('../errors/CreateError');

class UsuarioService {
  getUsuario = async (email) => await Usuario.findOne({ email });
  register = async (nome, email, senha, perfis) => {
    const newUser = new Usuario({
      nome,
      email,
      senha,
      createdAt: new Date().toISOString(),
      perfis,
    });

    try {
      return await newUser.save();
    } catch (error) {
      throw new CreateError('Erro ao registrar usuário.');
    }
  };
}

module.exports = new UsuarioService();
