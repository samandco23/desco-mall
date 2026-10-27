import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Les prix sont stockés en centimes XAF (entier).
 * XAF n'a pas de décimales : on divise par 100 puis on formate sans décimale.
 */
export function formatPrice(cents: number): string {
  // Intl fr-CM rend « FCFA » : on force le libellé XAF demandé par la marque.
  const amount = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  })
    .format(Math.round(cents / 100))
    .replace(/[\u00a0\u202f]/g, " ");
  return `${amount} XAF`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Affiche un numéro camerounais au format +237 6XX XXX XXX */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^237/, "");
  if (digits.length !== 9) return phone;
  return `+237 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

export function isValidCameroonPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "").replace(/^237/, "");
  return /^[26]\d{8}$/.test(digits);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(value: Date | string, withTime = false): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export const CAMEROON_CITIES = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Bamenda",
  "Garoua",
  "Maroua",
  "Kribi",
  "Limbé",
  "Buea",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Dschang",
  "Kumba",
] as const;

export type CameroonCity = (typeof CAMEROON_CITIES)[number];

export const SHIPPING_FEES: Record<string, number> = {
  Douala: 100_000,
  "Yaoundé": 150_000,
  Bafoussam: 200_000,
  Bamenda: 250_000,
  Garoua: 300_000,
  Maroua: 300_000,
  Kribi: 200_000,
  "Limbé": 200_000,
  Buea: 200_000,
  "Ngaoundéré": 300_000,
  Bertoua: 300_000,
  Ebolowa: 250_000,
  Dschang: 200_000,
  Kumba: 250_000,
};

export function shippingFeeFor(city: string | undefined): number {
  if (!city) return 0;
  return SHIPPING_FEES[city] ?? 250_000;
}
