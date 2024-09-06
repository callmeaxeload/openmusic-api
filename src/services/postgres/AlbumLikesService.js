const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLikes(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add like');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
    return result.rows[0].id;
  }

  async deleteAlbumLikes(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND "album_id" = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like failed to delete');
    }
    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async checkAlreadyLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND "album_id" = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async getLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return {
        count: JSON.parse(result),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE "album_id" = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Album did not have any likes');
      }

      await this._cacheService.set(
        `album_likes:${albumId}`,
        JSON.stringify(result.rowCount),
      );

      return {
        count: result.rowCount,
      };
    }
  }
}

module.exports = AlbumLikesService;
