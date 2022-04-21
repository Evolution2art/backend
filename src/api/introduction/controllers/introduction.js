"use strict";

/**
 * A set of functions called "actions" for `introduction`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::introduction.introduction");
