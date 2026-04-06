import { Truck } from "lucide-react";

const TopBar = () => {
  return (
    <div
      className="w-full py-2 px-4 text-center text-sm"
      style={{ backgroundColor: "hsl(0, 0%, 13%)" }}
    >
      <div className="flex items-center justify-center gap-2 text-white">
        <Truck className="h-4 w-4" />
        <span>Mbështetu tek ne. Dërgesa 100% të sigurta, kudo në Kosovë.</span>
      </div>
    </div>
  );
};

export default TopBar;
