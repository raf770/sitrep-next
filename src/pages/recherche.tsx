import { GetStaticProps } from "next";
import path from "path";
import fs from "fs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Layout from "@/components/layout/Layout";

export default function RecherchePage({ articles, siteData }: any) {
  const router = useRouter();
  const q = (router.query.q as string || "").toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return [];
    return (articles || []).filter((a: any) =>
      a.statut === "Publié" && (
        a.titre?.toLowerCase().includes(q) ||
        a.theme?.toLowerCase().includes(q) ||
        a.format?.toLowerCase().includes(q) ||
        a.chapeau?.toLowerCase().includes(q) ||
        a.corps?.toLowerCase().includes(q) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(q))
      )
    );
  }, [q, articles]);

  const highlight = (text: string, max = 120) => {
    if (!text) return "";
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text.slice(0, max) + (text.length > max ? "…" : "");
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + q.length + 80);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <Layout siteData={siteData}>
      <div className="w-full max-w-[1240px] mx-auto px-4 md:px-9 py-6 md:py-8">
        <div className="mb-8 pb-4 border-b-2 border-navy">
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted mb-2">Recherche</div>
          <h1 className="text-2xl md:text-3xl font-black text-navy">
            {q ? `Résultats pour "${router.query.q}"` : "Recherche"}
          </h1>
          <div className="text-sm text-muted mt-1">
            {results.length} résultat{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
          </div>
        </div>

        {!q && (
          <div className="text-center py-16 text-muted">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-semibold text-navy">Entrez un mot dans la barre de recherche</div>
          </div>
        )}

        {q && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">😕</div>
            <div className="text-lg font-semibold text-navy mb-2">Aucun résultat pour "{router.query.q}"</div>
            <div className="text-sm text-muted mb-8">Essayez avec d'autres mots-clés</div>
            <Link href="/" className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy border-b border-navy pb-0.5">← Retour à l'accueil</Link>
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-0 border border-[#c8c0b0] overflow-hidden bg-white">
            {results.map((a: any, i: number) => (
              <Link key={i} href={`/articles/${a.slug}`}
                className="flex gap-4 p-5 border-b border-[#e8e4de] last:border-b-0 hover:bg-sand transition-colors">
                {a.image && (
                  <img src={a.image} alt={a.titre}
                    className="w-24 h-16 object-cover flex-shrink-0 brightness-90"
                    style={{ objectPosition: a.imgpos || "center" }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {a.format && <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 bg-navy text-white rounded-[1px]">{a.format}</span>}
                    {a.theme && <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-muted">{a.theme}</span>}
                  </div>
                  <div className="text-[15px] font-bold text-navy leading-snug mb-1">{a.titre}</div>
                  {a.chapeau && <div className="text-xs text-muted leading-relaxed mb-1.5">{highlight(a.chapeau)}</div>}
                  {a.corps && !a.chapeau && <div className="text-xs text-muted leading-relaxed mb-1.5">{highlight(a.corps)}</div>}
                  <div className="text-[10px] text-muted">
                    {a.auteur && <span>{a.auteur}</span>}
                    {a.auteur && a.date && <span> · </span>}
                    {a.date && <span>{formatDate(a.date)}</span>}
                    {a.lecture && <span> · {a.lecture}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy border-b border-navy pb-0.5">← Retour à l'accueil</Link>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const dbPath = path.join(process.cwd(), "content", "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  return {
    props: {
      articles: db.articles || [],
      siteData: {
        ticker: db.ticker || [],
        header: db.header || null,
        footer: db.footer || null,
        articles: (db.articles || []).filter((a: any) => a.statut === "Publié"),
      },
    },
    revalidate: 30,
  };
};
