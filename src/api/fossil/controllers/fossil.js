"use strict";

/**
 * A set of functions called "actions" for `fossil`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::fossil.fossil");
