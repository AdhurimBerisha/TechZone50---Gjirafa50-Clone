import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, Gift, MessageCircle, Apple } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CategorySidebar from "./CategorySidebar";

const linkBase =
  "flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm text-foreground hover:text-primary transition-colors whitespace-nowrap shrink-0";

const CategoryNav = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setCategoriesOpen(false);
  }, [pathname]);

  return (
    <nav className="w-full bg-white border-b border-border">
      <div className="max-w-[1320px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-stretch min-h-[44px] sm:min-h-0">
          <div className="flex flex-1 items-center min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className={`${linkBase} font-medium lg:hidden`}
              aria-expanded={categoriesOpen}
              aria-haspopup="dialog"
            >
              <Menu className="h-4 w-4 shrink-0" aria-hidden />
              Kategoritë
            </button>
            <Link
              to="/"
              className={`${linkBase} font-medium hidden lg:flex`}
            >
              <Menu className="h-4 w-4 shrink-0" aria-hidden />
              Kategoritë
            </Link>
            <Link to="/outlet" className={linkBase}>
              Outlet
            </Link>
            <Link to="/category/new" className={linkBase}>
              <span className="md:hidden">Të reja</span>
              <span className="hidden md:inline">Çfarë ka të re?</span>
            </Link>
            <Link to="/gift-card" className={linkBase}>
              <Gift className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Gift card</span>
            </Link>
            <div
              className={`${linkBase} text-muted-foreground hidden lg:flex`}
              aria-label="Authorized Apple Reseller"
            >
              <Apple className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-xs leading-tight">
                Authorized
                <br />
                Reseller
              </span>
            </div>
          </div>
          <Link
            to="#"
            className={`${linkBase} shrink-0 border-l border-border pl-2 sm:pl-3 ml-1 sm:ml-0`}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Chat</span>
          </Link>
        </div>
      </div>

      <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <SheetContent
          side="left"
          className="w-[min(100vw-2rem,320px)] sm:max-w-sm p-0 gap-0 overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Kategoritë</SheetTitle>
          </SheetHeader>
          <div className="p-3 pt-12">
            <CategorySidebar />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default CategoryNav;
