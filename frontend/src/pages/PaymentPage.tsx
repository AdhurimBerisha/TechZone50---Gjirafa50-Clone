import { useState } from "react";
import { Link } from "react-router";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle,
} from "lucide-react";

const PaymentPage = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Kosovë",
    paymentMethod: "cash",
    termsAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      alert("Ju lutem plotësoni të gjitha fushat e kërkuara!");
      return;
    }

    if (!formData.termsAccepted) {
      alert("Ju lutem pranoni kushtet e përdorimit!");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const orderNum = `GJ${Date.now().toString().slice(-8)}`;
      setOrderNumber(orderNum);

      clearCart();

      setOrderCompleted(true);
    } catch (error) {
      alert(
        "Ndodhi një gabim gjatë përpunimit të porosisë. Ju lutem provoni përsëri.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Shporta juaj është bosh</h1>
        <Link
          to="/"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Kthehu në faqen kryesore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Vazhdo pagesën</h1>
        <p className="text-muted-foreground mt-1">
          Plotësoni të dhënat për të përfunduar porosinë
        </p>
      </div>

      {!orderCompleted && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Të dhënat personale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Emri *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Mbiemri *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Numri i telefonit *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adresa e dërgesës</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresa *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Qyteti *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Kodi postar</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Shteti</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mënyra e pagesës</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleInputChange("paymentMethod", value)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label
                      htmlFor="cash"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">
                          Pagesë me para në dorë
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Paguani kur të merrni produktin
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="online" id="online" />
                    <Label
                      htmlFor="online"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Pagesë online</div>
                        <div className="text-sm text-muted-foreground">
                          Kartë krediti/debiti, PayPal
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label
                      htmlFor="bank"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Transfer bankar</div>
                        <div className="text-sm text-muted-foreground">
                          Transfer nga banka juaj
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) =>
                  handleInputChange("termsAccepted", checked)
                }
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                Pranoj{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  kushtet e përdorimit
                </Link>{" "}
                dhe
                <Link
                  to="/privacy"
                  className="text-primary hover:underline ml-1"
                >
                  politikat e privatësisë
                </Link>
              </Label>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Përmbledhja e porosisë
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-contain border border-border rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sasia: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold">
                        {(item.product.price * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nën-totali</span>
                    <span>{totalPrice().toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transporti</span>
                    <span className="text-green-600">Falas</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totali</span>
                    <span className="text-primary">
                      {totalPrice().toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Dërgesa brenda 1-3 ditëve pune</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!formData.termsAccepted || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Duke përpunuar...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Përfundo porosinë
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      )}

      {/* Success State */}
      {orderCompleted && (
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-16 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-green-800 mb-2">
              Porosia u krye me sukses!
            </h1>
            <p className="text-green-700 mb-4">
              Numri i porosisë tuaj është: <strong>{orderNumber}</strong>
            </p>
            <p className="text-sm text-green-600 mb-6">
              Ju do të merrni një email konfirmimi së shpejti me detajet e
              porosisë.
            </p>
            <Link
              to="/"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block"
            >
              Kthehu në faqen kryesore
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
