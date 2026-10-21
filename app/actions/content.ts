"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SECTION_LABELS } from "@/lib/content-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors, parseProfileForm, parseSectionsForm, parseSkillsForm } from "@/lib/validation/content";

export type ContentFormState = { message?: string; errors?: Record<string, string> };

export async function updateProfileAction(
  _previous: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin();
  const parsed = parseProfileForm(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_profile")
    .update(parsed.data)
    .eq("id", 1)
    .select("id")
    .maybeSingle();

  if (error || !data) return { message: "The profile could not be saved. Check the database setup and try again." };
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  return { message: "Profile saved." };
}

export async function replaceSkillsAction(
  _previous: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin();
  const parsed = parseSkillsForm(formData);
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Check the skill list and try again." };

  const supabase = await createSupabaseServerClient();
  const skills = parsed.data.map((skill, sort_order) => ({ ...skill, sort_order }));
  const { error } = await supabase.rpc("replace_portfolio_skills", { p_skills: skills });
  if (error) return { message: "Skills could not be saved. Check for duplicate entries and try again." };

  revalidatePath("/skills");
  revalidatePath("/");
  return { message: "Skills saved." };
}

export async function updateSectionsAction(
  _previous: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin();
  const parsed = parseSectionsForm(formData);
  if (!parsed.success) return { message: parsed.message };

  const supabase = await createSupabaseServerClient();
  const rows = parsed.data.map((row) => ({ ...row, label: SECTION_LABELS[row.section_key] }));
  const { error } = await supabase.from("portfolio_sections").upsert(rows, { onConflict: "section_key" });
  if (error) return { message: "Section settings could not be saved. Try again." };

  for (const path of ["/", "/about", "/projects", "/skills", "/experience", "/contact"]) {
    revalidatePath(path);
  }
  return { message: "Section settings saved." };
}
