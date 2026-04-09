import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react";
import { products } from "@/data/products";

const stats = [
  {
    label: "Totali i produkteve",
    value: "12",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    label: "Porosi sot",
    value: "24",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  { label: "Përdorues", value: "1,234", icon: Users, color: "bg-purple-500" },
  {
    label: "Të ardhurat",
    value: "45,678€",
    icon: DollarSign,
    color: "bg-primary",
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Arben Krasniqi",
    total: "249.00€",
    status: "Përfunduar",
    date: "05.04.2026",
  },
  {
    id: "ORD-002",
    customer: "Drita Berisha",
    total: "1,199.00€",
    status: "Në proces",
    date: "05.04.2026",
  },
  {
    id: "ORD-003",
    customer: "Faton Gashi",
    total: "449.00€",
    status: "Dërguar",
    date: "04.04.2026",
  },
  {
    id: "ORD-004",
    customer: "Liridona Hoxha",
    total: "89.00€",
    status: "Përfunduar",
    date: "04.04.2026",
  },
  {
    id: "ORD-005",
    customer: "Besnik Mustafa",
    total: "599.00€",
    status: "Në pritje",
    date: "03.04.2026",
  },
];

const statusColors: Record<string, string> = {
  Përfunduar: "bg-green-100 text-green-700",
  "Në proces": "bg-blue-100 text-blue-700",
  Dërguar: "bg-purple-100 text-purple-700",
  "Në pritje": "bg-yellow-100 text-yellow-700",
};

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
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
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3 text-sm font-medium">{order.id}</td>
                  <td className="px-5 py-3 text-sm">{order.customer}</td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {order.total}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || ""}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.date}
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
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-12 object-contain rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {p.price.toFixed(2)}€
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
