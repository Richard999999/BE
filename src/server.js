/* eslint-disable import/no-extraneous-dependencies */
// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NotesValidator = require('./validator/notes');
const NotesServiceP = require('./services/postgres/NotesServiceP');

const init = async () => {
  const notesService = new NotesServiceP();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: notes,
    options: { service: notesService, validator: NotesValidator },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
