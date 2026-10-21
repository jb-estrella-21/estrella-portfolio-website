"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function archiveProjectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/projects?error=invalid-action");

  const supabase = await createSupabaseServerClient();
  const { data: project, error: lookupError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !project) throw new Error("The selected project could not be found.");
  const { error } = await supabase.from("projects").update({ status: "archived" }).eq("id", id);
  if (error) throw new Error("The project could not be archived.");

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  redirect("/admin/projects?updated=1");
}
