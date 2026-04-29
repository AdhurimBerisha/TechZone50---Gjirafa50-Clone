import { useEffect, useState } from "react";
import { Loader2, Plus, Search, Gift, Copy, Check, X } from "lucide-react";
import { api } from "@/lib/api";

interface GiftCard {
  id: string;
  code: string;
  displayCode: string;
  initialAmount: number;
  currentBalance: number;
  currency: string;
  status: "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED" | "TRANSFERRED";
  expiresAt: string | null;
  activatedAt: string | null;
  usedAt: string | null;
  purchaserEmail: string | null;
  purchaserName: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  createdAt: string;
}

interface CreateGiftCardPayload {
  initialAmount: number;
  recipientEmail?: string;
  recipientName?: string;
  recipientPhone?: string;
  message?: string;
  expiresAt?: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  USED: "bg-gray-100 text-gray-700",
  EXPIRED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  TRANSFERRED: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktiv",
  USED: "Përdorur",
  EXPIRED: "Skaduar",
  CANCELLED: "Anuluar",
  TRANSFERRED: "Transferuar",
};

const AdminGiftCards = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateGiftCardPayload>({
    initialAmount: 50,
    recipientEmail: "",
    recipientName: "",
    recipientPhone: "",
    message: "",
    expiresAt: "",
  });

  const fetchGiftCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: true; giftCards: GiftCard[] }>(
        "/api/admin/gift-cards",
      );
      if ("success" in res.data && res.data.success === true) {
        setGiftCards(res.data.giftCards);
      } else {
        setError("Failed to fetch gift cards");
      }
    } catch (err) {
      console.error("Error fetching gift cards:", err);
      setError("Failed to load gift cards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchGiftCards();
  }, []);

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post<{ success: true; giftCard: GiftCard }>(
        "/api/admin/gift-cards",
        formData,
      );
      if ("success" in res.data && res.data.success === true) {
        setGiftCards((prev) => [res.data.giftCard, ...prev]);
        setShowCreateModal(false);
        setFormData({
          initialAmount: 50,
          recipientEmail: "",
          recipientName: "",
          recipientPhone: "",
          message: "",
          expiresAt: "",
        });
      } else {
        setError("Failed to create gift card");
      }
    } catch (err) {
      console.error("Error creating gift card:", err);
      setError("Failed to create gift card");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCards = giftCards.filter(
    (card) =>
      card.displayCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.recipientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.purchaserEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalValue = giftCards.reduce(
    (sum, card) => sum + card.currentBalance,
    0,
  );
  const activeCards = giftCards.filter((c) => c.status === "ACTIVE").length;

  if (isLoading && giftCards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gift className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gift Cards Total</p>
              <p className="text-2xl font-bold">{giftCards.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Cards</p>
              <p className="text-2xl font-bold">{activeCards}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{totalValue.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kërkoni gift cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Krijo Gift Card
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Kodi
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Balanca
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Statusi
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Marrimtari
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Blersit
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Data
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Nuk ka gift cards.
                </td>
              </tr>
            ) : (
              filteredCards.map((card) => (
                <tr
                  key={card.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {card.displayCode}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(card.displayCode, card.id)
                        }
                        className="p-1 hover:bg-muted rounded"
                        title="Kopjo kodin"
                      >
                        {copiedId === card.id ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {card.currentBalance.toFixed(2)}€ /{" "}
                    {card.initialAmount.toFixed(2)}€
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        statusColors[card.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[card.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {card.recipientName || card.recipientEmail || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {card.purchaserEmail || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(card.createdAt).toLocaleDateString("sq-AL")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Krijo Gift Card të Ri</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGiftCard} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shuma (€)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.initialAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email i Marrimtarit (opsional)
                </label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Emri i Marrimtarit (opsional)
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Emri i plotë"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mesazhi (opsional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="Urime për..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data e Skadimit (opsional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Krijo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGiftCards;
