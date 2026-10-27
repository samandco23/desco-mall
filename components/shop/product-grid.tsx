import { ProductCard } from "@/components/shop/product-card";
import type { CatalogProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  columns = 4,
  className,
}: {
  products: CatalogProduct[];
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
