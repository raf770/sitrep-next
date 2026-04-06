import { GetStaticProps, GetStaticPaths } from "next";
import path from "path";
import fs from "fs";
import Link from "next/link";
import Layout from "@/components/layout/Layout";

const THEMES: Record<string, string> = {
  "mena": "MENA",
  "europe": "Europe",
  "osint": "OSINT",
  "podcasts": "Podcasts",
  "programme": "Événements",
};

export default function ThemePage({ theme, articles, siteData }: any) {
  const hero = articles[0];
  const grid = articles.slice(1, 4);
  const rest = articles.slice(4);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <Layout siteData={siteData}>
      <div className="w-full max-w-[1240px] mx-auto px-4 md:px-9 py-6 md:py-8">
        {/* Header thème */}
        <div className="mb-8 pb-4 border-b-2 border-navy flex items-end justify-between">
          <div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted mb-1">Thème</div>
            <h1 className="text-3xl md:text-4xl font-black text-navy">{theme}</h1>
          </div>
          <div className="text-sm text-muted">{articles.length} article{articles.length > 1 ? "s" : ""}</div>
        </div>

        {!articles.length && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📝</div>
            <div className="text-xl font-semibold text-navy mb-2">Aucun article pour ce thème</div>
            <div className="text-sm text-muted mb-8">Revenez bientôt !</div>
            <Link href="/" className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy border-b border-navy pb-0.5">← Retour à l'accueil</Link>
          </div>
        )}

        {/* Hero article */}
        {hero && (
          <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr] border border-[#c8c0b0] mb-9 overflow-hidden">
            <div className="relative min-h-[280px] md:min-h-[380px] overflow-hidden">
              <img src={hero.image || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&q=80"}
                alt={hero.titre} className="w-full h-full object-cover brightness-[0.45] absolute inset-0"
                style={{ objectPosition: hero.imgpos || "center" }} />
              <div className="absolute inset-0 p-6 md:p-8 bg-gradient-to-t from-[rgba(18,25,56,0.97)] via-[rgba(18,25,56,0.2)] to-transparent flex flex-col justify-end">
                <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 mb-2">
                  {hero.format || "Note"}{hero.theme ? ` · ${hero.theme}` : ""}
                </div>
                <Link href={`/articles/${hero.slug}`} className="text-xl md:text-[26px] font-black leading-tight text-white mb-2 block hover:underline">
                  {hero.titre}
                </Link>
                {hero.chapeau && <div className="text-sm text-white/60 mb-2 hidden md:block">{hero.chapeau}</div>}
                <div className="text-[11px] text-white/45">
                  {hero.auteur && <strong className="text-white/80">{hero.auteur}</strong>}
                  {hero.date && ` · ${formatDate(hero.date)}`}
                  {hero.lecture && ` · ${hero.lecture}`}
                </div>
              </div>
            </div>
            {/* Articles côté */}
            {grid.slice(0, 2).length > 0 && (
              <div className="flex flex-row md:flex-col border-t md:border-t-0 md:border-l border-[#d8d2c8] bg-white">
                {grid.slice(0, 2).map((a: any, i: number) => (
                  <Link key={i} href={`/articles/${a.slug}`}
                    className="p-3 md:p-4 border-r md:border-r-0 md:border-b border-[#d8d2c8] flex flex-col flex-1 hover:bg-sand overflow-hidden">
                    {a.image && (
                      <div className="w-full h-20 md:h-28 overflow-hidden mb-2">
                        <img src={a.image} alt={a.titre} className="w-full h-full object-cover brightness-[0.85]"
                          style={{ objectPosition: a.imgpos || "center 20%" }} />
                      </div>
                    )}
                    <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-navy2 mb-1">{a.format || a.theme}</div>
                    <div className="text-[13px] font-semibold text-navy leading-snug">{a.titre}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grille articles */}
        {grid.slice(2).length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b-2 border-navy">
              <div className="text-[10px] font-black tracking-[0.25em] uppercase text-navy">Toutes les notes</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border border-[#c8c0b0] mb-9 overflow-hidden bg-white">
              {[...grid.slice(2), ...rest].map((a: any, i: number, arr: any[]) => (
                <Link key={i} href={`/articles/${a.slug}`}
                  className={`block overflow-hidden hover:bg-sand ${i < arr.length - 1 ? "border-b md:border-b-0 md:border-r border-[#d8d2c8]" : ""}`}>
                  <img src={a.image || "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=600&q=70"}
                    alt={a.titre} className="w-full h-[160px] object-cover brightness-[0.78] saturate-75"
                    style={{ objectPosition: a.imgpos || "center 20%" }} />
                  <div className="p-4">
                    <div className="inline-block text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 bg-navy text-white mb-2 rounded-[1px]">
                      {a.format || a.theme || "Note"}
                    </div>
                    <div className="text-[15px] font-bold text-navy leading-snug mb-1.5">{a.titre}</div>
                    {a.extrait && <div className="text-xs text-muted leading-relaxed font-light mb-3">{a.extrait}</div>}
                    <div className="text-[10px] text-[#bbb] border-t border-[#d8d2c8] pt-2.5 flex justify-between">
                      <span>{a.auteur}</span><span>{a.lecture}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <Link href="/" className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy border-b border-navy pb-0.5">← Retour à l'accueil</Link>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(THEMES).map(slug => ({ params: { theme: slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const dbPath = path.join(process.cwd(), "content", "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const themeKey = params?.theme as string;
  const themeName = THEMES[themeKey] || themeKey;
  const articles = (db.articles || []).filter((a: any) => a.statut === "Publié" && a.theme === themeName);
  return {
    props: {
      theme: themeName,
      articles,
      siteData: { ticker: db.ticker || [], header: db.header || null, footer: db.footer || null },
    },
    revalidate: 30,
  };
};
