'use strict';

/**
 * Walton Model (/walton-model on waltonyr.com)
 *
 * Seeds Participating County, Model Stat, and Model FAQ on first run (each
 * collection is only seeded while it is empty) and grants the Public role
 * read access to those three collections.
 *
 * Model Request gets no Public permissions at all. The Next.js route handler
 * writes submissions with a server-only API token (create on Model Request).
 */

const COUNTY_UID = 'api::participating-county.participating-county';
const STAT_UID = 'api::model-stat.model-stat';
const FAQ_UID = 'api::model-faq.model-faq';

const COUNTIES = [
  {
    name: 'Walton',
    fips: '13297',
    launchDate: '2026-11-01',
    clubName: 'Walton County Young Republicans',
    clubUrl: 'https://waltonyr.com',
    status: 'active',
  },
];

// Labels only. Values stay empty until there is a real number to post.
// "Counties on the Model" is derived on the site from the Participating County count.
const STATS = [
  'Members',
  'Show Up Night Attendance',
  'Op-Eds Published',
  'Precincts Covered',
  'Candidates Filed',
  'Counties on the Model',
].map((label, index) => ({ label, displayOrder: index + 1, visible: true }));

function paragraph(text) {
  return [{ type: 'paragraph', children: [{ type: 'text', text }] }];
}

const FAQS = [
  {
    question: 'What does it cost?',
    answer:
      "The playbook and support are free. Running the website has hosting costs, and we'll walk you through them before you commit. [CONFIRM cost details]",
  },
  {
    question: 'Do we have to use the website?',
    answer: 'No. Take the parts that fit. Most clubs start with the Show Up Night and the content calendar.',
  },
  {
    question: 'How much time does it take?',
    answer:
      "Once you're running, plan on a few hours a week spread across your leadership team. [CONFIRM time estimate]",
  },
  {
    question: 'Is this an official Georgia Young Republicans program?',
    answer:
      'No. The Walton Model is a Walton County Young Republicans initiative. Any club in Georgia can use it.',
  },
  {
    question: "What if our county doesn't have a club yet?",
    answer: "Even better. We'll help you start one.",
  },
].map((faq, index) => ({ question: faq.question, answer: paragraph(faq.answer), displayOrder: index + 1 }));

async function ensurePublicAction(roleId, action) {
  const existing = await strapi.query('plugin::users-permissions.permission').findOne({
    where: { action, role: roleId },
  });
  if (existing) return;
  await strapi.query('plugin::users-permissions.permission').create({
    data: { action, role: roleId },
  });
}

async function ensurePublicPermissions() {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  if (!publicRole) return;

  for (const uid of [COUNTY_UID, STAT_UID, FAQ_UID]) {
    await ensurePublicAction(publicRole.id, `${uid}.find`);
    await ensurePublicAction(publicRole.id, `${uid}.findOne`);
  }
}

async function seedIfEmpty(uid, entries, label) {
  const existing = await strapi.documents(uid).findFirst({ status: 'draft' });
  if (existing) return;

  for (const data of entries) {
    await strapi.documents(uid).create({ data, status: 'published' });
  }
  strapi.log.info(`Seeded ${entries.length} ${label} entries for the Walton Model`);
}

async function ensureWaltonModelFeature() {
  try {
    await ensurePublicPermissions();
    await seedIfEmpty(COUNTY_UID, COUNTIES, 'Participating County');
    await seedIfEmpty(STAT_UID, STATS, 'Model Stat');
    await seedIfEmpty(FAQ_UID, FAQS, 'Model FAQ');
  } catch (error) {
    strapi.log.error('Could not finish Walton Model setup');
    strapi.log.error(error);
  }
}

module.exports = {
  ensureWaltonModelFeature,
};
