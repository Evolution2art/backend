"use strict";

/**
 * A set of functions called "actions" for `destination`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::destination.destination");
