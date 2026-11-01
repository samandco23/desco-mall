"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const message = await loginAction(new FormData(event.currentTarget));
    if (message) {
      setError(message);
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Espace client</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Se connecter</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        Retrouvez vos commandes, vos adresses et vos favoris. Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-brand-black underline underline-offset-4">
          Créer un compte
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@email.cm"
            className="mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/aide#contact"
              className="text-[11.5px] text-ink-muted underline underline-offset-4 hover:text-brand-black"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className="mt-1.5"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <p
            className="rounded-sm border border-brand-accent/20 bg-brand-accent-bg px-3 py-2.5 text-[12px] font-medium text-brand-accent"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
            </>
          ) : (
            <>
              Se connecter <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

    </div>
  );
}
