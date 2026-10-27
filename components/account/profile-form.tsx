"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateProfile, type ProfileState } from "@/lib/actions/account";
import { CAMEROON_CITIES } from "@/lib/utils";

export function ProfileForm({
  name,
  email,
  phone,
  city,
  neighborhood,
}: {
  name: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
}) {
  const [state, setState] = useState<ProfileState | undefined>(undefined);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await updateProfile(new FormData(event.currentTarget));
    setState(result);
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink-line p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" defaultValue={name} className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={email}
            readOnly
            disabled
            className="mt-1.5"
          />
          <p className="mt-1 text-[10.5px] text-ink-faint">
            L&apos;email de connexion ne peut pas être modifié en ligne.
          </p>
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            placeholder="+237 6XX XXX XXX"
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="city">Ville</Label>
          <Select id="city" name="city" defaultValue={city} className="mt-1.5">
            {CAMEROON_CITIES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="neighborhood">Quartier</Label>
          <Input
            id="neighborhood"
            name="neighborhood"
            defaultValue={neighborhood}
            placeholder="Akwa, Bonamoussadi…"
            className="mt-1.5"
            required
          />
        </div>
      </div>

      {state?.message && (
        <p
          className={
            state.ok
              ? "mt-4 flex items-start gap-2 rounded-sm border border-brand-success/20 bg-[#EEF7F0] px-3 py-2.5 text-[12px] font-medium text-brand-success"
              : "mt-4 rounded-sm border border-brand-accent/20 bg-brand-accent-bg px-3 py-2.5 text-[12px] font-medium text-brand-accent"
          }
          role="status"
        >
          {state.ok && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-5">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Enregistrer
          </>
        )}
      </Button>
    </form>
  );
}
