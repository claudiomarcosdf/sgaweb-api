class InputError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    this.message = message;
    this.name = InputError;
  }
}

module.exports = InputError;
