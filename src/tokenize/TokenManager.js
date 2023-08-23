/* eslint-disable linebreak-style */
// eslint-disable-next-line import/no-extraneous-dependencies
const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  // Parameter payload merupakan objek yang disimpan ke dalam salah satu artifacts JWT.
  // Biasanya objek payload berisi properti yang berisikan identitas pengguna, contohnya user id
  generateAccessToken(payload) {
    // Pada parameter payload ini, akan memberikan nilai payload yang ada di parameter fungsi
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },
  generateRefreshToken(payload) {
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY);
  },
  verifyRefreshToken(refreshToken) {
    try {
      // membuat token dalam bentuk artifacts / decode
      const artifacts = Jwt.token.decode(refreshToken);
      // verifySignature ini, hanya menerima token dalam bentuk artifacts / token yg sudah di decode
      // jadi tidak bisa menggunakan refreshToken secara langsung
      // Fungsi verifySignature ini
      // akan mengecek refresh token memiliki signature yang sesuai atau tidak
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      // payload ini yang di dapat dari artifacts.decoded
      const { payload } = artifacts.decoded;
      // Nilai payload ini nantinya akan digunakan dalam membuat akses token baru
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
