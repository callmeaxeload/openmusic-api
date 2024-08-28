const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._poll = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._poll.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist failed to add');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, playlists.name, users.username
      ORDER BY playlists.id`,
      values: [owner],
    };
    const result = await this._poll.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._poll.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete playlist. Id not found');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._poll.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist song failed to add');
    }
  }

  async getPlaylistSongById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const songQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlists
      JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      JOIN songs ON songs.id = playlist_songs.song_id WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._poll.query(query);
    const resultSongs = await this._poll.query(songQuery);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    const playlist = result.rows[0];
    const allResult = {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: resultSongs.rows,
    };
    return allResult;
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._poll.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist song failed to delete');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1 ',
      values: [playlistId],
    };
    const result = await this._poll.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }
    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('You are not the owner of this playlist');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
