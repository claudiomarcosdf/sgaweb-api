const UsuarioService = require('../../../services/UsuarioService');
const { UserInputError } = require('apollo-server');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../../common/validators');
const bcryptjs = require('bcryptjs');
const jwt = require('jwt-simple');

function generateToken(usuario) {
  const now = Math.floor(Date.now() / 1000);
  const usuarioInfo = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    createdAt: usuario.createdAt,
    perfis: usuario.perfis,
    iat: now,
    exp: now + 1 * 24 * 60 * 60, //token válido por um dia
  };

  return {
    ...usuarioInfo,
    token: jwt.encode(usuarioInfo, process.env.AUTH_SECRET),
  };
}

module.exports = {
  Mutation: {
    login: async (_, { email, senha }) => {
      const { errors, valid } = validateLoginInput(email, senha);
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const usuario = await UsuarioService.getUsuario(email);
      if (!usuario) {
        errors.general = 'Usuário não encontrado.';
        throw new UserInputError('Usuário não encontrado', { errors });
      }

      const senhasConferem = await bcryptjs.compare(senha, usuario.senha);
      if (!senhasConferem) {
        errors.general = 'Usuário/Senha inválidos.';
        throw new UserInputError('Usuário/Senha inválidos.', { errors });
      }

      return generateToken(usuario);
    },
    register: async (_, { dados }, context) => {
      const { nome, email, senha, confirmaSenha } = dados;
      const { errors, valid } = validateRegisterInput(
        nome,
        email,
        senha,
        confirmaSenha
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const usuario = await UsuarioService.getUsuario(email);
      if (usuario) {
        errors.general = 'Usuário já registrado.';
        throw new UserInputError('Usuário já registrado.', { errors });
      }

      if (!dados.perfis || !dados.perfis.length) {
        dados.perfis = ['COMUM'];
      } else {
        context && context.validateMasters(); //verifica se é adm ou super
      }

      const senhaCrypt = await bcryptjs.hash(senha, 12);

      const novoUsuario = await UsuarioService.register(
        nome,
        email,
        senhaCrypt,
        dados.perfis
      );
      return generateToken(novoUsuario);
    },
  },
};
