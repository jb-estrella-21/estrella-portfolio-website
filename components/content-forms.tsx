"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, replaceSkillsAction, updateSectionsAction, type ContentFormState } from "@/app/actions/content";
import type { ProfileRow, SectionRow, SkillRow } from "@/lib/supabase/database.types";

function FieldError({ state, field }: { state: ContentFormState; field: string }) {
  const error = state.errors?.[field];
  return error ? <span className="field-error" id={`${field}-error`}>{error}</span> : null;
}

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {} as ContentFormState);
  const [values, setValues] = useState({
    display_name: profile.display_name,
    professional_title: profile.professional_title,
    intro_line: profile.intro_line,
    biography_markdown: profile.biography_markdown,
    experience_markdown: profile.experience_markdown,
    contact_email: profile.contact_email ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    github_url: profile.github_url ?? "",
    other_url: profile.other_url ?? "",
  });
  const fields = [
    ["linkedin_url", "LinkedIn URL", profile.linkedin_url],
    ["github_url", "GitHub URL", profile.github_url],
    ["other_url", "Other profile URL", profile.other_url],
  ] as const;

  return (
    <form action={formAction} className="form">
      {state.message && <p className={state.message.endsWith("saved.") ? "form-success" : "form-message"} role={state.message.endsWith("saved.") ? "status" : "alert"}>{state.message}</p>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="display_name">Name</label>
          <input id="display_name" name="display_name" maxLength={100} value={values.display_name} onChange={(event) => setValues({ ...values, display_name: event.target.value })} aria-describedby={state.errors?.display_name ? "display_name-error" : undefined} />
          <FieldError state={state} field="display_name" />
        </div>
        <div className="field">
          <label htmlFor="professional_title">Professional focus</label>
          <input id="professional_title" name="professional_title" maxLength={140} value={values.professional_title} onChange={(event) => setValues({ ...values, professional_title: event.target.value })} placeholder="Add your title or focus" aria-describedby={state.errors?.professional_title ? "professional_title-error" : undefined} />
          <FieldError state={state} field="professional_title" />
        </div>
        <div className="field field-full">
          <label htmlFor="intro_line">Short introduction</label>
          <textarea id="intro_line" name="intro_line" rows={3} maxLength={240} value={values.intro_line} onChange={(event) => setValues({ ...values, intro_line: event.target.value })} placeholder="A short line for the home page" aria-describedby={state.errors?.intro_line ? "intro_line-error" : "intro_line-help"} />
          <small id="intro_line-help">Up to 240 characters. Leave empty to show the portfolio placeholder.</small>
          <FieldError state={state} field="intro_line" />
        </div>
        <div className="field field-full">
          <label htmlFor="biography_markdown">About</label>
          <textarea id="biography_markdown" name="biography_markdown" rows={10} maxLength={12000} value={values.biography_markdown} onChange={(event) => setValues({ ...values, biography_markdown: event.target.value })} placeholder="Write a short biography. Markdown is supported." aria-describedby={state.errors?.biography_markdown ? "biography_markdown-error" : "biography-help"} />
          <small id="biography-help">Markdown is supported; raw HTML is disabled.</small>
          <FieldError state={state} field="biography_markdown" />
        </div>
        <div className="field field-full">
          <label htmlFor="experience_markdown">Experience and education</label>
          <textarea id="experience_markdown" name="experience_markdown" rows={8} maxLength={12000} value={values.experience_markdown} onChange={(event) => setValues({ ...values, experience_markdown: event.target.value })} placeholder="Add roles, education, or relevant milestones. Markdown is supported." aria-describedby={state.errors?.experience_markdown ? "experience_markdown-error" : "experience-help"} />
          <small id="experience-help">This content appears when the Experience / education section is visible.</small>
          <FieldError state={state} field="experience_markdown" />
        </div>
        <div className="field">
          <label htmlFor="contact_email">Contact email</label>
          <input id="contact_email" name="contact_email" type="email" maxLength={254} value={values.contact_email} onChange={(event) => setValues({ ...values, contact_email: event.target.value })} aria-describedby={state.errors?.contact_email ? "contact_email-error" : undefined} />
          <FieldError state={state} field="contact_email" />
        </div>
        {fields.map(([name, label, value]) => (
          <div className="field" key={name}>
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} type="url" inputMode="url" placeholder="https://" value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} aria-describedby={state.errors?.[name] ? `${name}-error` : undefined} />
            <FieldError state={state} field={name} />
          </div>
        ))}
      </div>
      {state.message && state.errors && <p className="form-message" role="alert">{state.message}</p>}
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Saving…" : "Save profile"}</button>
      </div>
    </form>
  );
}

export function SkillsForm({ skills }: { skills: SkillRow[] }) {
  const [state, formAction, pending] = useActionState(replaceSkillsAction, {} as ContentFormState);
  const value = skills.map((skill) => skill.category ? `${skill.label} | ${skill.category}` : skill.label).join("\n");
  const [skillsText, setSkillsText] = useState(value);

  return (
    <form action={formAction} className="form">
      <div className="field">
        <label htmlFor="skills">Skills</label>
        <textarea id="skills" name="skills" rows={10} value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder={"Skill name | Category\nAnother skill | Optional category"} aria-describedby="skills-help" />
        <small id="skills-help">One skill per line. Add an optional category after a vertical bar. Line order controls display order.</small>
      </div>
      {state.message && <p className={state.message.endsWith("saved.") ? "form-success" : "form-message"} role={state.message.endsWith("saved.") ? "status" : "alert"}>{state.message}</p>}
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Saving…" : "Save skills"}</button>
      </div>
    </form>
  );
}

export function SectionsForm({ sections }: { sections: SectionRow[] }) {
  const [state, formAction, pending] = useActionState(updateSectionsAction, {} as ContentFormState);
  const byKey = new Map(sections.map((section) => [section.section_key, section]));
  const rows = ["about", "projects", "skills", "experience", "contact"] as const;
  const [settings, setSettings] = useState(() => Object.fromEntries(rows.map((key) => {
    const section = byKey.get(key);
    return [key, { order: String(section?.sort_order ?? 0), visible: section?.is_visible ?? false }];
  })) as Record<(typeof rows)[number], { order: string; visible: boolean }>);

  return (
    <form action={formAction} className="form">
      <p className="section-help">Choose which fixed sections appear in navigation and set their order. Projects and Contact stay visible for quick access.</p>
      <div className="section-settings">
        {rows.map((key) => {
          const section = byKey.get(key);
          const locked = key === "projects" || key === "contact";
          return (
            <div className="section-setting" key={key}>
              <div className="section-setting-name">
                <strong>{section?.label ?? key}</strong>
                {locked && <small>Always visible</small>}
              </div>
              <label className="section-visibility">
                <input type="checkbox" name={`visible_${key}`} checked={locked || settings[key].visible} onChange={(event) => setSettings({ ...settings, [key]: { ...settings[key], visible: event.target.checked } })} disabled={locked} />
                <span>Show</span>
              </label>
              <label className="section-order">
                <span>Order</span>
                <input type="number" name={`order_${key}`} min={0} max={1000} step={1} value={settings[key].order} onChange={(event) => setSettings({ ...settings, [key]: { ...settings[key], order: event.target.value } })} required />
              </label>
            </div>
          );
        })}
      </div>
      {state.message && <p className={state.message.endsWith("saved.") ? "form-success" : "form-message"} role={state.message.endsWith("saved.") ? "status" : "alert"}>{state.message}</p>}
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Saving…" : "Save sections"}</button>
      </div>
    </form>
  );
}
