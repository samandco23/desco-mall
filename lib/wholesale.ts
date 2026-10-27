/**
 * Tarifs grossiste DESCO MALL — remise automatique par quantité, par ligne de panier.
 * Les paliers s'appliquent dès que la quantité d'une même ligne (référence + taille + couleur)
 * atteint le seuil. Aucun code promo n'est nécessaire.
 */

export type WholesaleTier = {
  /** Quantité minimale (inclusive) pour déclencher le palier */
  minQuantity: number;
  /** Remise en pourcentage sur le prix unitaire */
  discountPercent: number;
};

export const WHOLESALE_TIERS: WholesaleTier[] = [
  { minQuantity: 3, discountPercent: 5 },
  { minQuantity: 10, discountPercent: 10 },
  { minQuantity: 25, discountPercent: 15 },
];

/** Palier applicable pour une quantité donnée (null si tarif détail classique). */
export function tierForQuantity(quantity: number): WholesaleTier | null {
  let applied: WholesaleTier | null = null;
  for (const tier of WHOLESALE_TIERS) {
    if (quantity >= tier.minQuantity) applied = tier;
  }
  return applied;
}

/** Prochain palier atteignable au-dessus de la quantité courante (pour l'incitation UI). */
export function nextTierAbove(quantity: number): WholesaleTier | null {
  return WHOLESALE_TIERS.find((tier) => tier.minQuantity > quantity) ?? null;
}

/**
 * Prix unitaire appliqué pour une quantité. Arrondi au centime XAF entier
 * (les prix sont stockés en centimes XAF).
 */
export function unitPriceFor(basePrice: number, quantity: number): number {
  const tier = tierForQuantity(quantity);
  if (!tier) return basePrice;
  return Math.round((basePrice * (100 - tier.discountPercent)) / 100);
}

/** Économie totale (en centimes XAF) pour une ligne donnée. */
export function lineSavings(basePrice: number, quantity: number): number {
  return basePrice * quantity - unitPriceFor(basePrice, quantity) * quantity;
}
