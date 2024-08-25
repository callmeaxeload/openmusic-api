const mapDBToModel = ({
  id,
  name,
  owner,
  created_at,
  updated_at,
  username,
}) => ({
  id,
  name,
  owner,
  createdAt: created_at,
  updatedAt: updated_at,
  username,
});

module.exports = { mapDBToModel };
