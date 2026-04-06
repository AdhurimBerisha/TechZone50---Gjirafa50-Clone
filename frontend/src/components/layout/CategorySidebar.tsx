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
} from "lucide-react";
import { categories } from "@/data/products";

const iconMap: Record<string, React.ElementType> = {
  monitor: Monitor,
  smartphone: Smartphone,
  tv: Tv,
  "gamepad-2": Gamepad2,
  wifi: Wifi,
  headphones: Headphones,
  cpu: Cpu,
};

const CategorySidebar = () => {
  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0">
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Monitor;
          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-foreground">{cat.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default CategorySidebar;
