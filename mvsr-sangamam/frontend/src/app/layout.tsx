import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FEST } from "@/config/fest";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: `${FEST.name} ${FEST.edition} · ${FEST.dateLabel}`, template: `%s · ${FEST.name}` },
  description: `${FEST.name} — the official fest of MVSR Engineering College, ${FEST.locationShort}. ${FEST.dateLabel}. Events, competitions and a 24-hour hackathon.`,
  openGraph: { title: `${FEST.name} ${FEST.edition}`, description: FEST.tagline },
};

export const viewport: Viewport = { themeColor: "#05040a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] btn-primary">
          Skip to content
        </a>
        <SmoothScroll>
          <SiteHeader />
          <main id="main" className="relative">{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
