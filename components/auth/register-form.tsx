"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const message = await registerAction(new FormData(event.currentTarget));
    if (message) {
      setError(message);
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Nouveau chez DESCO</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Créer un compte</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        Suivez vos commandes, enregistrez vos adresses et gardez vos favoris. Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-medium text-brand-black underline underline-offset-4">
          Se connecter
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Aïcha Ngo Bell"
            className="mt-1.5"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@email.cm"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+237 6XX XXX XXX"
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="8 caractères, 1 lettre et 1 chiffre"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            name="acceptTerms"
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-black"
            required
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/aide#conditions" className="underline underline-offset-2">
              conditions générales
            </Link>{" "}
            et la politique de confidentialité de DESCO MALL.
          </span>
        </label>

        {error && (
          <p
            className="rounded-sm border border-brand-accent/20 bg-brand-accent-bg px-3 py-2.5 text-[12px] font-medium leading-relaxed text-brand-accent"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Création…
            </>
          ) : (
            <>
              Créer mon compte <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-[10.5px] leading-relaxed text-ink-faint">
        En créant un compte, vous recevez un email de bienvenue et notre sélection mensuelle.
        Désinscription en un clic.
      </p>
    </div>
  );
}
