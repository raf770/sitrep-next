import Link from "next/link";

interface Article {
  slug: string;
  title: string;
  theme?: string;
  format?: string;
  auteur?: string;
  date?: string;
  lecture?: string;
  image?: string;
  imgpos?: string;
}

interface HeroProps {
  articles: Article[];
}

export default function Hero({ articles }: HeroProps) {
  const hero = articles[0];
  const side1 = articles[1];
  const side2 = articles[2];

  if (!hero) return null;

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div className="grid grid-cols-[2fr_1fr] border border-[#c8c0b0] mb-9 overflow-hidden">
      {/* Main hero */}
      <div className="relative min-h-[420px] overflow-hidden">
        <img
          src={hero.image || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&q=80"}
          alt={hero.title}
          className="w-full h-full object-cover brightness-[0.45] absolute inset-0"
          style={{ objectPosition: hero.imgpos || "center" }}
        />
        <div className="absolute inset-0 p-8 bg-gradient-to-t from-[rgba(18,25,56,0.97)] via-[rgba(18,25,56,0.2)] to-transparent flex flex-col justify-end">
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 mb-2.5">
            {hero.format || "Note"} · {hero.theme}
          </div>
          <Link href={`/articles/${hero.slug}`} className="text-[26px] font-black leading-tight text-white mb-2.5 block hover:underline">
            {hero.title}
          </Link>
          <div className="text-[11px] text-white/45">
            <strong className="text-white/80">{hero.auteur}</strong>
            {hero.date && ` · ${formatDate(hero.date)}`}
            {hero.lecture && ` · ${hero.lecture}`}
          </div>
        </div>
      </div>

      {/* Side articles */}
      <div className="flex flex-col border-l border-[#d8d2c8] bg-white">
        {[side1, side2].filter(Boolean).map((a, i) => (
          <Link
            key={i}
            href={`/articles/${a!.slug}`}
            className="p-4 border-b border-[#d8d2c8] flex flex-col flex-1 hover:bg-sand overflow-hidden"
          >
            {a!.image && (
              <div className="w-full h-32 overflow-hidden mb-2 flex-shrink-0">
                <img
                  src={a!.image}
                  alt={a!.title}
                  className="w-full h-full object-cover brightness-[0.85]"
                  style={{ objectPosition: a!.imgpos || "center 20%" }}
                />
              </div>
            )}
            <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-navy2 mb-1">{a!.theme}</div>
            <div className="text-[13px] font-semibold text-navy leading-snug">{a!.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
