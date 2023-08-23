/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */

const ClientError = require('../../exceptions/ClientError');

/* eslint-disable linebreak-style */
class CollaborationsHandler {
  constructor(collaborationsService, notesService, validator) {
    this._collaborationsService = collaborationsService;
    this._notesService = notesService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      //  membawa payload noteId dan userId pada body
      this._validator.validateCollaborationPayload(request.payload);
      // pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut
      const { id: credentialId } = request.auth.credentials;
      const { noteId, userId } = request.payload;

      // pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut
      await this._notesService.verifyNoteOwner(noteId, credentialId);

      // addCollaboration mengembalikan collaboration id yang dimasukkan,
      // maka tampung nilainya di variabel collaborationId dan gunakan nilainya sebagai data respons
      const collaborationId = await this._collaborationsService.addCollaboration(noteId, userId);
      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      //  membawa payload noteId dan userId pada body
      this._validator.validateCollaborationPayload(request.payload);
      // pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut
      const { id: credentialId } = request.auth.credentials;
      const { noteId, userId } = request.payload;

      // pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut
      await this._notesService.verifyNoteOwner(noteId, credentialId);

      // deleteCollaboration mengembalikan collaboration id yang mau di hapus,
      await this._collaborationsService.deleteCollaboration(noteId, userId);
      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;
