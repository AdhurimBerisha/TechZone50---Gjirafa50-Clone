import { useCallback, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { Loader2, Package, RefreshCw } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusLabels: Record<string, string> = {
  PENDING: "Në pritje",
  CONFIRMED: "E konfirmuar",
  PROCESSING: "Në përpunim",
  SHIPPED: "E dërguar",
  DELIVERED: "E dorëzuar",
  CANCELLED: "E anuluar",
  REFUNDED: "E rimbursuar",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("sq-XK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatMoney(value: number) {
  return `${value.toFixed(2)}€`;
}

export function ProfileOrders() {
  const { getToken } = useAuth();
  const orders = useOrderStore((s) => s.orders);
  const isLoadingOrders = useOrderStore((s) => s.isLoadingOrders);
  const ordersError = useOrderStore((s) => s.ordersError);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    await fetchOrders(token);
  }, [getToken, fetchOrders]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoadingOrders && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-12 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">Duke ngarkuar porositë...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-semibold text-lg">Porositë</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isLoadingOrders}
          onClick={() => void load()}
        >
          {isLoadingOrders ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Rifresko
        </Button>
      </div>

      {ordersError && (
        <p className="text-sm text-destructive mb-4">{ordersError}</p>
      )}

      {!ordersError && orders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p>Nuk keni asnjë porosi ende.</p>
        </div>
      )}

      {orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Porosia</p>
                  <p className="font-mono text-sm font-medium">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {statusLabels[order.status] ?? order.status}
                </Badge>
                <p className="text-base font-semibold text-primary w-full sm:w-auto sm:ml-auto">
                  {formatMoney(order.total)}
                </p>
              </div>

              {order.items.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Artikujt
                  </p>
                  <ul className="space-y-2 text-sm">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap justify-between gap-2 text-muted-foreground"
                      >
                        <span>
                          Produkt ID:{" "}
                          <span className="font-mono text-foreground">
                            {item.productId.length > 14
                              ? `${item.productId.slice(0, 12)}…`
                              : item.productId}
                          </span>
                        </span>
                        <span>
                          {item.quantity} × {formatMoney(item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
