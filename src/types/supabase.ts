export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_profiles: Table<
        {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      site_content: Table<
        {
          id: string;
          page: string;
          section: string;
          content_key: string;
          content_value_ka: string;
          content_value_en: string;
          content_type: "text" | "textarea" | "number" | "url" | "image" | "rich_text" | "boolean" | "json";
          sort_order: number;
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        },
        {
          id?: string;
          page: string;
          section: string;
          content_key: string;
          content_value_ka?: string;
          content_value_en?: string;
          content_type?: "text" | "textarea" | "number" | "url" | "image" | "rich_text" | "boolean" | "json";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        }
      >;
      site_settings: Table<
        {
          id: string;
          setting_key: string;
          setting_value: string;
          value_ka: string;
          value_en: string;
          setting_type: "text" | "textarea" | "url" | "image" | "boolean" | "json";
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        },
        {
          id?: string;
          setting_key: string;
          setting_value?: string;
          value_ka?: string;
          value_en?: string;
          setting_type?: "text" | "textarea" | "url" | "image" | "boolean" | "json";
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        }
      >;
      portfolio_categories: Table<
        {
          id: string;
          name: string;
          name_ka: string;
          name_en: string;
          slug: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          name_ka?: string;
          name_en?: string;
          slug: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      portfolio_projects: Table<
        PortfolioProject,
        {
          id?: string;
          title: string;
          title_ka?: string;
          title_en?: string;
          slug: string;
          category_id?: string | null;
          category: string;
          category_label_ka?: string;
          category_label_en?: string;
          description?: string;
          description_ka?: string;
          description_en?: string;
          full_description?: string;
          full_description_ka?: string;
          full_description_en?: string;
          problem?: string;
          problem_ka?: string;
          problem_en?: string;
          solution?: string;
          solution_ka?: string;
          solution_en?: string;
          results?: string[];
          results_ka?: string[];
          results_en?: string[];
          technologies?: string[];
          cover_image?: string;
          detail_cover_image_url?: string;
          gallery?: string[];
          link?: string | null;
          featured?: boolean;
          published?: boolean;
          display_order?: number;
          alt_text?: string;
          alt_text_ka?: string;
          alt_text_en?: string;
          seo_title?: string | null;
          seo_title_ka?: string;
          seo_title_en?: string;
          seo_description?: string | null;
          seo_description_ka?: string;
          seo_description_en?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        }
      >;
      team_members: Table<
        TeamMember,
        {
          id?: string;
          name: string;
          name_ka?: string;
          name_en?: string;
          role?: string;
          role_ka?: string;
          role_en?: string;
          bio?: string;
          bio_ka?: string;
          bio_en?: string;
          skills?: string[];
          skills_ka?: string[];
          skills_en?: string[];
          image?: string;
          image_alt_ka?: string;
          image_alt_en?: string;
          socials?: Json;
          display_order?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        }
      >;
      service_packages: Table<
        ServicePackage,
        {
          id?: string;
          section: "website" | "social-media" | "addons";
          category?: string;
          name: string;
          name_ka?: string;
          name_en?: string;
          price?: string;
          price_suffix_ka?: string;
          price_suffix_en?: string;
          custom_price_label_ka?: string;
          custom_price_label_en?: string;
          billing_label?: string | null;
          billing_label_ka?: string;
          billing_label_en?: string;
          description?: string | null;
          description_ka?: string;
          description_en?: string;
          ideal_for?: string | null;
          ideal_for_ka?: string;
          ideal_for_en?: string;
          features?: string[];
          features_ka?: string[];
          features_en?: string[];
          delivery_time?: string | null;
          delivery_time_ka?: string;
          delivery_time_en?: string;
          cta?: string;
          cta_ka?: string;
          cta_en?: string;
          cta_label_ka?: string;
          cta_label_en?: string;
          highlighted?: boolean;
          custom_price?: boolean;
          price_explanation?: string | null;
          price_explanation_ka?: string;
          price_explanation_en?: string;
          icon_name?: string | null;
          display_order?: number;
          published?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        }
      >;
      contact_messages: Table<
        ContactMessage,
        {
          id?: string;
          locale?: "ka" | "en";
          name: string;
          email: string;
          phone?: string;
          company?: string;
          service?: string;
          budget?: string;
          message: string;
          status?: ContactStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      service_requests: Table<
        ServiceRequest,
        {
          id?: string;
          locale?: "ka" | "en";
          service_type: ServiceRequestType;
          service_package?: string;
          customer_name: string;
          customer_email?: string;
          customer_phone?: string;
          customer_company?: string;
          preferred_contact?: string;
          answers?: Json;
          status?: ContactStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type AdminProfile = Database["public"]["Tables"]["admin_profiles"]["Row"];
export type SiteContent = Database["public"]["Tables"]["site_content"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type PortfolioCategory = Database["public"]["Tables"]["portfolio_categories"]["Row"];
export type ContactMessage = {
  id: string;
  locale: "ka" | "en";
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
};
export type ServiceRequest = {
  id: string;
  locale: "ka" | "en";
  service_type: ServiceRequestType;
  service_package: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string;
  preferred_contact: string;
  answers: Json;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
  // New columns for the professional service request system
  service_name?: string;
  client_name?: string;
  email?: string;
  phone?: string;
  business_type?: string;
  business_description?: string;
  has_existing_website?: boolean;
  website_url?: string;
  deadline?: string;
  budget?: string;
};
export type ContactStatus = "new" | "read" | "in_progress" | "closed" | "spam";
export type ServiceRequestStatus = "new" | "contacted" | "in_progress" | "completed" | "cancelled";
export type ServiceRequestType = "website_creation" | "social_media" | "advertising" | "seo_services";

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
  detail_cover_image_url: string;
  gallery: string[];
  link: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  alt_text: string;
  alt_text_ka?: string;
  alt_text_en?: string;
  seo_title: string | null;
  seo_title_ka?: string;
  seo_title_en?: string;
  seo_description: string | null;
  seo_description_ka?: string;
  seo_description_en?: string;
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
  category?: string;
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
  active?: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}
