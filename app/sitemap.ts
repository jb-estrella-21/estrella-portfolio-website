import type { MetadataRoute } from "next";
import { DEFAULT_PUBLIC_SECTIONS } from "@/lib/content-config";
import { listPublicSections } from "@/lib/content";
import { listPublishedProjects } from "@/lib/projects";
import { getPublicSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const sectionPaths = {
  about: "/about",
  projects: "/projects",
  skills: "/skills",
  experience: "/experience",
  contact: "/contact",
} as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  if (!siteUrl) return [];

  const [sectionsResult, projectsResult] = await Promise.allSettled([
    listPublicSections(),
    listPublishedProjects(),
  ]);
  const sections = sectionsResult.status === "fulfilled"
    ? sectionsResult.value
    : DEFAULT_PUBLIC_SECTIONS;
  const projects = projectsResult.status === "fulfilled" ? projectsResult.value : [];
  const visibleKeys = new Set(sections.map((section) => section.section_key));

  const entries: MetadataRoute.Sitemap = [{
    url: new URL("/", siteUrl).toString(),
    changeFrequency: "weekly",
    priority: 1,
  }];

  for (const [key, path] of Object.entries(sectionPaths) as [keyof typeof sectionPaths, string][]) {
    if (!visibleKeys.has(key)) continue;
    entries.push({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: key === "projects" ? "weekly" : "monthly",
      priority: key === "projects" || key === "contact" ? 0.8 : 0.6,
    });
  }

  if (visibleKeys.has("projects")) {
    for (const project of projects) {
      entries.push({
        url: new URL(`/projects/${project.slug}`, siteUrl).toString(),
        lastModified: project.updated_at,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
