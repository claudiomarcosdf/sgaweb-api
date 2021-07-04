module.exports.validateRegisterInput = (nome, email, senha, confirmaSenha) => {
  const errors = {};
  if (nome.trim() === '') {
    errors.nome = 'O nome é obrigatório';
  }
  if (email.trim() === '') {
    errors.email = 'O email é obrigatório';
  } else {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(regEx)) {
      errors.email = 'Email inválido.';
    }
  }
  if (senha.trim() === '') {
    errors.senha = 'A senha é obrigatória.';
  } else if (senha !== confirmaSenha) {
    errors.senha = 'As senhas não conferem.';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  };
};

module.exports.validateLoginInput = (email, senha) => {
  const errors = {};
  if (email.trim() === '') {
    errors.email = 'O email é obrigatório';
  } else {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(regEx)) {
      errors.email = 'Email inválido.';
    }
  }
  if (senha.trim() === '') {
    errors.senha = 'A senha é obrigatória.';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  };
};

module.exports.validateForgotEmail = (email) => {
  const errors = {};
  if (email.trim() === '') {
    errors.email = 'O email é obrigatório';
  } else {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(regEx)) {
      errors.email = 'Email inválido.';
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  };
};
