"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
}

export default function Logo({ header, articles }: { header?: SiteHeader; articles?: Article[] }) {
  const logoText = header?.logoText || "SITREP";
  const logoAccent = header?.logoAccent || "REP";
  const tagline = header?.tagline || "L'info au service de la décision";
  const btnText = header?.btnText || "S'abonner";
  const btnVisible = header?.btnVisible !== false;
  const prefix = logoText.replace(logoAccent, "");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const filtered = (articles || []).filter(a =>
      a.titre?.toLowerCase().includes(q) ||
      a.theme?.toLowerCase().includes(q) ||
      a.format?.toLowerCase().includes(q)
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
      <div className="flex items-center gap-3">
        {/* Search */}
        <div ref={ref} className="relative hidden md:block">
          <div className="flex items-center border border-[#c8c0b0] bg-white px-3 py-1.5 gap-2">
            <svg className="w-3.5 h-3.5 stroke-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              className="border-none outline-none text-xs text-navy bg-transparent w-44"
            />
            {query && (
              <button onClick={() => { setQuery(""); setOpen(false); }} className="text-muted hover:text-navy text-sm leading-none">×</button>
            )}
          </div>
          {/* Results dropdown */}
          {open && (
            <div className="absolute top-full left-0 right-0 bg-white border border-[#c8c0b0] border-t-0 shadow-lg z-50 max-h-80 overflow-y-auto">
              {results.map((a, i) => (
                <Link key={i} href={`/articles/${a.slug}`} onClick={() => { setQuery(""); setOpen(false); }}
                  className="flex items-center gap-3 p-3 hover:bg-sand border-b border-[#e8e4de] last:border-b-0">
                  {a.image && (
                    <img src={a.image} alt={a.titre} className="w-10 h-10 object-cover flex-shrink-0 brightness-90"
                      style={{ objectPosition: a.imgpos || "center" }} />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-navy leading-snug">{a.titre}</div>
                    {(a.theme || a.format) && (
                      <div className="text-[10px] text-muted mt-0.5">{a.theme}{a.theme && a.format ? " · " : ""}{a.format}</div>
                    )}
                  </div>
                </Link>
              ))}
              {results.length === 0 && (
                <div className="p-3 text-xs text-muted text-center">Aucun résultat</div>
              )}
            </div>
          )}
        </div>
        {btnVisible && (
          <button className="text-[10px] font-bold tracking-wide uppercase text-white bg-accent px-3.5 py-2 rounded-sm">
            {btnText}
          </button>
        )}
      </div>
    </div>
  );
}
