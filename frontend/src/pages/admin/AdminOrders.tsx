const orders = [
  {
    id: "ORD-001",
    customer: "Arben Krasniqi",
    email: "arben@email.com",
    total: "249.00€",
    items: 2,
    status: "Përfunduar",
    date: "05.04.2026",
  },
  {
    id: "ORD-002",
    customer: "Drita Berisha",
    email: "drita@email.com",
    total: "1,199.00€",
    items: 1,
    status: "Në proces",
    date: "05.04.2026",
  },
  {
    id: "ORD-003",
    customer: "Faton Gashi",
    email: "faton@email.com",
    total: "449.00€",
    items: 1,
    status: "Dërguar",
    date: "04.04.2026",
  },
  {
    id: "ORD-004",
    customer: "Liridona Hoxha",
    email: "liridona@email.com",
    total: "89.00€",
    items: 3,
    status: "Përfunduar",
    date: "04.04.2026",
  },
  {
    id: "ORD-005",
    customer: "Besnik Mustafa",
    email: "besnik@email.com",
    total: "599.00€",
    items: 1,
    status: "Në pritje",
    date: "03.04.2026",
  },
  {
    id: "ORD-006",
    customer: "Vlora Shala",
    email: "vlora@email.com",
    total: "1,299.00€",
    items: 1,
    status: "Dërguar",
    date: "03.04.2026",
  },
  {
    id: "ORD-007",
    customer: "Agim Rexhepi",
    email: "agim@email.com",
    total: "149.00€",
    items: 1,
    status: "Përfunduar",
    date: "02.04.2026",
  },
];

const statusColors: Record<string, string> = {
  Përfunduar: "bg-green-100 text-green-700",
  "Në proces": "bg-blue-100 text-blue-700",
  Dërguar: "bg-purple-100 text-purple-700",
  "Në pritje": "bg-yellow-100 text-yellow-700",
};

const AdminOrders = () => {
  return (
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
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30"
            >
              <td className="px-5 py-3 text-sm font-medium">{order.id}</td>
              <td className="px-5 py-3 text-sm">{order.customer}</td>
              <td className="px-5 py-3 text-sm text-muted-foreground">
                {order.email}
              </td>
              <td className="px-5 py-3 text-sm">{order.items}</td>
              <td className="px-5 py-3 text-sm font-medium">{order.total}</td>
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
  );
};

export default AdminOrders;
