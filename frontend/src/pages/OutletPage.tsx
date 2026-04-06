import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Tag } from "lucide-react";

const OutletPage = () => {
  const outletProducts = products.filter((p) => p.oldPrice);

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {outletProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default OutletPage;
