class NotFoundError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    this.message = message;
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
