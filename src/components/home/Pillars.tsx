const pillars = [
  {
    color: "bg-navy",
    label: "Décryptages & Notes OSINT",
    title: "Des lectures de fond sur les dynamiques géopolitiques du moment",
    desc: "Croisement de sources ouvertes, terrain et expertise académique.",
    link: "Explorer",
    textColor: "text-navy",
  },
  {
    color: "bg-accent",
    label: "Programme & Rencontres",
    title: "Séminaires, tables rondes et lives avec nos experts",
    desc: "Un calendrier régulier pour débattre et comprendre les grands enjeux.",
    link: "Voir le programme",
    textColor: "text-accent",
  },
  {
    color: "bg-[#2e6e48]",
    label: "Expertise & Accompagnement",
    title: "Notes sur mesure et due diligence géopolitique pour décideurs",
    desc: "Cartographie des risques et accompagnement confidentiel.",
    link: "Nous contacter",
    textColor: "text-[#2e6e48]",
  },
];

export default function Pillars() {
  return (
    <div className="grid grid-cols-3 border border-[#c8c0b0] mb-9 bg-white">
      {pillars.map((p, i) => (
        <div key={i} className={`p-6 ${i < 2 ? "border-r border-[#d8d2c8]" : ""}`}>
          <div className={`w-7 h-[3px] ${p.color} mb-3.5`} />
          <div className="text-[9px] font-bold tracking-[0.22em] uppercase text-muted mb-1.5">{p.label}</div>
          <div className="text-sm font-bold text-navy leading-snug mb-2">{p.title}</div>
          <div className="text-xs text-muted leading-relaxed font-light mb-3.5">{p.desc}</div>
          <a href="#" className={`text-[10px] font-bold tracking-[0.1em] uppercase ${p.textColor} after:content-['_→']`}>
            {p.link}
          </a>
        </div>
      ))}
    </div>
  );
}
