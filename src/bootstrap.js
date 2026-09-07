'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { categories, authors, articles, global, about } = require('../data/data.json');

async function seedExampleApp() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the template...');
      await importSeedData();
      console.log('Ready to go');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry }) {
  try {
    // Actually create the entry in Strapi
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function checkFileExistsBeforeUpload(files) {
  const existingFiles = [];
  const uploadedFiles = [];
  const filesCopy = [...files];

  for (const fileName of filesCopy) {
    // Check if the file already exists in Strapi
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: {
        name: fileName.replace(/\..*$/, ''),
      },
    });

    if (fileWhereName) {
      // File exists, don't upload it
      existingFiles.push(fileWhereName);
    } else {
      // File doesn't exist, upload it
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split('.').shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  // If only one file then return only that file
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks) {
  const updatedBlocks = [];
  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file name on the block with the actual file
      blockCopy.file = uploadedFiles;
      updatedBlocks.push(blockCopy);
    } else if (block.__component === 'shared.slider') {
      // Get files already uploaded to Strapi or upload new files
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file names on the block with the actual files
      blockCopy.files = existingAndUploadedFiles;
      // Push the updated block
      updatedBlocks.push(blockCopy);
    } else {
      // Just push the block as is
      updatedBlocks.push(block);
    }
  }

  return updatedBlocks;
}

async function importArticles() {
  for (const article of articles) {
    const cover = await checkFileExistsBeforeUpload([`${article.slug}.jpg`]);
    const updatedBlocks = await updateBlocks(article.blocks);

    await createEntry({
      model: 'article',
      entry: {
        ...article,
        cover,
        blocks: updatedBlocks,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importGlobal() {
  const favicon = await checkFileExistsBeforeUpload(['favicon.png']);
  const shareImage = await checkFileExistsBeforeUpload(['default-image.png']);
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      favicon,
      // Make sure it's not a draft
      publishedAt: Date.now(),
      defaultSeo: {
        ...global.defaultSeo,
        shareImage,
      },
    },
  });
}

async function importAbout() {
  const updatedBlocks = await updateBlocks(about.blocks);

  await createEntry({
    model: 'about',
    entry: {
      ...about,
      blocks: updatedBlocks,
      // Make sure it's not a draft
      publishedAt: Date.now(),
    },
  });
}

async function importCategories() {
  for (const category of categories) {
    await createEntry({ model: 'category', entry: category });
  }
}

async function importAuthors() {
  for (const author of authors) {
    const avatar = await checkFileExistsBeforeUpload([author.avatar]);

    await createEntry({
      model: 'author',
      entry: {
        ...author,
        avatar,
      },
    });
  }
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
    candidate: ['find', 'findOne'],
    'gallery-event': ['find', 'findOne'],
  });

  // Create all entries
  await importCategories();
  await importAuthors();
  await importArticles();
  await importGlobal();
  await importAbout();
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedExampleApp();
  await app.destroy();

  process.exit(0);
}


const CANDIDATE_WEBHOOK_NAME = 'Revalidate WCYR content';
const CANDIDATE_WEBHOOK_URL = 'https://www.waltonyr.com/api/revalidate-articles';
const CANDIDATE_WEBHOOK_EVENTS = [
  'entry.publish',
  'entry.unpublish',
  'entry.update',
  'entry.delete',
];
const REVALIDATE_WEBHOOK_MODELS = new Set(['candidate', 'gallery-event']);

async function ensurePublicAction(roleId, action) {
  const existing = await strapi.query('plugin::users-permissions.permission').findOne({
    where: {
      action,
      role: roleId,
    },
  });

  if (existing) {
    return;
  }

  await strapi.query('plugin::users-permissions.permission').create({
    data: {
      action,
      role: roleId,
    },
  });
}

async function ensureCandidatePublicPermissions() {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  if (!publicRole) {
    return;
  }

  await ensurePublicAction(publicRole.id, 'api::candidate.candidate.find');
  await ensurePublicAction(publicRole.id, 'api::candidate.candidate.findOne');
  await ensurePublicAction(publicRole.id, 'api::gallery-event.gallery-event.find');
  await ensurePublicAction(publicRole.id, 'api::gallery-event.gallery-event.findOne');
  await ensurePublicAction(publicRole.id, 'plugin::upload.content-api.find');
  await ensurePublicAction(publicRole.id, 'plugin::upload.content-api.findOne');
}

async function ensureCandidateAdminLabels() {
  const contentType = strapi.contentTypes['api::candidate.candidate'];
  if (!contentType) {
    return;
  }

  const contentTypes = strapi.plugin('content-manager').service('content-types');
  const current = await contentTypes.findConfiguration(contentType);
  if (!current?.metadatas) {
    return;
  }

  const labelUpdates = {
    office: {
      label: 'Office / Race',
      description: 'e.g. "Georgia House of Representatives District 112"',
    },
    category: {
      label: 'Category',
      description: 'Federal, State, or Local race',
    },
    photo: {
      label: 'Photo',
      description: 'Primary headshot / featured photo',
    },
    photos: {
      label: 'Photos',
      description: 'Campaign gallery / collage photos',
    },
    issues: {
      label: 'Issues',
      description: 'Campaign issues. Add a stance to make the item expandable on /2026candidates/[slug].',
    },
    talkingPoints: {
      label: 'Talking Points (deprecated)',
      description: 'Deprecated — use Issues. Kept so the Next.js site can fall back during migration.',
    },
    hasBioPage: {
      label: 'Has Bio Page',
      description:
        "If enabled, Learn More opens the WCYR bio page. If disabled, Learn More opens the candidate's Contact URL (campaign website) instead. When enabled, fill in Bio (and optional Issues and Photos). When disabled, Contact URL is required and bio content is optional.",
    },
    contactUrl: {
      label: 'Contact URL',
      description:
        'Campaign or donation website (absolute URL). Required when Has Bio Page is disabled — Learn More opens this URL in a new tab.',
    },
    bio: {
      label: 'Bio',
      description:
        'On-site biography. Fill this in when Has Bio Page is enabled. If Has Bio Page is disabled, bio is optional and will not be linked from the listing page.',
    },
    metaImage: {
      label: 'Meta Image',
      description: 'Optional SEO / social share image',
    },
  };

  const metadatas = { ...current.metadatas };
  let changed = false;

  for (const [field, meta] of Object.entries(labelUpdates)) {
    if (!metadatas[field]) {
      continue;
    }

    const nextEdit = {
      ...metadatas[field].edit,
      label: meta.label,
      description: meta.description,
    };
    const nextList = {
      ...metadatas[field].list,
      label: meta.label,
    };

    if (
      metadatas[field].edit?.label === nextEdit.label &&
      metadatas[field].edit?.description === nextEdit.description &&
      metadatas[field].list?.label === nextList.label
    ) {
      continue;
    }

    metadatas[field] = {
      ...metadatas[field],
      edit: nextEdit,
      list: nextList,
    };
    changed = true;
  }

  const { layouts, changed: layoutChanged } = placeHasBioPageNearContactUrl(current.layouts);
  if (layoutChanged) {
    changed = true;
  }

  if (!changed) {
    return;
  }

  await contentTypes.updateConfiguration(contentType, {
    settings: current.settings,
    metadatas,
    layouts,
  });
}

function placeHasBioPageNearContactUrl(layouts = {}) {
  const edit = Array.isArray(layouts.edit) ? layouts.edit : [];
  const flattened = edit.flat().filter((el) => el && el.name);
  const names = flattened.map((el) => el.name);
  const hasBioIdx = names.indexOf('hasBioPage');
  const contactIdx = names.indexOf('contactUrl');

  const alreadyTogether =
    hasBioIdx >= 0 && contactIdx >= 0 && Math.abs(hasBioIdx - contactIdx) === 1;

  if (alreadyTogether && flattened[Math.min(hasBioIdx, contactIdx)].name === 'hasBioPage') {
    return { layouts, changed: false };
  }

  const rest = flattened.filter((el) => el.name !== 'hasBioPage' && el.name !== 'contactUrl');
  const pair = [
    { name: 'hasBioPage', size: 4 },
    { name: 'contactUrl', size: 8 },
  ];

  let insertAt = rest.findIndex((el) => el.name === 'sortOrder');
  if (insertAt < 0) {
    insertAt = rest.length;
  }

  const nextFlat = [...rest.slice(0, insertAt), ...pair, ...rest.slice(insertAt)];
  const rows = [];
  let row = [];
  let used = 0;

  for (const el of nextFlat) {
    const size = el.size || 6;
    if (used + size > 12 && row.length > 0) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ name: el.name, size });
    used += size;
  }

  if (row.length > 0) {
    rows.push(row);
  }

  return {
    layouts: {
      ...layouts,
      edit: rows,
    },
    changed: true,
  };
}

function installCandidateWebhookSignature(strapiInstance) {
  const crypto = require('crypto');
  const runner = strapiInstance.get('webhookRunner');
  if (!runner || runner.__candidateWebhookPatched) {
    return;
  }

  const originalRun = runner.run.bind(runner);

  runner.run = function runCandidateWebhook(webhook, event, info = {}) {
    if (webhook.url !== CANDIDATE_WEBHOOK_URL) {
      return originalRun(webhook, event, info);
    }

    if (info.model && !REVALIDATE_WEBHOOK_MODELS.has(info.model)) {
      return Promise.resolve({ statusCode: 204 });
    }

    const body = JSON.stringify({
      event,
      createdAt: new Date(),
      ...info,
    });
    const headers = {
      ...this.config.defaultHeaders,
      ...webhook.headers,
      'X-Strapi-Event': event,
      'Content-Type': 'application/json',
    };
    const secret = process.env.WEBHOOK_SECRET;

    if (secret) {
      headers['x-webhook-signature'] = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    } else {
      strapiInstance.log.warn(
        'WEBHOOK_SECRET is not set; candidate webhook will be sent without x-webhook-signature'
      );
    }

    return this.fetch(webhook.url, {
      method: 'post',
      body,
      headers,
      signal: AbortSignal.timeout(10000),
    })
      .then(async (res) => {
        if (res.ok) {
          return { statusCode: res.status };
        }
        return {
          statusCode: res.status,
          message: await res.text(),
        };
      })
      .catch((err) => ({
        statusCode: 500,
        message: err.message,
      }));
  };

  runner.__candidateWebhookPatched = true;
}

async function ensureCandidateWebhook() {
  const webhookStore = strapi.get('webhookStore');
  const webhookRunner = strapi.get('webhookRunner');
  if (!webhookStore || !webhookRunner) {
    return;
  }

  installCandidateWebhookSignature(strapi);

  const webhooks = await webhookStore.findWebhooks();
  const existing = webhooks.find(
    (webhook) => webhook.name === CANDIDATE_WEBHOOK_NAME || webhook.url === CANDIDATE_WEBHOOK_URL
  );

  const payload = {
    name: CANDIDATE_WEBHOOK_NAME,
    url: CANDIDATE_WEBHOOK_URL,
    headers: {},
    events: CANDIDATE_WEBHOOK_EVENTS,
    isEnabled: true,
  };

  if (existing) {
    const updated = await webhookStore.updateWebhook(existing.id, {
      ...existing,
      ...payload,
    });
    webhookRunner.update(updated);
    return;
  }

  const created = await webhookStore.createWebhook(payload);
  webhookRunner.add(created);
}

function blocksParagraph(text) {
  return [
    {
      type: 'paragraph',
      children: [{ type: 'text', text }],
    },
  ];
}

const EXAMPLE_CANDIDATE_ISSUES = [
  {
    title: 'Public Safety',
    stance: blocksParagraph(
      'I will support increased funding for local law enforcement and first responders.'
    ),
  },
  {
    title: 'Tax Relief',
    stance: blocksParagraph(
      'Georgia families deserve lower taxes. I will work to reduce the state income tax.'
    ),
  },
  {
    title: 'Infrastructure',
  },
];

function talkingPointsToIssues(talkingPoints = []) {
  return talkingPoints
    .map((item) => (typeof item?.point === 'string' ? item.point.trim() : ''))
    .filter(Boolean)
    .map((title) => ({ title }));
}

async function migrateTalkingPointsToIssues() {
  for (const status of ['published', 'draft']) {
    const candidates = await strapi.documents('api::candidate.candidate').findMany({
      status,
      limit: 100,
      populate: {
        talkingPoints: true,
        issues: true,
      },
    });

    for (const candidate of candidates) {
      const issues = candidate.issues || [];
      if (issues.length > 0) {
        continue;
      }

      const migrated = talkingPointsToIssues(candidate.talkingPoints);
      if (migrated.length === 0) {
        continue;
      }

      await strapi.documents('api::candidate.candidate').update({
        documentId: candidate.documentId,
        data: { issues: migrated },
        status,
      });
    }
  }
}

async function ensureSampleCandidate() {
  const existing = await strapi.documents('api::candidate.candidate').findFirst({
    filters: { slug: { $eq: 'jane-doe' } },
    status: 'published',
    populate: {
      issues: true,
    },
  });

  if (existing) {
    const data = {};
    if (!existing.category) {
      data.category = 'Local';
    }
    if (!existing.issues?.length) {
      data.issues = EXAMPLE_CANDIDATE_ISSUES;
    }
    if (Object.keys(data).length > 0) {
      await strapi.documents('api::candidate.candidate').update({
        documentId: existing.documentId,
        data,
        status: 'published',
      });
    }
    return;
  }

  const photo = await checkFileExistsBeforeUpload(['jane-doe.png']);

  await strapi.documents('api::candidate.candidate').create({
    data: {
      name: 'Jane Doe',
      slug: 'jane-doe',
      office: 'Walton County Commission',
      category: 'Local',
      photo,
      bio: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Jane Doe is a candidate for Walton County Commission. She is focused on local infrastructure, public safety, and accountable county government.',
            },
          ],
        },
      ],
      issues: EXAMPLE_CANDIDATE_ISSUES,
      talkingPoints: [
        { point: 'Invest in roads, drainage, and local infrastructure' },
        { point: 'Support public safety and first responders' },
        { point: 'Keep county spending transparent and accountable' },
      ],
      hasBioPage: true,
      contactUrl: 'https://example.com/contact',
      sortOrder: 1,
      metaTitle: 'Jane Doe',
      metaDescription: 'Jane Doe for Walton County Commission.',
    },
    status: 'published',
  });
}

async function ensureHasBioPageDefaults() {
  const knex = strapi.db.connection;
  if (!(await knex.schema.hasColumn('candidates', 'has_bio_page'))) {
    return;
  }

  await knex('candidates').whereNull('has_bio_page').update({ has_bio_page: true });
}

async function ensureSampleGalleryEvent() {
  const existing = await strapi.documents('api::gallery-event.gallery-event').findFirst({
    filters: { slug: { $eq: 'monthly-meetup-march-2026' } },
    status: 'published',
    populate: {
      photos: {
        populate: {
          image: true,
        },
      },
    },
  });

  if (existing?.photos?.length) {
    return;
  }

  const images = await Promise.all([
    checkFileExistsBeforeUpload(['gallery-meetup-1.png']),
    checkFileExistsBeforeUpload(['gallery-meetup-2.png']),
    checkFileExistsBeforeUpload(['gallery-meetup-3.png']),
  ]);

  const photos = [
    {
      image: images[0],
      caption: 'Members networking at High Voltage Wings',
    },
    {
      image: images[1],
      caption: 'Welcome remarks',
    },
    {
      image: images[2],
    },
  ];

  if (existing) {
    await strapi.documents('api::gallery-event.gallery-event').update({
      documentId: existing.documentId,
      data: { photos },
      status: 'published',
    });
    return;
  }

  await strapi.documents('api::gallery-event.gallery-event').create({
    data: {
      title: 'Monthly Meetup — March 2026',
      slug: 'monthly-meetup-march-2026',
      eventDate: '2026-03-17',
      sortOrder: 1,
      photos,
    },
    status: 'published',
  });
}

async function ensureGalleryEventFeature() {
  try {
    await ensureSampleGalleryEvent();
  } catch (error) {
    strapi.log.error('Could not finish Gallery Event collection setup');
    strapi.log.error(error);
  }
}

async function ensureCandidateFeature() {
  try {
    await ensureCandidatePublicPermissions();
    await ensureCandidateAdminLabels();
    await ensureCandidateWebhook();
    await ensureHasBioPageDefaults();
    await ensureSampleCandidate();
    await migrateTalkingPointsToIssues();
  } catch (error) {
    strapi.log.error('Could not finish Candidate collection setup');
    strapi.log.error(error);
  }
}

module.exports = async () => {
  await seedExampleApp();
  await ensureCandidateFeature();
  await ensureGalleryEventFeature();
};
