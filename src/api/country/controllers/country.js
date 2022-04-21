"use strict";

/**
 * A set of functions called "actions" for `country`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::country.country");
