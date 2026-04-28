import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/actions/products";

type ProductCardProps = {
  product: Product;
  promoPrice?: number | null;
  inverseColors?: boolean;
};

export function ProductCard({ product, promoPrice, inverseColors }: ProductCardProps) {
  const primaryImage = product.images[0]?.url ?? "https://picsum.photos/seed/fallback/600/900";
  const secondaryImage = product.images[1]?.url || primaryImage;

  return (
    <article className="group relative flex flex-col">
      <Link href={`/produto/${product.id}`} className="block">
        {/* Portrait Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden bg-[#F3F4F6]">
          {/* Base Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-700 group-hover:opacity-0"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {/* Hover Reveal Image */}
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            className="absolute inset-0 object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          
          {/* Floating Badges */}
          {promoPrice || product.promo_price ? (
            <div className="absolute left-4 top-4">
              <span className="bg-brand-gold px-2.5 py-1 text-[9px] font-bold tracking-widest text-white">
                OFERTA
              </span>
            </div>
          ) : null}
          
          {/* Quick Add Overlay (Desktop) */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-500 group-hover:translate-y-0 hidden md:block">
            <div className="bg-white/90 py-3 text-center text-[10px] font-bold tracking-[0.2em] text-brand-midnight backdrop-blur-md">
              VISTA RÁPIDA
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-6 flex flex-col items-center text-center">
          <p className={cn(
            "text-[9px] font-bold tracking-[0.2em] mb-2",
            inverseColors ? "text-brand-white/40" : "text-brand-midnight/40"
          )}>
            {product.categories?.[0]?.name?.toUpperCase() ?? "RAMOS GLAMOUR"}
          </p>
          <h3 className={cn(
            "heading-luxury text-lg font-light transition-colors group-hover:text-brand-gold md:text-xl",
            inverseColors ? "text-brand-white" : "text-brand-midnight"
          )}>
            {product.name}
          </h3>
          <div className="mt-2">
            <ProductPrice
              price={product.price}
              promoPrice={promoPrice || product.promo_price}
              size="sm"
              inverse={inverseColors}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
