import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useProductStore } from "@/stores/productStore";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { searchResults, isSearching, fetchSearchResults, clearSearchResults } =
    useProductStore();

  useEffect(() => {
    fetchSearchResults(query);
    return () => clearSearchResults();
  }, [query]);

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">
          Rezultatet për "<span className="text-primary">{query}</span>"
        </h1>
        <span className="text-sm text-muted-foreground">
          ({searchResults.length} produkte)
        </span>
      </div>

      {isSearching ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Nuk u gjetën produkte për "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
