import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CartContext } from "../context/cartContext";
import { OrderContext } from "../context/orderContext";
import { PharmacyContext } from "../context/pharmacyContext";
import "../css/checkout.css";

export default function Checkout() {
  const { t } = useTranslation();
  const formatEtb = (value: number) =>
    t("common.priceLabel", { price: value.toFixed(2) });
  const cart = useContext(CartContext);
  const orderContext = useContext(OrderContext);
  const pharmacy = useContext(PharmacyContext);

  const [recipientName, setRecipientName] = useState(() => {
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    return [firstName, lastName].filter(Boolean).join(" ");
  });
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState(
    () => localStorage.getItem("phone_number") ?? "",
  );
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(
    null,
  );
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recipientName.trim() || !address.trim() || !contact.trim()) {
      alert(t("checkout.alertMissingFields"));
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    orderContext?.addOrder({
      items,
      total,
      recipientName,
      address,
      contact,
    });

    items.forEach((item) => {
      pharmacy?.addOrder({
        id: `${Date.now()}-${item.id}-${Math.random().toString(36).slice(2, 6)}`,
        patientName: recipientName,
        medication: item.title,
        dosage: item.dosage ?? "",
        quantity: item.quantity,
        address,
        contact,
        createdAt: Date.now(),
        status: "pending",
      });
    });

    setConfirmedTotal(total);
    setConfirmedOrderId(id);
    cart?.clearCart();
  };

  if (confirmedOrderId) {
    return (
      <div className="appointment-page checkout-page container content-with-nav">
        <div className="appointment-shell">
          <section className="booking-card hero-card success-card">
            <p className="eyebrow">{t("giveHope.thankYou")}</p>
            <h1>{t("checkout.orderPlaced")}</h1>
            <p className="muted-copy">
              {t("checkout.orderConfirmedText", {
                total: formatEtb(confirmedTotal),
              })}
            </p>

            <Link className="cta-button" to="/orders">
              {t("checkout.viewMyOrders")}
            </Link>
            <Link className="back-link" to="/medicine">
              <i className="material-icons">arrow_back</i>{" "}
              {t("checkout.continueShopping")}
            </Link>
          </section>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="appointment-page checkout-page container content-with-nav">
        <div className="appointment-shell">
          <section className="booking-card hero-card">
            <p className="eyebrow">{t("checkout.checkout")}</p>
            <h1>{t("checkout.cartEmptyTitle")}</h1>
            <p className="muted-copy">{t("checkout.cartEmptyText")}</p>
            <Link className="back-link" to="/medicine">
              <i className="material-icons">arrow_back</i>{" "}
              {t("checkout.browseMedicine")}
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-page checkout-page container content-with-nav">
      <div className="appointment-shell">
        <section className="booking-card hero-card">
          <Link className="back-link" to="/cart">
            <i className="material-icons">arrow_back</i>{" "}
            {t("checkout.backToCart")}
          </Link>
          <p className="eyebrow">{t("checkout.checkout")}</p>
          <h1>{t("checkout.reviewAndConfirm")}</h1>
        </section>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <section className="booking-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("checkout.step1")}</p>
                <h2>{t("checkout.whatYoureBuying")}</h2>
              </div>
            </div>

            <div className="checkout-items">
              {items.map((item) => (
                <div className="checkout-item" key={item.id}>
                  {item.image ? (
                    <img
                      className="checkout-item-image"
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <div className="checkout-item-image" />
                  )}
                  <div className="checkout-item-info">
                    <strong>{item.title}</strong>
                    {item.dealerName && (
                      <span className="checkout-item-dealer">
                        {t("medicine.soldBy", { dealer: item.dealerName })}
                      </span>
                    )}
                    <span>
                      {t("checkout.qty", { count: item.quantity })}
                    </span>
                  </div>
                  <div className="checkout-item-price">
                    {formatEtb(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-total-row">
              <span className="summary-label">{t("checkout.total")}</span>
              <strong>{formatEtb(total)}</strong>
            </div>
          </section>

          <section className="booking-card patient-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("checkout.step2")}</p>
                <h2>{t("checkout.whereToSend")}</h2>
              </div>
              <span className="availability-chip">
                {t("appointment.guestFriendly")}
              </span>
            </div>

            <div className="patient-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="recipientName">
                  {t("appointment.fullName")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">person</i>
                  <input
                    id="recipientName"
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                    placeholder={t("appointment.fullNamePlaceholder")}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="contact">
                  {t("appointment.phoneNumber")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">phone</i>
                  <input
                    id="contact"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="09xx xxx xxx"
                    autoComplete="tel"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="address">
                {t("checkout.deliveryAddress")}
              </label>
              <div className="input-shell textarea-shell">
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={t("checkout.addressPlaceholder")}
                />
              </div>
            </div>
          </section>

          <section className="booking-card summary-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("checkout.step3")}</p>
                <h2>{t("checkout.placeOrder")}</h2>
              </div>
            </div>

            <div className="summary-grid">
              <div>
                <span className="summary-label">{t("checkout.items")}</span>
                <strong>{items.length}</strong>
              </div>
              <div>
                <span className="summary-label">{t("checkout.total")}</span>
                <strong>{formatEtb(total)}</strong>
              </div>
            </div>

            <div className="desktop-cta">
              <button className="cta-button" type="submit">
                {t("checkout.confirmOrder")}
              </button>
            </div>
          </section>

          <div className="mobile-cta" aria-hidden="true">
            <button className="cta-button" type="submit">
              {t("checkout.confirmOrder")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
