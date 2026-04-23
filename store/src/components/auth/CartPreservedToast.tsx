"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/lib/store/cart";

function CartPreservedToastContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    const cartPreserved = searchParams.get("cart_preserved");

    if (cartPreserved === "1" && hasHydrated) {
      if (items.length > 0) {
        toast.success("O teu carrinho foi preservado", {
          duration: 4000,
        });
      }
      
      // Remove param from URL without refreshing
      const params = new URLSearchParams(searchParams.toString());
      params.delete("cart_preserved");
      const newQuery = params.toString();
      const newUrl = `${pathname}${newQuery ? `?${newQuery}` : ""}`;
      
      router.replace(newUrl);
    }
  }, [searchParams, hasHydrated, items.length, router, pathname]);

  return null;
}

export function CartPreservedToast() {
  return (
    <Suspense fallback={null}>
      <CartPreservedToastContent />
    </Suspense>
  );
}
