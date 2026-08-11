import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CartContext } from "../context/cartContext";
import "../css/cart.css";

function Cart() {
  const { t } = useTranslation();
  const cart = useContext(CartContext);
  const navigate = useNavigate();

  if (!cart) return <div>{t("cart.notAvailable")}</div>;

  return (
    <main className="cart-page container content-with-nav">
      <div className="cart-container">
        <h1 className="cart-title">{t("cart.yourCart")}</h1>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <p>{t("cart.empty")}</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((it) => (
                <div className="cart-item" key={it.id}>
                  {it.image ? (
                    <img
                      className="cart-item-image"
                      src={it.image}
                      alt={it.title}
                    />
                  ) : (
                    <div className="cart-item-image" />
                  )}
                  <div className="cart-item-info">
                    <strong>{it.title}</strong>
                    {it.dealerName && (
                      <span className="cart-item-dealer">
                        {t("medicine.soldBy", { dealer: it.dealerName })}
                      </span>
                    )}
                    <span>
                      {it.price
                        ? t("common.priceLabel", {
                            price: it.price.toFixed(2),
                          })
                        : t("cart.priceNotAvailable")}
                      {it.dosage ? ` · ${it.dosage}` : ""}
                    </span>
                  </div>
                  <div className="cart-item-controls">
                    <input
                      className="cart-qty-input"
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        cart.updateQuantity(it.id, Number(e.target.value || 1))
                      }
                    />
                    <button
                      className="cart-remove-btn"
                      onClick={() => cart.removeItem(it.id)}
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <button className="cart-clear-btn" onClick={() => cart.clearCart()}>
                {t("cart.clearCart")}
              </button>
              <div className="cart-total-block">
                <div className="cart-total-value">
                  {t("cart.total", {
                    total: t("common.priceLabel", {
                      price: cart.total.toFixed(2),
                    }),
                  })}
                </div>
                <button
                  className="cart-checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  {t("cart.proceedToCheckout")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Cart;
