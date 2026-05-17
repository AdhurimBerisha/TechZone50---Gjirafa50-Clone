import { useEffect } from "react";
import { Users as UsersIcon } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useAdminStore } from "@/stores/adminStore";

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("sq-AL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const AdminUsers = () => {
  const { getToken } = useAuth();
  const recentUsers = useAdminStore((s) => s.recentUsers);
  const isLoading = useAdminStore((s) => s.isLoading);
  const error = useAdminStore((s) => s.error);
  const fetchAllUsers = useAdminStore((s) => s.fetchAllUsers);

  useEffect(() => {
    void (async () => {
      const token = await getToken();
      if (!token) return;
      void fetchAllUsers(token);
    })();
  }, [fetchAllUsers, getToken]);

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="bg-white rounded-lg border border-border overflow-x-auto -mx-px">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-medium text-muted-foreground uppercase">
                Përdoruesi
              </th>
              <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-medium text-muted-foreground uppercase">
                Email
              </th>
              <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-medium text-muted-foreground uppercase">
                Porosi
              </th>
              <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-medium text-muted-foreground uppercase">
                I regjistruar
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && recentUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  Duke ngarkuar përdoruesit…
                </td>
              </tr>
            ) : recentUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  Nuk u gjet asnjë përdorues.
                </td>
              </tr>
            ) : (
              recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UsersIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {user.name?.trim() || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td
                    className="px-3 sm:px-5 py-2.5 sm:py-3 text-sm text-muted-foreground"
                    title="Numri i porosive nuk ofrohet nga API ende"
                  >
                    —
                  </td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-sm text-muted-foreground">
                    {formatJoined(user.createdAt)}
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

export default AdminUsers;
