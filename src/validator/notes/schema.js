/* eslint-disable linebreak-style */
// eslint-disable-next-line import/no-extraneous-dependencies
const Joi = require('joi');

const NotePayloadSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
});

// eslint-disable-next-line eol-last
module.exports = { NotePayloadSchema };