import { useCallback, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { Gift, Loader2, RefreshCw } from "lucide-react";
import { useGiftCardStore } from "@/stores/giftCardStore";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProfileGiftCards() {
  const { getToken } = useAuth();
  const { currentUser } = useAuthStore();
  const { giftCards, isLoading, error, fetchGiftCards } = useGiftCardStore();

  const loadGiftCards = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    await fetchGiftCards();
  }, [fetchGiftCards, getToken]);

  useEffect(() => {
    void loadGiftCards();
  }, [loadGiftCards]);

  const purchasedCards = giftCards.filter(
    (card) => card.purchaserId === currentUser?.id,
  );

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-lg">Gift Cards</h2>
          <p className="text-sm text-muted-foreground">
            Kartat që keni blerë dhe kodi për përdorim.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isLoading}
          onClick={() => void loadGiftCards()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Rifresko
        </Button>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {isLoading && purchasedCards.length === 0 ? (
        <div className="bg-muted rounded-lg p-10 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
          <p className="text-sm">Duke ngarkuar gift cards...</p>
        </div>
      ) : purchasedCards.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm">Nuk keni gift cards të blera ende.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchasedCards.map((card) => (
            <div key={card.id} className="border border-border rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Kodi i gift card
                  </p>
                  <p className="font-mono text-lg font-semibold">
                    {card.displayCode}
                  </p>
                </div>
                <Badge variant="secondary">{card.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Vlera</p>
                  <p>
                    {card.currentBalance} {card.currency}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Data</p>
                  <p>
                    {new Date(card.updatedAt).toLocaleDateString("sq-XK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Kodi i brendshëm
                  </p>
                  <p className="break-all">{card.code}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
