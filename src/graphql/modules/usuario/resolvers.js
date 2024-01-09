const UsuarioService = require('../../../services/UsuarioService');
//const { UserInputError } = require('@apollo/server');
const { GraphQLError } = require('graphql');
const {
  validateRegisterInput,
  validateLoginInput,
  validateForgotEmail
} = require('../../../common/validators');
const bcryptjs = require('bcryptjs');
const jwt = require('jwt-simple');
const nodemailer = require('nodemailer');

function generateToken(usuario) {
  const now = Math.floor(Date.now() / 1000);
  const usuarioInfo = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    createdAt: usuario.createdAt,
    perfis: usuario.perfis,
    iat: now,
    exp: now + 1 * 24 * 60 * 60 //token válido por um dia
  };

  return {
    ...usuarioInfo,
    token: jwt.encode(usuarioInfo, process.env.AUTH_SECRET)
  };
}

function generateCodeToken(id) {
  const now = Math.floor(Date.now() / 1000);
  const obj = {
    _id: id,
    iat: now,
    exp: now + 1 * 1 * 60 * 60 //token válido por uma hora
  };

  return jwt.encode(obj, process.env.KEY_RESET_PASSWORD);
}

function verifyCodeToken(codeToken) {
  try {
    const contentToken = jwt.decode(codeToken, process.env.KEY_RESET_PASSWORD);

    if (new Date(contentToken.exp * 1000) > new Date()) {
      usuario = contentToken;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error('Token inválido ou expirado.');
  }
}

async function sendEmail(usuario, errors) {
  const codeToken = generateCodeToken(usuario.id);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PW
    }
  });
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: usuario.email,
    subject: 'Link de recuperação de senha',
    html: `
    <h2>Por favor click sobre o link para recuperar sua senha no sistema SGAWEB</h2>
    <p><a href="${process.env.CLIENT_URL}/reset-password?code=${codeToken}">${process.env.CLIENT_URL}/reset-password?code=${codeToken}</p>
    `
  };

  await transporter.sendMail(mailOptions)
  .then((res) => { 
     console.log('Mail sended.')
  }
  )
  .catch((err) => {
    errors.general = `Erro no envio do email. 
                      Mensagem original: [${err}]`;
	throw new GraphQLError('Erro no envio do email.', {
	  extensions: {
		code: 'BAD_USER_INPUT',
		myExtension: { errors },
	  },
	});					  
    //throw new UserInputError('Erro no envio do email.', { errors });
  });

  return await UsuarioService.resetLink(usuario.id, codeToken);

  // transporter.sendMail(mailOptions, async (err, data) => {
  //   if (err) {
  //     errors.general = `Erro no envio do email. [${err}]`;
  //     throw new UserInputError('Erro no envio do email.', { errors });
  //   }
     
  //   if (data) {
  //     //update user.resetLink
  //     return await UsuarioService.resetLink(usuario.id, codeToken);
      
  //     console.log('Código de recuperação de senha enviado com sucesso!');
  //   }
  // }); 

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

      const senhaCrypted = await bcryptjs.hash(senha, 12);

      const novoUsuario = await UsuarioService.register(
        nome,
        email,
        senhaCrypted,
        dados.perfis
      );
      return generateToken(novoUsuario);
    },
    forgotPassword: async (_, { email }) => {
      const usuario = await UsuarioService.getUsuario(email);
      const { errors, valid } = validateForgotEmail(email);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      if (!usuario) {
        errors.general = 'Usuário não encontrado.';
        throw new UserInputError('Usuário não encontrado', { errors });
      }

      //Enviar email de recuperação
      return await sendEmail(usuario, errors);
    },
    resetPassword: async (_, { codeToken, newPassword }) => {
      const errors = {};
      if (!codeToken) {
        errors.general = 'Código do token inválido!';
        throw new UserInputError('Código do token inválido!', { errors });
      } else {
        if (verifyCodeToken(codeToken)) {
          //
          const senhaCrypted = await bcryptjs.hash(newPassword, 12);

          const success = await UsuarioService.saveNewPassword(
            codeToken,
            senhaCrypted
          );
          return success;
        }
      }
    }
  }
};
