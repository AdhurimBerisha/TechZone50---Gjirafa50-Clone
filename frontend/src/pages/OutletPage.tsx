import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/stores/productStore";
import { Tag } from "lucide-react";

const OutletPage = () => {
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const fetchAllProducts = useProductStore((s) => s.fetchAllProducts);
  const outletProducts = products.filter((p) => p.isOutlet);

  useEffect(() => {
    if (products.length === 0) {
      void fetchAllProducts(true);
    }
  }, [fetchAllProducts, products.length]);

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary to-red-600 rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Outlet</h1>
        </div>
        <p className="text-white/80 max-w-xl">
          Produkte me çmime të zbritura. Oferta të limituara - ble tani!
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          Duke ngarkuar produktet e outlet...
        </div>
      )}

      {!isLoading && outletProducts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Nuk u gjet asnjë produkt Outlet.
        </div>
      )}

      {!isLoading && outletProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {outletProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OutletPage;
