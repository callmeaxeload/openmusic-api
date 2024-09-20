const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapUserAlbumLikesDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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

  async addAlbumLikes(albumId, userId) {
    const query = {
      text: 'SELECT * FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      await this.doLikeAlbum(albumId, userId);
      await this._cacheService.delete(`album:${albumId}:likes`);
    } else {
      throw new InvariantError('User has already liked this album');
    }
  }

  async doLikeAlbum(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO album_likes(id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Failed to like album');
    }
  }

  async doUnlikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);
    await this._cacheService.delete(`album:${albumId}:likes`);

    if (!result.rowCount) {
      throw new InvariantError('Failed to unlike album');
    }
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}:likes`);

      return {
        likes: JSON.parse(result),
        isCache: 1,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapUserAlbumLikesDBToModel);

      await this._cacheService.set(
        `album:${albumId}:likes`,
        JSON.stringify(mappedResult),
      );

      return {
        likes: mappedResult,
      };
    }
  }
}

module.exports = AlbumService;
