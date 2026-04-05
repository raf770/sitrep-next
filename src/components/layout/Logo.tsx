import Link from "next/link";

export default function Logo() {
  return (
    <div className="bg-sand px-4 md:px-9 py-4 border-b border-[#d8d2c8] flex items-center justify-between w-full">
      <div>
        <Link href="/">
          <div className="font-barlow text-4xl md:text-5xl font-black tracking-wide text-navy leading-none">
            SIT<em className="text-accent not-italic">REP</em>
          </div>
        </Link>
        <div className="text-[9px] tracking-[0.18em] uppercase text-muted mt-1">
          L'info au service de la décision
        </div>
      </div>
      <div className="hidden md:flex items-center border border-[#c8c0b0] bg-white px-3 py-1.5 gap-2">
        <svg className="w-3.5 h-3.5 stroke-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Rechercher…" className="border-none outline-none text-xs text-navy bg-transparent w-44" />
      </div>
    </div>
  );
}
