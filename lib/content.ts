import "server-only";

import { createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_PUBLIC_SECTIONS } from "@/lib/content-config";
import type { MediaAssetRow, ProfileRow, SectionRow, SkillRow } from "@/lib/supabase/database.types";
import type { SectionKey } from "@/lib/supabase/database.types";

export const EMPTY_PROFILE: ProfileRow = {
  id: 1,
  display_name: "",
  professional_title: "",
  intro_line: "",
  biography_markdown: "",
  experience_markdown: "",
  contact_email: null,
  linkedin_url: null,
  github_url: null,
  other_url: null,
  updated_at: "",
};

export async function getPublicProfile(): Promise<ProfileRow> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from("site_profile").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Unable to load portfolio profile: ${error.message}`);
  return data ?? EMPTY_PROFILE;
}

export async function getAdminProfile(): Promise<ProfileRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_profile").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Unable to load portfolio profile: ${error.message}`);
  return data ?? EMPTY_PROFILE;
}

export async function listPublicSections(): Promise<SectionRow[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("portfolio_sections")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("section_key", { ascending: true });
  if (error) throw new Error(`Unable to load portfolio sections: ${error.message}`);
  return data ?? DEFAULT_PUBLIC_SECTIONS;
}

export async function isPublicSectionVisible(key: SectionKey): Promise<boolean> {
  try {
    const sections = await listPublicSections();
    return sections.some((section) => section.section_key === key);
  } catch {
    return DEFAULT_PUBLIC_SECTIONS.some((section) => section.section_key === key);
  }
}

export async function listAdminSections(): Promise<SectionRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_sections")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("section_key", { ascending: true });
  if (error) throw new Error(`Unable to load portfolio sections: ${error.message}`);
  return data ?? [];
}

export async function listPublicSkills(): Promise<SkillRow[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(`Unable to load skills: ${error.message}`);
  return data ?? [];
}

export async function listAdminSkills(): Promise<SkillRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(`Unable to load skills: ${error.message}`);
  return data ?? [];
}

export async function listPublicMedia(projectIds: string[]): Promise<MediaAssetRow[]> {
  if (!projectIds.length) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .in("project_id", projectIds)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Unable to load project media: ${error.message}`);
  return data ?? [];
}

export async function listAdminProjectMedia(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Unable to load project media: ${error.message}`);

  const media = data ?? [];
  return Promise.all(media.map(async (asset) => {
    const { data: signed } = await supabase.storage.from("portfolio-media").createSignedUrl(asset.storage_path, 300);
    return { ...asset, previewUrl: signed?.signedUrl ?? null };
  }));
}
