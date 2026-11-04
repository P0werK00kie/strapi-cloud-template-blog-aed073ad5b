'use strict';

/**
 * model-request route
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::model-request.model-request');
