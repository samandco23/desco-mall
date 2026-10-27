import Link from "next/link";
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail } from "lucide-react";

import { Logo } from "@/components/shared/logo";

const columns = [
  {
    title: "Boutique",
    links: [
      { label: "Nouveautés", href: "/catalogue?nouveautes=1" },
      { label: "Femme", href: "/catalogue/femme" },
      { label: "Homme", href: "/catalogue/homme" },
      { label: "Enfants", href: "/catalogue/enfants" },
      { label: "Accessoires", href: "/catalogue/accessoires" },
      { label: "Soldes", href: "/catalogue?promo=1" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Livraison", href: "/aide#livraison" },
      { label: "Retours & échanges", href: "/aide#retours" },
      { label: "Guide des tailles", href: "/aide#tailles" },
      { label: "Paiement Mobile Money", href: "/aide#paiement" },
      { label: "Nous contacter", href: "/aide#contact" },
    ],
  },
  {
    title: "DESCO",
    links: [
      { label: "Notre histoire", href: "/a-propos" },
      { label: "Wax & Culture", href: "/catalogue/wax-culture" },
      { label: "Tarifs grossiste", href: "/a-propos#distributeurs" },
      { label: "Devenir distributeur", href: "/a-propos#distributeurs" },
      { label: "Conditions générales", href: "/aide#conditions" },
      { label: "Confidentialité", href: "/aide#confidentialite" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="container-shop grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo invert />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
            Le Distributeur qui Distribue les Distributeurs. Mode, wax et accessoires
            sélectionnés à Douala, livrés partout au Cameroun.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="DESCO MALL sur Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="DESCO MALL sur Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/237655000000"
              target="_blank"
              rel="noreferrer"
              aria-label="DESCO MALL sur WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-[13px] font-semibold text-white">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-shop border-t border-white/[0.08] py-5">
        <div className="flex flex-col gap-4 text-[11.5px] text-white/45 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Akwa, Douala — Cameroun
            </span>
            <a href="tel:+237655000000" className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3.5 w-3.5" /> +237 655 000 000
            </a>
            <a href="mailto:bonjour@descomall.cm" className="flex items-center gap-1.5 hover:text-white">
              <Mail className="h-3.5 w-3.5" /> bonjour@descomall.cm
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} DESCO MALL</span>
            <span>MTN MoMo · Orange Money</span>
            <span>Fait à Douala</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
