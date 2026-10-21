import type { SectionKey, SectionRow } from "@/lib/supabase/database.types";

export const SECTION_LABELS: Record<SectionKey, string> = {
  about: "About",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience / education",
  contact: "Contact",
};

export const SECTION_KEYS = Object.keys(SECTION_LABELS) as SectionKey[];

export const DEFAULT_PUBLIC_SECTIONS: SectionRow[] = [
  { section_key: "about", label: "About", sort_order: 10, is_visible: true },
  { section_key: "projects", label: "Projects", sort_order: 20, is_visible: true },
  { section_key: "skills", label: "Skills", sort_order: 30, is_visible: true },
  { section_key: "contact", label: "Contact", sort_order: 50, is_visible: true },
];
