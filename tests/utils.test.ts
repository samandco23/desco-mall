import { describe, expect, it } from "vitest";

import {
  formatPrice,
  isValidCameroonPhone,
  shippingFeeFor,
  slugify,
} from "@/lib/utils";

describe("formatPrice", () => {
  it("formate les centimes XAF sans décimale", () => {
    expect(formatPrice(1_500_000)).toBe("15 000 XAF");
    expect(formatPrice(2_450_000)).toBe("24 500 XAF");
  });

  it("ne produit jamais de décimale", () => {
    expect(formatPrice(999)).not.toContain(",");
    expect(formatPrice(999)).toContain("XAF");
  });
});

describe("slugify", () => {
  it("retire les accents et les caractères spéciaux", () => {
    expect(slugify("Robe longue Sawa — Édition limitée")).toBe(
      "robe-longue-sawa-edition-limitee"
    );
    expect(slugify("  Ensemble  Bonanjo  ")).toBe("ensemble-bonanjo");
    expect(slugify("Wax & Culture")).toBe("wax-culture");
  });
});

describe("téléphones camerounais", () => {
  it("accepte les formats locaux et internationaux", () => {
    expect(isValidCameroonPhone("+237 655 234 118")).toBe(true);
    expect(isValidCameroonPhone("655234118")).toBe(true);
    expect(isValidCameroonPhone("237699872004")).toBe(true);
  });

  it("refuse les numéros incomplets", () => {
    expect(isValidCameroonPhone("65523411")).toBe(false);
    expect(isValidCameroonPhone("+237 155 234 118")).toBe(false);
  });
});

describe("frais de livraison", () => {
  it("applique le barème par ville", () => {
    expect(shippingFeeFor("Douala")).toBe(100_000);
    expect(shippingFeeFor("Yaoundé")).toBe(150_000);
  });

  it("retombe sur le tarif villes secondaires", () => {
    expect(shippingFeeFor("Ville inconnue")).toBe(250_000);
    expect(shippingFeeFor(undefined)).toBe(0);
  });
});
