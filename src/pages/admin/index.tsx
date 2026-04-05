import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

// ─── TYPES ───────────────────────────────────────────────────
interface Article {
  id: string; slug: string; titre: string; chapeau?: string; corps?: string;
  extrait?: string; theme?: string; format?: string; tags?: string[];
  auteur?: string; langue?: string; date?: string; lecture?: string;
  image?: string; imgpos?: string; credit?: string; seoTitle?: string;
  metaDesc?: string; statut?: string; une?: boolean; home?: boolean;
}
interface Evenement {
  id: string; titre: string; type?: string; date?: string; lieu?: string;
  int?: string; lien?: string; pub?: boolean;
}
interface TickerItem { tag: string; text: string; }
interface LayoutBlock { id: string; label: string; icon: string; desc: string; visible: boolean; }
interface Collaborateur { email: string; role: string; }
interface NavLink { label: string; href: string; }
interface FooterCol { title: string; links: NavLink[]; }
interface SiteHeader {
  logoText: string; logoAccent: string; tagline: string;
  navLinks: NavLink[]; btnText: string; btnVisible: boolean;
}
interface Social { name: string; url: string; icon: string; }
interface SiteFooter {
  cols: FooterCol[]; copyright: string;
  socialX?: string; socialLinkedin?: string;
  socials?: Social[];
}
interface DB {
  articles: Article[]; evenements: Evenement[]; ticker: TickerItem[];
  layout: LayoutBlock[]; collaborateurs: Collaborateur[]; theme?: any;
  header?: SiteHeader; footer?: SiteFooter;
}

const DEFAULT_HEADER: SiteHeader = {
  logoText: "SITREP", logoAccent: "REP", tagline: "L'info au service de la décision",
  navLinks: [
    { label: "Accueil", href: "/" },
    { label: "MENA", href: "/mena" },
    { label: "Europe", href: "/europe" },
    { label: "OSINT", href: "/osint" },
    { label: "Programme", href: "/programme" },
    { label: "Services", href: "/services" },
  ],
  btnText: "S'abonner", btnVisible: true,
};
const DEFAULT_FOOTER: SiteFooter = {
  cols: [
    { title: "Notes & Décryptages", links: [{ label: "MENA", href: "#" }, { label: "OSINT", href: "#" }, { label: "Europe", href: "#" }] },
    { title: "Programme", links: [{ label: "Séminaires", href: "#" }, { label: "Lives", href: "#" }, { label: "Podcasts", href: "#" }] },
    { title: "Services", links: [{ label: "Notre approche", href: "#" }, { label: "Contact", href: "#" }] },
  ],
  copyright: "SITREP",
  socials: [
    { name: "X", url: "https://x.com/", icon: "x" },
    { name: "LinkedIn", url: "https://linkedin.com/", icon: "linkedin" },
  ],
};

const DEFAULTS: DB = {
  articles: [], evenements: [],
  ticker: [
    { tag: "BREAKING", text: "Escalade en Mer Rouge — décryptage exclusif" },
    { tag: "PROGRAMME", text: "Iran post-accord — 8 Avril" },
    { tag: "", text: "Gaza : pourparlers à Doha, sources OSINT" },
  ],
  layout: [
    { id: "hero", label: "Article principal", icon: "🗞️", desc: "Grande photo + 2 articles", visible: true },
    { id: "piliers", label: "Piliers éditoriaux", icon: "🏛️", desc: "Les 3 colonnes", visible: true },
    { id: "notes", label: "Notes récentes", icon: "📰", desc: "Grille des 3 derniers articles", visible: true },
    { id: "evenements", label: "Programme", icon: "📅", desc: "Les 4 prochains événements", visible: true },
    { id: "conseil", label: "Conseil & Newsletter", icon: "💼", desc: "Bloc contact + newsletter", visible: true },
  ],
  collaborateurs: [{ email: "parienteraphael@gmail.com", role: "Admin" }],
};

const uid = () => Math.random().toString(36).substr(2, 9);
const sl = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const fd = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [section, setSection] = useState("dashboard");
  const [db, setDb] = useState<DB>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "", show: false });
  const [modal, setModal] = useState<string | null>(null);
  const [editingArt, setEditingArt] = useState<Partial<Article>>({});
  const [editingEv, setEditingEv] = useState<Partial<Evenement>>({});
  const [editingTicker, setEditingTicker] = useState<{ idx: number; item: TickerItem } | null>(null);
  const [newCollab, setNewCollab] = useState({ email: "", role: "Editeur" });
  const [saving, setSaving] = useState(false);
  const [artTab, setArtTab] = useState("contenu");
  const dragSrc = useRef<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  interface Theme { navy: string; accent: string; sand: string; text: string; customCss: string; }
  const defaultTheme: Theme = { navy: "#1a2744", accent: "#c0392b", sand: "#f5f2ee", text: "#1a1f3a", customCss: "" };
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [siteHeader, setSiteHeader] = useState<SiteHeader>(DEFAULT_HEADER);
  const [siteFooter, setSiteFooter] = useState<SiteFooter>(DEFAULT_FOOTER);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") loadDB();
  }, [status]);

  async function loadDB() {
    try {
      const r = await fetch(`https://raw.githubusercontent.com/raf770/sitrep-next/main/content/db.json?t=${Date.now()}`);
      if (r.ok) { const d = await r.json(); setDb({ ...DEFAULTS, ...d }); if (d.theme) setTheme(d.theme); if (d.header) setSiteHeader(d.header); if (d.footer) setSiteFooter(d.footer); }
    } catch (e) {}
    setLoading(false);
  }

  async function saveDB(newDb: DB) {
    setSaving(true);
    try {
      await fetch("/api/save-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "content/db.json",
          content: JSON.stringify(newDb, null, 2),
          message: "Update DB"
        })
      });
      // Also save allowed emails
      await fetch("/api/save-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "content/config/allowed-emails.json",
          content: JSON.stringify({ emails: newDb.collaborateurs.map(c => c.email) }, null, 2),
          message: "Update allowed emails"
        })
      });
    } catch (e) {}
    setSaving(false);
  }

  function updateDB(newDb: DB) { setDb(newDb); saveDB(newDb); }

  async function loadStats() {
    setStatsLoading(true);
    setStatsError("");
    try {
      const r = await fetch("/api/stats");
      if (r.ok) { const d = await r.json(); setStats(d); }
      else { const d = await r.json(); setStatsError(d.error || "Erreur"); }
    } catch(e: any) { setStatsError(e.message); }
    setStatsLoading(false);
  }

  function showToast(msg: string, type = "success") {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }

  // ─── ARTICLES ─────────────────────────────────────────────
  function saveArt(statut?: string) {
    const art = { ...editingArt };
    if (!art.titre?.trim()) { showToast("Titre obligatoire", "error"); return; }
    art.slug = art.slug || sl(art.titre);
    art.statut = statut || art.statut || "Brouillon";
    art.id = art.id || uid();
    const arts = [...db.articles];
    const idx = arts.findIndex(a => a.id === art.id);
    if (idx > -1) arts[idx] = art as Article;
    else arts.unshift(art as Article);
    const newDb = { ...db, articles: arts };
    updateDB(newDb);
    setModal(null);
    showToast(art.statut === "Publié" ? "Publié ✓" : "Brouillon sauvegardé ✓");
  }

  function delArt(id: string) {
    if (!confirm("Supprimer ?")) return;
    updateDB({ ...db, articles: db.articles.filter(a => a.id !== id) });
    showToast("Supprimé");
  }

  function onArtDragStart(i: number) { dragSrc.current = i; }
  function onArtDrop(i: number) {
    if (dragSrc.current === null || dragSrc.current === i) return;
    const arts = [...db.articles];
    const [item] = arts.splice(dragSrc.current, 1);
    arts.splice(i, 0, item);
    updateDB({ ...db, articles: arts });
    dragSrc.current = null;
    showToast("Ordre mis à jour ✓");
  }

  // ─── EVENTS ───────────────────────────────────────────────
  function saveEv() {
    const ev = { ...editingEv };
    if (!ev.titre?.trim()) { showToast("Titre requis", "error"); return; }
    ev.id = ev.id || uid();
    const evs = [...db.evenements];
    const idx = evs.findIndex(e => e.id === ev.id);
    if (idx > -1) evs[idx] = ev as Evenement;
    else evs.unshift(ev as Evenement);
    updateDB({ ...db, evenements: evs });
    setModal(null);
    showToast("Enregistré ✓");
  }

  function delEv(id: string) {
    if (!confirm("Supprimer ?")) return;
    updateDB({ ...db, evenements: db.evenements.filter(e => e.id !== id) });
    showToast("Supprimé");
  }

  // ─── LAYOUT ───────────────────────────────────────────────
  function onLayoutDragStart(i: number) { dragSrc.current = i; }
  function onLayoutDrop(i: number) {
    if (dragSrc.current === null || dragSrc.current === i) return;
    const layout = [...db.layout];
    const [item] = layout.splice(dragSrc.current, 1);
    layout.splice(i, 0, item);
    updateDB({ ...db, layout });
    dragSrc.current = null;
    showToast("Ordre mis à jour ✓");
  }
  function toggleBlock(id: string, visible: boolean) {
    const layout = db.layout.map(b => b.id === id ? { ...b, visible } : b);
    updateDB({ ...db, layout });
  }

  // ─── TICKER ───────────────────────────────────────────────
  function saveTicker() {
    updateDB({ ...db });
    showToast("Ticker sauvegardé ✓");
  }

  // ─── COLLABS ──────────────────────────────────────────────
  function addCollab() {
    if (!newCollab.email.trim()) { showToast("Email requis", "error"); return; }
    if (db.collaborateurs.find(c => c.email === newCollab.email)) { showToast("Déjà ajouté", "error"); return; }
    updateDB({ ...db, collaborateurs: [...db.collaborateurs, { ...newCollab }] });
    setNewCollab({ email: "", role: "Editeur" });
    showToast("Collaborateur ajouté ✓");
  }
  function delCollab(email: string) {
    if (email === session?.user?.email) { showToast("Impossible de se supprimer soi-même", "error"); return; }
    updateDB({ ...db, collaborateurs: db.collaborateurs.filter(c => c.email !== email) });
    showToast("Supprimé");
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a2744", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 36, fontWeight: 800, color: "#fff" }}>SIT<span style={{ color: "#c0392b" }}>REP</span></div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Chargement des données…</div>
      </div>
    );
  }
  if (!session) return null;

  const pubArts = db.articles.filter(a => a.statut === "Publié").length;
  const brouArts = db.articles.filter(a => a.statut === "Brouillon").length;

  const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };
  const navy = "#1a2744", accent = "#c0392b", green = "#2e6e48", muted = "#7a7468", border = "#e0e4ea";

  const badge = (s?: string) => {
    const m: Record<string, string> = { "Publié": "#e8f5ee", "Brouillon": "#f0f0f0", "Programmé": "#fef3e8", "Archivé": "#f3eef8" };
    const mc: Record<string, string> = { "Publié": green, "Brouillon": muted, "Programmé": "#e67e22", "Archivé": "#6a3090" };
    return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", background: m[s!] || "#f0f0f0", color: mc[s!] || muted }}>{s || "—"}</span>;
  };

  const inp = (style?: React.CSSProperties): React.CSSProperties => ({ width: "100%", border: `1.5px solid ${border}`, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 13, borderRadius: 4, outline: "none", color: navy, background: "#fff", ...style });
  const btn = (bg: string, color = "#fff"): React.CSSProperties => ({ padding: "8px 16px", borderRadius: 4, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, cursor: "pointer", border: "none", background: bg, color, display: "inline-flex", alignItems: "center", gap: 6 });
  const label = (text: string) => <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em", color: navy, marginBottom: 5 }}>{text}</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", ...S }}>
      {/* SIDEBAR */}
      <div style={{ width: 240, background: navy, position: "fixed", top: 0, left: 0, bottom: 0, display: "flex", flexDirection: "column", overflowY: "auto", zIndex: 10 }}>
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>SIT<em style={{ color: accent, fontStyle: "normal" }}>REP</em></div>
          <div style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Backoffice</div>
        </div>
        <div style={{ padding: "12px 0", flex: 1 }}>
          {[
            { id: "dashboard", icon: "▦", label: "Tableau de bord" },
          ].map(item => (
            <div key={item.id} onClick={() => setSection(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", fontSize: 12, fontWeight: 500, color: section === item.id ? "#fff" : "rgba(255,255,255,.5)", cursor: "pointer", borderLeft: `2px solid ${section === item.id ? accent : "transparent"}`, background: section === item.id ? "rgba(255,255,255,.08)" : "transparent" }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.2)", padding: "12px 20px 4px" }}>Contenu</div>
          {[
            { id: "articles", label: "Articles", badge: db.articles.length },
            { id: "evenements", label: "Événements", badge: db.evenements.length },
          ].map(item => (
            <div key={item.id} onClick={() => setSection(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", fontSize: 12, fontWeight: 500, color: section === item.id ? "#fff" : "rgba(255,255,255,.5)", cursor: "pointer", borderLeft: `2px solid ${section === item.id ? accent : "transparent"}`, background: section === item.id ? "rgba(255,255,255,.08)" : "transparent" }}>
              <span>{item.label}</span>
              {item.badge > 0 && <span style={{ marginLeft: "auto", background: accent, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>}
            </div>
          ))}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.2)", padding: "12px 20px 4px" }}>Site</div>
          {[
            { id: "layout", label: "Mise en page" },
            { id: "disposition", label: "Disposition articles" },
            { id: "stats", label: "Statistiques" },
            { id: "ticker", label: "Ticker" },
            { id: "header", label: "Header" },
            { id: "footer", label: "Footer" },
            { id: "theme", label: "Thème & CSS" },
            { id: "collaborateurs", label: "Collaborateurs" },
          ].map(item => (
            <div key={item.id} onClick={() => setSection(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", fontSize: 12, fontWeight: 500, color: section === item.id ? "#fff" : "rgba(255,255,255,.5)", cursor: "pointer", borderLeft: `2px solid ${section === item.id ? accent : "transparent"}`, background: section === item.id ? "rgba(255,255,255,.08)" : "transparent" }}>
              {item.label}
            </div>
          ))}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.2)", padding: "12px 20px 4px" }}>Liens</div>
          <div onClick={() => window.open("https://sitrep-next.vercel.app", "_blank")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.5)", cursor: "pointer" }}>
            Voir le site ↗
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 4 }}>{session.user?.email}</div>
          <div onClick={() => signOut()} style={{ fontSize: 11, color: "rgba(255,255,255,.3)", cursor: "pointer" }}>← Déconnexion</div>
          {saving && <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 4 }}>Sauvegarde…</div>}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: 240, padding: 28, flex: 1, height: "100vh", overflowY: "auto" }}>

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Tableau de bord</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <button style={btn(navy)} onClick={() => { setEditingArt({ statut: "Brouillon", date: new Date().toISOString().split("T")[0] }); setArtTab("contenu"); setModal("art"); }}>+ Nouvel article</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { val: pubArts, label: "Publiés", bg: "#e8ecf5", color: navy },
                { val: brouArts, label: "Brouillons", bg: "#fdf0ee", color: accent },
                { val: db.evenements.filter(e => e.pub).length, label: "Événements", bg: "#fef3e8", color: "#e67e22" },
                { val: db.collaborateurs.length, label: "Collaborateurs", bg: "#e8f5ee", color: green },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", padding: "18px 20px", borderRadius: 6, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color, fontWeight: 800 }}>{s.val}</div>
                  <div><div style={{ fontSize: 24, fontWeight: 800, color: navy }}>{s.val}</div><div style={{ fontSize: 11, color: muted }}>{s.label}</div></div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${border}`, fontSize: 12, fontWeight: 600, color: navy }}>Derniers articles</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Titre", "Thème", "Format", "Auteur", "Date", "Statut"].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: muted, padding: "10px 16px", textAlign: "left" as const, borderBottom: `2px solid ${border}`, background: "#fafafa" }}>{h}</th>)}</tr></thead>
                <tbody>{db.articles.slice(0, 6).map(a => (
                  <tr key={a.id}><td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{a.titre}</td><td style={{ padding: "10px 16px", fontSize: 12 }}>{a.theme || "—"}</td><td style={{ padding: "10px 16px", fontSize: 12 }}>{a.format || "—"}</td><td style={{ padding: "10px 16px", fontSize: 12 }}>{a.auteur || "—"}</td><td style={{ padding: "10px 16px", fontSize: 12, whiteSpace: "nowrap" as const }}>{fd(a.date)}</td><td style={{ padding: "10px 16px" }}>{badge(a.statut)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ARTICLES */}
        {section === "articles" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Articles</div><div style={{ fontSize: 12, color: muted }}>Glissez ⠿ pour réordonner</div></div>
              <button style={btn(navy)} onClick={() => { setEditingArt({ statut: "Brouillon", date: new Date().toISOString().split("T")[0] }); setArtTab("contenu"); setModal("art"); }}>+ Nouvel article</button>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["", "Titre", "Thème", "Format", "Auteur", "Date", "Statut", "★", ""].map((h, i) => <th key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: muted, padding: "10px 16px", textAlign: "left" as const, borderBottom: `2px solid ${border}`, background: "#fafafa", width: h === "" ? 40 : "auto" }}>{h}</th>)}</tr></thead>
                <tbody>{db.articles.map((a, i) => (
                  <tr key={a.id} draggable onDragStart={() => onArtDragStart(i)} onDragOver={e => e.preventDefault()} onDrop={() => onArtDrop(i)} style={{ cursor: "default" }}>
                    <td style={{ padding: "10px 16px", fontSize: 16, color: muted, cursor: "grab" }}>⠿</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{a.titre}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{a.theme || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{a.format || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, whiteSpace: "nowrap" as const }}>{a.auteur || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, whiteSpace: "nowrap" as const }}>{fd(a.date)}</td>
                    <td style={{ padding: "10px 16px" }}>{badge(a.statut)}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{a.une ? "⭐" : ""}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={btn("#f0f0f0", navy)} onClick={() => { setEditingArt(a); setArtTab("contenu"); setModal("art"); }}>✏️</button>
                        <button style={btn(accent)} onClick={() => delArt(a.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {!db.articles.length && <div style={{ padding: 48, textAlign: "center", color: muted }}>Aucun article. Créez le premier !</div>}
            </div>
          </div>
        )}

        {/* EVENEMENTS */}
        {section === "evenements" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Événements</div>
              <button style={btn(navy)} onClick={() => { setEditingEv({ pub: false }); setModal("ev"); }}>+ Nouvel événement</button>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Titre", "Type", "Date", "Lieu", "Intervenant", "Lien", "Statut", ""].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: muted, padding: "10px 16px", textAlign: "left" as const, borderBottom: `2px solid ${border}`, background: "#fafafa" }}>{h}</th>)}</tr></thead>
                <tbody>{db.evenements.map(e => (
                  <tr key={e.id}>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}>{e.titre}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{e.type || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, whiteSpace: "nowrap" as const }}>{fd(e.date)}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{e.lieu || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{e.int || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{e.lien ? <a href={e.lien} target="_blank" style={{ color: navy, textDecoration: "underline" }}>Tester ↗</a> : "—"}</td>
                    <td style={{ padding: "10px 16px" }}>{badge(e.pub ? "Publié" : "Brouillon")}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={btn("#f0f0f0", navy)} onClick={() => { setEditingEv(e); setModal("ev"); }}>✏️</button>
                        <button style={btn(accent)} onClick={() => delEv(e.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {!db.evenements.length && <div style={{ padding: 48, textAlign: "center", color: muted }}>Aucun événement.</div>}
            </div>
          </div>
        )}

        {/* STATS */}
        {section === "stats" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Statistiques</div><div style={{ fontSize: 12, color: muted }}>Données des 30 derniers jours</div></div>
              <button style={btn(navy)} onClick={loadStats}>🔄 Actualiser</button>
            </div>

            {!stats && !statsLoading && !statsError && (
              <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: navy, marginBottom: 8 }}>Statistiques Vercel Analytics</div>
                <div style={{ fontSize: 12, color: muted, marginBottom: 20 }}>Cliquez pour charger les données des 30 derniers jours</div>
                <button style={btn(navy)} onClick={loadStats}>Charger les statistiques</button>
              </div>
            )}

            {statsLoading && (
              <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 48, textAlign: "center", color: muted, fontSize: 13 }}>
                Chargement…
              </div>
            )}

            {statsError && (
              <div style={{ background: "#fdf0ee", border: `1px solid ${accent}`, borderRadius: 6, padding: 20, color: accent, fontSize: 13 }}>
                ❌ Erreur : {statsError}
                <div style={{ fontSize: 11, marginTop: 8, color: muted }}>Vérifiez que Vercel Analytics est activé sur le projet.</div>
              </div>
            )}

            {stats && !statsLoading && (() => {
              const ts = stats.timeseries?.data || [];
              const pages = stats.pages?.data || [];
              const totalViews = ts.reduce((acc: number, d: any) => acc + (d.pageViews || 0), 0);
              const totalVisitors = ts.reduce((acc: number, d: any) => acc + (d.visitors || 0), 0);
              const maxViews = Math.max(...ts.map((d: any) => d.pageViews || 0), 1);

              return (
                <div>
                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                    {[
                      { val: totalViews.toLocaleString("fr-FR"), label: "Pages vues", icon: "👁️", bg: "#e8ecf5", color: navy },
                      { val: totalVisitors.toLocaleString("fr-FR"), label: "Visiteurs uniques", icon: "👥", bg: "#e8f5ee", color: green },
                      { val: ts.length > 0 ? Math.round(totalViews / ts.length).toLocaleString("fr-FR") : "0", label: "Moy. par jour", icon: "📅", bg: "#fef3e8", color: "#e67e22" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#fff", padding: "18px 20px", borderRadius: 6, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                        <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div><div style={{ fontSize: 11, color: muted }}>{s.label}</div></div>
                      </div>
                    ))}
                  </div>

                  {/* Graphique */}
                  {ts.length > 0 && (
                    <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: navy, marginBottom: 16 }}>Pages vues par jour</div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
                        {ts.map((d: any, i: number) => {
                          const h = Math.max(4, Math.round((d.pageViews || 0) / maxViews * 110));
                          const date = new Date(d.key).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                          return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} title={`${date} : ${d.pageViews || 0} vues`}>
                              <div style={{ width: "100%", height: h, background: navy, borderRadius: "2px 2px 0 0", transition: "height .3s" }} />
                              {i % 5 === 0 && <div style={{ fontSize: 8, color: muted, textAlign: "center", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>{date}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pages les plus vues */}
                  {pages.length > 0 && (
                    <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${border}`, fontSize: 12, fontWeight: 700, color: navy }}>Pages les plus visitées</div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {["Page", "Vues", "Visiteurs", "Durée moy."].map(h => (
                              <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: muted, padding: "10px 16px", textAlign: "left" as const, borderBottom: `2px solid ${border}`, background: "#fafafa" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pages.map((p: any, i: number) => {
                            const durMs = p.avgDuration || 0;
                            const durStr = durMs > 0 ? (durMs >= 60000 ? Math.round(durMs/60000)+"min" : Math.round(durMs/1000)+"s") : "—";
                            const maxPv = Math.max(...pages.map((x: any) => x.pageViews || 0), 1);
                            const pct = Math.round((p.pageViews || 0) / maxPv * 100);
                            return (
                              <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                                <td style={{ padding: "10px 16px", fontSize: 12, color: navy }}>
                                  <div style={{ fontFamily: "monospace", marginBottom: 4 }}>{p.key || "/"}</div>
                                  <div style={{ height: 4, background: "#e8ecf5", borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: pct+"%", background: navy, borderRadius: 2 }} />
                                  </div>
                                </td>
                                <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, color: navy }}>{(p.pageViews || 0).toLocaleString("fr-FR")}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, color: muted }}>{(p.visitors || 0).toLocaleString("fr-FR")}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, color: durMs > 30000 ? green : muted, fontWeight: durMs > 30000 ? 600 : 400 }}>{durStr}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* LAYOUT */}
        {section === "layout" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Mise en page</div><div style={{ fontSize: 12, color: muted }}>Réorganisez les blocs et choisissez leur contenu</div></div>
              <button style={btn(green)} onClick={() => { updateDB({ ...db }); showToast("Mise en page sauvegardée ✓"); }}>💾 Sauvegarder</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
              <div>
                {db.layout.map((block, i) => {
                  const pubArts = db.articles.filter((a: Article) => a.statut === "Publié");
                  const pubEvs = db.evenements.filter((e: Evenement) => e.pub);
                  return (
                    <div key={block.id} draggable onDragStart={() => onLayoutDragStart(i)} onDragOver={e => e.preventDefault()} onDrop={() => onLayoutDrop(i)}
                      style={{ background: "#fff", border: `1.5px solid ${block.visible ? border : "#e0e0e0"}`, borderRadius: 6, marginBottom: 10, overflow: "hidden", opacity: block.visible ? 1 : 0.6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "grab", borderBottom: block.visible ? `1px solid ${border}` : "none" }}>
                        <span style={{ color: muted, fontSize: 20 }}>⠿</span>
                        <span style={{ fontSize: 20 }}>{block.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: navy }}>{block.label}</div>
                          <div style={{ fontSize: 11, color: muted }}>{block.desc}</div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={block.visible} onChange={e => toggleBlock(block.id, e.target.checked)} style={{ width: 16, height: 16, accentColor: green, cursor: "pointer" }} />
                          <span style={{ fontSize: 11, color: muted }}>Visible</span>
                        </label>
                      </div>
                      {block.visible && (
                        <div style={{ padding: "12px 16px", background: "#fafafa" }}>
                          {block.id === "hero" && (
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: muted, marginBottom: 8 }}>Article principal</div>
                              <select style={inp()} value={db.articles[0]?.id || ""}
                                onChange={e => {
                                  const arts = [...db.articles];
                                  const idx2 = arts.findIndex((a: Article) => a.id === e.target.value);
                                  if (idx2 > 0) { const [item] = arts.splice(idx2, 1); arts.unshift(item); updateDB({ ...db, articles: arts }); showToast("Article hero mis à jour ✓"); }
                                }}>
                                {pubArts.map((a: Article) => <option key={a.id} value={a.id}>{a.titre}</option>)}
                              </select>
                              <div style={{ fontSize: 10, color: muted, marginTop: 6 }}>Les articles 2 et 3 apparaissent dans la colonne droite</div>
                            </div>
                          )}
                          {block.id === "notes" && (
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: muted, marginBottom: 8 }}>Articles dans la grille (positions 1, 2, 3)</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                {[0,1,2].map(slot => {
                                  const artIdx = 3 + slot;
                                  const art = db.articles[artIdx];
                                  return (
                                    <div key={slot}>
                                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, color: muted, marginBottom: 4 }}>Position {slot+1}</div>
                                      <select style={inp({ fontSize: 11 })} value={art?.id || ""}
                                        onChange={e => {
                                          const arts = [...db.articles];
                                          const fromIdx = arts.findIndex((a: Article) => a.id === e.target.value);
                                          if (fromIdx >= 0 && fromIdx !== artIdx) {
                                            const [item] = arts.splice(fromIdx, 1);
                                            arts.splice(artIdx, 0, item);
                                            updateDB({ ...db, articles: arts });
                                            showToast("Grille mise à jour ✓");
                                          }
                                        }}>
                                        <option value="">— Vide —</option>
                                        {pubArts.map((a: Article) => <option key={a.id} value={a.id}>{a.titre.slice(0,28)}{a.titre.length>28?"…":""}</option>)}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {block.id === "evenements" && (
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: muted, marginBottom: 8 }}>
                                {pubEvs.length} événement{pubEvs.length>1?"s":""} publié{pubEvs.length>1?"s":""} — les 4 premiers sont affichés
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {pubEvs.slice(0,4).map((e: Evenement, ei: number) => (
                                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "6px 10px", background: "#fff", borderRadius: 4, border: `1px solid ${border}` }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 6px", background: navy, color: "#fff", borderRadius: 2 }}>{ei+1}</span>
                                    <span style={{ flex: 1 }}>{e.titre}</span>
                                    <span style={{ fontSize: 10, color: muted }}>{e.date ? new Date(e.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) : ""}</span>
                                  </div>
                                ))}
                                {pubEvs.length === 0 && <div style={{ fontSize: 11, color: muted }}>Aucun événement publié</div>}
                              </div>
                            </div>
                          )}
                          {(block.id === "piliers" || block.id === "conseil") && (
                            <div style={{ fontSize: 11, color: muted, fontStyle: "italic" }}>
                              {block.id === "piliers" ? "Contenu fixe — modifiable dans le code" : "Bloc contact + newsletter — toujours le même"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ position: "sticky", top: 20 }}>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, marginBottom: 12 }}>Ordre des blocs</div>
                  {db.layout.map((b, i) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", borderRadius: 4, padding: "8px 12px", marginBottom: 6, opacity: b.visible ? 1 : 0.35 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: muted, width: 16 }}>{b.visible ? i+1 : "—"}</span>
                      <span>{b.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: navy, textDecoration: b.visible ? "none" : "line-through" }}>{b.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, marginBottom: 12 }}>Article hero actuel</div>
                  {db.articles[0] ? (
                    <div>
                      {db.articles[0].image && <img src={db.articles[0].image} style={{ width: "100%", height: 80, objectFit: "cover", objectPosition: db.articles[0].imgpos||"center", borderRadius: 4, marginBottom: 8 }} />}
                      <div style={{ fontSize: 12, fontWeight: 600, color: navy }}>{db.articles[0].titre}</div>
                      <div style={{ fontSize: 10, color: muted, marginTop: 4 }}>{db.articles[0].theme} · {db.articles[0].format}</div>
                    </div>
                  ) : <div style={{ fontSize: 11, color: muted }}>Aucun article publié</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TICKER */}
        {section === "ticker" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Ticker</div>
              <button style={btn(green)} onClick={saveTicker}>💾 Sauvegarder</button>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end", background: "#f8f9fc", padding: 14, borderRadius: 6, border: `1px solid ${border}` }}>
                <div style={{ width: 120 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: navy, marginBottom: 5 }}>Tag</div>
                  <input style={inp()} placeholder="BREAKING" id="t-tag" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: navy, marginBottom: 5 }}>Texte</div>
                  <input style={inp()} placeholder="Texte du ticker…" id="t-text" onKeyDown={e => { if (e.key === "Enter") { const tag = (document.getElementById("t-tag") as HTMLInputElement).value; const text = (document.getElementById("t-text") as HTMLInputElement).value; if (text) { const newDb = { ...db, ticker: [...db.ticker, { tag, text }] }; setDb(newDb); (document.getElementById("t-tag") as HTMLInputElement).value = ""; (document.getElementById("t-text") as HTMLInputElement).value = ""; }}}} />
                </div>
                <button style={btn(navy)} onClick={() => { const tag = (document.getElementById("t-tag") as HTMLInputElement).value; const text = (document.getElementById("t-text") as HTMLInputElement).value; if (text) { const newDb = { ...db, ticker: [...db.ticker, { tag, text }] }; setDb(newDb); (document.getElementById("t-tag") as HTMLInputElement).value = ""; (document.getElementById("t-text") as HTMLInputElement).value = ""; }}}>+ Ajouter</button>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Éléments</div>
              {db.ticker.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafa", border: `1px solid ${border}`, padding: "10px 12px", borderRadius: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 8px", background: navy, color: "#fff", borderRadius: 2, minWidth: 60, textAlign: "center" as const }}>{item.tag || "—"}</span>
                  <span style={{ flex: 1, fontSize: 12 }}>{item.text}</span>
                  <button onClick={() => setEditingTicker({ idx: i, item: { ...item } })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: muted }}>✏️</button>
                  <button onClick={() => { const ticker = db.ticker.filter((_, j) => j !== i); setDb({ ...db, ticker }); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: accent }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISPOSITION */}
        {section === "disposition" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Disposition des articles</div><div style={{ fontSize: 12, color: muted }}>Glissez les articles dans les zones pour définir leur position sur la page d'accueil</div></div>
              <button style={btn(green)} onClick={() => { updateDB({ ...db }); showToast("Disposition sauvegardée ✓"); }}>💾 Sauvegarder</button>
            </div>

            {(() => {
              const pubArts = db.articles.filter(a => a.statut === "Publié");
              const heroArt = pubArts[0];
              const sideArts = pubArts.slice(1, 3);
              const gridArts = pubArts.slice(3, 6);
              const restArts = pubArts.slice(6);

              const artCard = (a: Article, zone: string, idx: number) => (
                <div
                  key={a.id}
                  draggable
                  onDragStart={e => { e.dataTransfer.setData("artId", a.id); e.dataTransfer.setData("fromZone", zone); }}
                  style={{ background: "#fff", border: `1.5px solid ${border}`, borderRadius: 6, overflow: "hidden", cursor: "grab", transition: "all .15s" }}
                >
                  {a.image && <img src={a.image} style={{ width: "100%", height: zone === "hero" ? 120 : 60, objectFit: "cover", objectPosition: a.imgpos || "center", display: "block", filter: "brightness(.8)" }} />}
                  {!a.image && <div style={{ width: "100%", height: zone === "hero" ? 120 : 60, background: "#e8ecf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🖼️</div>}
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, color: navy, marginBottom: 3 }}>{a.theme || "—"} · {a.format || "—"}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: navy, lineHeight: 1.35 }}>{a.titre}</div>
                    <div style={{ fontSize: 10, color: muted, marginTop: 3 }}>{a.auteur} · {fd(a.date)}</div>
                  </div>
                </div>
              );

              const dropZone = (zone: string, label: string, capacity: number, articles: Article[], color: string) => (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const artId = e.dataTransfer.getData("artId");
                    const arts = [...db.articles];
                    const fromIdx = arts.findIndex(a => a.id === artId);
                    const zoneMap: Record<string, number> = { hero: 0, side1: 1, side2: 2, grid1: 3, grid2: 4, grid3: 5 };
                    const toIdx = zoneMap[zone];
                    if (fromIdx === -1 || toIdx === undefined) return;
                    const [item] = arts.splice(fromIdx, 1);
                    arts.splice(toIdx, 0, item);
                    updateDB({ ...db, articles: arts });
                    showToast("Disposition mise à jour ✓");
                  }}
                  style={{ border: `2px dashed ${color}`, borderRadius: 8, padding: 12, minHeight: 80, background: `${color}10` }}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>
                    {label} <span style={{ opacity: .5 }}>({articles.length}/{capacity})</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: zone === "hero" ? "1fr" : `repeat(${capacity}, 1fr)`, gap: 8 }}>
                    {articles.map((a, i) => artCard(a, zone, i))}
                    {articles.length < capacity && Array.from({ length: capacity - articles.length }).map((_, i) => (
                      <div key={i} style={{ border: `1.5px dashed ${border}`, borderRadius: 6, height: zone === "hero" ? 160 : 100, display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: 11 }}>
                        Glissez ici
                      </div>
                    ))}
                  </div>
                </div>
              );

              return (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                  {/* Left column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {dropZone("hero", "🗞️ Article principal (Hero)", 1, heroArt ? [heroArt] : [], navy)}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      {dropZone("grid1", "📰 Grille 1", 1, gridArts[0] ? [gridArts[0]] : [], "#6a3090")}
                      {dropZone("grid2", "📰 Grille 2", 1, gridArts[1] ? [gridArts[1]] : [], "#6a3090")}
                      {dropZone("grid3", "📰 Grille 3", 1, gridArts[2] ? [gridArts[2]] : [], "#6a3090")}
                    </div>
                  </div>

                  {/* Right column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {dropZone("side1", "➡️ Côté 1", 1, sideArts[0] ? [sideArts[0]] : [], accent)}
                    {dropZone("side2", "➡️ Côté 2", 1, sideArts[1] ? [sideArts[1]] : [], accent)}
                    <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 12 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: muted, marginBottom: 8 }}>Autres articles publiés</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {restArts.map(a => (
                          <div key={a.id} draggable onDragStart={e => { e.dataTransfer.setData("artId", a.id); e.dataTransfer.setData("fromZone", "rest"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "#fafafa", borderRadius: 4, border: `1px solid ${border}`, cursor: "grab" }}>
                            <span style={{ color: muted }}>⠿</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: navy, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{a.titre}</span>
                          </div>
                        ))}
                        {restArts.length === 0 && <div style={{ fontSize: 11, color: muted, textAlign: "center" as const, padding: "12px 0" }}>Tous les articles sont placés</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* HEADER */}
        {section === "header" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Header</div><div style={{ fontSize: 12, color: muted }}>Logo, navigation, bouton</div></div>
              <button style={btn(green)} onClick={() => { updateDB({ ...db, header: siteHeader }); showToast("Header sauvegardé ✓"); }}>💾 Sauvegarder</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Logo</div>
                  <div style={{ marginBottom: 16 }}>{label("Texte du logo")}<input style={inp()} value={siteHeader.logoText} onChange={e => setSiteHeader({ ...siteHeader, logoText: e.target.value })} /></div>
                  <div style={{ marginBottom: 16 }}>{label("Partie colorée (accent)")}<input style={inp()} value={siteHeader.logoAccent} onChange={e => setSiteHeader({ ...siteHeader, logoAccent: e.target.value })} /></div>
                  <div style={{ marginBottom: 16 }}>{label("Tagline")}<input style={inp()} value={siteHeader.tagline} onChange={e => setSiteHeader({ ...siteHeader, tagline: e.target.value })} /></div>
                </div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Bouton S'abonner</div>
                  <div style={{ marginBottom: 16 }}>{label("Texte")}<input style={inp()} value={siteHeader.btnText} onChange={e => setSiteHeader({ ...siteHeader, btnText: e.target.value })} /></div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={siteHeader.btnVisible} onChange={e => setSiteHeader({ ...siteHeader, btnVisible: e.target.checked })} style={{ width: 14, height: 14, accentColor: navy }} />
                    <span style={{ fontSize: 12 }}>Afficher le bouton</span>
                  </label>
                </div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted }}>Liens navigation</div>
                    <button style={btn(navy)} onClick={() => setSiteHeader({ ...siteHeader, navLinks: [...siteHeader.navLinks, { label: "Nouveau", href: "/" }] })}>+ Ajouter</button>
                  </div>
                  {siteHeader.navLinks.map((link, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <input style={inp({ flex: 1 })} placeholder="Label" value={link.label} onChange={e => { const links = [...siteHeader.navLinks]; links[i] = { ...link, label: e.target.value }; setSiteHeader({ ...siteHeader, navLinks: links }); }} />
                      <input style={inp({ flex: 1 })} placeholder="URL" value={link.href} onChange={e => { const links = [...siteHeader.navLinks]; links[i] = { ...link, href: e.target.value }; setSiteHeader({ ...siteHeader, navLinks: links }); }} />
                      <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: accent }} onClick={() => setSiteHeader({ ...siteHeader, navLinks: siteHeader.navLinks.filter((_, j) => j !== i) })}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" as const, color: muted, marginBottom: 10 }}>Aperçu</div>
                <div style={{ background: siteHeader.logoText ? "#f5f2ee" : "#f0f0f0", border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ background: navy, padding: "0 24px", height: 36, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>Dimanche 5 avril 2026</span>
                    {siteHeader.btnVisible && <span style={{ fontSize: 10, fontWeight: 700, background: accent, color: "#fff", padding: "3px 12px", borderRadius: 2 }}>{siteHeader.btnText}</span>}
                  </div>
                  <div style={{ padding: "16px 24px", borderBottom: `1px solid #d8d2c8`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 36, fontWeight: 800, color: navy, lineHeight: 1 }}>
                        {siteHeader.logoText.replace(siteHeader.logoAccent, "")}<span style={{ color: accent }}>{siteHeader.logoAccent}</span>
                      </div>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" as const, color: muted }}>{siteHeader.tagline}</div>
                    </div>
                  </div>
                  <div style={{ background: "#f5f2ee", borderBottom: `2px solid ${navy}`, display: "flex", padding: "0 24px", overflowX: "auto" as const }}>
                    {siteHeader.navLinks.map((link, i) => (
                      <div key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" as const, color: muted, padding: "11px 14px", whiteSpace: "nowrap" as const }}>{link.label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {section === "footer" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Footer</div><div style={{ fontSize: 12, color: muted }}>Colonnes, réseaux sociaux, copyright</div></div>
              <button style={btn(green)} onClick={() => { updateDB({ ...db, footer: siteFooter }); showToast("Footer sauvegardé ✓"); }}>💾 Sauvegarder</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted }}>Réseaux sociaux</div>
                    <button style={btn(navy)} onClick={() => setSiteFooter({ ...siteFooter, socials: [...(siteFooter.socials||[]), { name: "Instagram", url: "", icon: "instagram" }] })}>+ Ajouter</button>
                  </div>
                  {(siteFooter.socials||[]).map((s: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-end", padding: 12, background: "#fafafa", borderRadius: 4, border: `1px solid ${border}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "#fff", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {({"x":"𝕏","linkedin":"in","instagram":"📷","youtube":"▶","facebook":"f","tiktok":"♪","telegram":"✈"} as Record<string,string>)[s.icon]||"🔗"}
                      </div>
                      <div style={{ flex: 1 }}>
                        {label("Réseau")}
                        <select style={inp()} value={s.icon} onChange={e => { const s2=[...(siteFooter.socials||[])]; s2[i]={...s2[i],icon:e.target.value,name:e.target.options[e.target.selectedIndex].text}; setSiteFooter({...siteFooter,socials:s2}); }}>
                          <option value="x">X (Twitter)</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="facebook">Facebook</option>
                          <option value="tiktok">TikTok</option>
                          <option value="telegram">Telegram</option>
                        </select>
                      </div>
                      <div style={{ flex: 2 }}>
                        {label("URL")}
                        <input style={inp()} placeholder="https://…" value={s.url} onChange={e => { const s2=[...(siteFooter.socials||[])]; s2[i]={...s2[i],url:e.target.value}; setSiteFooter({...siteFooter,socials:s2}); }} />
                      </div>
                      <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: accent, flexShrink: 0 }} onClick={() => setSiteFooter({...siteFooter, socials:(siteFooter.socials||[]).filter((_:any,j:number)=>j!==i)})}>×</button>
                    </div>
                  ))}
                  <div style={{ marginBottom: 16, marginTop: 8 }}>{label("Copyright")}<input style={inp()} value={siteFooter.copyright} onChange={e => setSiteFooter({ ...siteFooter, copyright: e.target.value })} /></div>
                </div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted }}>Colonnes</div>
                    <button style={btn(navy)} onClick={() => setSiteFooter({ ...siteFooter, cols: [...siteFooter.cols, { title: "Nouvelle colonne", links: [] }] })}>+ Colonne</button>
                  </div>
                  {siteFooter.cols.map((col, ci) => (
                    <div key={ci} style={{ marginBottom: 16, padding: 12, background: "#fafafa", borderRadius: 4, border: `1px solid ${border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <input style={inp({ flex: 1 })} placeholder="Titre colonne" value={col.title} onChange={e => { const cols = [...siteFooter.cols]; cols[ci] = { ...col, title: e.target.value }; setSiteFooter({ ...siteFooter, cols }); }} />
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: accent }} onClick={() => setSiteFooter({ ...siteFooter, cols: siteFooter.cols.filter((_, j) => j !== ci) })}>×</button>
                      </div>
                      {col.links.map((link, li) => (
                        <div key={li} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <input style={inp({ flex: 1 })} placeholder="Label" value={link.label} onChange={e => { const cols = [...siteFooter.cols]; cols[ci].links[li] = { ...link, label: e.target.value }; setSiteFooter({ ...siteFooter, cols }); }} />
                          <input style={inp({ flex: 1 })} placeholder="URL" value={link.href} onChange={e => { const cols = [...siteFooter.cols]; cols[ci].links[li] = { ...link, href: e.target.value }; setSiteFooter({ ...siteFooter, cols }); }} />
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: accent }} onClick={() => { const cols = [...siteFooter.cols]; cols[ci].links = cols[ci].links.filter((_, j) => j !== li); setSiteFooter({ ...siteFooter, cols }); }}>×</button>
                        </div>
                      ))}
                      <button style={{ ...btn("#e8ecf5", navy), fontSize: 10, marginTop: 6 }} onClick={() => { const cols = [...siteFooter.cols]; cols[ci].links.push({ label: "Nouveau lien", href: "#" }); setSiteFooter({ ...siteFooter, cols }); }}>+ Lien</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" as const, color: muted, marginBottom: 10 }}>Aperçu</div>
                <div style={{ background: navy, padding: "24px 24px 0", borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>SIT<em style={{ color: accent, fontStyle: "normal" }}>REP</em></div>
                      <div style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.25)", marginBottom: 12 }}>L'info au service de la décision</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(siteFooter.socials||[]).map((s:any,i:number) => (
                          <div key={i} style={{ width: 28, height: 28, border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                            {({"x":"𝕏","linkedin":"in","instagram":"📷","youtube":"▶","facebook":"f","tiktok":"♪","telegram":"✈"} as Record<string,string>)[s.icon]||"🔗"}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 28 }}>
                      {siteFooter.cols.map((col, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.28)", marginBottom: 10 }}>{col.title}</div>
                          {col.links.map((link, j) => <div key={j} style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginBottom: 6 }}>{link.label}</div>)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "10px 0", display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,.2)" }}>
                    <span>© {new Date().getFullYear()} {siteFooter.copyright}</span>
                    <span>L'info au service de la décision</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THEME */}
        {section === "theme" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Thème & CSS</div><div style={{ fontSize: 12, color: muted }}>Personnalisez les couleurs et l'apparence du site</div></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btn("#f0f0f0", muted)} onClick={() => { setTheme(defaultTheme); showToast("Thème réinitialisé"); }}>↺ Réinitialiser</button>
                <button style={btn(green)} onClick={() => { const newDb = { ...db, theme }; updateDB(newDb); showToast("Thème sauvegardé ✓ — Vercel redéploie automatiquement"); }}>💾 Sauvegarder</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
              <div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Couleurs principales</div>
                  {[
                    { key: "navy", label: "Navy (fond sidebar, header)" },
                    { key: "accent", label: "Accent (rouge — logo, boutons)" },
                    { key: "sand", label: "Fond du site" },
                    { key: "text", label: "Couleur texte" },
                  ].map(c => (
                    <div key={c.key} style={{ marginBottom: 16 }}>
                      {label(c.label)}
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={(theme as any)[c.key]} onChange={e => setTheme({ ...theme, [c.key]: e.target.value })} style={{ width: 48, height: 36, border: `1px solid ${border}`, borderRadius: 4, cursor: "pointer", padding: 2 }} />
                        <input style={inp({ fontFamily: "monospace", flex: 1 })} value={(theme as any)[c.key]} onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setTheme({ ...theme, [c.key]: e.target.value }); }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>CSS personnalisé</div>
                  <textarea style={{ ...inp(), minHeight: 160, fontFamily: "monospace", fontSize: 12, resize: "vertical" as const }} value={theme.customCss} onChange={e => setTheme({ ...theme, customCss: e.target.value })} placeholder=".logo { font-size: 52px; }&#10;.nav a { font-size: 13px; }" />
                </div>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Préréglages rapides</div>
                  {[
                    { name: "classique", label: "🏛️ Classique (défaut)", navy: "#1a2744", accent: "#c0392b", sand: "#f5f2ee", text: "#1a1f3a" },
                    { name: "sombre", label: "🌙 Mode sombre", navy: "#0d1117", accent: "#e05a5a", sand: "#161b22", text: "#e6edf3" },
                    { name: "bleu", label: "🔵 Bleu profond", navy: "#0a2342", accent: "#1565c0", sand: "#e8f0fe", text: "#0a2342" },
                    { name: "vert", label: "🌿 Vert éditorial", navy: "#1b3a2d", accent: "#2e6e48", sand: "#f0f5f1", text: "#1b3a2d" },
                  ].map(p => (
                    <button key={p.name} style={{ ...btn("#f0f0f0", navy), width: "100%", justifyContent: "flex-start", marginBottom: 8 }} onClick={() => setTheme({ ...theme, navy: p.navy, accent: p.accent, sand: p.sand, text: p.text })}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" as const, color: muted, marginBottom: 10 }}>Aperçu en direct</div>
                <div style={{ border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ background: "#f0f0f0", padding: "8px 12px", fontSize: 11, color: muted, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${border}` }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                    </div>
                    <span>sitrep-next.vercel.app</span>
                  </div>
                  <iframe src="https://sitrep-next.vercel.app" style={{ width: "100%", height: 600, border: "none" }} />
                </div>
                <div style={{ fontSize: 11, color: muted, marginTop: 8, textAlign: "center" as const }}>Sauvegardez pour voir les changements en ligne</div>
              </div>
            </div>
          </div>
        )}

        {/* COLLABORATEURS */}
        {section === "collaborateurs" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Collaborateurs</div><div style={{ fontSize: 12, color: muted }}>Les emails autorisés à accéder au backoffice via Google</div></div>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Ajouter un accès</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  {label("Email Gmail")}
                  <input style={inp()} type="email" placeholder="collaborateur@gmail.com" value={newCollab.email} onChange={e => setNewCollab({ ...newCollab, email: e.target.value })} onKeyDown={e => e.key === "Enter" && addCollab()} />
                </div>
                <div style={{ width: 160 }}>
                  {label("Rôle")}
                  <select style={inp()} value={newCollab.role} onChange={e => setNewCollab({ ...newCollab, role: e.target.value })}>
                    <option>Admin</option>
                    <option>Editeur</option>
                    <option>Lecteur</option>
                  </select>
                </div>
                <button style={btn(navy)} onClick={addCollab}>+ Ajouter</button>
              </div>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Email", "Rôle", ""].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: muted, padding: "10px 16px", textAlign: "left" as const, borderBottom: `2px solid ${border}`, background: "#fafafa" }}>{h}</th>)}</tr></thead>
                <tbody>{db.collaborateurs.map(c => (
                  <tr key={c.email}>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}>{c.email} {c.email === session.user?.email && <span style={{ fontSize: 9, background: "#e8ecf5", color: navy, padding: "1px 6px", borderRadius: 3, marginLeft: 6 }}>Vous</span>}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{c.role}</td>
                    <td style={{ padding: "10px 16px" }}>
                      {c.email !== session.user?.email && <button style={btn(accent)} onClick={() => delCollab(c.email)}>Supprimer</button>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL ARTICLE */}
      {modal === "art" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 100, padding: "32px 20px", overflowY: "auto" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 800, borderRadius: 6, margin: "auto" }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: navy }}>{editingArt.id ? "Modifier l'article" : "Nouvel article"}</div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: muted }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", borderBottom: `2px solid ${border}`, marginBottom: 24 }}>
                {["contenu", "meta", "options"].map(t => (
                  <div key={t} onClick={() => setArtTab(t)} style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" as const, color: artTab === t ? navy : muted, cursor: "pointer", borderBottom: `2px solid ${artTab === t ? accent : "transparent"}`, marginBottom: -2 }}>
                    {t === "contenu" ? "Contenu" : t === "meta" ? "Méta & SEO" : "Options"}
                  </div>
                ))}
              </div>

              {artTab === "contenu" && (
                <div>
                  <div style={{ marginBottom: 16 }}>{label("Titre *")}<input style={inp()} value={editingArt.titre || ""} onChange={e => { const titre = e.target.value; const slug = sl(titre); setEditingArt({ ...editingArt, titre, slug }); }} /></div>
                  <div style={{ marginBottom: 16 }}>{label("Chapeau")}<input style={inp()} placeholder="Phrase d'accroche…" value={editingArt.chapeau || ""} onChange={e => setEditingArt({ ...editingArt, chapeau: e.target.value })} /></div>
                  <div style={{ marginBottom: 16 }}>{label("Slug URL")}<input style={inp()} value={editingArt.slug || ""} onChange={e => setEditingArt({ ...editingArt, slug: e.target.value })} /><div style={{ fontSize: 11, color: muted, marginTop: 4, fontFamily: "monospace", background: "#f5f5f5", padding: "4px 8px", borderRadius: 3 }}>sitrep.fr/articles/{editingArt.slug || "—"}</div></div>
                  <div style={{ marginBottom: 16 }}>
                  {label("Corps de l'article")}
                  <div style={{ border: `1.5px solid ${border}`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: 4, padding: "6px 8px", background: "#f8f9fc", borderBottom: `1px solid ${border}`, flexWrap: "wrap" as const }}>
                      {[
                        { cmd: "bold", label: "G", title: "Gras", style: { fontWeight: 700 } },
                        { cmd: "italic", label: "I", title: "Italique", style: { fontStyle: "italic" } },
                        { cmd: "underline", label: "S", title: "Souligné", style: { textDecoration: "underline" } },
                      ].map(b => (
                        <button key={b.cmd} title={b.title} onMouseDown={e => { e.preventDefault(); document.execCommand(b.cmd); }}
                          style={{ ...b.style, padding: "2px 8px", border: `1px solid ${border}`, borderRadius: 3, cursor: "pointer", background: "#fff", fontSize: 12, minWidth: 28 }}>{b.label}</button>
                      ))}
                      <div style={{ width: 1, background: border, margin: "0 4px" }} />
                      {[
                        { tag: "h2", label: "H2" },
                        { tag: "h3", label: "H3" },
                      ].map(h => (
                        <button key={h.tag} title={h.tag} onMouseDown={e => { e.preventDefault(); document.execCommand("formatBlock", false, h.tag); }}
                          style={{ padding: "2px 8px", border: `1px solid ${border}`, borderRadius: 3, cursor: "pointer", background: "#fff", fontSize: 12 }}>{h.label}</button>
                      ))}
                      <button title="Paragraphe" onMouseDown={e => { e.preventDefault(); document.execCommand("formatBlock", false, "p"); }}
                        style={{ padding: "2px 8px", border: `1px solid ${border}`, borderRadius: 3, cursor: "pointer", background: "#fff", fontSize: 12 }}>¶</button>
                      <div style={{ width: 1, background: border, margin: "0 4px" }} />
                      <button title="Liste" onMouseDown={e => { e.preventDefault(); document.execCommand("insertUnorderedList"); }}
                        style={{ padding: "2px 8px", border: `1px solid ${border}`, borderRadius: 3, cursor: "pointer", background: "#fff", fontSize: 12 }}>• Liste</button>
                      <button title="Tout effacer" onMouseDown={e => { e.preventDefault(); document.execCommand("removeFormat"); }}
                        style={{ padding: "2px 8px", border: `1px solid ${border}`, borderRadius: 3, cursor: "pointer", background: "#fff", fontSize: 11, color: accent }}>✕ Format</button>
                    </div>
                    <div
                      id="rich-editor"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={e => setEditingArt({ ...editingArt, corps: (e.target as HTMLDivElement).innerHTML })}
                      dangerouslySetInnerHTML={{ __html: editingArt.corps || "" }}
                      style={{ minHeight: 220, padding: "12px", fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, outline: "none", color: navy }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: muted, marginTop: 4 }}>Sélectionnez du texte pour le formater</div>
                </div>
                  <div style={{ marginBottom: 16 }}>{label("Extrait (max 180 car.)")}<textarea style={{ ...inp(), minHeight: 70, resize: "vertical" as const }} value={editingArt.extrait || ""} onChange={e => setEditingArt({ ...editingArt, extrait: e.target.value })} /><div style={{ fontSize: 10, color: muted, textAlign: "right" as const }}>{(editingArt.extrait || "").length}/180</div></div>
                </div>
              )}

              {artTab === "meta" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>{label("Thème")}<select style={inp()} value={editingArt.theme || ""} onChange={e => setEditingArt({ ...editingArt, theme: e.target.value })}><option value="">Choisir…</option>{["MENA", "Europe", "OSINT", "Podcasts", "Événements", "Services"].map(o => <option key={o}>{o}</option>)}</select></div>
                    <div>{label("Format")}<select style={inp()} value={editingArt.format || ""} onChange={e => setEditingArt({ ...editingArt, format: e.target.value })}><option value="">Choisir…</option>{["Décryptage", "Note", "Analyse", "Entretien", "Brief", "Podcast"].map(o => <option key={o}>{o}</option>)}</select></div>
                  </div>
                  <div style={{ marginBottom: 16 }}>{label("Tags (virgules)")}<input style={inp()} placeholder="Iran, nucléaire, diplomatie" value={(editingArt.tags || []).join(", ")} onChange={e => setEditingArt({ ...editingArt, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>{label("Auteur")}<select style={inp()} value={editingArt.auteur || ""} onChange={e => setEditingArt({ ...editingArt, auteur: e.target.value })}><option value="">Choisir…</option>{["Karim Mansouri", "Sara El-Amine", "Nadia Khoury"].map(o => <option key={o}>{o}</option>)}</select></div>
                    <div>{label("Langue")}<select style={inp()} value={editingArt.langue || "FR"} onChange={e => setEditingArt({ ...editingArt, langue: e.target.value })}><option value="FR">Français</option><option value="EN">Anglais</option></select></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>{label("Date")}<input type="date" style={inp()} value={editingArt.date || ""} onChange={e => setEditingArt({ ...editingArt, date: e.target.value })} /></div>
                    <div>{label("Temps de lecture")}<input style={inp()} placeholder="8 min" value={editingArt.lecture || ""} onChange={e => setEditingArt({ ...editingArt, lecture: e.target.value })} /></div>
                  </div>
                  <div style={{ marginBottom: 16 }}>{label("SEO Title")}<input style={inp()} value={editingArt.seoTitle || ""} onChange={e => setEditingArt({ ...editingArt, seoTitle: e.target.value })} /><div style={{ fontSize: 10, color: muted, textAlign: "right" as const }}>{(editingArt.seoTitle || "").length}/60</div></div>
                  <div style={{ marginBottom: 16 }}>{label("Meta description")}<textarea style={{ ...inp(), minHeight: 80, resize: "vertical" as const }} value={editingArt.metaDesc || ""} onChange={e => setEditingArt({ ...editingArt, metaDesc: e.target.value })} /><div style={{ fontSize: 10, color: muted, textAlign: "right" as const }}>{(editingArt.metaDesc || "").length}/155</div></div>
                </div>
              )}

              {artTab === "options" && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>Image principale</div>
                  {editingArt.image && <img src={editingArt.image} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 4, border: `1px solid ${border}`, marginBottom: 8, objectPosition: editingArt.imgpos || "center" }} />}
                  <div style={{ marginBottom: 16 }}>{label("URL de l'image")}<input type="url" style={inp()} placeholder="https://…" value={editingArt.image || ""} onChange={e => setEditingArt({ ...editingArt, image: e.target.value })} /></div>
                  <div style={{ marginBottom: 16 }}>{label("Position de l'image")}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 4 }}>
                      {[{v:"top",l:"⬆️ Haut"},{v:"center",l:"↕️ Centre"},{v:"bottom",l:"⬇️ Bas"},{v:"20%",l:"🎯 20%"}].map(p => (
                        <div key={p.v} onClick={() => setEditingArt({ ...editingArt, imgpos: p.v })} style={{ border: `2px solid ${editingArt.imgpos === p.v ? navy : border}`, borderRadius: 4, padding: "8px 4px", fontSize: 11, fontWeight: 600, color: editingArt.imgpos === p.v ? navy : muted, background: editingArt.imgpos === p.v ? "#e8ecf5" : "#fff", cursor: "pointer", textAlign: "center" as const }}>{p.l}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>{label("Crédit image")}<input style={inp()} placeholder="© Reuters" value={editingArt.credit || ""} onChange={e => setEditingArt({ ...editingArt, credit: e.target.value })} /></div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, paddingBottom: 8, borderBottom: `1px solid ${border}`, marginBottom: 16, marginTop: 8 }}>Publication</div>
                  <div style={{ marginBottom: 16 }}>{label("Statut")}<select style={inp()} value={editingArt.statut || "Brouillon"} onChange={e => setEditingArt({ ...editingArt, statut: e.target.value })}><option value="Brouillon">Brouillon</option><option value="Programmé">Programmé</option><option value="Publié">Publié</option><option value="Archivé">Archivé</option></select></div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 12px", border: `1.5px solid ${border}`, borderRadius: 4 }}><input type="checkbox" checked={editingArt.une || false} onChange={e => setEditingArt({ ...editingArt, une: e.target.checked })} style={{ width: 14, height: 14, accentColor: navy }} /><span style={{ fontSize: 12, fontWeight: 500 }}>⭐ À la une</span></label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 12px", border: `1.5px solid ${border}`, borderRadius: 4 }}><input type="checkbox" checked={editingArt.home || false} onChange={e => setEditingArt({ ...editingArt, home: e.target.checked })} style={{ width: 14, height: 14, accentColor: navy }} /><span style={{ fontSize: 12, fontWeight: 500 }}>🏠 Home</span></label>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end", gap: 8, position: "sticky", bottom: 0, background: "#fff" }}>
              <button style={btn("#f0f0f0", muted)} onClick={() => setModal(null)}>Annuler</button>
              <button style={btn("#f0f0f0", muted)} onClick={() => saveArt("Brouillon")}>Sauver brouillon</button>
              <button style={btn(navy)} onClick={() => saveArt("Publié")}>Publier →</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EVENEMENT */}
      {modal === "ev" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "32px 20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 520, borderRadius: 6 }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: navy }}>{editingEv.id ? "Modifier" : "Nouvel événement"}</div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: muted }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>{label("Titre *")}<input style={inp()} value={editingEv.titre || ""} onChange={e => setEditingEv({ ...editingEv, titre: e.target.value })} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>{label("Type")}<select style={inp()} value={editingEv.type || "Webinaire"} onChange={e => setEditingEv({ ...editingEv, type: e.target.value })}>{["Webinaire", "Conférence", "Live", "Podcast", "Table ronde"].map(o => <option key={o}>{o}</option>)}</select></div>
                <div>{label("Date")}<input type="date" style={inp()} value={editingEv.date || ""} onChange={e => setEditingEv({ ...editingEv, date: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>{label("Lieu")}<input style={inp()} placeholder="En ligne / Paris…" value={editingEv.lieu || ""} onChange={e => setEditingEv({ ...editingEv, lieu: e.target.value })} /></div>
                <div>{label("Intervenant")}<input style={inp()} value={editingEv.int || ""} onChange={e => setEditingEv({ ...editingEv, int: e.target.value })} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>{label("Lien d'inscription")}<input type="url" style={inp()} placeholder="https://…" value={editingEv.lien || ""} onChange={e => setEditingEv({ ...editingEv, lien: e.target.value })} /></div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 12px", border: `1.5px solid ${border}`, borderRadius: 4 }}>
                <input type="checkbox" checked={editingEv.pub || false} onChange={e => setEditingEv({ ...editingEv, pub: e.target.checked })} style={{ width: 14, height: 14, accentColor: navy }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Publier sur le site</span>
              </label>
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("#f0f0f0", muted)} onClick={() => setModal(null)}>Annuler</button>
              <button style={btn(navy)} onClick={saveEv}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TICKER EDIT */}
      {editingTicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "32px 20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 460, borderRadius: 6 }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: navy }}>Modifier l'élément</div>
              <button onClick={() => setEditingTicker(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: muted }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>{label("Tag")}<input style={inp()} placeholder="BREAKING" value={editingTicker.item.tag} onChange={e => setEditingTicker({ ...editingTicker, item: { ...editingTicker.item, tag: e.target.value } })} /></div>
              <div style={{ marginBottom: 16 }}>{label("Texte *")}<input style={inp()} value={editingTicker.item.text} onChange={e => setEditingTicker({ ...editingTicker, item: { ...editingTicker.item, text: e.target.value } })} /></div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("#f0f0f0", muted)} onClick={() => setEditingTicker(null)}>Annuler</button>
              <button style={btn(navy)} onClick={() => { const ticker = [...db.ticker]; ticker[editingTicker.idx] = editingTicker.item; setDb({ ...db, ticker }); setEditingTicker(null); showToast("Modifié ✓"); }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? accent : toast.type === "success" ? green : navy, color: "#fff", padding: "12px 20px", borderRadius: 6, fontSize: 12, fontWeight: 500, zIndex: 200, transform: toast.show ? "translateY(0)" : "translateY(100px)", opacity: toast.show ? 1 : 0, transition: "all .3s", maxWidth: 320 }}>
        {toast.msg}
      </div>
    </div>
  );
}
