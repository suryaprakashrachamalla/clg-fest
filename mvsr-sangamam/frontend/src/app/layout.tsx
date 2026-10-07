import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FEST } from "@/config/fest";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: `${FEST.name} ${FEST.edition}`, template: `%s · ${FEST.shortName}` },
  description: `${FEST.name}, the fest of MVSR Engineering College, ${FEST.locationShort}. ${FEST.dateLabel}. Technical, semitechnical and cultural events.`,
  openGraph: { title: `${FEST.name} ${FEST.edition}`, description: FEST.tagline },
};

export const viewport: Viewport = { themeColor: "#08090c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] btn-primary">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
