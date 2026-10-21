export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProjectStatus = "draft" | "published" | "archived";

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description_markdown: string;
  technology_tags: string[];
  live_url: string | null;
  source_url: string | null;
  status: ProjectStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: number;
  display_name: string;
  professional_title: string;
  intro_line: string;
  biography_markdown: string;
  experience_markdown: string;
  contact_email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  other_url: string | null;
  updated_at: string;
};

export type SectionKey = "about" | "projects" | "skills" | "experience" | "contact";

export type SectionRow = {
  section_key: SectionKey;
  label: string;
  sort_order: number;
  is_visible: boolean;
};

export type SkillRow = {
  id: string;
  label: string;
  category: string;
  sort_order: number;
  created_at: string;
};

export type MediaAssetRow = {
  id: string;
  project_id: string;
  storage_path: string;
  alt_text: string;
  mime_type: "image/webp";
  byte_size: number;
  width: number;
  height: number;
  display_order: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { id: string; email: string; created_at: string };
        Insert: { id: string; email: string; created_at?: string };
        Update: { id?: string; email?: string; created_at?: string };
        Relationships: [];
      };
      projects: {
        Row: ProjectRow;
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary: string;
          description_markdown?: string;
          technology_tags?: string[];
          live_url?: string | null;
          source_url?: string | null;
          status?: ProjectStatus;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          summary?: string;
          description_markdown?: string;
          technology_tags?: string[];
          live_url?: string | null;
          source_url?: string | null;
          status?: ProjectStatus;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_profile: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      portfolio_sections: {
        Row: SectionRow;
        Insert: SectionRow;
        Update: Partial<SectionRow>;
        Relationships: [];
      };
      skills: {
        Row: SkillRow;
        Insert: Omit<SkillRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<SkillRow>;
        Relationships: [];
      };
      media_assets: {
        Row: MediaAssetRow;
        Insert: Omit<MediaAssetRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<MediaAssetRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_portfolio_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      replace_portfolio_skills: { Args: { p_skills: Json }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
