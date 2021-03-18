class GeneralError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    this.message = message;
    this.name = GeneralError;
  }
}

module.exports = GeneralError;
