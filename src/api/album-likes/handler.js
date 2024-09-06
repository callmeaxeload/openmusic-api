class AlbumLikesHandler {
  constructor(service, albumService) {
    this._service = service;
    this._albumService = albumService;

    this.postAlbumLikeHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikeHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    const alreadyLiked = await this._service.checkAlreadyLike(
      credentialId,
      albumId,
    );

    if (!alreadyLiked) {
      const likeId = await this._service.addAlbumLikes(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: `Success add likes with id: ${likeId}`,
      });
      response.code(201);
      return response;
    }

    await this._service.deleteAlbumLikes(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Success delete likes',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { albumId } = request.params;
    const data = await this.service.getLikesCount(albumId);
    const likes = data.count;

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', data.source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumLikesHandler;
