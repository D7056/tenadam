import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OrderContext } from "../context/orderContext";
import "../css/my-orders.css";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function MyOrders() {
  const { t } = useTranslation();
  const formatEtb = (amount: number) =>
    t("common.priceLabel", { price: amount.toLocaleString() });
  const orderContext = useContext(OrderContext);
  const orders = orderContext?.orders ?? [];

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    [orders],
  );

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <main className="orders-page container content-with-nav">
      <section className="orders-hero">
        <div className="orders-copy">
          <p className="orders-eyebrow">{t("myOrders.myOrders")}</p>
          <h1>{t("myOrders.heroTitle")}</h1>
          <p className="orders-text">{t("myOrders.heroText")}</p>
        </div>

        <div className="orders-stats">
          <div className="orders-stat-card">
            <span className="orders-stat-value">{formatEtb(totalSpent)}</span>
            <span className="orders-stat-label">
              {t("myOrders.totalSpent")}
            </span>
          </div>
          <div className="orders-stat-card">
            <span className="orders-stat-value">{pendingCount}</span>
            <span className="orders-stat-label">
              {t("myDonations.pendingConfirmation")}
            </span>
          </div>
        </div>
      </section>

      <section className="orders-section">
        <div className="orders-header">
          <div>
            <p className="orders-section-label">{t("myOrders.listLabel")}</p>
            <h2>{t("myOrders.allEntries")}</h2>
          </div>
          <Link className="orders-link" to="/medicine">
            {t("myOrders.shopMore")}
          </Link>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="orders-empty">
            <h3>{t("myOrders.emptyTitle")}</h3>
            <p>{t("myOrders.emptyText")}</p>
            <Link className="orders-link" to="/medicine">
              {t("medicine.browseMedicine")}
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {sortedOrders.map((order) => (
              <article key={order.id} className="order-history-card">
                <div className="order-history-head">
                  <div>
                    <p className="order-eyebrow">
                      {t("myOrders.itemCount", {
                        count: order.items.length,
                      })}
                    </p>
                    <h3>{formatEtb(order.total)}</h3>
                  </div>
                  <span className="order-status">
                    {t(`myOrders.status.${order.status}`)}
                  </span>
                </div>

                <div className="order-items-list">
                  {order.items.map((item) => (
                    <div className="order-line-item" key={item.id}>
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <span>
                        {t("common.priceLabel", {
                          price: (item.price * item.quantity).toFixed(2),
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-history-meta">
                  <div>
                    <span>{t("appointments.date")}</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                  <div>
                    <span>{t("myOrders.recipient")}</span>
                    <strong>{order.recipientName}</strong>
                  </div>
                  <div>
                    <span>{t("appointments.phone")}</span>
                    <strong>{order.contact}</strong>
                  </div>
                  <div>
                    <span>{t("myOrders.address")}</span>
                    <strong>{order.address}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyOrders;
