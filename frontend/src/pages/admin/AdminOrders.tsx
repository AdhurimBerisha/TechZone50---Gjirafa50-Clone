import { useAdminStore } from "@/stores/adminStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  CANCELED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  DELIVERED: "Përfunduar",
  PROCESSING: "Në proces",
  SHIPPED: "Dërguar",
  PENDING: "Në pritje",
  CONFIRMED: "Konfirmuar",
  CANCELED: "Anuluar",
};

const AdminOrders = () => {
  const fetchAllOrders = useAdminStore((s) => s.fetchOrders);
  const isLoading = useAdminStore((s) => s.isLoading);
  const error = useAdminStore((s) => s.error);
  const recentOrders = useAdminStore((s) => s.recentOrders);

  useEffect(() => {
    void fetchAllOrders();
  }, [fetchAllOrders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                ID
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Klienti
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Email
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Artikuj
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Totali
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Statusi
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                Data
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  Nuk ka porosi për momentin.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3 text-sm font-medium">{order.id}</td>
                  <td className="px-5 py-3 text-sm">
                    {order.user?.name || "Pa emër"}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.user?.email || "-"}
                  </td>
                  <td className="px-5 py-3 text-sm">{order.items?.length ?? 0}</td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {order.total.toFixed(2)}€
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("sq-AL")}
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

export default AdminOrders;
