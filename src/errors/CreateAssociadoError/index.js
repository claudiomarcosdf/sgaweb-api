// *** AS MENSAGENS DEVEM TODAS TERMINAR COM ! (EXCLAMAÇÃO) ***

class CreateAssociadoError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    let newMessage = '';

    if (message.indexOf('ValidationError') !== -1) {
      const firstPart = message.substr(
        message.indexOf('ValidationError') + 16,
        message.length
      );

      const secondPart = firstPart
        .substr(firstPart.indexOf(':') + 1, firstPart.length)
        .trim();

      newMessage = secondPart.substr(0, secondPart.indexOf('!') + 1);
    } else {
      newMessage = message.substr(0, message.indexOf('.') + 1);
    }

    this.message = newMessage;
    this.name = 'CreateAssociadoError';
  }
}

module.exports = CreateAssociadoError;
