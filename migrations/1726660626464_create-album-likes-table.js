/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('album_likes', {
    id: {
      type: 'text',
      primaryKey: true,
    },
    user_id: {
      type: 'text',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    album_id: {
      type: 'text',
      notNull: true,
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('album_likes', 'album_likes_user_id_fkey');
  pgm.dropConstraint('album_likes', 'album_likes_album_id_fkey');

  pgm.dropTable('album_likes');
};
