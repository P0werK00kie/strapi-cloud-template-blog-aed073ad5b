'use strict';

/**
 * car-show-2027 controller
 *
 * Strapi treats populate=* as first-level only, so media inside components
 * (carouselPhotos.image, sponsorshipTiers.sponsors.logo, foodVendors.logo)
 * would come back as ids. The Next.js app requests this deep populate:
 *
 *   populate[heroImage]=true
 *   populate[carouselPhotos][populate]=true
 *   populate[expectItems]=true
 *   populate[vehicleRegistration][populate]=true
 *   populate[vendorRegistration][populate]=true
 *   populate[sponsorRegistration][populate]=true
 *   populate[sponsorshipTiers][populate][benefits]=true
 *   populate[sponsorshipTiers][populate][sponsors][populate]=true
 *   populate[vendorPackageItems]=true
 *   populate[foodVendors][populate]=true
 *
 * GET /api/car-show-2027 always applies that depth, including when the
 * caller passes populate=*.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const defaultPopulate = {
  heroImage: true,
  carouselPhotos: {
    populate: {
      image: true,
    },
  },
  expectItems: true,
  vehicleRegistration: {
    populate: {
      steps: true,
      highlights: true,
    },
  },
  vendorRegistration: {
    populate: {
      steps: true,
      highlights: true,
    },
  },
  sponsorRegistration: {
    populate: {
      steps: true,
      highlights: true,
    },
  },
  sponsorshipTiers: {
    populate: {
      benefits: true,
      sponsors: {
        populate: {
          logo: true,
        },
      },
    },
  },
  vendorPackageItems: true,
  foodVendors: {
    populate: {
      logo: true,
    },
  },
};

module.exports = createCoreController('api::car-show-2027.car-show-2027', () => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: defaultPopulate,
    };
    return super.find(ctx);
  },
}));
