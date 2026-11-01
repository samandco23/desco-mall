import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductTabs } from "@/components/shop/product-tabs";
import { SectionHeading } from "@/components/shared/section-heading";
import { getProductBySlug, getRelatedProducts, getProducts } from "@/lib/catalog";
import { getPublicBaseUrl } from "@/lib/site-url";

export const revalidate = 86400;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Produit introuvable" };
  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} — DESCO MALL`,
      description: product.description.slice(0, 155),
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const appUrl = getPublicBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => `${appUrl}${image.url}`),
    brand: { "@type": "Brand", name: "DESCO MALL" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "XAF",
      price: product.price / 100,
      availability:
        Object.values(product.stock).reduce((sum, value) => sum + value, 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${appUrl}/produit/${product.slug}`,
    },
  };

  return (
    <div className="container-shop py-6 md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Fil d'Ariane" className="text-[11.5px] text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-brand-black">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/catalogue/${product.category.slug}`}
              className="transition-colors hover:text-brand-black"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-[220px] truncate text-brand-black">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-[52px]">
        <ProductGallery images={product.images} name={product.name} />
        <ProductPurchasePanel product={product} />
      </div>

      <section className="mt-12 border-t border-ink-line pt-10 md:mt-16">
        <ProductTabs product={product} />
      </section>

      {related.length > 0 && (
        <section className="mt-14 border-t border-ink-line pt-10 md:mt-16">
          <SectionHeading
            title="Vous aimerez aussi"
            actionLabel="Tout le catalogue"
            actionHref={`/catalogue/${product.category.slug}`}
          />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
