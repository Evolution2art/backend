"use strict";

/**
 * A set of functions called "actions" for `about`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::about.about");
