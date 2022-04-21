"use strict";

/**
 * A set of functions called "actions" for `mail-template`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::mail-template.mail-template");
