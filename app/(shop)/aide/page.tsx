import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SHIPPING_FEES, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Aide & informations",
  description:
    "Livraison au Cameroun, retours, guide des tailles, paiement MTN MoMo et Orange Money : toutes les réponses DESCO MALL.",
};

const SECTIONS = [
  { id: "livraison", label: "Livraison" },
  { id: "retours", label: "Retours & échanges" },
  { id: "tailles", label: "Guide des tailles" },
  { id: "paiement", label: "Paiement" },
  { id: "contact", label: "Contact" },
  { id: "conditions", label: "Conditions" },
  { id: "confidentialite", label: "Confidentialité" },
];

export default function HelpPage() {
  return (
    <div className="container-shop py-8 md:py-12">
      <div className="max-w-2xl">
        <p className="eyebrow">Service client</p>
        <h1 className="mt-2 text-[30px] font-bold tracking-[-0.03em] md:text-[36px]">
          Aide & informations
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
          Livraison, paiement Mobile Money, tailles et retours : tout ce qu&apos;il faut savoir
          avant et après votre commande. Notre équipe reste joignable sur WhatsApp.
        </p>
      </div>

      <div className="mt-9 grid gap-10 md:grid-cols-[200px_1fr] md:gap-14">
        <nav aria-label="Sommaire de l'aide" className="md:sticky md:top-24 md:h-fit">
          <ul className="flex gap-2 overflow-x-auto no-scrollbar md:flex-col md:gap-2.5">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block whitespace-nowrap text-[12.5px] text-ink-muted transition-colors hover:text-brand-black"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-2xl space-y-10">
          <section id="livraison" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Livraison</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Les commandes passées avant 15 h sont préparées le jour même. Douala et Yaoundé
              sont livrées en 48 h ouvrées. Les autres villes comptent 2 à 4 jours ouvrés via
              nos partenaires transporteurs.
            </p>
            <div className="mt-4 overflow-hidden rounded-md border border-ink-line">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-paper-soft">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Ville</th>
                    <th className="px-4 py-2.5 font-semibold">Frais</th>
                    <th className="px-4 py-2.5 font-semibold">Délai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-line">
                  {Object.entries(SHIPPING_FEES).map(([city, fee]) => (
                    <tr key={city}>
                      <td className="px-4 py-2.5 text-ink-soft">{city}</td>
                      <td className="px-4 py-2.5 font-medium">{formatPrice(fee)}</td>
                      <td className="px-4 py-2.5 text-ink-muted">
                        {city === "Douala" || city === "Yaoundé" ? "48 h" : "2 à 4 jours"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11.5px] text-ink-faint">
              Livraison offerte à Douala et Yaoundé dès 50 000 XAF d&apos;achat.
            </p>
          </section>

          <section id="retours" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Retours & échanges</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Vous avez 7 jours après réception pour demander un échange ou un remboursement.
              La pièce doit être non portée, non lavée, avec son étiquette. Écrivez-nous sur
              WhatsApp avec votre numéro de commande : nous organisons le retour.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              Les articles en promotion restent échangeables, mais remboursables uniquement en
              avoir. Les sous-vêtements et pièces personnalisées ne sont pas repris.
            </p>
          </section>

          <section id="tailles" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Guide des tailles</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Nos coupes sont fidèles aux tailles standards. En cas d&apos;hésitation entre deux
              tailles, prenez la plus grande pour les robes et ensembles, la plus petite pour
              les pièces en maille.
            </p>
            <div className="mt-4 overflow-hidden rounded-md border border-ink-line">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-paper-soft">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Taille</th>
                    <th className="px-4 py-2.5 font-semibold">Poitrine</th>
                    <th className="px-4 py-2.5 font-semibold">Taille</th>
                    <th className="px-4 py-2.5 font-semibold">Hanches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-line">
                  {[
                    ["XS", "80–84", "60–64", "88–92"],
                    ["S", "85–89", "65–69", "93–97"],
                    ["M", "90–94", "70–74", "98–102"],
                    ["L", "95–100", "75–80", "103–108"],
                    ["XL", "101–106", "81–86", "109–114"],
                    ["XXL", "107–112", "87–92", "115–120"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td
                          key={cell}
                          className={index === 0 ? "px-4 py-2.5 font-medium" : "px-4 py-2.5 text-ink-muted"}
                        >
                          {index === 0 ? cell : `${cell} cm`}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="paiement" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Paiement</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Nous acceptons MTN Mobile Money et Orange Money via Fapshi. Vous recevez une
              demande de validation sur votre téléphone au moment de la commande. Aucun numéro
              de carte bancaire n&apos;est demandé.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              Le paiement à la livraison est possible à Douala et Yaoundé sur demande, via
              WhatsApp, pour les commandes inférieures à 50 000 XAF.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Contact</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { icon: MessageCircle, title: "WhatsApp", text: "+237 655 000 000", href: "https://wa.me/237655000000" },
                { icon: Phone, title: "Téléphone", text: "+237 655 000 000", href: "tel:+237655000000" },
                { icon: Mail, title: "Email", text: "bonjour@descomall.cm", href: "mailto:bonjour@descomall.cm" },
                { icon: MapPin, title: "Boutique", text: "Akwa, Douala — Cameroun", href: "https://maps.google.com/?q=Akwa+Douala" },
              ].map((entry) => (
                <a
                  key={entry.title}
                  href={entry.href}
                  className="flex items-start gap-3 rounded-md border border-ink-line p-4 transition-colors hover:border-ink-faint"
                >
                  <entry.icon className="mt-0.5 h-4 w-4 text-ink-soft" />
                  <span>
                    <span className="block text-[12px] font-semibold">{entry.title}</span>
                    <span className="block text-[11.5px] text-ink-muted">{entry.text}</span>
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] text-ink-faint">
              Du lundi au samedi, de 8 h à 19 h (heure de Douala). Réponse WhatsApp sous 2 h en
              moyenne.
            </p>
          </section>

          <section id="conditions" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Conditions générales</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Les prix sont affichés en francs CFA BEAC (XAF), toutes taxes comprises. Les
              photos produits sont non contractuelles : de légères variations de teinte peuvent
              apparaître selon les écrans. DESCO MALL se réserve le droit d&apos;annuler une
              commande en cas d&apos;erreur de prix manifeste ou de rupture de stock, avec
              remboursement intégral.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              Le site est édité par DESCO MALL, Douala, Cameroun. Les présentes conditions sont
              régies par le droit camerounais.
            </p>
          </section>

          <section id="confidentialite" className="scroll-mt-24">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Confidentialité</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Nous collectons uniquement les données nécessaires à la commande : nom, email,
              téléphone et adresse. Elles ne sont jamais revendues. Vous pouvez demander leur
              suppression en écrivant à bonjour@descomall.cm. Les paiements sont traités par
              Fapshi ; DESCO MALL ne stocke aucune donnée bancaire.
            </p>
          </section>

          <div className="rounded-lg bg-paper-soft p-6">
            <h2 className="text-[18px] font-semibold">Une question sans réponse ?</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              Écrivez-nous, nous répondons sous 2 h en moyenne du lundi au samedi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href="https://wa.me/237655000000" target="_blank" rel="noreferrer">
                  Écrire sur WhatsApp
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/catalogue">Retour au catalogue</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
