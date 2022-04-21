"use strict";

/**
 * A set of functions called "actions" for `rate`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::rate.rate");
