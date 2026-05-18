import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Monitor,
  Smartphone,
  Tv,
  Gamepad2,
  Wifi,
  Headphones,
  Cpu,
  ChevronRight,
  Menu,
} from "lucide-react";
import type { Category, MegaMenu } from "@/data/products";
import { normalizeSubcategoryList } from "@/lib/categoryShape";
import { useCategoryStore } from "@/stores/categoryStore";

const ACCENT = "text-[#e64a19]";
const ACCENT_HOVER = "hover:text-[#e64a19]";

const iconMap: Record<string, React.ElementType> = {
  monitor: Monitor,
  smartphone: Smartphone,
  tv: Tv,
  "gamepad-2": Gamepad2,
  wifi: Wifi,
  headphones: Headphones,
  cpu: Cpu,
};

const CLOSE_MS = 180;

function megaMenuForCategory(cat: Category): MegaMenu {
  return (
    cat.megaMenu ?? {
      columns: [
        {
          title: "Nën kategori",
          links: normalizeSubcategoryList(cat.subcategories),
          showMore: true,
        },
      ],
    }
  );
}

const CategorySidebar = () => {
  const categories = useCategoryStore((s) => s.categories);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenSlug(null);
      closeTimer.current = null;
    }, CLOSE_MS);
  }, [cancelClose]);

  const openCategory = useCallback(
    (slug: string) => {
      cancelClose();
      setOpenSlug(slug);
    },
    [cancelClose],
  );

  useEffect(() => () => cancelClose(), [cancelClose]);

  const activeCategory = openSlug
    ? categories.find((c) => c.slug === openSlug)
    : null;
  const mega = activeCategory ? megaMenuForCategory(activeCategory) : null;
  const colCount = mega?.columns.length ?? 0;

  return (
    <aside className="relative z-30 w-full shrink-0 lg:w-[280px]">
      <div className="overflow-visible rounded-lg border border-border bg-white">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Menu className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-semibold text-foreground">
            Kategoritë
          </span>
        </div>
        <ul className="m-0 list-none p-0">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Monitor;
            const isOpen = openSlug === cat.slug;
            return (
              <li
                key={cat.slug}
                className="border-b border-border last:border-b-0"
                onMouseEnter={() => openCategory(cat.slug)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    isOpen
                      ? `bg-orange-50/80 ${ACCENT}`
                      : `text-foreground ${ACCENT_HOVER} hover:bg-accent`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isOpen ? ACCENT : "text-muted-foreground"
                      }`}
                    />
                    <span className={isOpen ? ACCENT : ""}>{cat.name}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      isOpen ? ACCENT : "text-muted-foreground"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {activeCategory && mega && colCount > 0 && (
        <div
          className="absolute left-full top-0 z-50 hidden pl-3 lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          role="navigation"
          aria-label={`Nën kategori për ${activeCategory.name}`}
        >
          {/*
            Explicit width + horizontal flex (not shrink-wrapped flex/grid):
            abspos + display:flex on the outer wrapper was collapsing track widths
            to ~0, which stacked all columns on top of each other.
          */}
          <div className="w-max max-h-[min(90vh,640px)] max-w-[calc(100vw-1rem)] overflow-x-auto overflow-y-auto rounded-xl border border-border bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex w-max flex-row flex-nowrap items-start gap-8 px-6 py-5">
              {mega.columns.map((col, colIndex) => (
                <div
                  key={`${activeCategory.slug}-${col.title}-${colIndex}`}
                  className="w-40 shrink-0 sm:w-44"
                >
                  <p className="mb-3 text-sm font-bold text-foreground">
                    {col.title}
                  </p>
                  <ul className="m-0 list-none space-y-2 p-0">
                    {col.links.map((link) => (
                      <li key={`${col.title}-${link.slug}`}>
                        <Link
                          to={`/category/${activeCategory.slug}?sub=${encodeURIComponent(link.slug)}`}
                          className={`block text-sm leading-snug text-muted-foreground transition-colors ${ACCENT_HOVER}`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {col.showMore && (
                    <Link
                      to={`/category/${activeCategory.slug}`}
                      className={`mt-4 inline-flex items-center gap-0.5 text-sm font-medium ${ACCENT} ${ACCENT_HOVER}`}
                    >
                      Shiko më shumë
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))}
              {mega.promoImage && (
                <Link
                  to={`/category/${activeCategory.slug}`}
                  className="relative block h-64 w-52 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={mega.promoImage}
                    alt=""
                    width={208}
                    height={256}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default CategorySidebar;
