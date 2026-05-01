import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "@clerk/react";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";
import { useGiftCardStore } from "@/stores/giftCardStore";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const purchaseOptions = [
  { value: 10, color: "from-blue-500 to-blue-600" },
  { value: 25, color: "from-green-500 to-green-600" },
  { value: 50, color: "from-primary to-orange-600" },
  { value: 100, color: "from-purple-500 to-purple-600" },
];

const GiftCardPage = () => {
  const { giftCards, isLoading, error, fetchGiftCards } = useGiftCardStore();
  const { createGiftCardStripeSession, completeGiftCardStripeCheckout } =
    useOrderStore();
  const { currentUser } = useAuthStore();
  const { getToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [purchasedGiftCard, setPurchasedGiftCard] = useState<{
    displayCode: string;
    code: string;
    initialAmount: number;
    currentBalance: number;
    currency: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  useEffect(() => {
    const stripeStatus = searchParams.get("stripe");
    const sessionId = searchParams.get("session_id");
    const giftCardId = searchParams.get("giftCardId");

    if (stripeStatus === "cancel") {
      setPurchaseError("Pagesa online u anulua. Provoni përsëri.");
      setSearchParams({});
      return;
    }

    if (stripeStatus !== "success" || !sessionId || !giftCardId) {
      return;
    }

    void (async () => {
      setIsPurchasing(true);
      setPurchaseError(null);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Ju duhet të identifikoheni për të blerë gift card.");
        }
        const result = await completeGiftCardStripeCheckout(token, sessionId);
        setPurchasedGiftCard(result.giftCard ?? null);
        setGiftModalOpen(true);
        await fetchGiftCards();
      } catch (err) {
        setPurchaseError(
          err instanceof Error ? err.message : "Dështoi blerja e gift card.",
        );
      } finally {
        setIsPurchasing(false);
        setSearchParams({});
      }
    })();
  }, [
    searchParams,
    completeGiftCardStripeCheckout,
    fetchGiftCards,
    getToken,
    setSearchParams,
  ]);

  const userGiftCards = giftCards.filter(
    (card) => card.purchaserId === currentUser?.id,
  );

  const availableDenominations = Array.from(
    new Map(
      giftCards
        .filter((card) => !card.purchaserId && card.status === "ACTIVE")
        .map((card) => [card.initialAmount, card]),
    ).values(),
  );

  const isAdmin = currentUser?.role === "ADMIN";
  const displayGiftCards = isAdmin ? giftCards : userGiftCards;

  const handlePurchase = async (giftCardId: string) => {
    setPurchaseError(null);
    setIsPurchasing(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Ju duhet të identifikoheni për të blerë gift card.");
      }

      const { checkoutUrl } = await createGiftCardStripeSession(
        token,
        giftCardId,
      );
      if (!checkoutUrl) {
        throw new Error("Nuk mund të krijohet sesioni i pagesës.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setPurchaseError(
        err instanceof Error ? err.message : "Dështoi blerja e gift card.",
      );
      setIsPurchasing(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <div className="text-center mb-8">
        <Gift className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold mb-2">Gift Card</h1>
        <p className="text-muted-foreground">
          Dhuro teknologjinë më të re me një gift card të TechStore50
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Duke ngarkuar...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {purchaseError && (
        <div className="text-center py-4">
          <p className="text-sm text-destructive">{purchaseError}</p>
        </div>
      )}

      {!isLoading && !error && displayGiftCards.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            {isAdmin ? "Të Gjitha Gift Cards" : "Gift Cardsat e Mia"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayGiftCards.map((card) => (
              <div
                key={card.id}
                className="bg-gradient-to-br from-primary to-orange-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium opacity-80">
                    TechStore50
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      card.status === "ACTIVE"
                        ? "bg-green-500"
                        : card.status === "USED"
                          ? "bg-gray-500"
                          : "bg-red-500"
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
                <p className="text-3xl font-bold">{card.currentBalance}€</p>
                <p className="text-sm opacity-80 mt-1">{card.displayCode}</p>
                {card.message && (
                  <p className="text-sm mt-2 opacity-90">{card.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdmin &&
        !isLoading &&
        !error &&
        availableDenominations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Gift Cards të Gatshme për Bli
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableDenominations.map((card) => (
                <div
                  key={card.id}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium opacity-80">
                      TechStore50
                    </span>
                    <Gift className="h-5 w-5 opacity-60" />
                  </div>
                  <p className="text-3xl font-bold">{card.initialAmount}€</p>
                  <button
                    type="button"
                    onClick={() => void handlePurchase(card.id)}
                    disabled={isPurchasing}
                    className="w-full mt-4 bg-white text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPurchasing ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Duke blerë...
                      </span>
                    ) : (
                      "Blej Tani"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {!isAdmin &&
        !isLoading &&
        !error &&
        availableDenominations.length === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">
              Bli një Gift Card
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {purchaseOptions.map((card) => (
                <div key={card.value} className="group cursor-pointer">
                  <div
                    className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white aspect-[4/3] flex flex-col justify-between group-hover:scale-105 transition-transform`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium opacity-80">
                        TechStore50
                      </span>
                      <Gift className="h-5 w-5 opacity-60" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{card.value}€</p>
                      <p className="text-sm opacity-80 mt-1">Gift Card</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    Blej {card.value}€ Gift Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      <Dialog open={giftModalOpen} onOpenChange={setGiftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gift Card e Juaj u krijua</DialogTitle>
            <DialogDescription>
              Ruani kodin e mëposhtëm për ta përdorur ose dhuruar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            {purchasedGiftCard ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Kodi i gift card
                </p>
                <p className="font-mono text-xl font-semibold tracking-[0.2em]">
                  {purchasedGiftCard.displayCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vlera: {purchasedGiftCard.initialAmount}{" "}
                  {purchasedGiftCard.currency}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Gift card u blerë me sukses.
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Mbyll</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftCardPage;
