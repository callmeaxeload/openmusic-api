const PlaylistService = require('../../services/postgres/PlaylistService');

class ExportsHandler {
  constructor(service, validator, collaborationsService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = new PlaylistService(collaborationsService);

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      userId: request.auth.credentials.id,
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage(
      'export:playlists',
      JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message:
        'Your request still in progress, please check your email for further instructions',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
