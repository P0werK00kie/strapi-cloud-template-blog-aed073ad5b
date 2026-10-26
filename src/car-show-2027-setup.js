'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const UID = 'api::car-show-2027.car-show-2027';
const LOCAL_WEBHOOK_NAME = 'Revalidate WCYR content (local)';
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/revalidate-articles';
const WEBHOOK_EVENTS = ['entry.publish', 'entry.unpublish', 'entry.update', 'entry.delete'];

const HERO_IMAGE =
  'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/Events/2026%20Walton%20Yr/shutterstock_2229874257.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMjU3NzlmNC01ZjdjLTRjZWEtYmM2MS1mYjMwZjllNzkxM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0V2ZW50cy8yMDI2IFdhbHRvbiBZci9zaHV0dGVyc3RvY2tfMjIyOTg3NDI1Ny5qcGciLCJpYXQiOjE3Nzg2MDA0NjAsImV4cCI6MjcyNDY4MDQ2MH0.ApXbPb8raB8Im4fwQFWJOSsuX7La80VpA8McvSsOAkM';

function bullets(lines) {
  return lines.map((text) => ({ text }));
}

function registrationSlot(slot) {
  return {
    eyebrow: slot.eyebrow,
    title: slot.title,
    description: slot.description,
    buttonLabel: slot.buttonLabel,
    closedLabel: slot.closedLabel,
    registrationClosed: true,
    formTitle: slot.formTitle,
    formHeight: slot.formHeight,
    footnote: slot.footnote,
    steps: bullets(slot.steps || []),
    highlights: bullets(slot.highlights || []),
  };
}

const TIER_SPONSORS = {
  'All American': [
    {
      name: 'Walton County GOP',
      link: 'https://www.waltoncountygop.com',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Walton-GOP-Logo-768x768.png',
    },
    {
      name: 'Ink Wave Printing',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/Event%20Images/Sponsors/Logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMjU3NzlmNC01ZjdjLTRjZWEtYmM2MS1mYjMwZjllNzkxM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0V2ZW50IEltYWdlcy9TcG9uc29ycy9Mb2dvLnBuZyIsImlhdCI6MTc0OTgyOTM3MiwiZXhwIjoyMzgwNTQ5MzcyfQ.I244lMxlhSv2SubhT04m4dTvS3j13HG2Z_Qxt3qw1XI',
    },
    {
      name: 'Tow it All Towing',
      link: 'https://www.towitallga.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/TOWITALL.LOGO.png',
    },
    {
      name: 'Real News With Lucretia Hughes',
      link: 'https://lucretiahughes.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Real%20News%20With%20Lucretia%20Hughes.png',
    },
    {
      name: 'Georgia Built Construction',
      link: 'https://www.gabuilt.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/GA%20Built.svg',
    },
    {
      name: 'Jeremy Adams District 5 Commissioner',
      link: 'https://www.waltoncountyga.gov/325/Jeremy-Adams',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Jeremy%20Adams.png',
    },
    {
      name: 'Lee Bradford District 4 Commissioner',
      link: 'https://www.waltoncountyga.gov/327/Lee-Bradford',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Lee%20Bradford%20District%204%20Campaign%20Sign.png',
    },
  ],
  'Red Blooded American': [
    {
      name: 'Atha Rental',
      link: 'https://atharental.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Atha%20Rental.png',
    },
    {
      name: 'Benton & Benton Attorneys At Law',
      link: 'https://bentonandbentonlaw.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/bentonandbenton.png',
    },
    {
      name: 'Campton Restaurant',
      link: 'https://www.camptonrestaurant.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Campton_Logo_Design.png',
    },
    {
      name: 'Andrews Termite & Pest Control',
      link: 'https://andrewstermiteandpestcontrol.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/Event%20Images/Sponsors/Open%20Andrews%20Termite%20and%20Pest.png?token=eyJraWQiOiJjMjU3NzlmNC01ZjdjLTRjZWEtYmM2MS1mYjMwZjllNzkxM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0V2ZW50IEltYWdlcy9TcG9uc29ycy9PcGVuIEFuZHJld3MgVGVybWl0ZSBhbmQgUGVzdC5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkwMTE4NTkwLCJleHAiOjI3MzYxOTg1OTB9.JPxLOUlCKls6k397YRKjN1IaRligZHLR4VyoLK-jJn8',
    },
    {
      name: 'Williamson for Walton',
      link: 'https://williamsonforwalton.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/brucewilliamson.png',
    },
    {
      name: 'Marc McMain for Georgia',
      link: 'https://www.marcforgeorgia.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/493228749_1015380964073239_4837929805580516742_n.png',
    },
  ],
  'Stars and Stripes American': [
    {
      name: 'WOW Express Oil Change and Auto Repair',
      link: 'https://www.wowwashandlube.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/Event%20Images/Sponsors/WOW%20logo%20FINAL.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMjU3NzlmNC01ZjdjLTRjZWEtYmM2MS1mYjMwZjllNzkxM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0V2ZW50IEltYWdlcy9TcG9uc29ycy9XT1cgbG9nbyBGSU5BTC5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1MzcxNDg0LCJleHAiOjI3MzE0NTE0ODR9.Rtp45dLJImiSYkwoaG0YPFPR_yQGBnpjAk60Ew3N4NE',
    },
    {
      name: 'The Walton Tribune',
      link: 'https://www.waltontribune.com/',
      imageUrl:
        'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Events/2026%20Car%20Show/Walton%20Tribune%20logo.png',
    },
  ],
};

const TIERS = [
  {
    name: 'All American',
    price: '$250',
    featured: false,
    sortOrder: 0,
    benefits: [
      'Social media mentions throughout the event',
      'YR Supporter window cling',
      'Booth space at the event',
    ],
  },
  {
    name: 'Red Blooded American',
    price: '$500',
    featured: false,
    sortOrder: 1,
    benefits: [
      'Personalized social media promotion (shoutouts + photos)',
      'YR Supporter window cling',
      'Booth space at the event',
      '1 free car entry into the show',
    ],
  },
  {
    name: 'Stars and Stripes American',
    price: '$750',
    featured: true,
    sortOrder: 2,
    benefits: [
      'Personalized social media promotion (shoutouts + photos)',
      'YR Supporter window cling',
      'Booth space at the event',
      'Banner placement at the venue',
      'Logo featured on the back of the event t-shirt',
      '2 free car entries into the show',
    ],
  },
];

const CAROUSEL_PHOTOS = [
  {
    imageUrl: HERO_IMAGE,
    alt: 'Lineup of classic cars at a previous WCYR car show',
  },
  {
    imageUrl:
      'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/Events/678927747_960850100142322_8087291737358928484_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMjU3NzlmNC01ZjdjLTRjZWEtYmM2MS1mYjMwZjllNzkxM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0V2ZW50cy82Nzg5Mjc3NDdfOTYwODUwMTAwMTQyMzIyXzgwODcyOTE3MzczNTg5Mjg0ODRfbi5wbmciLCJpYXQiOjE3NzgyNjYyMjksImV4cCI6MjcyNDM0NjIyOX0.QomwhdVc37Y2ef4wxI3JvXMVcduWYv8cAismDHN2XJA',
    alt: 'WCYR members gathered at a community event',
  },
  {
    imageUrl:
      'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/DT%20Monroe.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0RUIE1vbnJvZS53ZWJwIiwiaWF0IjoxNzQ1ODA5OTA3LCJleHAiOjIwNjExNjk5MDd9.bntN5Tf03s-RH56gkiZ5wOfEXyfHbmYu1_Ae_bnqGVU',
    alt: 'Downtown Monroe, Georgia — home of the WCYR car show',
  },
  {
    imageUrl:
      'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/sign/files/WCYR/Website%20Images/Leadership/loganville-ga-2.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMjU3NzlmNC01ZjdjLTRjZWEtYmM2MS1mYjMwZjllNzkxM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9XQ1lSL1dlYnNpdGUgSW1hZ2VzL0xlYWRlcnNoaXAvbG9nYW52aWxsZS1nYS0yLmpwZyIsImlhdCI6MTc3ODI1ODk2NywiZXhwIjoyNzI0MzM4OTY3fQ.qzEL8GlT_k8s5Yxwo4wXX0qRJ6JXhxbB7xVHrQvPzfI',
    alt: 'Walton County community gathering',
  },
  {
    imageUrl:
      'https://wbuiebxqdjuxhvdtiata.supabase.co/storage/v1/object/public/sitefiles/WCYR/Website/Home%20Page/Hero/shutterstock_2724857377%20copy.webp',
    alt: 'Community energy around Walton County Young Republicans',
  },
];

function extensionFromResponse(url, contentType) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (ext && ext.length <= 8 && ext !== '.') {
      return ext;
    }
  } catch {
    // ignore malformed URLs
  }

  const lookedUp = contentType ? mime.extension(contentType.split(';')[0].trim()) : false;
  return lookedUp ? `.${lookedUp}` : '.img';
}

async function downloadTo(url, filePath) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
    headers: { 'user-agent': 'WCYR-Strapi-seed' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('response was HTML');
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 32) {
    throw new Error('file was empty');
  }

  const finalPath = filePath.endsWith(path.extname(filePath))
    ? filePath.replace(/\.img$/, extensionFromResponse(url, contentType))
    : filePath;
  await fs.promises.writeFile(finalPath, bytes);
  return { filePath: finalPath, contentType };
}

async function uploadLocalFile(filePath, name, alternativeText) {
  const existing = await strapi.query('plugin::upload.file').findOne({
    where: { name },
  });
  if (existing) {
    return existing;
  }

  const stat = fs.statSync(filePath);
  const filename = path.basename(filePath);
  const [uploaded] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: {
        filepath: filePath,
        originalFilename: filename,
        originalFileName: filename,
        size: stat.size,
        mimetype: mime.lookup(filename) || 'application/octet-stream',
      },
      data: {
        fileInfo: {
          name,
          alternativeText: alternativeText || name,
          caption: name,
        },
      },
    });

  return uploaded;
}

async function mediaIdFor(cache, { imageUrl, name, alt }) {
  if (!imageUrl) return null;
  if (cache.has(imageUrl)) return cache.get(imageUrl);

  const dir = path.join(process.cwd(), '.tmp', 'car-show-2027-seed');
  await fs.promises.mkdir(dir, { recursive: true });
  const safeName = name.replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const target = path.join(dir, `${safeName}.img`);

  try {
    const downloaded = await downloadTo(imageUrl, target);
    const file = await uploadLocalFile(downloaded.filePath, safeName, alt || name);
    const id = file?.id ?? null;
    cache.set(imageUrl, id);
    return id;
  } catch (error) {
    strapi.log.warn(`Car Show 2027 image skipped (${name}): ${error.message}`);
    cache.set(imageUrl, null);
    return null;
  }
}

async function buildSeedData() {
  const cache = new Map();
  const heroImage = await mediaIdFor(cache, {
    imageUrl: HERO_IMAGE,
    name: 'car-show-2027-hero',
    alt: 'Classic and custom cars lined up at the WCYR car show in Monroe, Georgia',
  });

  const carouselPhotos = [];
  for (const [index, photo] of CAROUSEL_PHOTOS.entries()) {
    const image = await mediaIdFor(cache, {
      imageUrl: photo.imageUrl,
      name: `car-show-2027-photo-${index + 1}`,
      alt: photo.alt,
    });
    if (!image) continue;
    carouselPhotos.push({ image, alt: photo.alt });
  }

  const sponsorshipTiers = [];
  for (const tier of TIERS) {
    const sponsors = [];
    const sourceSponsors = TIER_SPONSORS[tier.name] || [];
    for (const [index, sponsor] of sourceSponsors.entries()) {
      const logo = await mediaIdFor(cache, {
        imageUrl: sponsor.imageUrl,
        name: `car-show-2027-sponsor-${tier.sortOrder}-${index + 1}`,
        alt: `${sponsor.name} logo`,
      });
      if (!logo) continue;
      sponsors.push({
        name: sponsor.name,
        ...(sponsor.link ? { link: sponsor.link } : {}),
        logo,
        sortOrder: index,
      });
    }

    sponsorshipTiers.push({
      name: tier.name,
      price: tier.price,
      featured: tier.featured,
      sortOrder: tier.sortOrder,
      benefits: bullets(tier.benefits),
      sponsors,
    });
  }

  return {
    heroBrand: 'Walton County Young Republicans',
    heroYear: '2027',
    heroTitle: 'Car Show',
    heroTagline: 'Classics. Muscle. Customs. Monroe.',
    heroDateLabel: 'Date coming soon',
    ...(heroImage ? { heroImage } : {}),
    heroImageAlt: 'Classic and custom cars lined up at the WCYR car show in Monroe, Georgia',
    photoStripEyebrow: "Last year's energy",
    photoStripTitle: 'Built for the asphalt',
    carouselPhotos,
    venueEyebrow: 'When & where',
    venueTitle: 'Same asphalt. Bigger show.',
    venueDateLabel: 'Date coming soon',
    venueDateNote: "We're locking the 2027 date — check back here or follow WCYR for the announce.",
    locationName: '1025 Church - Monroe Campus',
    locationLine1: '1025 E Spring St',
    locationLine2: 'Monroe, GA 30655',
    mapUrl: 'https://maps.google.com/?q=1025+E+Spring+St,Monroe,GA,30655',
    expectTitle: 'What to expect',
    expectItems: bullets([
      'Classic cars, modern muscle, and custom builds',
      'Food vendors and local businesses',
      'Live energy in the heart of Monroe',
      'A morning built for car people and families',
    ]),
    registrationEyebrow: 'Get in early',
    registrationTitle: 'Registration opens soon',
    registrationDescription:
      "Vehicle registration comes first — then vendors and sponsors. Forms go live here the moment they're ready.",
    vehicleRegistration: registrationSlot({
      eyebrow: 'Cars',
      title: 'Register your car',
      description:
        'Reserve your display spot for the 2027 show. Early registration means a better lane and less day-of scramble.',
      steps: [
        'Open registration when it goes live',
        'Tell us about your ride',
        'Get confirmation and your event-day packet',
      ],
      buttonLabel: 'Register your car',
      closedLabel: 'Coming soon',
      formTitle: '2027 Vehicle Registration',
      formHeight: 1175,
      footnote: "Vehicle registration isn't open yet — this button goes live with the form.",
    }),
    vendorRegistration: registrationSlot({
      eyebrow: 'Vendors',
      title: 'Vendors',
      description: 'Food, retail, craft, and service booths along the show.',
      highlights: [
        'Strong foot traffic on the route',
        'Coordinated load-in after approval',
        'Limited spaces — early interest helps',
      ],
      buttonLabel: 'Register as a vendor',
      closedLabel: 'Coming soon',
      formTitle: '2027 Vendor Registry',
      formHeight: 2004,
      footnote: 'Vendor registration opens with the 2027 forms.',
    }),
    sponsorRegistration: registrationSlot({
      eyebrow: 'Sponsors',
      title: 'Sponsors',
      description: 'Put your brand in front of enthusiasts and families — tiers from $250.',
      highlights: [
        'Packages from $250 to $750',
        'Social, booth space, and car entries',
        'Banner and t-shirt logos at the top tier',
      ],
      buttonLabel: 'Register as a sponsor',
      closedLabel: 'Coming soon',
      formTitle: '2027 Sponsor Registry',
      formHeight: 1645,
      footnote: 'Sponsor registration opens with the 2027 forms.',
    }),
    tiersEyebrow: 'Partners',
    tiersTitle: 'Sponsorship tiers',
    tiersDescription: 'Draft packages for 2027 — same ladder as last year until we announce updates.',
    sponsorshipTiers,
    vendorPackageName: 'American Dream — Local Vendor Package',
    vendorPackageItems: [
      { label: 'Booth Space', amount: '$55' },
      { label: 'Car Entry', amount: '$20 per car' },
    ],
    foodVendorsEyebrow: 'Food & vendors',
    foodVendorsTitle: 'Taste of the show',
    foodVendorsDescription:
      "Local food vendors joining the 2027 car show — logos appear here as they're confirmed.",
    foodVendors: [],
    ctaTitle: "Don't miss the next one",
    ctaDescription: 'Date TBD at 1025 Church. Be ready when registration opens.',
    contactLabel: 'Questions? Contact us',
    contactHref: '/contact',
    stickyClosedLabel: 'Car registration — coming soon',
    stickyLabel: 'Register your car',
  };
}

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

async function ensureCarShowPublicPermissions() {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    return;
  }

  await ensurePublicAction(publicRole.id, 'api::car-show-2027.car-show-2027.find');
  await ensurePublicAction(publicRole.id, 'api::car-show-2027.car-show-2027.findOne');
  await ensurePublicAction(publicRole.id, 'plugin::upload.content-api.find');
  await ensurePublicAction(publicRole.id, 'plugin::upload.content-api.findOne');
}

async function ensureLocalRevalidateWebhook() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const webhookStore = strapi.get('webhookStore');
  const webhookRunner = strapi.get('webhookRunner');
  if (!webhookStore || !webhookRunner) {
    return;
  }

  const webhooks = await webhookStore.findWebhooks();
  const existing = webhooks.find(
    (webhook) => webhook.name === LOCAL_WEBHOOK_NAME || webhook.url === LOCAL_WEBHOOK_URL
  );
  const payload = {
    name: LOCAL_WEBHOOK_NAME,
    url: LOCAL_WEBHOOK_URL,
    headers: {},
    events: WEBHOOK_EVENTS,
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

async function ensureCarShow2027Entry() {
  const existing = await strapi.documents(UID).findFirst({
    status: 'draft',
  });

  if (existing) {
    const published = await strapi.documents(UID).findFirst({
      status: 'published',
    });
    if (!published) {
      await strapi.documents(UID).publish({ documentId: existing.documentId });
      strapi.log.info('Published the existing Car Show 2027 draft');
    }
    return;
  }

  const data = await buildSeedData();
  await strapi.documents(UID).create({
    data,
    status: 'published',
  });
  strapi.log.info('Published the Car Show 2027 single type');
}

async function ensureCarShow2027Feature() {
  try {
    await ensureCarShowPublicPermissions();
    await ensureLocalRevalidateWebhook();
    await ensureCarShow2027Entry();
  } catch (error) {
    strapi.log.error('Could not finish Car Show 2027 single type setup');
    strapi.log.error(error);
  }
}

module.exports = {
  ensureCarShow2027Feature,
};
