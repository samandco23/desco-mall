import { Headphones, RotateCcw, Smartphone, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Livraison 48 h",
    text: "Douala et Yaoundé, puis villes secondaires",
  },
  {
    icon: Smartphone,
    title: "Mobile Money",
    text: "MTN MoMo et Orange Money sécurisés",
  },
  {
    icon: RotateCcw,
    title: "Retours 7 jours",
    text: "Échange ou remboursement sans discussion",
  },
  {
    icon: Headphones,
    title: "Conseil WhatsApp",
    text: "Une équipe à Douala, du lundi au samedi",
  },
];

export function TrustBar() {
  return (
    <section aria-label="Nos engagements" className="border-y border-ink-line">
      <div className="container-shop grid grid-cols-2 gap-x-6 gap-y-6 py-6 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <item.icon className="mt-0.5 h-[22px] w-[22px] shrink-0 text-ink-soft" />
            <div>
              <p className="text-[12px] font-semibold text-brand-black">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-[1.4] text-ink-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
