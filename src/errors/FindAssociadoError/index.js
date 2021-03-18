class FindAssociadoError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    this.message = message;
    this.name = 'FindAssociadoError';
  }
}

module.exports = FindAssociadoError;
