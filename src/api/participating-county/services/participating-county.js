'use strict';

/**
 * participating-county service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::participating-county.participating-county');
