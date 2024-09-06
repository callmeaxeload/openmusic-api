class ExportsHandler {
  constructor(service, PlaylistsService, Validator) {
    this._service = service;
    this._playlistsService = PlaylistsService;
    this._validator = Validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);
    const { userId: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.getPlaylistById(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage(
      'export:playlists',
      JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message: 'Your export playlist request has been submitted',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
