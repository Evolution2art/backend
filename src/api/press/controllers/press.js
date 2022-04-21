"use strict";

/**
 * A set of functions called "actions" for `press`
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::press.press");
