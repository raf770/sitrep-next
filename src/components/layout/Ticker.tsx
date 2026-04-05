"use client";

const items = [
  { tag: "BREAKING", text: "Escalade en Mer Rouge — décryptage exclusif" },
  { tag: "PROGRAMME", text: "Iran post-accord — 8 Avril" },
  { tag: "", text: "Gaza : pourparlers à Doha, sources OSINT" },
  { tag: "PARIS", text: "Sahel & dynamiques sécuritaires — 15 Mai" },
];

export default function Ticker() {
  const content = items.map((item, i) => (
    <span key={i}>
      {item.tag && <strong className="text-white/85">{item.tag} </strong>}
      <span className="text-white/45">{item.text}</span>
      <span className="mx-7 opacity-20">|</span>
    </span>
  ));

  return (
    <div className="bg-navy py-1.5 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-[scroll_38s_linear_infinite] text-[10px] tracking-[0.09em]">
        {content}{content}
      </div>
    </div>
  );
}
