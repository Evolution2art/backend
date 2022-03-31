"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // set isValid only if all relations are set
    // + unpublish item if invalid
    async beforeUpdate(params, data) {
      const isValid = !!data.package && !!data.category && !!data.quality;
      data.isValid = isValid;
      if (!isValid) {
        data.published_at = null;
      }
    },
  },
};
