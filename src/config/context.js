const jwt = require('jwt-simple');

module.exports = async ({ req }) => {
  const auth = req.headers.authorization;
  const token = auth && auth.split('Bearer ')[1];

  let usuario = null;
  let superUser = false;
  let admin = false;

  if (token) {
    try {
      let contentToken = jwt.decode(token, process.env.AUTH_SECRET);
      if (new Date(contentToken.exp * 1000) > new Date()) {
        usuario = contentToken;
      }
    } catch (error) {
      throw new Error('Token inválido.' + error);
    }
  }

  if (usuario && usuario.perfis) {
    admin = usuario.perfis.includes('ADMIN');
    superUser = usuario.perfis.includes('SUPER');
  }

  const err = new Error('Acesso negado.');

  return {
    usuario,
    admin,
    superUser,
    validateUsuario() {
      if (!usuario) throw err;
    },
    validateMasters() {
      if (!admin && !superUser) throw err;
    },
    validateAdmin() {
      if (!admin) throw err;
    },
    validateSuperUser() {
      if (!superUser) throw err;
    },
  };
};
