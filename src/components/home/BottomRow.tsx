export default function BottomRow() {
  return (
    <div className="grid grid-cols-2 border border-[#c8c0b0] overflow-hidden mb-9">
      {/* Conseil */}
      <div className="bg-navy p-9">
        <div className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/30 mb-2.5">
          Expertise & Accompagnement
        </div>
        <div className="text-[21px] font-black text-white leading-tight mb-3.5">
          Accompagnement géopolitique pour décideurs et organisations
        </div>
        <ul className="mb-6 flex flex-col gap-1.5">
          {[
            "Notes de risque pays et cartographie des menaces",
            "Due diligence géopolitique avant implantation",
            "Notes confidentielles MENA, Afrique, Europe",
            "Veille OSINT et alertes sur mesure",
          ].map((item, i) => (
            <li key={i} className="text-xs text-white/55 font-light pl-4 relative leading-relaxed before:content-['—'] before:absolute before:left-0 before:text-white/35">
              {item}
            </li>
          ))}
        </ul>
        <button className="text-[10px] font-bold tracking-[0.1em] uppercase text-white border border-white/35 px-5 py-2.5">
          Prendre contact →
        </button>
      </div>

      {/* Newsletter */}
      <div className="bg-sand2 p-9 flex flex-col justify-center">
        <div className="text-[9px] font-bold tracking-[0.22em] uppercase text-accent mb-2.5">
          Briefing du matin
        </div>
        <div className="text-[21px] font-black text-navy leading-tight mb-2.5">
          Le SITREP du matin
        </div>
        <div className="text-xs text-muted font-light leading-relaxed mb-5">
          Notes exclusives, signaux OSINT et calendrier des rencontres. Chaque matin, avant l'heure.
        </div>
        <div className="flex">
          <input
            type="email"
            placeholder="email@domaine.com"
            className="flex-1 border border-r-0 border-[#c8c0b0] px-3.5 py-2.5 text-sm outline-none bg-white"
          />
          <button className="bg-navy text-white text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2.5 border border-navy">
            Recevoir →
          </button>
        </div>
      </div>
    </div>
  );
}
