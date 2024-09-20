const mapDBToModelSongDetail = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});
const mapUserAlbumLikesDBToModel = ({ id, user_id, album_id }) => ({
  id,
  userId: user_id,
  albumId: album_id,
});

module.exports = { mapDBToModelSongDetail, mapUserAlbumLikesDBToModel };
