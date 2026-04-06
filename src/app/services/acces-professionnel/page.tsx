import Link from "next/link";

export const metadata = {
  title: "Offres professionnelles — SITREP",
  description: "Accès réservé aux organisations, abonnés professionnels et partenaires qualifiés. Veille, notes de risque, due diligence géopolitique.",
};

export default function AccesProfessionnelPage() {
  return (
    <main className="bg-sand min-h-screen font-inter">

      {/* Hero */}
      <section className="bg-navy text-white px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <Link href="/services" className="text-xs tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition mb-6 inline-block">
            ← Solutions & Intelligence
          </Link>
          <p className="text-xs tracking-[0.15em] uppercase text-white/40 mb-4">Offres professionnelles</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Accès réservé aux organisations, abonnés professionnels et partenaires qualifiés
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-2xl">
            Dans les contextes instables, la question n'est pas seulement d'accéder à l'information, mais d'accéder à une information fiable, hiérarchisée et directement exploitable.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-navy/80 text-base leading-relaxed">
          Les offres professionnelles de sitrep.fr s'adressent aux structures qui ont besoin d'un appui géopolitique exigeant, réactif et confidentiel. Nous proposons des formats conçus pour accompagner les organisations confrontées à des environnements sensibles, à des enjeux d'implantation, à des crises régionales, à des risques réputationnels ou à des besoins de veille ciblée.
        </p>
      </section>

      {/* Formats */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-10">Nos formats d'accompagnement</h2>
          <div className="space-y-10">
            {[
              {
                title: "Veille stratégique",
                desc: "Un suivi régulier de vos zones, enjeux ou risques prioritaires. Destiné aux organisations souhaitant disposer d'une lecture continue d'un environnement géopolitique, d'une zone de crise, d'un pays ou d'un sujet sensible.",
                points: [
                  "Sélection et hiérarchisation de l'information utile",
                  "Synthèses régulières",
                  "Alertes contextualisées",
                  "Suivi des signaux faibles",
                  "Mise en perspective géopolitique des évolutions observées",
                ],
              },
              {
                title: "Notes de risque pays",
                desc: "Des notes d'aide à la décision centrées sur l'exposition d'un pays, d'une région ou d'un environnement donné.",
                points: [
                  "Le contexte politique",
                  "La stabilité institutionnelle",
                  "La situation sécuritaire",
                  "Les vulnérabilités réglementaires",
                  "Les enjeux réputationnels",
                  "Les principaux points de vigilance à court et moyen terme",
                ],
              },
              {
                title: "Due diligence géopolitique",
                desc: "Un accompagnement en amont d'une implantation, d'un engagement local, d'un partenariat ou d'une décision sensible. Cette offre permet d'éclairer les angles morts d'un projet dans un environnement complexe, incertain ou exposé.",
                points: [],
              },
              {
                title: "Notes confidentielles",
                desc: "Des productions réservées, à diffusion restreinte, sur des sujets sensibles ou à forte dimension stratégique. Conçues pour les organisations qui ont besoin d'une analyse ciblée, synthétique et confidentielle.",
                points: [],
              },
              {
                title: "Briefings exécutifs",
                desc: "Des formats courts conçus pour les décideurs qui doivent aller à l'essentiel.",
                points: [
                  "Un briefing écrit",
                  "Une note synthétique",
                  "Un échange de débrief",
                  "Un point préparatoire avant déplacement, réunion ou arbitrage",
                ],
              },
            ].map((f) => (
              <div key={f.title} className="border-t border-navy/10 pt-8">
                <h3 className="text-navy font-semibold text-lg mb-3">{f.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed mb-4">{f.desc}</p>
                {f.points.length > 0 && (
                  <ul className="space-y-2">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy/30 flex-shrink-0" />
                        <span className="text-navy/60 text-sm">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 niveaux */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-10">Trois niveaux d'accès</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              titre: "Accès Essentiel",
              desc: "Pour les structures souhaitant un accès privilégié à certaines publications, analyses et contenus réservés. Adapté aux lecteurs professionnels, rédactions, cabinets et décideurs.",
            },
            {
              titre: "Accès Intelligence",
              desc: "Pour les organisations ayant besoin d'une veille suivie, de notes ciblées ou d'un appui ponctuel sur des zones, pays ou enjeux prioritaires.",
              highlight: true,
            },
            {
              titre: "Accès Sur mesure",
              desc: "Pour les besoins sensibles, confidentiels ou à forte composante décisionnelle. Adapté aux directions générales, investisseurs, médias et organisations internationales.",
            },
          ].map((n) => (
            <div
              key={n.titre}
              className={`p-6 border ${n.highlight ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy"}`}
            >
              <h3 className={`font-semibold mb-3 ${n.highlight ? "text-white" : "text-navy"}`}>{n.titre}</h3>
              <p className={`text-sm leading-relaxed ${n.highlight ? "text-white/70" : "text-navy/60"}`}>{n.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ce qui nous distingue */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-10">Ce qui nous distingue</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { titre: "Une exigence éditoriale forte", desc: "Notre travail repose sur la qualité du fond, la solidité des sources et la précision de la restitution." },
              { titre: "Une orientation décisionnelle", desc: "Nos livrables ne cherchent pas l'exhaustivité théorique, mais la pertinence stratégique." },
              { titre: "Une réelle adaptabilité", desc: "Chaque besoin peut être traité dans le format le plus utile : note, briefing, veille, alerte ou analyse ciblée." },
              { titre: "Un cadre de discrétion", desc: "Une partie de notre accompagnement est conçue pour rester dans un périmètre strictement professionnel et maîtrisé." },
            ].map((d) => (
              <div key={d.titre} className="border-t border-navy/10 pt-6">
                <h3 className="text-navy font-semibold mb-2">{d.titre}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modalités */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.15em] uppercase text-navy/40 mb-6">Modalités</h2>
        <p className="text-navy/70 text-sm leading-relaxed mb-4">
          Les modalités d'accès, d'abonnement ou d'accompagnement sont communiquées sur demande, après qualification du besoin et, selon les cas, dans un cadre confidentiel.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-navy text-white px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">
            Demander un accès ou en savoir plus
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:contact@sitrep.fr?subject=Demande d'accès professionnel"
              className="inline-block bg-white text-navy text-sm font-semibold px-6 py-3 hover:bg-white/90 transition"
            >
              Demander une présentation des offres →
            </a>
            <a
              href="mailto:contact@sitrep.fr?subject=Parler à un analyste"
              className="inline-block border border-white/30 text-white text-sm font-semibold px-6 py-3 hover:border-white/60 transition"
            >
              Parler à un analyste
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
