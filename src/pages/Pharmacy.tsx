import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PharmacyContext, type PharmacyOrder } from "../context/pharmacyContext";
import "../css/pharmacy-dashboard.css";

const STATUS_ORDER: Record<PharmacyOrder["status"], number> = {
  pending: 0,
  preparing: 1,
  completed: 2,
  cancelled: 3,
};

const FILTERS: { key: string; value: "all" | PharmacyOrder["status"] }[] = [
  { key: "all", value: "all" },
  { key: "pending", value: "pending" },
  { key: "preparing", value: "preparing" },
  { key: "completed", value: "completed" },
  { key: "cancelled", value: "cancelled" },
];

function formatOrderDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function Pharmacy() {
  const { t } = useTranslation();
  const pharmacy = useContext(PharmacyContext);
  const orders = pharmacy?.orders ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | PharmacyOrder["status"]>("all");

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...orders]
      .filter(
        (order) => activeFilter === "all" || order.status === activeFilter,
      )
      .filter(
        (order) =>
          !query ||
          order.patientName.toLowerCase().includes(query) ||
          order.medication.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return b.createdAt - a.createdAt;
      });
  }, [orders, searchQuery, activeFilter]);

  return (
    <main className="pharmacy-page content-with-nav">
      <section className="pharmacy-hero">
        <p className="pharmacy-eyebrow">{t("pharmacy.dashboardEyebrow")}</p>
        <h1>{t("pharmacy.incomingOrders")}</h1>
        <p>{t("pharmacy.reviewOrdersText")}</p>
        <Link to="/medicinedealer/inventory" className="pharmacy-inventory-btn">
          <i className="material-icons">inventory_2</i>
          {t("pharmacy.inventory")}
        </Link>
      </section>

      <div className="pharmacy-stats">
        <div className="pharmacy-stat-card">
          <span className="pharmacy-stat-value">{pendingCount}</span>
          <span className="pharmacy-stat-label">{t("pharmacy.pending")}</span>
        </div>
        <div className="pharmacy-stat-card">
          <span className="pharmacy-stat-value">{preparingCount}</span>
          <span className="pharmacy-stat-label">
            {t("pharmacy.preparing")}
          </span>
        </div>
        <div className="pharmacy-stat-card">
          <span className="pharmacy-stat-value">{completedCount}</span>
          <span className="pharmacy-stat-label">
            {t("pharmacy.completed")}
          </span>
        </div>
      </div>

      <section className="pharmacy-section">
        <div className="pharmacy-toolbar">
          <div className="pharmacy-search-wrapper">
            <i className="material-icons pharmacy-search-icon">search</i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("pharmacy.searchPlaceholder")}
            />
          </div>

          <div className="pharmacy-filter-rail">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`pharmacy-filter-pill${activeFilter === filter.value ? " active" : ""}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {t(`pharmacy.filters.${filter.key}`)}
              </button>
            ))}
          </div>
        </div>

        <h2>{t("pharmacy.allOrders")}</h2>

        {visibleOrders.length === 0 ? (
          <div className="pharmacy-empty">
            <p>
              {orders.length === 0
                ? t("pharmacy.emptyText")
                : t("pharmacy.noMatchingOrders")}
            </p>
          </div>
        ) : (
          <div className="pharmacy-order-grid">
            {visibleOrders.map((order) => (
              <article key={order.id} className="pharmacy-order-card">
                <div className="pharmacy-order-head">
                  <h3>
                    {order.medication}
                    {order.dosage ? ` (${order.dosage})` : ""}
                  </h3>
                  <span className={`pharmacy-order-status ${order.status}`}>
                    {t(`pharmacy.status.${order.status}`)}
                  </span>
                </div>

                <p className="pharmacy-order-timestamp">
                  {formatOrderDate(order.createdAt)}
                </p>

                <div className="pharmacy-order-meta">
                  <div>
                    <span>{t("medicine.quantity")}</span>
                    <strong>{order.quantity}</strong>
                  </div>
                  <div>
                    <span>{t("pharmacy.patient")}</span>
                    <strong>
                      {order.patientName || t("pharmacy.notProvided")}
                    </strong>
                  </div>
                  {order.contact && (
                    <div>
                      <span>{t("pharmacy.contact")}</span>
                      <strong>{order.contact}</strong>
                    </div>
                  )}
                  {order.address && (
                    <div>
                      <span>{t("myOrders.address")}</span>
                      <strong>{order.address}</strong>
                    </div>
                  )}
                </div>

                {(order.status === "pending" ||
                  order.status === "preparing") && (
                  <div className="pharmacy-order-actions">
                    {order.status === "pending" && (
                      <button
                        className="pharmacy-action-btn prepare"
                        onClick={() =>
                          pharmacy?.updateOrderStatus(order.id, "preparing")
                        }
                      >
                        {t("pharmacy.startPreparing")}
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        className="pharmacy-action-btn complete"
                        onClick={() =>
                          pharmacy?.updateOrderStatus(order.id, "completed")
                        }
                      >
                        {t("pharmacy.markCompleted")}
                      </button>
                    )}
                    <button
                      className="pharmacy-action-btn cancel"
                      onClick={() =>
                        pharmacy?.updateOrderStatus(order.id, "cancelled")
                      }
                    >
                      {t("pharmacy.cancel")}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
export default Pharmacy;
