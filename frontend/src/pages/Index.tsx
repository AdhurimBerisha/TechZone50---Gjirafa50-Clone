import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Headphones,
  ShieldCheck,
  X,
} from "lucide-react";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useProductStore } from "@/stores/productStore";

const tabs = [
  "Për ty",
  "Gaming",
  "Kompjuter",
  "Laptop",
  "Maus",
  "Tastierë",
  "TV",
  "Kufje & Mikrofon",
];

const promos = [
  {
    title: "HAPPY HOURS",
    subtitle: "16:00 - 18:00",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
  {
    title: "VETËM SOT",
    subtitle: "Oferta speciale",
    color: "bg-gradient-to-r from-primary to-red-600",
  },
  {
    title: "Më pak gravitet.",
    subtitle: "Më shumë zbritje.",
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
  },
  {
    title: "SIGUROJE FITOREN",
    subtitle: "Gaming aksesorë",
    color: "bg-gradient-to-r from-green-500 to-teal-600",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("Për ty");
  const [showTrust, setShowTrust] = useState(true);
  const { products: fetchedProducts, fetchAllProducts } = useProductStore();

  useEffect(() => {
    void fetchAllProducts();
  }, [fetchAllProducts]);

  const allProducts = fetchedProducts.length > 0 ? fetchedProducts : products;

  const filteredProducts =
    activeTab === "Për ty"
      ? allProducts
      : allProducts.filter((p) => {
          const tab = activeTab.toLowerCase();
          return (
            p.category.toLowerCase().includes(tab) ||
            p.name.toLowerCase().includes(tab) ||
            p.categorySlug.includes(tab)
          );
        });

  return (
    <div className="max-w-[1320px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="hidden lg:block">
          <CategorySidebar />
        </div>

        <div className="flex-1 min-w-0">
          {/* Hero Banner */}
          <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-r from-[hsl(0,0%,18%)] to-[hsl(0,0%,25%)] min-h-[220px] h-auto sm:h-[260px] md:h-[280px] lg:h-[320px] flex items-center px-4 sm:px-6 md:px-8 py-6 sm:py-0">
            <div className="relative z-10 max-w-[85%] sm:max-w-none">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                GIGABYTE
              </h2>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                GS25F2A
              </h3>
              <p className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-sm">
                25" FHD 240Hz 1ms
              </p>
              <div className="mt-2 sm:mt-4 flex flex-wrap items-baseline gap-x-2 sm:gap-x-3">
                <span className="text-white/50 line-through text-sm sm:text-lg">
                  144.50€
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  119.50€
                </span>
              </div>
              <p className="text-white/50 text-[10px] sm:text-xs mt-1">
                3.32€ x 36 Muaj
              </p>
              <button
                type="button"
                className="mt-3 sm:mt-4 bg-primary text-primary-foreground px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                BLEJ TANI
              </button>
            </div>
            <div className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 opacity-20 sm:opacity-30 pointer-events-none hidden sm:block">
              <span className="text-[48px] sm:text-[72px] md:text-[96px] lg:text-[120px] font-black text-primary leading-none">
                VETËM SOT
              </span>
            </div>

            {/* Nav Arrows */}
            <button
              type="button"
              aria-label="Banneri i mëparshëm"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              aria-label="Banneri tjetër"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Promo Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
            {promos.map((p, i) => (
              <div
                key={i}
                className={`${p.color} rounded-lg p-3 sm:p-4 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-[64px] sm:min-h-[70px] flex flex-col justify-center`}
              >
                <p className="font-bold text-xs sm:text-sm truncate">{p.title}</p>
                <p className="text-[10px] sm:text-xs opacity-80 truncate">
                  {p.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      {showTrust && (
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Blerje të sigurta
            </h2>
            <button
              type="button"
              onClick={() => setShowTrust(false)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Mbyll"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: Truck,
                title: "Dërgesa të shpejta",
                sub: "Kudo në Kosovë",
              },
              {
                icon: Package,
                title: "Mbi 100,000 produkte",
                sub: "Origjinale dhe me garancion",
              },
              {
                icon: Headphones,
                title: "Kujdesi ndaj klientit",
                sub: "Prano përgjigje brenda sekondave",
              },
              {
                icon: ShieldCheck,
                title: "Çmimi më i mirë i garantuar",
                sub: "Në çdo produkt",
              },
            ].map(({ icon: Icon, title, sub }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 bg-white border border-border rounded-lg p-3 sm:p-4"
              >
                <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products */}
      <section className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
          Të rekomanduara
        </h2>
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {(filteredProducts.length > 0 ? filteredProducts : allProducts)
            .slice(0, 10)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
        <div className="text-center mt-4 sm:mt-6 px-1">
          <Link
            to="/category/all"
            className="inline-block w-full sm:w-auto bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors text-center"
          >
            SHFAQ MË SHUMË PRODUKTE
          </Link>
        </div>
      </section>

      {/* Most Searched */}
      <section className="mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
          Më të kërkuarat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              name: "Kompjuter",
              image:
                "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop",
            },
            {
              name: "Laptop",
              image:
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
            },
            {
              name: "Monitor",
              image:
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
            },
          ].map((item) => (
            <Link
              key={item.name}
              to={`/category/${item.name.toLowerCase()}`}
              className="relative rounded-lg sm:rounded-xl overflow-hidden bg-muted h-[160px] sm:h-[180px] md:h-[200px] group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                loading="lazy"
              />
              <div className="relative z-10 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {item.name}
                </h3>
                <span className="inline-block mt-2 sm:mt-3 bg-white text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Blej tani
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Logos */}
      <section className="mt-8 sm:mt-12 mb-6 sm:mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
          {["Apple", "Samsung", "MSI", "SteelSeries", "Lenovo", "Razer"].map(
            (brand) => (
              <div
                key={brand}
                className="border border-border rounded-lg p-3 sm:p-4 flex items-center justify-center h-[48px] sm:h-[60px] hover:border-primary transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground text-center">
                  {brand}
                </span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
