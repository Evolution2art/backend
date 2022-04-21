"use strict";

/**
 * A set of functions called "actions" for `legal`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::legal.legal");
