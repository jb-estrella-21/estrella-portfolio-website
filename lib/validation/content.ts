import { z } from "zod";
import { SECTION_KEYS } from "@/lib/content-config";
import type { SectionKey } from "@/lib/supabase/database.types";

const optionalHttpUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
  z.string().url("Enter a valid URL.").refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    "Use an http or https URL.",
  ).nullable(),
);

export const profileSchema = z.object({
  display_name: z.string().trim().max(100, "Use 100 characters or fewer."),
  professional_title: z.string().trim().max(140, "Use 140 characters or fewer."),
  intro_line: z.string().trim().max(240, "Use 240 characters or fewer."),
  biography_markdown: z.string().trim().max(12000, "Use 12,000 characters or fewer."),
  experience_markdown: z.string().trim().max(12000, "Use 12,000 characters or fewer."),
  contact_email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
    z.string().email("Enter a valid email address.").max(254).nullable(),
  ),
  linkedin_url: optionalHttpUrl,
  github_url: optionalHttpUrl,
  other_url: optionalHttpUrl,
});

export const skillSchema = z.object({
  label: z.string().trim().min(1, "Enter a skill name.").max(80),
  category: z.string().trim().max(80),
});

export const skillsSchema = z.array(skillSchema).max(100, "Add up to 100 skills.").superRefine((skills, context) => {
  const seen = new Set<string>();
  skills.forEach((skill, index) => {
    const key = `${skill.label.toLocaleLowerCase()}\u0000${skill.category.toLocaleLowerCase()}`;
    if (seen.has(key)) {
      context.addIssue({ code: "custom", message: `Duplicate skill on line ${index + 1}.` });
    }
    seen.add(key);
  });
});

export function parseProfileForm(formData: FormData) {
  return profileSchema.safeParse({
    display_name: formData.get("display_name") ?? "",
    professional_title: formData.get("professional_title") ?? "",
    intro_line: formData.get("intro_line") ?? "",
    biography_markdown: formData.get("biography_markdown") ?? "",
    experience_markdown: formData.get("experience_markdown") ?? "",
    contact_email: formData.get("contact_email") ?? "",
    linkedin_url: formData.get("linkedin_url") ?? "",
    github_url: formData.get("github_url") ?? "",
    other_url: formData.get("other_url") ?? "",
  });
}

export function parseSkillsForm(formData: FormData) {
  const raw = formData.get("skills");
  const lines = (typeof raw === "string" ? raw : "").split(/\r?\n/);
  const skills = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const divider = line.indexOf("|");
      return divider < 0
        ? { label: line, category: "" }
        : { label: line.slice(0, divider).trim(), category: line.slice(divider + 1).trim() };
    });
  return skillsSchema.safeParse(skills);
}

export function parseSectionsForm(formData: FormData) {
  const rows: Array<{ section_key: SectionKey; sort_order: number; is_visible: boolean }> = [];

  for (const key of SECTION_KEYS) {
    const rawOrder = formData.get(`order_${key}`);
    const sort_order = typeof rawOrder === "string" && /^\d{1,4}$/.test(rawOrder)
      ? Number(rawOrder)
      : Number.NaN;
    const is_visible = key === "projects" || key === "contact"
      ? true
      : formData.get(`visible_${key}`) === "on";

    if (!Number.isInteger(sort_order) || sort_order < 0 || sort_order > 1000) {
      return { success: false as const, message: `Choose an order from 0 to 1000 for ${key}.` };
    }
    rows.push({ section_key: key, sort_order, is_visible });
  }

  return { success: true as const, data: rows };
}

export function fieldErrors(error: z.ZodError) {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(flattened).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."]),
  );
}
