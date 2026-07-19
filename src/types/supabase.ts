export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: AdminProfile;
        Insert: Omit<AdminProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<AdminProfile, "id">>;
      };
      site_content: {
        Row: SiteContent;
        Insert: Omit<SiteContent, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<SiteContent, "id">>;
      };
      portfolio_categories: {
        Row: PortfolioCategory;
        Insert: Omit<PortfolioCategory, "id" | "created_at">;
        Update: Partial<Omit<PortfolioCategory, "id">>;
      };
      portfolio_projects: {
        Row: PortfolioProject;
        Insert: Omit<PortfolioProject, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PortfolioProject, "id">>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TeamMember, "id">>;
      };
      service_packages: {
        Row: ServicePackage;
        Insert: Omit<ServicePackage, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ServicePackage, "id">>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<SiteSetting, "id">>;
      };
    };
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_value: string;
  value_ka?: string;
  value_en?: string;
  content_type: "text" | "textarea" | "number" | "url" | "image" | "rich_text" | "boolean" | "json";
  sort_order: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  name_ka?: string;
  name_en?: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  title_ka?: string;
  title_en?: string;
  slug: string;
  category_id: string | null;
  category: string;
  category_label?: string;
  category_label_ka?: string;
  category_label_en?: string;
  description: string;
  description_ka?: string;
  description_en?: string;
  full_description: string;
  full_description_ka?: string;
  full_description_en?: string;
  problem: string;
  problem_ka?: string;
  problem_en?: string;
  solution: string;
  solution_ka?: string;
  solution_en?: string;
  results: string[];
  results_ka?: string[];
  results_en?: string[];
  technologies: string[];
  cover_image: string;
  gallery: string[];
  link: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  alt_text: string;
  alt_text_ka?: string;
  alt_text_en?: string;
  seo_title: string | null;
  seo_title_ka?: string | null;
  seo_title_en?: string | null;
  seo_description: string | null;
  seo_description_ka?: string | null;
  seo_description_en?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  name_ka?: string;
  name_en?: string;
  role: string;
  role_ka?: string;
  role_en?: string;
  bio: string;
  bio_ka?: string;
  bio_en?: string;
  skills: string[];
  skills_ka?: string[];
  skills_en?: string[];
  image: string;
  image_alt?: string;
  image_alt_ka?: string;
  image_alt_en?: string;
  socials: Record<string, string>;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ServicePackage {
  id: string;
  section: string;
  name: string;
  name_ka?: string;
  name_en?: string;
  price: string;
  price_suffix_ka?: string;
  price_suffix_en?: string;
  custom_price_label_ka?: string;
  custom_price_label_en?: string;
  billing_label: string | null;
  billing_label_ka?: string;
  billing_label_en?: string;
  description: string | null;
  description_ka?: string;
  description_en?: string;
  ideal_for: string | null;
  ideal_for_ka?: string;
  ideal_for_en?: string;
  features: string[];
  features_ka?: string[];
  features_en?: string[];
  delivery_time: string | null;
  delivery_time_ka?: string;
  delivery_time_en?: string;
  cta: string;
  cta_ka?: string;
  cta_en?: string;
  cta_label_ka?: string;
  cta_label_en?: string;
  highlighted: boolean;
  custom_price: boolean;
  price_explanation: string | null;
  price_explanation_ka?: string;
  price_explanation_en?: string;
  icon_name: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  value_ka?: string;
  value_en?: string;
  setting_type: "text" | "textarea" | "url" | "image" | "boolean" | "json";
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}
