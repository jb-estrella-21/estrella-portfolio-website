import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/seo";
import "./globals.css";

const publicSiteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  ...(publicSiteUrl ? { metadataBase: publicSiteUrl, alternates: { canonical: publicSiteUrl } } : {}),
  title: {
    default: "Portfolio",
    template: "%s · Portfolio",
  },
  description: "Explore a portfolio of selected projects, profile details, and contact information.",
  openGraph: {
    title: "Portfolio",
    description: "Explore a portfolio of selected projects, profile details, and contact information.",
    type: "website",
    siteName: "Portfolio",
    ...(publicSiteUrl ? { url: publicSiteUrl } : {}),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
