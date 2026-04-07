import { Gift } from "lucide-react";

const giftCards = [
  { value: 10, color: "from-blue-500 to-blue-600" },
  { value: 25, color: "from-green-500 to-green-600" },
  { value: 50, color: "from-primary to-orange-600" },
  { value: 100, color: "from-purple-500 to-purple-600" },
];

const GiftCardPage = () => {
  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <div className="text-center mb-8">
        <Gift className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold mb-2">Gift Card</h1>
        <p className="text-muted-foreground">
          Dhuro teknologjinë më të re me një gift card të TechStore50
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {giftCards.map((card) => (
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
  );
};

export default GiftCardPage;
