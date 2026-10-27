import { describe, expect, it } from "vitest";

import {
  WHOLESALE_TIERS,
  lineSavings,
  nextTierAbove,
  tierForQuantity,
  unitPriceFor,
} from "@/lib/wholesale";

describe("wholesale — paliers", () => {
  it("n'applique aucune remise en dessous du premier palier", () => {
    expect(tierForQuantity(1)).toBeNull();
    expect(tierForQuantity(2)).toBeNull();
    expect(unitPriceFor(1_000_000, 2)).toBe(1_000_000);
  });

  it("applique −5 % dès 3 pièces", () => {
    const tier = tierForQuantity(3);
    expect(tier?.discountPercent).toBe(5);
    expect(unitPriceFor(1_000_000, 3)).toBe(950_000);
    expect(unitPriceFor(1_000_000, 9)).toBe(950_000);
  });

  it("applique −10 % dès 10 pièces", () => {
    expect(unitPriceFor(1_000_000, 10)).toBe(900_000);
    expect(unitPriceFor(1_000_000, 24)).toBe(900_000);
  });

  it("applique −15 % dès 25 pièces", () => {
    expect(unitPriceFor(1_000_000, 25)).toBe(850_000);
    expect(unitPriceFor(1_000_000, 99)).toBe(850_000);
  });

  it("retourne le prochain palier au-dessus de la quantité courante", () => {
    expect(nextTierAbove(1)?.minQuantity).toBe(3);
    expect(nextTierAbove(3)?.minQuantity).toBe(10);
    expect(nextTierAbove(10)?.minQuantity).toBe(25);
    expect(nextTierAbove(25)).toBeNull();
  });

  it("calcule l'économie totale d'une ligne", () => {
    expect(lineSavings(1_000_000, 2)).toBe(0);
    expect(lineSavings(1_000_000, 3)).toBe(150_000);
    expect(lineSavings(1_000_000, 10)).toBe(1_000_000);
    expect(lineSavings(1_000_000, 25)).toBe(3_750_000);
  });

  it("reste cohérent avec la liste des paliers publiée", () => {
    for (const tier of WHOLESALE_TIERS) {
      expect(unitPriceFor(2_450_000, tier.minQuantity)).toBe(
        Math.round((2_450_000 * (100 - tier.discountPercent)) / 100)
      );
    }
  });
});
