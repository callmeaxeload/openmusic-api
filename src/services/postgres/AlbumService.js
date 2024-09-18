const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to add');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const songQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const resultSongs = await this._pool.query(songQuery);

    if (!result.rowCount) {
      throw new NotFoundError('Album not found');
    }

    const album = result.rows[0];
    const allResult = {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover_url,
      songs: resultSongs.rows,
    };

    return allResult;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Failed to edit album. Id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete album. Id not found');
    }
  }

  async updateAlbumCoverUrl({ id, url }) {
    // Check if the album exists
    const selctQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const selectResult = await this._pool.query(selctQuery);

    if (selectResult.rowCount === 0) {
      throw new NotFoundError('Album not found');
    }

    // Update the cover URL
    const updatedAt = new Date(Date.now());
    const query = {
      text: 'UPDATE albums SET cover_url=$2, updated_at = $3 WHERE id = $1',
      values: [id, url, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('Failed to update album cover');
    }
  }
}

module.exports = AlbumService;
