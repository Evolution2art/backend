const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async findOne(ctx) {
    const { slug } = ctx.params;

    const entity = await strapi.services.fossil.findOne({ slug });
    return sanitizeEntity(entity, { model: strapi.models.fossil });
  },

  async reserve(ctx) {
    // @TODO add webhook / local input validation
    // reserves an item [WIP]
  },

  async release(ctx) {
    // @TODO add webhook / local input validation
    // release a reserved item [WIP]
  },

  async sold(ctx) {
    // @TODO add webhook / local input validation
    // marks an items as sold
    const { id } = ctx.params;
    const entity = await strapi.services.fossil.update(
      { id },
      {
        sold: true,
      }
    );
    return sanitizeEntity(entity, { model: strapi.models.fossil });
  },
};
