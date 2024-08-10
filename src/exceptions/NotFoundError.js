const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
