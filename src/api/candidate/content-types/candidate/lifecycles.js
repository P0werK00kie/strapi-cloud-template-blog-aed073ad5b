'use strict';

const { errors } = require('@strapi/utils');

const ABSOLUTE_URL = /^https?:\/\/.+/i;

function isBlank(value) {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

async function resolveCandidatePayload(event) {
  const data = { ...(event.params.data || {}) };
  const needsExisting = data.hasBioPage === undefined || data.contactUrl === undefined;

  if (needsExisting && event.params.where) {
    const existing = await strapi.db.query('api::candidate.candidate').findOne({
      where: event.params.where,
      select: ['hasBioPage', 'contactUrl'],
    });

    if (existing) {
      if (data.hasBioPage === undefined) {
        data.hasBioPage = existing.hasBioPage;
      }
      if (data.contactUrl === undefined) {
        data.contactUrl = existing.contactUrl;
      }
    }
  }

  return data;
}

function validateLearnMoreFields(data = {}) {
  if (data.hasBioPage !== false) {
    return;
  }

  if (isBlank(data.contactUrl)) {
    throw new errors.ValidationError(
      'Contact URL is required when Has Bio Page is disabled. Learn More will open the campaign website.'
    );
  }

  if (typeof data.contactUrl === 'string' && !ABSOLUTE_URL.test(data.contactUrl.trim())) {
    throw new errors.ValidationError('Contact URL must be an absolute URL (https://...).');
  }
}

module.exports = {
  async beforeCreate(event) {
    validateLearnMoreFields(event.params.data || {});
  },
  async beforeUpdate(event) {
    const data = await resolveCandidatePayload(event);
    validateLearnMoreFields(data);
  },
};
