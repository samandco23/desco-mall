"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct } from "@/lib/actions/admin";
import type { CatalogCategory } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(3, "Le nom doit contenir au moins 3 caractères."),
  slug: z
    .string()
    .trim()
    .min(3, "Le slug est requis.")
    .regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement."),
  description: z.string().trim().min(30, "Ajoutez une description d'au moins 30 caractères."),
  priceXaf: z
    .number({ invalid_type_error: "Indiquez un prix." })
    .int("Prix entier en XAF.")
    .min(100, "Prix minimum : 100 XAF."),
  comparePriceXaf: z.number().int().min(0).optional(),
  categorySlug: z.string().min(1, "Choisissez une catégorie."),
  stock: z.number({ invalid_type_error: "Indiquez un stock." }).int().min(0, "Stock invalide."),
  sizes: z.string().trim().min(1, "Indiquez les tailles, séparées par des virgules."),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  metaTitle: z.string().trim().max(70, "70 caractères maximum.").optional(),
  metaDesc: z.string().trim().max(160, "160 caractères maximum.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type ProductFormInitial = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceXaf: number;
  comparePriceXaf?: number;
  categorySlug: string;
  stock: number;
  sizes: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  metaTitle?: string;
  metaDesc?: string;
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: CatalogCategory[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.id));
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      priceXaf: initial?.priceXaf ?? 15_000,
      comparePriceXaf: initial?.comparePriceXaf,
      categorySlug: initial?.categorySlug ?? categories[0]?.slug ?? "",
      stock: initial?.stock ?? 10,
      sizes: initial?.sizes ?? "S, M, L",
      imageUrl: initial?.imageUrl ?? "",
      isActive: initial?.isActive ?? true,
      isFeatured: initial?.isFeatured ?? false,
      isNew: initial?.isNew ?? true,
      metaTitle: initial?.metaTitle ?? "",
      metaDesc: initial?.metaDesc ?? "",
    },
  });

  const nameField = register("name");
  const imageUrl = watch("imageUrl");

  async function onSubmit(values: FormValues) {
    setServerMessage(null);
    const sizes = values.sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    const result = await saveProduct({
      id: initial?.id,
      name: values.name,
      slug: values.slug,
      description: values.description,
      priceXaf: values.priceXaf,
      comparePriceXaf: values.comparePriceXaf,
      categorySlug: values.categorySlug,
      stock: values.stock,
      sizes,
      imageUrl: values.imageUrl || undefined,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      isNew: values.isNew,
      metaTitle: values.metaTitle,
      metaDesc: values.metaDesc,
    });

    if (!result.ok) {
      setServerMessage(result.message);
      return;
    }

    router.push("/admin/produits?enregistre=1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Informations</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                {...nameField}
                onChange={(event) => {
                  nameField.onChange(event);
                  if (!slugEdited) {
                    setValue("slug", slugify(event.target.value), {
                      shouldValidate: false,
                    });
                  }
                }}
                className="mt-1.5"
                placeholder="Robe longue Sawa"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                {...register("slug")}
                onChange={(event) => {
                  setSlugEdited(true);
                  setValue("slug", event.target.value, { shouldValidate: true });
                }}
                className="mt-1.5"
                placeholder="robe-longue-sawa"
              />
              <p className="mt-1 text-[10.5px] text-ink-faint">
                URL publique : /produit/{watch("slug") || "…"}
              </p>
              {errors.slug && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.slug.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                className="mt-1.5 min-h-[130px]"
                placeholder="Matières, coupe, entretien…"
              />
              {errors.description && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.description.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Prix & disponibilité</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="priceXaf">Prix (XAF)</Label>
              <Input
                id="priceXaf"
                type="number"
                step="100"
                min="100"
                {...register("priceXaf", { valueAsNumber: true })}
                className="mt-1.5"
              />
              {errors.priceXaf && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.priceXaf.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="comparePriceXaf">Prix barré (XAF, optionnel)</Label>
              <Input
                id="comparePriceXaf"
                type="number"
                step="100"
                min="0"
                {...register("comparePriceXaf", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock total</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock", { valueAsNumber: true })}
                className="mt-1.5"
              />
              {errors.stock && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.stock.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
              <Input
                id="sizes"
                {...register("sizes")}
                className="mt-1.5"
                placeholder="XS, S, M, L, XL"
              />
              {errors.sizes && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.sizes.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Référencement (SEO)</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input
                id="metaTitle"
                {...register("metaTitle")}
                className="mt-1.5"
                placeholder="Robe longue Sawa — DESCO MALL"
              />
              {errors.metaTitle && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.metaTitle.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="metaDesc">Meta description</Label>
              <Textarea
                id="metaDesc"
                {...register("metaDesc")}
                className="mt-1.5 min-h-[80px]"
                placeholder="Décrivez la pièce en 160 caractères maximum."
              />
              {errors.metaDesc && (
                <p className="mt-1 text-[11px] text-brand-accent">{errors.metaDesc.message}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Publication</h2>
          <div className="mt-3 space-y-3">
            {[
              {
                name: "isActive" as const,
                label: "Produit actif",
                description: "Visible sur la boutique",
              },
              {
                name: "isNew" as const,
                label: "Nouveauté",
                description: "Badge « Nouveau » sur la fiche",
              },
              {
                name: "isFeatured" as const,
                label: "Mis en avant",
                description: "Apparaît dans la sélection d'accueil",
              },
            ].map((toggle) => (
              <label key={toggle.name} className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  {...register(toggle.name)}
                  className="mt-0.5 h-4 w-4 accent-brand-black"
                />
                <span>
                  <span className="block text-[12px] font-medium">{toggle.label}</span>
                  <span className="block text-[10.5px] text-ink-faint">{toggle.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Catégorie</h2>
          <Select {...register("categorySlug")} className="mt-3" aria-label="Catégorie">
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
          {errors.categorySlug && (
            <p className="mt-1 text-[11px] text-brand-accent">{errors.categorySlug.message}</p>
          )}
        </section>

        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Image principale</h2>
          <div
            className={cn(
              "mt-3 aspect-[3/4] w-full rounded-sm border border-ink-line bg-paper-tint bg-cover bg-center",
              !imageUrl && "flex items-center justify-center"
            )}
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          >
            {!imageUrl && (
              <p className="px-4 text-center text-[10.5px] text-ink-faint">
                Aucune image sélectionnée
              </p>
            )}
          </div>
          <Label htmlFor="imageUrl" className="mt-3 block">
            URL de l&apos;image
          </Label>
          <Input
            id="imageUrl"
            {...register("imageUrl")}
            className="mt-1.5"
            placeholder="/products/ma-piece.jpg"
          />
          <p className="mt-1.5 text-[10px] leading-relaxed text-ink-faint">
            Uploadthing sera branché en production. En attendant, utilisez une URL locale ou
            distante (Unsplash).
          </p>
        </section>

        {serverMessage && (
          <p
            className="rounded-sm border border-brand-accent/20 bg-brand-accent-bg px-3 py-2.5 text-[11.5px] font-medium text-brand-accent"
            role="alert"
          >
            {serverMessage}
          </p>
        )}

        <div className="space-y-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Enregistrer
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/admin/produits")}
          >
            Annuler
          </Button>
        </div>
      </div>
    </form>
  );
}
