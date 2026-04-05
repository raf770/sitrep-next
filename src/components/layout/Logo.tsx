"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

interface SiteHeader {
  logoText?: string;
  logoAccent?: string;
  tagline?: string;
  btnText?: string;
  btnVisible?: boolean;
}

interface Article {
  slug: string;
  titre: string;
  theme?: string;
  format?: string;
  image?: string;
  imgpos?: string;
  chapeau?: string;
  corps?: string;
}

export default function Logo({ header, articles }: { header?: SiteHeader; articles?: Article[] }) {
  const logoText = header?.logoText || "SITREP";
  const logoAccent = header?.logoAccent || "REP";
  const tagline = header?.tagline || "L'info au service de la décision";
  const prefix = logoText.replace(logoAccent, "");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const filtered = (articles || []).filter(a =>
      a.titre?.toLowerCase().includes(q) ||
      a.theme?.toLowerCase().includes(q) ||
      a.format?.toLowerCase().includes(q) ||
      a.chapeau?.toLowerCase().includes(q) ||
      a.corps?.toLowerCase().includes(q)
    ).slice(0, 6);
    setResults(filtered);
    setOpen(filtered.length > 0);
  }, [query, articles]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch() {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="bg-sand px-4 md:px-9 py-4 border-b border-[#d8d2c8] flex items-center justify-between w-full">
      <div>
        <Link href="/">
          <div className="font-barlow text-4xl md:text-5xl font-black tracking-wide text-navy leading-none">
            {prefix}<em className="text-accent not-italic">{logoAccent}</em>
          </div>
        </Link>
        <div className="text-[9px] tracking-[0.18em] uppercase text-muted mt-1">{tagline}</div>
      </div>

      {/* Search */}
      <div ref={ref} className="relative hidden md:flex items-center">
        <div className="flex items-center border border-[#c8c0b0] bg-white">
          <input
            type="text"
            placeholder="Rechercher un article, un mot…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="border-none outline-none text-xs text-navy bg-transparent px-3 py-2 w-56"
          />
          {query && (
            <button onClick={() => { setQuery(""); setOpen(false); }} className="text-muted hover:text-navy px-2 text-sm leading-none">×</button>
          )}
          <button
            onClick={handleSearch}
            className="bg-navy text-white px-3 py-2 flex items-center justify-center hover:bg-navy2 transition-colors"
            title="Rechercher"
          >
            <svg className="w-3.5 h-3.5 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* Dropdown résultats rapides */}
        {open && (
          <div className="absolute top-full left-0 right-0 bg-white border border-[#c8c0b0] border-t-0 shadow-lg z-50 max-h-80 overflow-y-auto">
            {results.map((a, i) => (
              <Link key={i} href={`/articles/${a.slug}`} onClick={() => { setQuery(""); setOpen(false); }}
                className="flex items-center gap-3 p-3 hover:bg-sand border-b border-[#e8e4de] last:border-b-0">
                {a.image && (
                  <img src={a.image} alt={a.titre} className="w-10 h-10 object-cover flex-shrink-0 brightness-90"
                    style={{ objectPosition: a.imgpos || "center" }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy leading-snug truncate">{a.titre}</div>
                  {(a.theme || a.format) && (
                    <div className="text-[10px] text-muted mt-0.5">{a.theme}{a.theme && a.format ? " · " : ""}{a.format}</div>
                  )}
                </div>
              </Link>
            ))}
            <Link href={`/recherche?q=${encodeURIComponent(query)}`} onClick={() => setOpen(false)}
              className="block p-3 text-[11px] font-semibold text-navy text-center hover:bg-sand border-t border-[#e8e4de]">
              Voir tous les résultats pour "{query}" →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
