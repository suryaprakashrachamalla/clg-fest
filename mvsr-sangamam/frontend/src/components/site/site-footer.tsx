import { FEST } from "@/config/fest";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-8 text-sm text-zinc-500">
      <div className="container-x flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>
          © {FEST.edition} {FEST.name} · MVSR Engineering College
        </p>
        <a href={`mailto:${FEST.contact.email}`} className="hover:text-zinc-300">
          {FEST.contact.email}
        </a>
      </div>
    </footer>
  );
}
