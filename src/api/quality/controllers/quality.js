"use strict";

/**
 * A set of functions called "actions" for `quality`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::quality.quality");
