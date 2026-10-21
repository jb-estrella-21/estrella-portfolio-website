import { ProfileForm, SectionsForm, SkillsForm } from "@/components/content-forms";
import { getAdminProfile, listAdminSections, listAdminSkills } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  try {
    const [profile, skills, sections] = await Promise.all([
      getAdminProfile(),
      listAdminSkills(),
      listAdminSections(),
    ]);

    return (
      <>
        <p className="eyebrow">Portfolio settings</p>
        <h1>Profile &amp; sections</h1>
        <p className="admin-lead">Edit the public profile, contact links, skills, and fixed navigation sections.</p>
        <section className="admin-content-section">
          <div className="admin-toolbar"><h2>Profile</h2></div>
          <div className="admin-panel"><ProfileForm profile={profile} /></div>
        </section>
        <section className="admin-content-section">
          <div className="admin-toolbar"><h2>Skills</h2></div>
          <div className="admin-panel"><SkillsForm skills={skills} /></div>
        </section>
        <section className="admin-content-section">
          <div className="admin-toolbar"><h2>Section navigation</h2></div>
          <div className="admin-panel"><SectionsForm sections={sections} /></div>
        </section>
      </>
    );
  } catch {
    return (
      <>
        <p className="eyebrow">Portfolio settings</p>
        <h1>Profile &amp; sections</h1>
        <p className="notice" role="status">Content settings could not be loaded. Apply the Phase 2 migration and check the Supabase connection.</p>
      </>
    );
  }
}
