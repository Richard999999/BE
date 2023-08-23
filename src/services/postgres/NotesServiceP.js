/* eslint-disable linebreak-style */
/* eslint-disable lines-between-class-members */
/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class NotesServiceP {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService; // mengubah objek yang menjadi dependency
  }

  // untuk memverifikasi hak akses pengguna (userId) terhadap catatan (id)
  // Dalam proses verifikasi, fungsi ini tidak melakukan kueri secara langsung ke database.
  // Melainkan ia memanfaatkan fungsi yang sudah dibuat sebelumnya,
  // yakni verifyNoteOwner dan verifyCollaborator.

  // ALURNYA
  // Fungsi ini akan memeriksa hak akses userId terhadap noteId melalui fungsi verifyNoteOwner.
  // Bila userId tersebut merupakan owner dari noteId maka ia akan lolos verifikasi.
  // Namun bila gagal, proses verifikasi owner membangkitkan eror (gagal) dan masuk ke block catch.
  // Dalam block catch (pertama), error yang dibangkitkan dari fungsi verifyNoteOwner bisa berupa
  // NotFoundError atau AuthorizationError. Bila error merupakan NotFoundError,
  // maka langsung throw dengan error (NotFoundError) tersebut.
  // Kita tak perlu memeriksa hak akses kolaborator karena catatannya memang tidak ada
  // Bila AuthorizationError,
  // maka lanjutkan dengan proses pemeriksaan hak akses kolaborator,
  // menggunakan fungsi verifyCollaborator.
  // Bila pengguna seorang kolaborator, proses verifikasi akan lolos.
  // Namun jika bukan,
  // maka fungsi verifyNoteAccess gagal dan throw kembali error (AuthorizationError).
  async verifyNoteAccess(noteId, userId) {
    try {
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  // eslint-disable-next-line object-curly-newline
  async addNote({ title, body, tags, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this._pool.query(query);
    // pengecekan karena melakukan returning id pada query
    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getNotes(owner) {
    // pake LEFT JOIN karena tabel notes berada di posisi paling kiri (dipanggil pertama kali).
    // Kueri akan mengembalikan seluruh nilai notes yg dimiliki oleh dan dikolaborasikan with owner.
    // Data notes yang dihasilkan berpotensi duplikasi, sehingga di akhir kueri,
    // di GROUP nilainya agar menghilangkan duplikasi yang dilihat berdasarkan notes.id.
    const query = {
      text: `SELECT notes.* FROM notes
      LEFT JOIN collaborations ON collaborations.note_id = notes.id
      WHERE notes.owner = $1 OR collaborations.user_id = $1
      GROUP BY notes.id`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }

  async getNoteById(id) {
    // melakukan join tabel catatan dengan users.
    // Kolom yang menjadi kunci dalam melakukan LEFT JOIN adalah users.id dengan notes.owner.
    const query = {
      text: `SELECT notes.*, users.username
      FROM notes
      LEFT JOIN users ON users.id = notes.owner
      WHERE notes.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    // Agar properti username tampil pada respons di tampilan detail,
    // perlu penyesuaian pada fungsi mapDBToModel dengan menambahkan field username.
    return result.rows.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = NotesServiceP;
