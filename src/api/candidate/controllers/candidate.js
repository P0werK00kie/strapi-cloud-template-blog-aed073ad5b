'use strict';

/**
 * candidate controller
 *
 * Always populate media and talkingPoints so published REST responses
 * match what the Next.js site expects.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const defaultPopulate = {
  photo: true,
  photos: true,
  talkingPoints: true,
  metaImage: true,
};

function withDefaultPopulate(query = {}) {
  const existing = query.populate;

  if (existing === '*' || existing === true) {
    return query;
  }

  const populate =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...defaultPopulate, ...existing }
      : defaultPopulate;

  return { ...query, populate };
}

module.exports = createCoreController('api::candidate.candidate', () => ({
  async find(ctx) {
    ctx.query = withDefaultPopulate(ctx.query);
    return super.find(ctx);
  },

  async findOne(ctx) {
    ctx.query = withDefaultPopulate(ctx.query);
    return super.findOne(ctx);
  },
}));
