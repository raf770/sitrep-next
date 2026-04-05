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
interface DB {
  articles: Article[]; evenements: Evenement[]; ticker: TickerItem[];
  layout: LayoutBlock[]; collaborateurs: Collaborateur[];
}

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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") loadDB();
  }, [status]);

  async function loadDB() {
    try {
      const r = await fetch(`https://raw.githubusercontent.com/raf770/sitrep-next/main/content/db.json?t=${Date.now()}`);
      if (r.ok) { const d = await r.json(); setDb({ ...DEFAULTS, ...d }); }
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
            { id: "ticker", label: "Ticker" },
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

        {/* LAYOUT */}
        {section === "layout" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: navy }}>Mise en page</div><div style={{ fontSize: 12, color: muted }}>Glissez les blocs pour réorganiser la page d'accueil</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
              <div>{db.layout.map((block, i) => (
                <div key={block.id} draggable onDragStart={() => onLayoutDragStart(i)} onDragOver={e => e.preventDefault()} onDrop={() => onLayoutDrop(i)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1.5px solid ${border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10, cursor: "grab" }}>
                  <span style={{ color: muted, fontSize: 20 }}>⠿</span>
                  <span style={{ fontSize: 22 }}>{block.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: navy }}>{block.label}</div>
                    <div style={{ fontSize: 11, color: muted }}>{block.desc}</div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={block.visible} onChange={e => toggleBlock(block.id, e.target.checked)} style={{ width: 16, height: 16, accentColor: green, cursor: "pointer" }} />
                    <span style={{ fontSize: 11, color: muted }}>Visible</span>
                  </label>
                </div>
              ))}</div>
              <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 6, padding: 16, position: "sticky", top: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" as const, color: muted, marginBottom: 12 }}>Aperçu de l'ordre</div>
                {db.layout.map(b => (
                  <div key={b.id} style={{ background: "#f5f5f5", borderRadius: 4, padding: "8px 12px", marginBottom: 6, fontSize: 11, fontWeight: 600, color: navy, opacity: b.visible ? 1 : 0.35, textDecoration: b.visible ? "none" : "line-through" }}>
                    {b.icon} {b.label}
                  </div>
                ))}
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
                  <div style={{ marginBottom: 16 }}>{label("Corps de l'article")}<textarea style={{ ...inp(), minHeight: 220, resize: "vertical" as const }} value={editingArt.corps || ""} onChange={e => setEditingArt({ ...editingArt, corps: e.target.value })} placeholder="Rédigez ici…&#10;&#10;Sautez une ligne entre les paragraphes." /></div>
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
