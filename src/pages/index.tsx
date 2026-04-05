import { GetStaticProps } from "next";
import path from "path";
import fs from "fs";
import Layout from "@/components/layout/Layout";
import Pillars from "@/components/home/Pillars";
import Hero from "@/components/home/Hero";
import ArticleGrid from "@/components/home/ArticleGrid";
import Events from "@/components/home/Events";
import BottomRow from "@/components/home/BottomRow";

export default function Home({ articles, events, layout, siteData }: any) {
  const pubArts = articles.filter((a: any) => a.statut === "Publié");
  const pubEvs = events.filter((e: any) => e.pub);
  const heroVisible = layout.find((b: any) => b.id === "hero" && b.visible);
  const gridArts = heroVisible ? pubArts.slice(3, 6) : pubArts.slice(0, 3);

  const renderBlock = (blockId: string) => {
    if (blockId === "hero") return <Hero key="hero" articles={pubArts} />;
    if (blockId === "piliers") return <Pillars key="piliers" />;
    if (blockId === "notes") return <ArticleGrid key="notes" articles={gridArts} />;
    if (blockId === "evenements") return <Events key="evenements" events={pubEvs} />;
    if (blockId === "conseil") return <BottomRow key="conseil" />;
    return null;
  };

  return (
    <Layout siteData={siteData}>
      <div className="w-full max-w-[1240px] mx-auto px-4 md:px-9 py-6 md:py-8">
        {layout.filter((b: any) => b.visible).map((b: any) => renderBlock(b.id))}
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
      events: db.evenements || [],
      layout: db.layout || [],
      siteData: {
        ticker: db.ticker || [],
        header: db.header || null,
        footer: db.footer || null,
      },
    },
    revalidate: 30,
  };
};
