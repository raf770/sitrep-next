export default function Footer() {
  return (
    <footer className="bg-navy pt-8 px-4 md:px-9">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-7">
        <div>
          <div className="font-barlow text-2xl font-black text-white tracking-wide mb-1">
            SIT<em className="text-accent not-italic">REP</em>
          </div>
          <div className="text-[9px] tracking-[0.16em] uppercase text-white/25 mb-4">L'info au service de la décision</div>
          <div className="flex gap-1.5">
            <a href="https://x.com" target="_blank" className="w-7 h-7 border border-white/15 flex items-center justify-center">
              <svg className="w-3 h-3 fill-white/40" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" className="w-7 h-7 border border-white/15 flex items-center justify-center">
              <svg className="w-3 h-3 fill-white/40" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-8 md:gap-11">
          <div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/28 mb-3">Notes & Décryptages</div>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">MENA</a>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">OSINT</a>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">Europe</a>
          </div>
          <div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/28 mb-3">Programme</div>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">Séminaires</a>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">Lives</a>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">Podcasts</a>
          </div>
          <div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/28 mb-3">Services</div>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">Notre approche</a>
            <a href="#" className="block text-[11px] text-white/45 mb-1.5 hover:text-white">Contact</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.07] py-3 flex justify-between text-[10px] text-white/20">
        <span>© {new Date().getFullYear()} SITREP</span>
        <span>L'info au service de la décision</span>
      </div>
    </footer>
  );
}
