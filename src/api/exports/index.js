const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, collaborationsService }) => {
    const exportsHandler = new ExportsHandler(
      service,
      validator,
      collaborationsService,
    );
    server.route(routes(exportsHandler));
  },
};
