'use strict';

/**
 * gallery-event controller
 *
 * Always populate photos.image so GET /api/gallery-events?populate=*
 * returns the nested media the Next.js /gallery page expects.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const defaultPopulate = {
  photos: {
    populate: {
      image: true,
    },
  },
};

function withDefaultPopulate(query = {}) {
  const existing = query.populate;

  if (!existing || existing === '*' || existing === true) {
    return { ...query, populate: defaultPopulate };
  }

  if (typeof existing === 'object' && !Array.isArray(existing)) {
    const photos = existing.photos;
    return {
      ...query,
      populate: {
        ...existing,
        photos:
          photos && typeof photos === 'object' && !Array.isArray(photos)
            ? {
                ...photos,
                populate: {
                  image: true,
                  ...(photos.populate && typeof photos.populate === 'object'
                    ? photos.populate
                    : {}),
                },
              }
            : defaultPopulate.photos,
      },
    };
  }

  return { ...query, populate: defaultPopulate };
}

module.exports = createCoreController('api::gallery-event.gallery-event', () => ({
  async find(ctx) {
    ctx.query = withDefaultPopulate(ctx.query);
    return super.find(ctx);
  },

  async findOne(ctx) {
    ctx.query = withDefaultPopulate(ctx.query);
    return super.findOne(ctx);
  },
}));
