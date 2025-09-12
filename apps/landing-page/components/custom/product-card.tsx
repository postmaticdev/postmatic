import { Product } from "@/models/product";
import Image from "next/image";

export function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: (product: Product) => void;
}) {
  return (
    <div
      className="relative group overflow-hidden rounded-lg bg-gradient-to-br from-card to-muted border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.imageAfter}
          fill
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"></div>
        {/* Product Name */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-foreground font-semibold text-sm">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-xs opacity-80">
            {product.shortDes}
          </p>
        </div>
      </div>
    </div>
  );
}
