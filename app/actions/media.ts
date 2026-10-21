"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentFormState } from "@/app/actions/content";

const maxBytes = 5 * 1024 * 1024;

function refreshProject(slug: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
}

export async function uploadProjectMediaAction(
  projectId: string,
  _previous: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin();

  const rawFile = formData.get("file");
  const altResult = z.string().trim().min(3, "Describe the image in at least 3 characters.").max(200, "Use 200 characters or fewer.").safeParse(formData.get("alt_text"));
  if (!altResult.success) return { errors: { alt_text: altResult.error.issues[0]?.message ?? "Enter alt text." } };
  if (!(rawFile instanceof File) || rawFile.size === 0) return { message: "Choose an image to upload." };
  if (rawFile.size > maxBytes) return { message: "Choose an image smaller than 5 MiB." };

  const supabase = await createSupabaseServerClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug")
    .eq("id", projectId)
    .maybeSingle();
  if (projectError || !project) return { message: "The project could not be found." };

  let converted: { data: Buffer; info: { width: number; height: number } };
  try {
    const input = Buffer.from(await rawFile.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "error" });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
      return { message: "Use a JPEG, PNG, or WebP image." };
    }
    converted = await image
      .rotate()
      .resize({ width: 2400, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return { message: "This file could not be decoded as an image. Try another JPEG, PNG, or WebP file." };
  }

  if (converted.data.byteLength === 0 || converted.data.byteLength > maxBytes) {
    return { message: "The optimized image exceeds the 5 MiB limit. Choose a smaller source image." };
  }

  const { data: currentMedia, error: mediaError } = await supabase
    .from("media_assets")
    .select("display_order")
    .eq("project_id", projectId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (mediaError) return { message: "Project media could not be loaded. Try again." };

  const storagePath = `${projectId}/${randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from("portfolio-media")
    .upload(storagePath, converted.data, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (uploadError) return { message: "The image could not be uploaded. Check the storage setup and try again." };

  const { error: insertError } = await supabase.from("media_assets").insert({
    project_id: projectId,
    storage_path: storagePath,
    alt_text: altResult.data,
    mime_type: "image/webp",
    byte_size: converted.data.byteLength,
    width: converted.info.width,
    height: converted.info.height,
    display_order: (currentMedia?.display_order ?? -1) + 1,
  });

  if (insertError) {
    await supabase.storage.from("portfolio-media").remove([storagePath]);
    return { message: "The image uploaded but could not be attached to this project. Try again." };
  }

  refreshProject(project.slug);
  revalidatePath(`/admin/projects/${projectId}/edit`);
  return { message: "Image uploaded and optimized." };
}

export async function updateProjectMediaAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const parsed = z.object({
    alt_text: z.string().trim().min(3).max(200),
    display_order: z.coerce.number().int().min(0).max(10000),
  }).safeParse({
    alt_text: formData.get("alt_text"),
    display_order: formData.get("display_order"),
  });
  if (!id || !projectId || !parsed.success) redirect(`/admin/projects/${projectId}/edit?mediaError=invalid`);

  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase.from("projects").select("slug").eq("id", projectId).maybeSingle();
  const { data: updated, error } = await supabase
    .from("media_assets")
    .update(parsed.data)
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id")
    .maybeSingle();
  if (error || !updated || !project) redirect(`/admin/projects/${projectId}/edit?mediaError=update`);
  refreshProject(project.slug);
  revalidatePath(`/admin/projects/${projectId}/edit`);
  redirect(`/admin/projects/${projectId}/edit?media=updated`);
}

export async function deleteProjectMediaAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!id || !projectId) redirect("/admin/projects?error=invalid-action");

  const supabase = await createSupabaseServerClient();
  const { data: asset } = await supabase
    .from("media_assets")
    .select("id, storage_path, project_id")
    .eq("id", id)
    .eq("project_id", projectId)
    .maybeSingle();
  const { data: project } = await supabase.from("projects").select("slug").eq("id", projectId).maybeSingle();
  if (!asset || !project) redirect(`/admin/projects/${projectId}/edit?mediaError=missing`);

  const { error: deleteRowError } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (deleteRowError) redirect(`/admin/projects/${projectId}/edit?mediaError=delete`);

  refreshProject(project.slug);
  revalidatePath(`/admin/projects/${projectId}/edit`);
  const { error: removeError } = await supabase.storage.from("portfolio-media").remove([asset.storage_path]);
  if (removeError) redirect(`/admin/projects/${projectId}/edit?mediaError=cleanup`);
  redirect(`/admin/projects/${projectId}/edit?media=deleted`);
}
