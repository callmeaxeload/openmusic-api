class PlaylistsHandler {
  constructor(playlistsService, songsService, activitiesService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._activitiesService = activitiesService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongByIdHandler = this.getPlaylistSongByIdHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });
    const response = h.response({
      status: 'success',
      message: 'Playlist successfully added',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);
    const response = h.response({
      status: 'success',
      message: 'Playlist successfully deleted',
    });
    response.code(200);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;

    await this._songsService.getSongById(songId);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistsService.addPlaylistSong(id, songId);

    const action = 'add';
    const time = new Date().toISOString();
    await this._activitiesService.addPlaylistSongActivities(id, {
      songId,
      userId: credentialId,
      action,
      time,
    });

    const response = h.response({
      status: 'success',
      message: 'Song successfully added to playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistsService.getPlaylistSongById(
      id,
      credentialId,
    );

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistsService.deletePlaylistSong(id, songId);

    const action = 'delete';
    const time = new Date().toISOString();
    await this._activitiesService.addPlaylistSongActivities(id, {
      songId,
      userId: credentialId,
      action,
      time,
    });

    const response = h.response({
      status: 'success',
      message: 'Song successfully deleted from playlist',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
