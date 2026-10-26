import type { Schema, Struct } from '@strapi/strapi';

export interface CandidateIssue extends Struct.ComponentSchema {
  collectionName: 'components_candidate_issues';
  info: {
    description: 'A campaign issue with expandable stance details';
    displayName: 'Issue';
  };
  attributes: {
    stance: Schema.Attribute.Blocks;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CandidatesTalkingPoint extends Struct.ComponentSchema {
  collectionName: 'components_candidates_talking_points';
  info: {
    description: 'Short campaign talking point shown on candidate pages';
    displayName: 'Talking Point';
    icon: 'bulletList';
  };
  attributes: {
    point: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 280;
      }>;
  };
}

export interface CarShowBullet extends Struct.ComponentSchema {
  collectionName: 'components_car_show_bullets';
  info: {
    description: 'A single line of text used for steps, highlights, and tier benefits';
    displayName: 'Bullet';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CarShowCarouselPhoto extends Struct.ComponentSchema {
  collectionName: 'components_car_show_carousel_photos';
  info: {
    description: 'A photo in the 2027 car show strip';
    displayName: 'Carousel photo';
    icon: 'landscape';
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface CarShowExpectItem extends Struct.ComponentSchema {
  collectionName: 'components_car_show_expect_items';
  info: {
    description: 'One line in the What to expect list';
    displayName: 'Expect item';
    icon: 'check';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CarShowFoodVendor extends Struct.ComponentSchema {
  collectionName: 'components_car_show_food_vendors';
  info: {
    description: 'A food vendor logo on the 2027 car show page';
    displayName: 'Food vendor';
    icon: 'restaurant';
  };
  attributes: {
    link: Schema.Attribute.Text;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface CarShowRegistrationSlot extends Struct.ComponentSchema {
  collectionName: 'components_car_show_registration_slots';
  info: {
    description: 'Vehicle, vendor, or sponsor registration block';
    displayName: 'Registration slot';
    icon: 'file';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    closedLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    footnote: Schema.Attribute.Text;
    formHeight: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1200>;
    formId: Schema.Attribute.String;
    formTitle: Schema.Attribute.String;
    formUrl: Schema.Attribute.Text;
    highlights: Schema.Attribute.Component<'car-show.bullet', true>;
    registrationClosed: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    steps: Schema.Attribute.Component<'car-show.bullet', true>;
    title: Schema.Attribute.String;
  };
}

export interface CarShowSponsor extends Struct.ComponentSchema {
  collectionName: 'components_car_show_sponsors';
  info: {
    description: 'A sponsor logo nested under a sponsorship tier';
    displayName: 'Sponsor';
    icon: 'store';
  };
  attributes: {
    link: Schema.Attribute.Text;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface CarShowSponsorshipTier extends Struct.ComponentSchema {
  collectionName: 'components_car_show_sponsorship_tiers';
  info: {
    description: 'A priced sponsorship package with benefits and sponsor logos';
    displayName: 'Sponsorship tier';
    icon: 'award';
  };
  attributes: {
    benefits: Schema.Attribute.Component<'car-show.bullet', true>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.String & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    sponsors: Schema.Attribute.Component<'car-show.sponsor', true>;
  };
}

export interface CarShowVendorPackageItem extends Struct.ComponentSchema {
  collectionName: 'components_car_show_vendor_package_items';
  info: {
    description: 'A labeled amount in the local vendor package';
    displayName: 'Vendor package item';
    icon: 'priceTag';
  };
  attributes: {
    amount: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface GalleryPhoto extends Struct.ComponentSchema {
  collectionName: 'components_gallery_photos';
  info: {
    description: 'A gallery photo with optional caption';
    displayName: 'Photo';
  };
  attributes: {
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'candidate.issue': CandidateIssue;
      'candidates.talking-point': CandidatesTalkingPoint;
      'car-show.bullet': CarShowBullet;
      'car-show.carousel-photo': CarShowCarouselPhoto;
      'car-show.expect-item': CarShowExpectItem;
      'car-show.food-vendor': CarShowFoodVendor;
      'car-show.registration-slot': CarShowRegistrationSlot;
      'car-show.sponsor': CarShowSponsor;
      'car-show.sponsorship-tier': CarShowSponsorshipTier;
      'car-show.vendor-package-item': CarShowVendorPackageItem;
      'gallery.photo': GalleryPhoto;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
