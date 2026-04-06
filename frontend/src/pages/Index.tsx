import { useState } from "react";
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
import { products, categories } from "@/data/products";

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

const heroSlides = [
  {
    title: "GIGABYTE GS25F2A",
    subtitle: '25" FHD 240Hz 1ms',
    oldPrice: "144.50€",
    newPrice: "119.50€",
    installment: "3.32€ x 36 Muaj",
    bg: "from-[hsl(0,0%,18%)] to-[hsl(17,100%,20%)]",
  },
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

  const filteredProducts =
    activeTab === "Për ty"
      ? products
      : products.filter((p) => {
          const tab = activeTab.toLowerCase();
          return (
            p.category.toLowerCase().includes(tab) ||
            p.name.toLowerCase().includes(tab) ||
            p.categorySlug.includes(tab)
          );
        });

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-4">
      {/* Hero Section */}
      <div className="flex gap-4">
        <div className="hidden lg:block">
          <CategorySidebar />
        </div>

        <div className="flex-1">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[hsl(0,0%,18%)] to-[hsl(0,0%,25%)] h-[280px] lg:h-[320px] flex items-center px-8">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                GIGABYTE
              </h2>
              <h3 className="text-2xl lg:text-3xl font-bold text-white">
                GS25F2A
              </h3>
              <p className="text-white/70 mt-2 text-sm">25" FHD 240Hz 1ms</p>
              <div className="mt-4">
                <span className="text-white/50 line-through text-lg">
                  144.50€
                </span>
                <span className="text-3xl font-bold text-white ml-3">
                  119.50€
                </span>
              </div>
              <p className="text-white/50 text-xs mt-1">3.32€ x 36 Muaj</p>
              <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                BLEJ TANI
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
              <span className="text-[120px] font-black text-primary">
                VETËM SOT
              </span>
            </div>

            {/* Nav Arrows */}
            <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Promo Banners */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {promos.map((p, i) => (
              <div
                key={i}
                className={`${p.color} rounded-lg p-4 text-white cursor-pointer hover:opacity-90 transition-opacity h-[70px] flex flex-col justify-center`}
              >
                <p className="font-bold text-sm">{p.title}</p>
                <p className="text-xs opacity-80">{p.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      {showTrust && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Blerje të sigurta
            </h2>
            <button
              onClick={() => setShowTrust(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="flex items-center gap-3 bg-white border border-border rounded-lg p-4"
              >
                <Icon className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Të rekomanduara
        </h2>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {(filteredProducts.length > 0 ? filteredProducts : products)
            .slice(0, 10)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/category/all"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            SHFAQ MË SHUMË PRODUKTE
          </Link>
        </div>
      </section>

      {/* Most Searched */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Më të kërkuarat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="relative rounded-xl overflow-hidden bg-muted h-[200px] group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                loading="lazy"
              />
              <div className="relative z-10 p-6">
                <h3 className="text-xl font-bold text-foreground">
                  {item.name}
                </h3>
                <button className="mt-3 bg-white text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                  Blej tani
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Logos */}
      <section className="mt-12 mb-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {["Apple", "Samsung", "MSI", "SteelSeries", "Lenovo", "Razer"].map(
            (brand) => (
              <div
                key={brand}
                className="border border-border rounded-lg p-4 flex items-center justify-center h-[60px] hover:border-primary transition-colors cursor-pointer"
              >
                <span className="text-sm font-semibold text-muted-foreground">
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
