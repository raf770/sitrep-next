interface Event {
  id: string; titre: string; type?: string; date?: string;
  lieu?: string; int?: string; lien?: string; pub?: boolean;
}

const typeColors: Record<string, { stripe: string; text: string }> = {
  "Webinaire": { stripe: "bg-navy", text: "text-navy" },
  "Conférence": { stripe: "bg-accent", text: "text-accent" },
  "Live": { stripe: "bg-[#6a3090]", text: "text-[#6a3090]" },
  "Podcast": { stripe: "bg-[#2e6e48]", text: "text-[#2e6e48]" },
  "Table ronde": { stripe: "bg-accent", text: "text-accent" },
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
        {events.slice(0, 4).map((e, i) => {
          const colors = typeColors[e.type || ""] || { stripe: "bg-navy", text: "text-navy" };
          return (
            <div key={e.id} className={`p-5 hover:bg-sand ${i < 3 ? "border-r border-[#d8d2c8]" : ""}`}>
              <div className={`h-[3px] w-full mb-3.5 ${colors.stripe}`} />
              <div className={`text-[9px] font-bold tracking-[0.16em] uppercase mb-1.5 ${colors.text}`}>{e.type}</div>
              <div className="text-[10px] text-muted mb-1.5">
                {e.date && new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                {e.lieu && ` · ${e.lieu}`}
              </div>
              <div className="text-[13px] font-bold text-navy leading-snug mb-1.5">{e.titre}</div>
              {e.int && <div className="text-[11px] text-muted font-light mb-3">Avec <strong className="text-navy font-semibold">{e.int}</strong></div>}
              <a href={e.lien || "#"} target="_blank" className={`text-[9px] font-bold tracking-[0.1em] uppercase after:content-['_→'] ${colors.text}`}>S'inscrire</a>
            </div>
          );
        })}
      </div>
    </>
  );
}
