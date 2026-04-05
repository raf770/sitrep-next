interface Event {
  titre: string;
  type: string;
  date?: string;
  lieu?: string;
  int?: string;
  lien?: string;
}

const typeClass: Record<string, string> = {
  Webinaire: "border-navy text-navy",
  Conférence: "border-accent text-accent",
  Live: "border-[#6a3090] text-[#6a3090]",
  Podcast: "border-[#2e6e48] text-[#2e6e48]",
  "Table ronde": "border-accent text-accent",
};

export default function Events({ events }: { events: Event[] }) {
  if (!events.length) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b-2 border-navy">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-navy">Programme</div>
        <a href="#" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted after:content-['_→']">Tout le calendrier</a>
      </div>
      <div className="grid grid-cols-4 border border-[#c8c0b0] mb-9 overflow-hidden bg-white">
        {events.slice(0, 4).map((e, i) => (
          <div key={i} className={`p-5 hover:bg-sand ${i < 3 ? "border-r border-[#d8d2c8]" : ""}`}>
            <div className={`h-[3px] w-full mb-3.5 ${typeClass[e.type]?.includes("navy") ? "bg-navy" : typeClass[e.type]?.includes("accent") ? "bg-accent" : typeClass[e.type]?.includes("6a3090") ? "bg-[#6a3090]" : "bg-[#2e6e48]"}`} />
            <div className={`text-[9px] font-bold tracking-[0.16em] uppercase mb-1.5 ${typeClass[e.type]?.split(" ")[1] || "text-navy"}`}>{e.type}</div>
            <div className="text-[10px] text-muted mb-1.5">
              {e.date && new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              {e.lieu && ` · ${e.lieu}`}
            </div>
            <div className="text-[13px] font-bold text-navy leading-snug mb-1.5">{e.titre}</div>
            <div className="text-[11px] text-muted font-light mb-3">Avec <strong className="text-navy font-semibold">{e.int}</strong></div>
            <a href={e.lien || "#"} target="_blank" className={`text-[9px] font-bold tracking-[0.1em] uppercase after:content-['_→'] ${typeClass[e.type]?.split(" ")[1] || "text-navy"}`}>S'inscrire</a>
          </div>
        ))}
      </div>
    </>
  );
}
