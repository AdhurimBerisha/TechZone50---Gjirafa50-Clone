import { Users as UsersIcon } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Arben Krasniqi",
    email: "arben@email.com",
    orders: 5,
    joined: "01.01.2026",
  },
  {
    id: 2,
    name: "Drita Berisha",
    email: "drita@email.com",
    orders: 3,
    joined: "15.02.2026",
  },
  {
    id: 3,
    name: "Faton Gashi",
    email: "faton@email.com",
    orders: 8,
    joined: "20.11.2025",
  },
  {
    id: 4,
    name: "Liridona Hoxha",
    email: "liridona@email.com",
    orders: 2,
    joined: "10.03.2026",
  },
  {
    id: 5,
    name: "Besnik Mustafa",
    email: "besnik@email.com",
    orders: 1,
    joined: "01.04.2026",
  },
  {
    id: 6,
    name: "Vlora Shala",
    email: "vlora@email.com",
    orders: 12,
    joined: "05.06.2025",
  },
];

const AdminUsers = () => {
  return (
    <div className="bg-white rounded-lg border border-border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
              Përdoruesi
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
              Email
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
              Porosi
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
              I regjistruar
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UsersIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-sm text-muted-foreground">
                {user.email}
              </td>
              <td className="px-5 py-3 text-sm">{user.orders}</td>
              <td className="px-5 py-3 text-sm text-muted-foreground">
                {user.joined}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
