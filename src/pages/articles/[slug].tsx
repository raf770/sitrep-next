import { GetStaticProps, GetStaticPaths } from "next";
import path from "path";
import fs from "fs";
import Link from "next/link";
import Layout from "@/components/layout/Layout";

export default function ArticlePage({ article }: any) {
  if (!article) return <div>Article introuvable</div>;

  const corps = (article.corps || "").split("\n\n").map((p: string, i: number) =>
    p.trim() ? <p key={i} style={{ marginBottom: 20 }}>{p}</p> : null
  );

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <Layout>
      <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
        <img
          src={article.image || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80"}
          alt={article.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: article.imgpos || "center", filter: "brightness(.45)" }}
        />
        <div style={{ position: "absolute", inset: 0, padding: 48, background: "linear-gradient(to top, rgba(18,25,56,.97) 0%, transparent 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginBottom: 10 }}>
            {article.format} · {article.theme}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, color: "#fff", marginBottom: 12, maxWidth: 800 }}>{article.titre}</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", display: "flex", gap: 16 }}>
            <strong style={{ color: "rgba(255,255,255,.85)", fontWeight: 500 }}>{article.auteur}</strong>
            {article.date && <span>{formatDate(article.date)}</span>}
            {article.lecture && <span>· {article.lecture}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 36px" }}>
        {article.chapeau && (
          <div style={{ fontSize: 18, fontWeight: 400, color: "#7a7468", lineHeight: 1.6, marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid #d8d2c8" }}>
            {article.chapeau}
          </div>
        )}
        {article.credit && <div style={{ fontSize: 10, color: "#7a7468", textAlign: "right", marginBottom: 16 }}>{article.credit}</div>}
        <div style={{ fontSize: 15, lineHeight: 1.85, color: "#1a1f3a" }}>{corps}</div>
        {article.tags && article.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 32, paddingTop: 24, borderTop: "1px solid #d8d2c8" }}>
            {article.tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", background: "#ede8df", border: "1px solid #d8d2c8", borderRadius: 2, color: "#7a7468" }}>{tag}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #d8d2c8" }}>
          <Link href="/" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#1a2744", textDecoration: "none" }}>← Retour à l'accueil</Link>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const dbPath = path.join(process.cwd(), "content", "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const paths = (db.articles || [])
    .filter((a: any) => a.statut === "Publié" && a.slug)
    .map((a: any) => ({ params: { slug: a.slug } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const dbPath = path.join(process.cwd(), "content", "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const article = (db.articles || []).find((a: any) => a.slug === params?.slug) || null;
  if (!article) return { notFound: true };
  return { props: { article } };
};
