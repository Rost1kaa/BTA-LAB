export interface FeatureTooltipData {
  nameKa: string;
  nameEn: string;
  descriptionKa: string;
  descriptionEn: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  billingLabel?: string;
  description?: string;
  idealFor?: string;
  features: string[];
  featureTooltips?: Record<string, FeatureTooltipData>;
  visibleItemCount?: number;
  deliveryTime?: string;
  cta: string;
  highlighted?: boolean;
  customPrice?: boolean;
  priceExplanation?: string;
  iconName?: string;
}

export interface PricingSection {
  id: string;
  title: string;
  description: string;
  packages: PricingPackage[];
  note?: string;
  columns?: 2 | 3 | 4 | 5;
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: string;
  description: string;
  example?: string;
  iconName?: string;
}

export interface PricingData {
  website: PricingSection;
  socialMedia: PricingSection;
  addons: ServiceAddon[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  problem: string;
  solution: string;
  results: string[];
  technologies: string[];
  coverImage: string;
  gallery: string[];
  link?: string;
  featured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  bio: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    instagram?: string;
  };
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  translationKey?: string;
}
