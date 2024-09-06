class UploadsHandler {
  constructor(service, validator, albumService) {
    this._service = service;
    this._validator = validator;
    this._albumService = albumService;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/${filename}`;

    await this._albumService.addAlbumCover(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Cover image uploaded successfully',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
