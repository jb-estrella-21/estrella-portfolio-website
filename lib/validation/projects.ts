import { z } from "zod";

const optionalHttpUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
  z
    .string()
    .url("Enter a valid URL.")
    .refine((value) => value.startsWith("https://") || value.startsWith("http://"), {
      message: "Use an http or https URL.",
    })
    .nullable(),
);

const technologyTags = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))])
    .pipe(z.array(z.string().min(1).max(40)).max(8, "Use up to 8 technology tags.")),
);

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Enter at least 2 characters.").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL slug.")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens."),
  summary: z.string().trim().min(10, "Enter at least 10 characters.").max(240),
  description_markdown: z.string().max(10000, "Keep the description under 10,000 characters."),
  technology_tags: technologyTags,
  live_url: optionalHttpUrl,
  source_url: optionalHttpUrl,
  sort_order: z.coerce.number().int("Use a whole number.").min(0, "Use 0 or higher.").max(10000, "Use 10,000 or lower."),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description_markdown: formData.get("description_markdown") ?? "",
    technology_tags: formData.get("technology_tags") ?? "",
    live_url: formData.get("live_url") ?? "",
    source_url: formData.get("source_url") ?? "",
    sort_order: formData.get("sort_order") ?? "0",
  });
}

export function projectFieldErrors(error: z.ZodError) {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(flattened).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."]),
  );
}
