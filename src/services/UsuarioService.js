const Usuario = require('../models/UsuarioModel');
const CreateError = require('../errors/CreateError');
const NotFoundError = require('../errors/NotFoundError');
const _ = require('lodash');

class UsuarioService {
  getUsuario = async (email) => await Usuario.findOne({ email });
  register = async (nome, email, senha, perfis) => {
    const newUser = new Usuario({
      nome,
      email,
      senha,
      createdAt: new Date().toISOString(),
      perfis
    });

    try {
      return await newUser.save();
    } catch (error) {
      throw new CreateError('Erro ao registrar usuário.');
    }
  };
  resetLink = async (id, codeToken) => {
    try {
      const user = await Usuario.findByIdAndUpdate(
        { _id: id },
        { resetLink: codeToken },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('Usuário não encontrado!');
      } else {
        return true;
      }
    } catch (error) {
      throw new NotFoundError('Erro ao redefinir link de senha.');
    }
  };
  saveNewPassword = async (codeToken, newPassword) => {
    let user = await Usuario.findOne({ resetLink: codeToken });

    if (!user) {
      throw new NotFoundError('O token não existe para este usuário.');
    } else {
      const obj = {
        senha: newPassword,
        resetLink: ''
      };

      user = _.extend(user, obj);

      try {
        user.save((err, result) => {
          if (err) {
            throw new Error('Erro ao resetar a senha.');
          }
        });
        return true;
      } catch (error) {
        throw new NotFoundError('Erro ao buscar o token do usuário.');
      }
    }
  };
}

module.exports = new UsuarioService();
