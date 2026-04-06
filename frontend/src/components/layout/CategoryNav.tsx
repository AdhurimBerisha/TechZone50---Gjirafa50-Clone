import { Link } from "react-router";
import { Menu, Gift, MessageCircle, Apple } from "lucide-react";

const CategoryNav = () => {
  return (
    <nav className="w-full bg-white border-b border-border">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="flex items-center gap-2 py-3 px-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <Menu className="h-4 w-4" />
            Kategoritë
          </Link>
          <Link
            to="/outlet"
            className="py-3 px-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            Outlet
          </Link>
          <Link
            to="/category/new"
            className="py-3 px-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            Çfarë ka të re?
          </Link>
          <Link
            to="/gift-card"
            className="flex items-center gap-1 py-3 px-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Gift className="h-4 w-4" />
            Gift card
          </Link>
          <div className="flex items-center gap-1 py-3 px-3 text-sm text-muted-foreground">
            <Apple className="h-4 w-4" />
            <span className="text-xs leading-tight">
              Authorized
              <br />
              Reseller
            </span>
          </div>
        </div>
        <Link
          to="#"
          className="flex items-center gap-2 py-3 px-3 text-sm text-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </Link>
      </div>
    </nav>
  );
};

export default CategoryNav;
