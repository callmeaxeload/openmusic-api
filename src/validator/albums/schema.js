const Joi = require('joi');

const thisyear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().max(thisyear).min(1900)
    .required(),
});

module.exports = { AlbumPayloadSchema };
