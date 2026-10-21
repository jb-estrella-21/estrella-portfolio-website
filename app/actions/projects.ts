"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseProjectForm, projectFieldErrors } from "@/lib/validation/projects";

export type ProjectFormState = {
  message?: string;
  errors?: Record<string, string>;
};

function databaseErrorMessage(message: string) {
  if (message.includes("projects_slug_key")) return "That URL slug is already in use. Choose another.";
  return "The project could not be saved. Please try again.";
}

export async function createProjectAction(
  _previous: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if (!parsed.success) return { errors: projectFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").insert({
    ...parsed.data,
    status: "draft",
  });

  if (error) return { message: databaseErrorMessage(error.message) };
  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/admin/projects?created=1");
}

export async function updateProjectAction(
  id: string,
  _previous: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if (!parsed.success) return { errors: projectFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: lookupError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !existing) return { message: "This project could not be found." };

  const { error } = await supabase.from("projects").update(parsed.data).eq("id", id);
  if (error) return { message: databaseErrorMessage(error.message) };

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${existing.slug}`);
  revalidatePath(`/projects/${parsed.data.slug}`);
  redirect("/admin/projects?updated=1");
}

export async function changeProjectStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["published", "draft", "archived"].includes(status)) {
    redirect("/admin/projects?error=invalid-action");
  }

  const supabase = await createSupabaseServerClient();
  const { data: project, error: lookupError } = await supabase
    .from("projects")
    .select("slug, status, published_at")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !project) throw new Error("The selected project could not be found.");

  const publishedAt = status === "published" && project.status !== "published"
    ? new Date().toISOString()
    : project.published_at;
  const { error } = await supabase
    .from("projects")
    .update({ status: status as "published" | "draft" | "archived", published_at: publishedAt })
    .eq("id", id);

  if (error) throw new Error("The project status could not be changed.");

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  redirect("/admin/projects?updated=1");
}
