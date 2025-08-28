// backend/src/models/WorkTypePage.js
const mongoose = require('mongoose');

const workTypePageSchema = new mongoose.Schema(
  {
    workType: {
      type: String,
      required: [true, 'Typ pracy jest wymagany'],
      trim: true,
    },
    category: {
      type: String,
      required: false,
    },
    subcategory: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    slugEn: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentEn: {
      type: String,
      required: true,
    },
    metaTitle: {
      type: String,
      required: true,
    },
    metaTitleEn: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
    metaDescriptionEn: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Sekcja Hero
    heroTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroSubtitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroSubtitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroCta: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroCtaEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroImage: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.hero
          ? true
          : false;
      },
    },
    heroFeatures: [
      {
        _id: false,
        icon: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc && doc.sectionsVisibility && doc.sectionsVisibility.hero
              ? true
              : false;
          },
          enum: ['BookOpen', 'Brain', 'Clock', 'Sparkles'],
        },
        title: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc && doc.sectionsVisibility && doc.sectionsVisibility.hero
              ? true
              : false;
          },
        },
        titleEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc && doc.sectionsVisibility && doc.sectionsVisibility.hero
              ? true
              : false;
          },
        },
        description: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc && doc.sectionsVisibility && doc.sectionsVisibility.hero
              ? true
              : false;
          },
        },
        descriptionEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc && doc.sectionsVisibility && doc.sectionsVisibility.hero
              ? true
              : false;
          },
        },
      },
    ],

    // Sekcja Benefits
    benefits: [
      {
        _id: false,
        title: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.benefits
              ? true
              : false;
          },
        },
        titleEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.benefits
              ? true
              : false;
          },
        },
        description: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.benefits
              ? true
              : false;
          },
        },
        descriptionEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.benefits
              ? true
              : false;
          },
        },
        icon: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.benefits
              ? true
              : false;
          },
        },
      },
    ],

    benefitsSectionTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.benefits
          ? true
          : false;
      },
    },
    benefitsSectionTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.benefits
          ? true
          : false;
      },
    },

    // Sekcja Process
    processSteps: [
      {
        _id: false,
        title: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.process
              ? true
              : false;
          },
        },
        titleEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.process
              ? true
              : false;
          },
        },
        description: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.process
              ? true
              : false;
          },
        },
        descriptionEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.process
              ? true
              : false;
          },
        },
      },
    ],
    processSectionTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.process
          ? true
          : false;
      },
    },
    processSectionTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.process
          ? true
          : false;
      },
    },

    // Sekcja Video
    videoUrl: { type: String },
    videoTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.video
          ? true
          : false;
      },
    },
    videoTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.video
          ? true
          : false;
      },
    },
    videoDescription: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.video
          ? true
          : false;
      },
    },
    videoDescriptionEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.video
          ? true
          : false;
      },
    },

    // Sekcja Services
    services: [
      {
        _id: false,
        title: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.services
              ? true
              : false;
          },
        },
        titleEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.services
              ? true
              : false;
          },
        },
        description: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.services
              ? true
              : false;
          },
        },
        descriptionEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.services
              ? true
              : false;
          },
        },
        icon: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.services
              ? true
              : false;
          },
        },
        price: { type: String },
      },
    ],

    servicesSectionTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.services
          ? true
          : false;
      },
    },
    servicesSectionTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.services
          ? true
          : false;
      },
    },

    // Sekcja How It Works
    howItWorksSteps: [
      {
        _id: false,
        title: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.howItWorks
              ? true
              : false;
          },
        },
        titleEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.howItWorks
              ? true
              : false;
          },
        },
        description: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.howItWorks
              ? true
              : false;
          },
        },
        descriptionEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.howItWorks
              ? true
              : false;
          },
        },
        icon: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.howItWorks
              ? true
              : false;
          },
        },
      },
    ],

    howItWorksSectionTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.howItWorks
          ? true
          : false;
      },
    },
    howItWorksSectionTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.howItWorks
          ? true
          : false;
      },
    },

    // Sekcja Education Levels
    educationLevels: [
      {
        _id: false, // dodaj to
        title: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.educationLevels
              ? true
              : false;
          },
        },
        titleEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.educationLevels
              ? true
              : false;
          },
        },
        description: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.educationLevels
              ? true
              : false;
          },
        },
        descriptionEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.educationLevels
              ? true
              : false;
          },
        },
        icon: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.educationLevels
              ? true
              : false;
          },
        },
      },
    ],

    educationLevelsSectionTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility &&
          this.sectionsVisibility.educationLevels
          ? true
          : false;
      },
    },
    educationLevelsSectionTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility &&
          this.sectionsVisibility.educationLevels
          ? true
          : false;
      },
    },

    // Sekcja Pricing
    pricingPlans: [
      {
        _id: false,
        name: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.pricing
              ? true
              : false;
          },
        },
        nameEn: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.pricing
              ? true
              : false;
          },
        },
        price: {
          type: String,
          required: function () {
            const doc = this.ownerDocument();
            return doc &&
              doc.sectionsVisibility &&
              doc.sectionsVisibility.pricing
              ? true
              : false;
          },
        },
        features: [
          {
            type: String,
            required: function () {
              const doc = this.ownerDocument();
              return doc &&
                doc.sectionsVisibility &&
                doc.sectionsVisibility.pricing
                ? true
                : false;
            },
          },
        ],
        featuresEn: [
          {
            type: String,
            required: function () {
              const doc = this.ownerDocument();
              return doc &&
                doc.sectionsVisibility &&
                doc.sectionsVisibility.pricing
                ? true
                : false;
            },
          },
        ],
        isPopular: {
          type: Boolean,
          default: false,
        },
      },
    ],
    pricingSectionTitle: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.pricing
          ? true
          : false;
      },
    },
    pricingSectionTitleEn: {
      type: String,
      required: function () {
        return this.sectionsVisibility && this.sectionsVisibility.pricing
          ? true
          : false;
      },
    },

    sectionsVisibility: {
      hero: { type: Boolean, default: true },
      benefits: { type: Boolean, default: true },
      process: { type: Boolean, default: true },
      video: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      howItWorks: { type: Boolean, default: true },
      educationLevels: { type: Boolean, default: true },
      pricing: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Pozostała logika generowania slugów
workTypePageSchema.pre('save', function (next) {
  let slugPath = this.workType;
  let slugPathEn = this.workType;

  if (this.category) {
    const categorySlug = this.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const categorySlugEn = this.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    slugPath += `/${categorySlug}`;
    slugPathEn += `/${categorySlugEn}`;

    if (this.subcategory) {
      const subcategorySlug = this.subcategory
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const subcategorySlugEn = this.subcategory
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      slugPath += `/${subcategorySlug}`;
      slugPathEn += `/${subcategorySlugEn}`;
    }
  }

  this.slug = slugPath;
  this.slugEn = slugPathEn;
  next();
});

module.exports = mongoose.model('WorkTypePage', workTypePageSchema);
