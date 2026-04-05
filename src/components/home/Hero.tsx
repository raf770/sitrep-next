import Link from "next/link";

interface Article {
  id: string; slug: string; titre: string; chapeau?: string;
  theme?: string; format?: string; auteur?: string; date?: string;
  lecture?: string; image?: string; imgpos?: string; extrait?: string; statut?: string;
}

export default function Hero({ articles }: { articles: Article[] }) {
  const hero = articles[0];
  const side1 = articles[1];
  const side2 = articles[2];
  if (!hero) return null;
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr] border border-[#c8c0b0] mb-9 overflow-hidden">
      {/* Hero principal */}
      <div className="relative min-h-[280px] md:min-h-[420px] overflow-hidden">
        <img src={hero.image || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&q=80"} alt={hero.titre}
          className="w-full h-full object-cover brightness-[0.45] absolute inset-0"
          style={{ objectPosition: hero.imgpos || "center" }} />
        <div className="absolute inset-0 p-6 md:p-8 bg-gradient-to-t from-[rgba(18,25,56,0.97)] via-[rgba(18,25,56,0.2)] to-transparent flex flex-col justify-end">
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 mb-2">
            {hero.format || "Note"}{hero.theme ? ` · ${hero.theme}` : ""}
          </div>
          <Link href={`/articles/${hero.slug}`} className="text-xl md:text-[26px] font-black leading-tight text-white mb-2 block hover:underline">
            {hero.titre}
          </Link>
          <div className="text-[11px] text-white/45">
            {hero.auteur && <strong className="text-white/80">{hero.auteur}</strong>}
            {hero.date && ` · ${formatDate(hero.date)}`}
            {hero.lecture && ` · ${hero.lecture}`}
          </div>
        </div>
      </div>
      {/* Articles côté */}
      <div className="flex flex-row md:flex-col border-t md:border-t-0 md:border-l border-[#d8d2c8] bg-white">
        {[side1, side2].filter(Boolean).map((a, i) => (
          <Link key={i} href={`/articles/${a!.slug}`}
            className="p-3 md:p-4 border-r md:border-r-0 md:border-b border-[#d8d2c8] flex flex-col flex-1 hover:bg-sand overflow-hidden">
            {a!.image && (
              <div className="w-full h-24 md:h-32 overflow-hidden mb-2 flex-shrink-0">
                <img src={a!.image} alt={a!.titre} className="w-full h-full object-cover brightness-[0.85]"
                  style={{ objectPosition: a!.imgpos || "center 20%" }} />
              </div>
            )}
            {a!.theme && <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-navy2 mb-1">{a!.theme}</div>}
            <div className="text-[12px] md:text-[13px] font-semibold text-navy leading-snug">{a!.titre}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
