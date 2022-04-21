"use strict";

/**
 * A set of functions called "actions" for `history`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::history.history");
