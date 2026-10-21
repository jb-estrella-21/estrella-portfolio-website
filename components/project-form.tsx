"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ProjectFormState } from "@/app/actions/projects";

type ProjectAction = (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;

type ProjectValues = {
  title?: string;
  slug?: string;
  summary?: string;
  description_markdown?: string;
  technology_tags?: string[];
  live_url?: string | null;
  source_url?: string | null;
  sort_order?: number;
};

export function ProjectForm({ action, project }: { action: ProjectAction; project?: ProjectValues }) {
  const [state, formAction, pending] = useActionState(action, {} as ProjectFormState);
  const [values, setValues] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    summary: project?.summary ?? "",
    description_markdown: project?.description_markdown ?? "",
    technology_tags: project?.technology_tags?.join(", ") ?? "",
    live_url: project?.live_url ?? "",
    source_url: project?.source_url ?? "",
    sort_order: String(project?.sort_order ?? 0),
  });

  function errorFor(field: string) {
    const error = state.errors?.[field];
    return error ? <span className="field-error" id={`${field}-error`}>{error}</span> : null;
  }

  return (
    <form action={formAction} className="form">
      {state.message && <p className="form-message" role="alert">{state.message}</p>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="title">Project title</label>
          <input id="title" name="title" required minLength={2} maxLength={100} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} aria-describedby={state.errors?.title ? "title-error" : undefined} />
          {errorFor("title")}
        </div>
        <div className="field">
          <label htmlFor="slug">URL slug</label>
          <input id="slug" name="slug" required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="project-name" value={values.slug} onChange={(event) => setValues({ ...values, slug: event.target.value })} aria-describedby={state.errors?.slug ? "slug-error" : "slug-help"} />
          <small id="slug-help">Lowercase letters, numbers, and hyphens.</small>
          {errorFor("slug")}
        </div>
        <div className="field field-full">
          <label htmlFor="summary">Short summary</label>
          <textarea id="summary" name="summary" required minLength={10} maxLength={240} rows={3} value={values.summary} onChange={(event) => setValues({ ...values, summary: event.target.value })} aria-describedby={state.errors?.summary ? "summary-error" : "summary-help"} />
          <small id="summary-help">10 to 240 characters. This appears in the project list.</small>
          {errorFor("summary")}
        </div>
        <div className="field field-full">
          <label htmlFor="description_markdown">Project details</label>
          <textarea id="description_markdown" name="description_markdown" maxLength={10000} value={values.description_markdown} onChange={(event) => setValues({ ...values, description_markdown: event.target.value })} placeholder="Describe the problem, your approach, and the outcome. Markdown is supported." aria-describedby={state.errors?.description_markdown ? "description_markdown-error" : "description-help"} />
          <small id="description-help">Markdown is supported. Raw HTML is disabled.</small>
          {errorFor("description_markdown")}
        </div>
        <div className="field field-full">
          <label htmlFor="technology_tags">Technologies</label>
          <input id="technology_tags" name="technology_tags" maxLength={400} placeholder="TypeScript, React, PostgreSQL" value={values.technology_tags} onChange={(event) => setValues({ ...values, technology_tags: event.target.value })} aria-describedby={state.errors?.technology_tags ? "technology_tags-error" : "technology_tags-help"} />
          <small id="technology_tags-help">Separate up to 8 tags with commas.</small>
          {errorFor("technology_tags")}
        </div>
        <div className="field">
          <label htmlFor="live_url">Live project URL</label>
          <input id="live_url" name="live_url" type="url" inputMode="url" placeholder="https://" value={values.live_url} onChange={(event) => setValues({ ...values, live_url: event.target.value })} aria-describedby={state.errors?.live_url ? "live_url-error" : undefined} />
          {errorFor("live_url")}
        </div>
        <div className="field">
          <label htmlFor="source_url">Source code URL</label>
          <input id="source_url" name="source_url" type="url" inputMode="url" placeholder="https://" value={values.source_url} onChange={(event) => setValues({ ...values, source_url: event.target.value })} aria-describedby={state.errors?.source_url ? "source_url-error" : undefined} />
          {errorFor("source_url")}
        </div>
        <div className="field">
          <label htmlFor="sort_order">Display order</label>
          <input id="sort_order" name="sort_order" type="number" min={0} max={10000} step={1} value={values.sort_order} onChange={(event) => setValues({ ...values, sort_order: event.target.value })} aria-describedby={state.errors?.sort_order ? "sort_order-error" : "sort_order-help"} />
          <small id="sort_order-help">Lower numbers appear first. Ties use publication date.</small>
          {errorFor("sort_order")}
        </div>
      </div>
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Saving…" : project ? "Save changes" : "Create draft"}
        </button>
        <Link className="text-link" href="/admin/projects">Cancel</Link>
      </div>
    </form>
  );
}
