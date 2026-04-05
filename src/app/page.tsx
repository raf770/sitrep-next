import Layout from "@/components/layout/Layout";
import Pillars from "@/components/home/Pillars";
import Hero from "@/components/home/Hero";
import ArticleGrid from "@/components/home/ArticleGrid";
import Events from "@/components/home/Events";
import BottomRow from "@/components/home/BottomRow";

const testArticles = [
  {
    slug: "test-article-1",
    title: "Escalade en Mer Rouge : analyse des dynamiques régionales",
    theme: "MENA",
    format: "Décryptage",
    auteur: "Karim Mansouri",
    date: "2026-04-04",
    lecture: "8 min",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&q=80",
    imgpos: "center",
    extrait: "Une analyse approfondie des tensions en Mer Rouge et leurs implications géopolitiques.",
  },
  {
    slug: "test-article-2",
    title: "Iran post-accord : les nouveaux équilibres",
    theme: "MENA",
    format: "Note",
    auteur: "Sara El-Amine",
    date: "2026-04-03",
    lecture: "6 min",
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=600&q=70",
    imgpos: "center",
    extrait: "Les dynamiques qui redessinent le paysage régional après l'accord.",
  },
  {
    slug: "test-article-3",
    title: "Gaza : pourparlers à Doha, sources OSINT",
    theme: "OSINT",
    format: "Brief",
    auteur: "Nadia Khoury",
    date: "2026-04-02",
    lecture: "4 min",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70",
    imgpos: "center",
    extrait: "Décryptage des négociations en cours à travers les sources ouvertes.",
  },
  {
    slug: "test-article-4",
    title: "Sahel : dynamiques sécuritaires 2026",
    theme: "MENA",
    format: "Analyse",
    auteur: "Karim Mansouri",
    date: "2026-04-01",
    lecture: "10 min",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=70",
    imgpos: "center",
    extrait: "Tour d'horizon des nouvelles configurations sécuritaires au Sahel.",
  },
  {
    slug: "test-article-5",
    title: "Europe et MENA : nouvelles alliances énergétiques",
    theme: "Europe",
    format: "Décryptage",
    auteur: "Sara El-Amine",
    date: "2026-03-30",
    lecture: "7 min",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=70",
    imgpos: "center",
    extrait: "Comment l'Europe restructure ses partenariats énergétiques avec le monde arabe.",
  },
];

const testEvents = [
  { titre: "Iran post-accord", type: "Webinaire", date: "2026-04-08", lieu: "En ligne", int: "Karim Mansouri", lien: "#" },
  { titre: "Sahel & sécurité", type: "Conférence", date: "2026-04-15", lieu: "Paris", int: "Sara El-Amine", lien: "#" },
  { titre: "OSINT & renseignement", type: "Live", date: "2026-04-22", lieu: "En ligne", int: "Nadia Khoury", lien: "#" },
  { titre: "Géopolitique du Golfe", type: "Podcast", date: "2026-04-29", lieu: "En ligne", int: "Karim Mansouri", lien: "#" },
];

export default function Home() {
  return (
    <Layout>
      <div className="max-w-[1240px] mx-auto px-9 py-8">
        <Pillars />
        <Hero articles={testArticles} />
        <ArticleGrid articles={testArticles.slice(3)} />
        <Events events={testEvents} />
        <BottomRow />
      </div>
    </Layout>
  );
}
