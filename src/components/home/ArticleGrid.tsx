import Link from "next/link";

interface Article {
  id: string; slug: string; titre: string; theme?: string; format?: string;
  auteur?: string; lecture?: string; image?: string; imgpos?: string; extrait?: string;
}

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  if (!articles.length) return (
    <div className="border border-[#c8c0b0] mb-9 p-5 text-muted text-sm bg-white">
      Aucun article publié.
    </div>
  );
  return (
    <>
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b-2 border-navy">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-navy">Notes récentes</div>
        <a href="#" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted after:content-['_→']">Toutes les notes</a>
      </div>
      <div className="grid grid-cols-3 border border-[#c8c0b0] mb-9 overflow-hidden bg-white">
        {articles.map((a, i) => (
          <Link key={i} href={`/articles/${a.slug}`}
            className={`block overflow-hidden hover:bg-sand ${i < 2 ? "border-r border-[#d8d2c8]" : ""}`}>
            <img src={a.image || "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=600&q=70"}
              alt={a.titre} className="w-full h-[150px] object-cover brightness-[0.78] saturate-75"
              style={{ objectPosition: a.imgpos || "center 20%" }} />
            <div className="p-4">
              <div className="inline-block text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 bg-navy text-white mb-2.5 rounded-[1px]">
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
  );
}
