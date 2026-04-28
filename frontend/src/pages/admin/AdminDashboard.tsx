import { useEffect, useMemo } from "react";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";

function formatCount(n: number) {
  return n.toLocaleString("sq-AL");
}

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  DELIVERED: "Përfunduar",
  PROCESSING: "Në proces",
  SHIPPED: "Dërguar",
  PENDING: "Në pritje",
  CONFIRMED: "Konfirmuar",
  CANCELLED: "Anuluar",
  REFUNDED: "Rimbursuar",
};

const AdminDashboard = () => {
  const fetchDashboardStats = useAdminStore((s) => s.fetchDashboardStats);
  const fetchOrders = useAdminStore((s) => s.fetchOrders);
  const fetchTopSellingProducts = useAdminStore(
    (s) => s.fetchTopSellingProducts,
  );
  const totalProducts = useAdminStore((s) => s.totalProducts);
  const totalUsers = useAdminStore((s) => s.totalUsers);
  const totalOrders = useAdminStore((s) => s.totalOrders);
  const totalRevenue = useAdminStore((s) => s.totalRevenue);
  const recentOrders = useAdminStore((s) => s.recentOrders);
  const topProducts = useAdminStore((s) => s.topProducts);
  const statsLoading = useAdminStore((s) => s.isLoading);
  const statsError = useAdminStore((s) => s.error);
  const fetchTotalRevenue = useAdminStore((s) => s.fetchTotalRevenue);

  useEffect(() => {
    void fetchDashboardStats();
    void fetchOrders();
    void fetchTopSellingProducts();
    void fetchTotalRevenue();
  }, [
    fetchDashboardStats,
    fetchOrders,
    fetchTopSellingProducts,
    fetchTotalRevenue,
  ]);

  const stats = useMemo(
    () => [
      {
        label: "Totali i produkteve",
        value: statsLoading ? "…" : formatCount(totalProducts),
        icon: Package,
        color: "bg-orange-600",
      },
      {
        label: "Porosi sot",
        value: statsLoading ? "…" : formatCount(totalOrders),
        icon: ShoppingCart,
        color: "bg-green-500",
      },
      {
        label: "Përdorues",
        value: statsLoading ? "…" : formatCount(totalUsers),
        icon: Users,
        color: "bg-purple-500",
      },
      {
        label: "Të ardhurat",
        value: statsLoading ? "…" : formatCount(totalRevenue),
        icon: DollarSign,
        color: "bg-primary",
      },
    ],
    [statsLoading, totalProducts, totalOrders, totalUsers, totalRevenue],
  );

  return (
    <div className="space-y-6">
      {statsError ? (
        <p className="text-sm text-destructive" role="alert">
          {statsError}
        </p>
      ) : null}
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-border p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Porositë e fundit</h2>
          <a
            href="/admin/orders"
            className="text-sm text-primary hover:underline"
          >
            Shiko të gjitha
          </a>
        </div>
        <div className="overflow-x-auto">
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
              {recentOrders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3 text-sm font-medium">{order.id}</td>
                  <td className="px-5 py-3 text-sm">
                    {order.user?.name || "Pa emër"}
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Produktet me të shitura</h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <img
                  src={
                    p.image || "https://via.placeholder.com/48?text=No+Image"
                  }
                  alt={p.name}
                  className="w-12 h-12 object-contain rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} - {formatCount(p.unitsSold)} shitje
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {p.revenue.toFixed(2)}€
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
