class UpdateAssociadoError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    this.message = message;
    this.name = 'UpdateAssociadoError';
  }
}

module.exports = UpdateAssociadoError;
