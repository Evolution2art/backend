"use strict";

/**
 * A set of functions called "actions" for `package`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::package.package");
