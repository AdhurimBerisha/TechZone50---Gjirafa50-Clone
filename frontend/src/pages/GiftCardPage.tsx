import { useEffect } from "react";
import { Gift } from "lucide-react";
import { useGiftCardStore } from "@/stores/giftCardStore";
import { useAuthStore } from "@/stores/authStore";

const purchaseOptions = [
  { value: 10, color: "from-blue-500 to-blue-600" },
  { value: 25, color: "from-green-500 to-green-600" },
  { value: 50, color: "from-primary to-orange-600" },
  { value: 100, color: "from-purple-500 to-purple-600" },
];

const GiftCardPage = () => {
  const { giftCards, isLoading, error, fetchGiftCards } = useGiftCardStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  const userGiftCards = giftCards.filter(
    (card) => card.purchaserId === currentUser?.id,
  );

  // Gift cards available for purchase (no purchaser yet)
  const availableGiftCards = giftCards.filter(
    (card) => !card.purchaserId && card.status === "ACTIVE",
  );

  const isAdmin = currentUser?.role === "ADMIN";

  // Show all gift cards for admins, only user's for regular users
  const displayGiftCards = isAdmin ? giftCards : userGiftCards;

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

      {/* User's purchased gift cards */}
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

      {/* Available gift cards for purchase */}
      {!isAdmin && !isLoading && !error && availableGiftCards.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Gift Cards të Gatshme për Bli
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableGiftCards.map((card) => (
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
                <button className="w-full mt-4 bg-white text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                  Blej Tani
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase section - show static options if no available gift cards */}
      {!isAdmin && !isLoading && !error && availableGiftCards.length === 0 && (
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
    </div>
  );
};

export default GiftCardPage;
