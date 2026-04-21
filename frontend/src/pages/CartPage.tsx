import { useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

const CartPage = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    fetchCartFromServer,
    updateCartItemServer,
    removeCartLineServer,
    clearCartServer,
  } = useCartStore();
  const { isSignedIn, getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || isSignedIn !== true) return;
    void (async () => {
      try {
        const token = await getToken();
        if (token) {
          await fetchCartFromServer(token);
        }
      } catch {
        /* errors shown on interaction */
      }
    })();
  }, [isLoaded, isSignedIn, getToken, fetchCartFromServer]);

  if (items.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Shporta juaj është bosh</h1>
        <p className="text-muted-foreground mb-6">
          Shto produkte në shportë për të vazhduar
        </p>
        <Link
          to="/"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Vazhdo blerjen
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Shporta ime</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            {items.map((item, i) => (
              <div
                key={item.product.id}
                className={`flex items-center gap-4 p-4 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <Link
                  to={`/product/${item.product.id}`}
                  className="w-20 h-20 flex-shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-contain"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-primary font-bold mt-1">
                    {item.product.price.toFixed(2)}€
                  </p>
                </div>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      const next = item.quantity - 1;
                      void (async () => {
                        try {
                          if (isSignedIn === true) {
                            const token = await getToken();
                            if (!token) {
                              toast.error("Sesioni skadoi.");
                              return;
                            }
                            await updateCartItemServer(
                              token,
                              item.product.id,
                              next,
                            );
                          } else {
                            updateQuantity(item.product.id, next);
                          }
                        } catch (e) {
                          toast.error(
                            e instanceof Error
                              ? e.message
                              : "Gabim në shportë",
                          );
                        }
                      })();
                    }}
                    className="p-1.5 hover:bg-muted"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = item.quantity + 1;
                      void (async () => {
                        try {
                          if (isSignedIn === true) {
                            const token = await getToken();
                            if (!token) {
                              toast.error("Sesioni skadoi.");
                              return;
                            }
                            await updateCartItemServer(
                              token,
                              item.product.id,
                              next,
                            );
                          } else {
                            updateQuantity(item.product.id, next);
                          }
                        } catch (e) {
                          toast.error(
                            e instanceof Error
                              ? e.message
                              : "Gabim në shportë",
                          );
                        }
                      })();
                    }}
                    className="p-1.5 hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-bold w-20 text-right">
                  {(item.product.price * item.quantity).toFixed(2)}€
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      try {
                        if (isSignedIn === true) {
                          const token = await getToken();
                          if (!token) {
                            toast.error("Sesioni skadoi.");
                            return;
                          }
                          await removeCartLineServer(token, item.product.id);
                        } else {
                          removeItem(item.product.id);
                        }
                      } catch (e) {
                        toast.error(
                          e instanceof Error
                            ? e.message
                            : "Gabim në shportë",
                        );
                      }
                    })();
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                try {
                  if (isSignedIn === true) {
                    const token = await getToken();
                    if (!token) {
                      toast.error("Sesioni skadoi.");
                      return;
                    }
                    await clearCartServer(token);
                  } else {
                    clearCart();
                  }
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Gabim në shportë",
                  );
                }
              })();
            }}
            className="mt-3 text-sm text-muted-foreground hover:text-destructive"
          >
            Pastro shportën
          </button>
        </div>

        <div className="w-full lg:w-[340px]">
          <div className="bg-white rounded-lg border border-border p-6 sticky top-4">
            <h2 className="font-semibold text-lg mb-4">Përmbledhja</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nën-totali</span>
                <span>{totalPrice().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transporti</span>
                <span className="text-green-600">Falas</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between text-base font-bold">
                <span>Totali</span>
                <span className="text-primary">{totalPrice().toFixed(2)}€</span>
              </div>
            </div>
            <Link
              to="/payment"
              className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center block"
            >
              Vazhdo me pagesën
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
