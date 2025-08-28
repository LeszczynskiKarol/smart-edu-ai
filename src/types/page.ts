// src/types/page.ts
export interface HeroFeature {
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  _id?: string;
}

export interface Benefit {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

export interface Service {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  price?: string;
}

export interface HowItWorksStep {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

export interface EducationLevel {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

export interface PricingPlan {
  name: string;
  nameEn: string;
  price: string;
  features: string[];
  featuresEn: string[];
  isPopular?: boolean;
}

export interface ProcessStep {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export interface PageData {
  // Podstawowe dane strony
  workType: string;
  category?: string;
  subcategory?: string;
  title: string;
  titleEn: string;
  slug: string;
  slugEn: string;
  content: string;
  contentEn: string;
  metaTitle: string;
  metaTitleEn: string;
  metaDescription: string;
  metaDescriptionEn: string;
  isActive: boolean;

  // Sekcja Hero
  heroTitle: string;
  heroTitleEn: string;
  heroSubtitle: string;
  heroSubtitleEn: string;
  heroCta: string;
  heroCtaEn: string;
  heroImage?: string;
  heroFeatures: HeroFeature[];

  // Sekcja Benefits
  benefits: Benefit[];
  benefitsSectionTitle: string;
  benefitsSectionTitleEn: string;

  // Sekcja Process
  processSteps: ProcessStep[];
  processSectionTitle: string;
  processSectionTitleEn: string;

  // Sekcja Video
  videoUrl?: string;
  videoTitle: string;
  videoTitleEn: string;
  videoDescription: string;
  videoDescriptionEn: string;

  // Sekcja Services
  services: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
    price?: string;
  }>;
  servicesSectionTitle: string;
  servicesSectionTitleEn: string;

  // Sekcja How It Works
  howItWorksSteps: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  }>;
  howItWorksSectionTitle: string;
  howItWorksSectionTitleEn: string;

  // Sekcja Education Levels
  educationLevels: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  }>;
  educationLevelsSectionTitle: string;
  educationLevelsSectionTitleEn: string;

  // Sekcja Pricing
  pricingPlans: Array<{
    name: string;
    nameEn: string;
    price: string;
    features: string[];
    featuresEn: string[];
    isPopular?: boolean;
  }>;
  pricingSectionTitle: string;
  pricingSectionTitleEn: string;
  sectionsVisibility: {
    hero: boolean;
    benefits: boolean;
    process: boolean;
    video: boolean;
    services: boolean;
    howItWorks: boolean;
    educationLevels: boolean;
    pricing: boolean;
  };

  // Metadane
  createdAt: string;
  updatedAt: string;
  _id: string;
}
