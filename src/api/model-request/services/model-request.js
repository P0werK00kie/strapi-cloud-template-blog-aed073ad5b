'use strict';

/**
 * model-request service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::model-request.model-request');
