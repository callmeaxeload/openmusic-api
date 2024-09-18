const Joi = require('joi');

const thisyear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().max(thisyear).min(1900)
    .required(),
});

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
    )
    .required(),
}).unknown();

module.exports = { AlbumPayloadSchema, ImageHeadersSchema };
