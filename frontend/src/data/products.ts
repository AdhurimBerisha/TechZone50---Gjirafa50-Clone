import categoriesJson from "./categories.json" with { type: "json" };

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  categorySlug: string;
  /** Slugs from mega menu / `?sub=` — used for precise subcategory filtering. */
  subcategorySlugs?: string[];
  brand: string;
  rating: number;
  reviewCount: number;
  badges: ("sale" | "new" | "24h" | "viewed")[];
  specs: Record<string, string>;
  description: string;
  inStock: boolean;
  installment?: string;
  isOutlet?: boolean;
  outletDiscount?: number;
  outletStock?: number;
  condition?: "NEW" | "OPEN_BOX" | "REFURBISHED";
}

export interface MegaMenuColumn {
  title: string;
  links: { name: string; slug: string }[];
  showMore?: boolean;
}

export interface MegaMenu {
  columns: MegaMenuColumn[];
  promoImage?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: { id?: string; name: string; slug: string }[];
  megaMenu?: MegaMenu;
}

/** Offline fallback (matches `categories.json`). Prefer data from `useCategoryStore`. */
export const staticCategories: Category[] = categoriesJson as Category[];

/** @deprecated Prefer `useCategoryStore` — kept for gradual migration */
export const categories = staticCategories;

export const products: Product[] = [
  {
    id: "1",
    name: 'GIGABYTE GS25F2A 25" FHD 240Hz 1ms Monitor',
    slug: "gigabyte-gs25f2a-monitor",
    price: 119.5,
    oldPrice: 144.5,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
    category: "Kompjuter, Laptop & Monitor",
    categorySlug: "kompjuter-laptop-monitor",
    subcategorySlugs: ["monitor-fhd"],
    brand: "Gigabyte",
    rating: 4.5,
    reviewCount: 23,
    badges: ["sale", "24h"],
    specs: {
      Madhësia: '25"',
      Rezolucioni: "1920x1080",
      "Refresh Rate": "240Hz",
      "Response Time": "1ms",
    },
    description:
      "Monitor i shkëlqyer për gaming me 240Hz refresh rate dhe 1ms response time.",
    inStock: true,
    installment: "3.32€ x 36 Muaj",
  },
  {
    id: "2",
    name: 'Apple MacBook Air 13" M3 8GB 256GB',
    slug: "macbook-air-m3",
    price: 999.0,
    oldPrice: 1099.0,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    category: "Kompjuter, Laptop & Monitor",
    categorySlug: "kompjuter-laptop-monitor",
    subcategorySlugs: ["macbook", "laptop-shkolle"],
    brand: "Apple",
    rating: 4.9,
    reviewCount: 156,
    badges: ["sale"],
    specs: {
      Procesori: "Apple M3",
      RAM: "8GB",
      Storage: "256GB SSD",
      Ekrani: '13.6" Liquid Retina',
    },
    description: "MacBook Air me çipin M3 për performancë të jashtëzakonshme.",
    inStock: true,
    installment: "27.75€ x 36 Muaj",
  },
  {
    id: "3",
    name: "Samsung Galaxy S24 Ultra 256GB",
    slug: "samsung-galaxy-s24-ultra",
    price: 1199.0,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    category: "Celular, Tablet & Navigim",
    categorySlug: "celular-tablet-navigim",
    subcategorySlugs: ["android", "smartphone"],
    brand: "Samsung",
    rating: 4.8,
    reviewCount: 89,
    badges: ["new"],
    specs: {
      Ekrani: '6.8" QHD+',
      RAM: "12GB",
      Storage: "256GB",
      Kamera: "200MP",
    },
    description: "Telefoni më i avancuar i Samsung me Galaxy AI.",
    inStock: true,
  },
  {
    id: "4",
    name: "Sony PlayStation 5 Slim Digital Edition",
    slug: "ps5-slim-digital",
    price: 449.0,
    oldPrice: 499.0,
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    category: "Gaming",
    categorySlug: "gaming",
    subcategorySlugs: ["ps", "console"],
    brand: "Sony",
    rating: 4.7,
    reviewCount: 234,
    badges: ["sale"],
    specs: { Storage: "1TB SSD", Rezolucioni: "4K", FPS: "Deri 120fps" },
    description:
      "PlayStation 5 Slim Digital Edition - eksperienca e re e gaming.",
    inStock: true,
    installment: "12.47€ x 36 Muaj",
  },
  {
    id: "5",
    name: 'LG OLED55C4 55" 4K Smart TV',
    slug: "lg-oled55c4",
    price: 899.0,
    oldPrice: 1099.0,
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    category: "TV, Audio & Foto",
    categorySlug: "tv-audio-foto",
    subcategorySlugs: ["tv-oled", "tv-4k"],
    brand: "LG",
    rating: 4.8,
    reviewCount: 67,
    badges: ["sale"],
    specs: {
      Madhësia: '55"',
      Rezolucioni: "4K OLED",
      "Smart TV": "webOS",
      HDR: "Dolby Vision",
    },
    description: "TV OLED me cilësi të jashtëzakonshme të imazhit.",
    inStock: true,
    installment: "24.97€ x 36 Muaj",
  },
  {
    id: "6",
    name: "Logitech G Pro X Superlight 2",
    slug: "logitech-g-pro-x-superlight-2",
    price: 149.0,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
    category: "Aksesorë",
    categorySlug: "aksesore",
    subcategorySlugs: ["maus", "periferike"],
    brand: "Logitech",
    rating: 4.9,
    reviewCount: 312,
    badges: ["new"],
    specs: {
      Sensori: "HERO 2",
      Pesha: "60g",
      Bateria: "95 orë",
      Lidhja: "Wireless",
    },
    description: "Mausi më i lehtë wireless për gaming profesional.",
    inStock: true,
  },
  {
    id: "7",
    name: "NVIDIA GeForce RTX 4070 Super",
    slug: "rtx-4070-super",
    price: 599.0,
    oldPrice: 649.0,
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
    category: "Pjesë për kompjuter",
    categorySlug: "pjese-per-kompjuter",
    subcategorySlugs: ["gpu"],
    brand: "NVIDIA",
    rating: 4.7,
    reviewCount: 45,
    badges: ["sale", "24h"],
    specs: { VRAM: "12GB GDDR6X", "Boost Clock": "2475 MHz", TDP: "220W" },
    description: "Kartë grafike e fuqishme për gaming 1440p.",
    inStock: true,
    installment: "16.64€ x 36 Muaj",
  },
  {
    id: "8",
    name: "Apple iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max",
    price: 1299.0,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    category: "Celular, Tablet & Navigim",
    categorySlug: "celular-tablet-navigim",
    subcategorySlugs: ["iphone", "smartphone"],
    brand: "Apple",
    rating: 4.9,
    reviewCount: 178,
    badges: [],
    specs: {
      Çipi: "A17 Pro",
      Ekrani: '6.7" Super Retina XDR',
      Kamera: "48MP",
      Storage: "256GB",
    },
    description: "iPhone 15 Pro Max - telefoni më i avancuar i Apple.",
    inStock: true,
    installment: "36.08€ x 36 Muaj",
  },
  {
    id: "9",
    name: "SteelSeries Arctis Nova Pro Wireless",
    slug: "steelseries-arctis-nova-pro",
    price: 349.0,
    oldPrice: 379.0,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop",
    category: "Aksesorë",
    categorySlug: "aksesore",
    subcategorySlugs: ["kufje-wireless", "kufje-gaming"],
    brand: "SteelSeries",
    rating: 4.6,
    reviewCount: 98,
    badges: ["sale"],
    specs: {
      Drajveri: "40mm",
      ANC: "Po",
      Bateria: "44 orë",
      Lidhja: "Wireless/Bluetooth",
    },
    description: "Kufje premium wireless me ANC për gaming.",
    inStock: true,
  },
  {
    id: "10",
    name: 'MSI MAG274QRF-QD 27" 1440p 165Hz',
    slug: "msi-mag274qrf-qd",
    price: 299.0,
    oldPrice: 349.0,
    image:
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=400&fit=crop",
    category: "Kompjuter, Laptop & Monitor",
    categorySlug: "kompjuter-laptop-monitor",
    subcategorySlugs: ["monitor-qhd"],
    brand: "MSI",
    rating: 4.7,
    reviewCount: 56,
    badges: ["sale", "24h"],
    specs: {
      Madhësia: '27"',
      Rezolucioni: "2560x1440",
      "Refresh Rate": "165Hz",
      Panel: "Rapid IPS",
    },
    description: "Monitor 1440p me ngjyra të shkëlqyera.",
    inStock: true,
    installment: "8.31€ x 36 Muaj",
  },
  {
    id: "11",
    name: 'Lenovo Legion 5 Pro 16" RTX 4060',
    slug: "lenovo-legion-5-pro",
    price: 1199.0,
    oldPrice: 1399.0,
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop",
    category: "Kompjuter, Laptop & Monitor",
    categorySlug: "kompjuter-laptop-monitor",
    subcategorySlugs: ["laptop-gaming"],
    brand: "Lenovo",
    rating: 4.6,
    reviewCount: 34,
    badges: ["sale"],
    specs: {
      CPU: "AMD Ryzen 7 7745HX",
      GPU: "RTX 4060",
      RAM: "16GB",
      Storage: "512GB SSD",
    },
    description: "Laptop gaming me performancë të lartë.",
    inStock: true,
    installment: "33.31€ x 36 Muaj",
  },
  {
    id: "12",
    name: "Razer BlackWidow V4 Pro Mechanical",
    slug: "razer-blackwidow-v4-pro",
    price: 229.0,
    image:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
    category: "Aksesorë",
    categorySlug: "aksesore",
    subcategorySlugs: ["tastiere", "periferike"],
    brand: "Razer",
    rating: 4.5,
    reviewCount: 72,
    badges: ["new"],
    specs: {
      Switches: "Razer Green",
      Layout: "Full-Size",
      RGB: "Chroma",
      Lidhja: "USB-C",
    },
    description: "Tastierë mekanike premium për gaming.",
    inStock: true,
  },
];

export const brands = [
  "Apple",
  "Samsung",
  "Gigabyte",
  "Sony",
  "LG",
  "Logitech",
  "NVIDIA",
  "SteelSeries",
  "MSI",
  "Lenovo",
  "Razer",
];
