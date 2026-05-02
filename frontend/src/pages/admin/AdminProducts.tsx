import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { toUiProduct, type BackendProduct } from "@/stores/productStore";
import { AddProductDialog } from "@/components/admin/AddProductDialog";
import { EditProductDialog } from "@/components/admin/EditProductDialog";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<BackendProduct | null>(null);

  const fetchAllProducts = useAdminStore((s) => s.fetchAllProducts);
  const isLoading = useAdminStore((s) => s.isLoading);
  const error = useAdminStore((s) => s.error);
  const recentProducts = useAdminStore((s) => s.recentProducts);

  const rows = useMemo(
    () => recentProducts.map((p) => toUiProduct(p)),
    [recentProducts],
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  useEffect(() => {
    void fetchAllProducts();
  }, [fetchAllProducts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kërko produktin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Shto produkt
        </button>
      </div>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />

      {editing ? (
        <EditProductDialog
          open={editOpen}
          onOpenChange={(next) => {
            if (!next) {
              setEditOpen(false);
              setEditing(null);
            }
          }}
          product={editing}
        />
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="bg-white rounded-lg border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Produkti
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Kategoria
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Çmimi
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Stoku
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Outlet
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Veprimet
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  {rows.length === 0
                    ? "Nuk ka produkte në databazë."
                    : "Nuk u gjet asnjë produkt për këtë kërkim."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm">{p.category}</td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {p.price.toFixed(2)}€
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {p.inStock ? "Në stok" : "Jashtë stokut"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {(() => {
                      const product = recentProducts.find((x) => x.id === p.id);
                      if (product?.isOutlet) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              Outlet
                            </span>
                            {product.outletDiscount && (
                              <span className="text-xs text-muted-foreground">
                                -{product.outletDiscount}€
                              </span>
                            )}
                          </div>
                        );
                      }
                      return (
                        <span className="text-xs text-muted-foreground">-</span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Ndrysho"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary"
                        onClick={() => {
                          const bp = recentProducts.find((x) => x.id === p.id);
                          if (bp) {
                            setEditing(bp);
                            setEditOpen(true);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
