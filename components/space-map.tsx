import Link from "next/link";
import type { SectionKey, SectionRow } from "@/lib/supabase/database.types";

const destinations: Record<SectionKey, { description: string; code: string }> = {
  about: { description: "Background and approach", code: "PROFILE" },
  projects: { description: "Selected work and process", code: "ARCHIVE" },
  skills: { description: "Tools and capabilities", code: "TOOLKIT" },
  experience: { description: "Experience and education", code: "TIMELINE" },
  contact: { description: "Get in touch", code: "TRANSMISSION" },
};

const sectionPaths: Record<SectionKey, string> = {
  about: "/about",
  projects: "/projects",
  skills: "/skills",
  experience: "/experience",
  contact: "/contact",
};

export function SpaceMap({ sections }: { sections: SectionRow[] }) {
  return (
    <section className="space-map-section" aria-labelledby="space-map-heading">
      <div className="section-heading map-heading-row">
        <div>
          <p className="eyebrow">Navigation chart</p>
          <h2 id="space-map-heading" tabIndex={-1}>Choose a destination</h2>
        </div>
        <p>Each stop opens a full page with its own link, ready to revisit or share.</p>
      </div>
      <div className="space-map-field">
        <svg className="space-map-route" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="route-line" x1="0" x2="1">
              <stop offset="0" stopColor="#8ed9d2" stopOpacity="0.06" />
              <stop offset="0.5" stopColor="#8ed9d2" stopOpacity="0.44" />
              <stop offset="1" stopColor="#f3c78d" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path d="M20 98 C190 18 290 156 500 88 S790 18 980 100" fill="none" stroke="url(#route-line)" strokeWidth="2" strokeDasharray="5 9" />
          <circle cx="500" cy="88" r="54" fill="none" stroke="#8ed9d2" strokeOpacity="0.08" />
          <circle cx="500" cy="88" r="73" fill="none" stroke="#8ed9d2" strokeOpacity="0.05" />
        </svg>
        <div className="map-star map-star-one" aria-hidden="true" />
        <div className="map-star map-star-two" aria-hidden="true" />
        <div className="map-star map-star-three" aria-hidden="true" />
        <nav className="space-destinations" aria-label="Portfolio destinations">
          {sections.map((section, index) => {
            const destination = destinations[section.section_key];
            return (
              <Link className={`space-destination destination-${section.section_key}`} href={sectionPaths[section.section_key]} key={section.section_key}>
                <span className="destination-marker" aria-hidden="true"><span /></span>
                <span className="destination-code">{String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {destination.code}</span>
                <strong>{section.label}</strong>
                <span className="destination-description">{destination.description}</span>
                <span className="destination-open">Open destination <span aria-hidden="true">↗</span></span>
              </Link>
            );
          })}
        </nav>
      </div>
      <p className="map-note">You can also use the persistent navigation above or open any destination directly.</p>
    </section>
  );
}
