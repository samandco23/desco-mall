"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Check,
  ChevronLeft,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMounted } from "@/hooks/use-mounted";
import { placeOrder } from "@/lib/actions/checkout";
import { CAMEROON_CITIES, cn, formatPrice, shippingFeeFor } from "@/lib/utils";
import { unitPriceFor } from "@/lib/wholesale";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { ShoppingBag } from "lucide-react";

const PHONE_REGEX = /^(\+237|237)?[26]\d{8}$/;

const formSchema = z.object({
  fullName: z.string().trim().min(3, "Indiquez votre nom complet."),
  email: z.string().trim().email("Adresse email invalide."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => PHONE_REGEX.test(value.replace(/\s/g, "")),
      "Numéro camerounais invalide. Exemple : +237 6XX XXX XXX."
    ),
  city: z.string().min(2, "Choisissez votre ville."),
  neighborhood: z.string().trim().min(2, "Indiquez votre quartier."),
  instructions: z.string().trim().max(400, "400 caractères maximum.").optional(),
  paymentMethod: z.enum(["MTN_MOMO", "ORANGE_MONEY"]),
});

type FormValues = z.infer<typeof formSchema>;

type CheckoutDefaults = {
  fullName: string; email: string; phone: string; city: string; neighborhood: string;
  instructions: string; paymentMethod: "MTN_MOMO" | "ORANGE_MONEY";
};

export function CheckoutView({ defaults }: { defaults: CheckoutDefaults }) {
  const router = useRouter();
  const mounted = useMounted();
  const items = useCartStore((state) => state.items);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaults },
  });

  const city = watch("city");
  const paymentMethod = watch("paymentMethod");

  if (!mounted) {
    return (
      <div className="container-shop py-10">
        <div className="h-56 animate-pulse rounded-lg bg-paper-soft" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-shop py-10 md:py-14">
        <h1 className="text-[28px] font-bold tracking-[-0.03em]">Paiement</h1>
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Ajoutez au moins une pièce avant de passer commande."
            actionLabel="Voir le catalogue"
            actionHref="/catalogue"
          />
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const shippingFee = shippingFeeFor(city);
  const total = subtotal + shippingFee;

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await placeOrder({
      ...values,
      items,
    });

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }
    router.push(`/checkout/confirmation?order=${encodeURIComponent(result.orderNumber)}&token=${result.confirmationToken}`);
  }

  return (
    <div className="container-shop py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Étape 2 sur 3</p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Livraison & paiement</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Renseignez vos informations, choisissez Mobile Money, validez.
          </p>
        </div>
        <Link
          href="/panier"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted underline-offset-4 hover:text-brand-black hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Retour au panier
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10"
        noValidate
      >
        <div className="space-y-8">
          <section className="rounded-lg border border-ink-line p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-black text-[11px] font-bold text-white">
                1
              </span>
              <h2 className="text-[15px] font-semibold">Vos coordonnées</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  className="mt-1.5"
                  placeholder="Aïcha Ngo Bell"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11.5px] text-brand-accent">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1.5"
                  placeholder="vous@email.cm"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-[11.5px] text-brand-accent">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone (WhatsApp)</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="mt-1.5"
                  placeholder="+237 6XX XXX XXX"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11.5px] text-brand-accent">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-ink-line p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-black text-[11px] font-bold text-white">
                2
              </span>
              <h2 className="text-[15px] font-semibold">Adresse de livraison</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Select id="city" {...register("city")} className="mt-1.5">
                  {CAMEROON_CITIES.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="neighborhood">Quartier</Label>
                <Input
                  id="neighborhood"
                  {...register("neighborhood")}
                  className="mt-1.5"
                  placeholder="Akwa, Bonamoussadi…"
                  aria-invalid={Boolean(errors.neighborhood)}
                />
                {errors.neighborhood && (
                  <p className="mt-1 text-[11.5px] text-brand-accent">
                    {errors.neighborhood.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="instructions">
                  Indications de livraison <span className="font-normal text-ink-faint">(optionnel)</span>
                </Label>
                <Textarea
                  id="instructions"
                  {...register("instructions")}
                  className="mt-1.5"
                  placeholder="Repère, étage, numéro d'immeuble, heure préférée…"
                />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
              <MapPin className="h-3.5 w-3.5" />
              Frais de livraison {city} : {formatPrice(shippingFee)}
            </p>
          </section>

          <section className="rounded-lg border border-ink-line p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-black text-[11px] font-bold text-white">
                3
              </span>
              <h2 className="text-[15px] font-semibold">Paiement Mobile Money</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "MTN_MOMO" as const,
                  label: "MTN Mobile Money",
                  hint: "Vous recevrez une demande de validation sur votre téléphone.",
                },
                {
                  value: "ORANGE_MONEY" as const,
                  label: "Orange Money",
                  hint: "Validation par code USSD ou sur l'application Orange Money.",
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-md border p-4 transition-colors",
                    paymentMethod === method.value
                      ? "border-brand-black bg-paper-soft"
                      : "border-ink-line hover:border-ink-faint"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={method.value}
                      {...register("paymentMethod")}
                      className="h-4 w-4 accent-brand-black"
                    />
                    <Smartphone className="h-4 w-4" />
                    <span className="text-[13px] font-semibold">{method.label}</span>
                  </span>
                  <span className="mt-1.5 pl-6 text-[11.5px] leading-relaxed text-ink-muted">
                    {method.hint}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <Lock className="h-3 w-3" /> Votre moyen Mobile Money préféré est mémorisé pour
              faciliter vos prochains achats. Aucun code PIN ni code de validation n’est enregistré.
            </p>
          </section>

          {serverError && (
            <p
              className="rounded-sm border border-brand-accent/20 bg-brand-accent-bg px-4 py-3 text-[12.5px] font-medium text-brand-accent"
              role="alert"
            >
              {serverError}
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border border-ink-line bg-white p-5">
            <h2 className="text-[15px] font-semibold">Votre commande</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative h-[72px] w-[56px] shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-bl-sm bg-brand-black px-1 text-[9px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div>
                      <p className="text-[12.5px] font-medium leading-snug">{item.name}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {item.size} · {item.color}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12.5px] font-semibold">
                      {formatPrice(unitPriceFor(item.price, item.quantity) * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-ink-line pt-4 text-[12.5px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Sous-total</dt>
                <dd className="font-semibold">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Livraison — {city}</dt>
                <dd className="font-semibold">{formatPrice(shippingFee)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-ink-line pt-3 text-[15px]">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold">{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button type="submit" disabled={isSubmitting} className="mt-5 w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Traitement…
                </>
              ) : (
                <>
                  Payer {formatPrice(total)}
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-ink-faint">
              <ShieldCheck className="h-3 w-3" /> Paiement sécurisé via Fapshi
            </p>
            <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink-faint">
              En validant, vous acceptez les{" "}
              <Link href="/aide#conditions" className="underline underline-offset-2">
                conditions générales
              </Link>
              .
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
