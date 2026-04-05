import { GetStaticProps, GetStaticPaths } from "next";
import path from "path";
import fs from "fs";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import ArticleGrid from "@/components/home/ArticleGrid";

const THEMES: Record<string, string> = {
  "mena": "MENA",
  "europe": "Europe",
  "osint": "OSINT",
  "podcasts": "Podcasts",
  "programme": "Événements",
  "services": "Services",
};

export default function ThemePage({ theme, articles }: any) {
  return (
    <Layout>
      <div className="w-full max-w-[1240px] mx-auto px-4 md:px-9 py-6 md:py-8">
        <div className="mb-8 pb-4 border-b-2 border-navy">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted mb-1">Thème</div>
          <h1 className="text-3xl font-black text-navy">{theme}</h1>
          <div className="text-sm text-muted mt-1">{articles.length} article{articles.length > 1 ? "s" : ""}</div>
        </div>
        {articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-lg font-semibold text-navy mb-2">Aucun article pour ce thème</div>
            <Link href="/" className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy mt-4 block">← Retour à l'accueil</Link>
          </div>
        )}
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
  return { props: { theme: themeName, articles }, revalidate: 30 };
};
