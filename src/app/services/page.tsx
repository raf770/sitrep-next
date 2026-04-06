import Link from "next/link";

export const metadata = {
  title: "Solutions & Intelligence — SITREP",
  description: "L'info au service de la décision. Analyses géopolitiques, intelligence stratégique et accompagnement des organisations.",
};

export default function ServicesPage() {
  return (
    <main className="bg-sand min-h-screen font-inter">

      {/* Hero */}
      <section className="bg-navy text-white px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.15em] uppercase text-white/40 mb-4">Solutions & Intelligence</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-6">
            L'info au service<br />de la décision
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl">
            Dans un environnement international marqué par l'incertitude, la volatilité et l'accélération des crises, la qualité de l'information devient une condition de la décision.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-navy/80 text-base leading-relaxed mb-6">
          sitrep.fr propose une lecture claire, rigoureuse et sourcée des dynamiques géopolitiques contemporaines à destination des décideurs, des rédactions, des entreprises, des ONG et des organisations exposées.
        </p>
        <p className="text-navy/80 text-base leading-relaxed">
          À la croisée du média d'analyse, du think tank et de l'accompagnement stratégique, nous produisons des contenus à forte valeur ajoutée conçus pour éclairer les choix, anticiper les risques et restituer la complexité sans la brouiller.
        </p>
      </section>

      {/* Positionnement */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-6">Notre positionnement</h2>
        <p className="text-navy/80 text-base leading-relaxed mb-8">
          Nous nous adressons à celles et ceux qui recherchent davantage qu'un flux d'actualité : une information fiable, contextualisée et utile à la décision.
        </p>
        <div className="border-l-2 border-navy/20 pl-6 space-y-3">
          {["L'exigence des sources", "La clarté de l'analyse", "La pertinence opérationnelle"].map((p) => (
            <p key={p} className="text-navy font-medium">{p}</p>
          ))}
        </div>
      </section>

      {/* Ce que nous proposons */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-10">Ce que nous proposons</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Analyses & décryptages",
                desc: "Articles, enquêtes, notes et formats éditoriaux conçus pour fournir une compréhension structurée des crises, des rapports de force et des risques émergents.",
              },
              {
                title: "Intelligence géopolitique",
                desc: "Analyses ciblées, notes de risque, synthèses pays et lectures régionales destinées aux acteurs confrontés à des environnements sensibles ou instables.",
              },
              {
                title: "Veille & alertes",
                desc: "Dispositifs de veille construits autour de priorités géographiques, sectorielles ou opérationnelles, avec signalement des évolutions critiques.",
              },
              {
                title: "Accompagnement des organisations",
                desc: "Appui ponctuel ou régulier auprès d'entreprises, de rédactions, d'ONG et de structures exposées à des risques politiques, sécuritaires ou réputationnels.",
              },
            ].map((s) => (
              <div key={s.title} className="border-t border-navy/10 pt-6">
                <h3 className="text-navy font-semibold mb-2">{s.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domaines */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-8">Domaines d'intervention</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "Les risques pays",
            "Les crises politiques et sécuritaires",
            "Les environnements réglementaires sensibles",
            "Les dynamiques d'influence et de réputation",
            "Les zones à forte exposition opérationnelle",
            "Les espaces MENA, Afrique et Europe",
          ].map((d) => (
            <div key={d} className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy/30 flex-shrink-0" />
              <p className="text-navy/70 text-sm">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* À qui */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-8">À qui s'adresse sitrep.fr</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Les médias et rédactions",
              "Les directions générales et directions stratégie",
              "Les investisseurs et acteurs de l'implantation internationale",
              "Les ONG et organisations internationales",
              "Les structures déployées dans des environnements complexes",
            ].map((a) => (
              <div key={a} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy/30 flex-shrink-0" />
                <p className="text-navy/70 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre approche */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-10">Notre approche</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { titre: "Rigueur", desc: "Chaque analyse repose sur un travail de vérification, de recoupement et de contextualisation." },
            { titre: "Lisibilité", desc: "Nous transformons des environnements complexes en lectures compréhensibles, structurées et exploitables." },
            { titre: "Discrétion", desc: "Certaines analyses et certains formats sont réservés à un cadre strictement professionnel." },
            { titre: "Souplesse", desc: "Nos productions peuvent prendre la forme d'articles, de notes, de briefings, d'alertes ou de suivis ciblés." },
          ].map((a) => (
            <div key={a.titre} className="border-t border-navy/10 pt-6">
              <h3 className="text-navy font-semibold mb-2">{a.titre}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA vers accès professionnel */}
      <section className="bg-navy text-white px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.15em] uppercase text-white/40 mb-4">Accès professionnel</p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Certaines analyses, notes confidentielles et offres d'accompagnement sont réservées aux organisations et partenaires qualifiés.
          </h2>
          <p className="text-white/50 text-sm mb-10 max-w-xl">
            Abonnés professionnels, structures exposées, décideurs — découvrez nos formats d'accompagnement et nos trois niveaux d'accès.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/services/acces-pro"
              className="inline-block bg-white text-navy text-sm font-semibold px-6 py-3 hover:bg-white/90 transition"
            >
              Découvrir les offres professionnelles →
            </Link>
            <a
              href="mailto:contact@sitrep.fr"
              className="inline-block border border-white/30 text-white text-sm font-semibold px-6 py-3 hover:border-white/60 transition"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
