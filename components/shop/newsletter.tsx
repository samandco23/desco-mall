"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter";

const initialState: NewsletterState = { ok: false, message: "" };

export function Newsletter() {
  const [state, setState] = useState<NewsletterState>(initialState);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const result = await subscribeNewsletter(new FormData(form));
    setState(result);
    setPending(false);
    if (result.ok) form.reset();
  }

  return (
    <section className="border-y border-ink-line bg-paper-soft">
      <div className="container-shop grid gap-8 py-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="eyebrow mb-2">Newsletter DESCO</p>
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">
            Les nouveautés avant tout le monde.
          </h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
            Deux emails par mois : nouvelles pièces, ventes privées et histoires d&apos;ateliers.
            Pas de bruit inutile.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Votre adresse email
            </label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="votre@email.cm"
              className="bg-white"
            />
            <Button type="submit" disabled={pending} className="shrink-0">
              {pending ? "Inscription…" : "Je m'inscris"}
              {!pending && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
          {state.message && (
            <p
              className={
                state.ok
                  ? "flex items-center gap-1.5 text-[12px] font-medium text-brand-success"
                  : "text-[12px] font-medium text-brand-accent"
              }
              role="status"
            >
              {state.ok && <Check className="h-3.5 w-3.5" />}
              {state.message}
            </p>
          )}
          <p className="text-[10.5px] text-ink-faint">
            En vous inscrivant, vous acceptez de recevoir nos emails. Désinscription en un clic.
          </p>
        </form>
      </div>
    </section>
  );
}
