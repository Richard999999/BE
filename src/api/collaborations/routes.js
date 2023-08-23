/* eslint-disable linebreak-style */
const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    // proses menambahkan atau menghapus kolaborasi
    // dibutuhkan informasi pengguna autentik untuk menentukan resource dapat diakses atau tidak
    // lewat options.auth dengan nilai notesapp_jwt
    options: {
      auth: 'notesapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    // proses menambahkan atau menghapus kolaborasi
    // dibutuhkan informasi pengguna autentik untuk menentukan resource dapat diakses atau tidak
    // lewat options.auth dengan nilai notesapp_jwt
    options: {
      auth: 'notesapp_jwt',
    },
  },
];

module.exports = routes;
