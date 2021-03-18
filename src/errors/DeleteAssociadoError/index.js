class DeleteAssociadoError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    this.message = message;
    this.name = 'DeleteAssociadoError';
  }
}

module.exports = DeleteAssociadoError;
