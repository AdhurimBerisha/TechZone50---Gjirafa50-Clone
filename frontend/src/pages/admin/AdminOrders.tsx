import { useAdminStore } from "@/stores/adminStore";
import { useEffect, useState } from "react";
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
  CANCELLED: "Anuluar",
};

const ALL_STATUSES = Object.keys(statusLabels);

const AdminOrders = () => {
  const fetchAllOrders = useAdminStore((s) => s.fetchOrders);
  const isLoading = useAdminStore((s) => s.isLoading);
  const error = useAdminStore((s) => s.error);
  const recentOrders = useAdminStore((s) => s.recentOrders);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);

  // Track per-row loading and error state so the whole page doesn't freeze
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<{
    id: string;
    msg: string;
  } | null>(null);

  useEffect(() => {
    void fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setUpdateError(null);
    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.ok) {
      setUpdateError({ id: orderId, msg: result.error });
    }
    setUpdatingId(null);
  };

  if (isLoading && recentOrders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
                <>
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-5 py-3 text-sm font-mono font-medium text-muted-foreground">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {order.user?.name || "Pa emër"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {order.user?.email || "-"}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">
                      {order.total.toFixed(2)}€
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            void handleStatusChange(order.id, e.target.value)
                          }
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                            statusColors[order.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                        {updatingId === order.id && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("sq-AL")}
                    </td>
                  </tr>
                  {updateError?.id === order.id && (
                    <tr key={`${order.id}-error`}>
                      <td
                        colSpan={7}
                        className="px-5 pb-2 text-xs text-destructive"
                      >
                        {updateError.msg}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
