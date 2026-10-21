import "server-only";

import { createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectRow } from "@/lib/supabase/database.types";

export async function listPublishedProjects(): Promise<ProjectRow[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Unable to load published projects: ${error.message}`);
  return data ?? [];
}

export async function getPublishedProject(slug: string): Promise<ProjectRow | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Unable to load project: ${error.message}`);
  return data;
}

export async function listAdminProjects(): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load projects: ${error.message}`);
  return data ?? [];
}

export async function getAdminProject(id: string): Promise<ProjectRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load project: ${error.message}`);
  return data;
}
