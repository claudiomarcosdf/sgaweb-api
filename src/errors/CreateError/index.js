class CreateError extends Error {
  constructor(message, ...args) {
    super(message, ...args)
    
    this.message = message
    this.name = CreateError
  }
}

module.exports = CreateError;