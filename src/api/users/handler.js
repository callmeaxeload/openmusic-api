class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;
    const userId = await this._service.addUser({
      username,
      fullname,
      password,
    });
    const response = h.response({
      status: 'success',
      message: 'User successfully registered',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
