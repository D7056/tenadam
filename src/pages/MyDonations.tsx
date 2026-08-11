import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DonationContext } from "../context/donationContext";
import "../css/my-donations.css";

const methodKeys: Record<string, string> = {
  bank: "bankTransfer",
  telebirr: "telebirr",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function MyDonations() {
  const { t } = useTranslation();
  const formatEtb = (amount: number) =>
    t("common.priceLabel", { price: amount.toLocaleString() });
  const donationContext = useContext(DonationContext);
  const donations = donationContext?.donations ?? [];

  const sortedDonations = useMemo(
    () =>
      [...donations].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    [donations],
  );

  const totalGiven = donations.reduce((sum, d) => sum + d.amount, 0);
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  return (
    <main className="donations-page container content-with-nav">
      <section className="donations-hero">
        <div className="donations-copy">
          <p className="donations-eyebrow">{t("myDonations.myDonations")}</p>
          <h1>{t("myDonations.heroTitle")}</h1>
          <p className="donations-text">{t("myDonations.heroText")}</p>
        </div>
        <div className="donations-stats">
          <div className="donations-stat-card">
            <span className="donations-stat-value">
              {formatEtb(totalGiven)}
            </span>
            <span className="donations-stat-label">
              {t("myDonations.totalGiven")}
            </span>
          </div>
          <div className="donations-stat-card">
            <span className="donations-stat-value">{pendingCount}</span>
            <span className="donations-stat-label">
              {t("myDonations.pendingConfirmation")}
            </span>
          </div>
        </div>
      </section>
      <section className="donations-section">
        <div className="donations-header">
          <div>
            <p className="donations-section-label">
              {t("myDonations.listLabel")}
            </p>
            <h2>{t("myDonations.allEntries")}</h2>
          </div>
          <Link className="donations-link" to="/give-hope">
            {t("myDonations.giveNew")}
          </Link>
        </div>

        {sortedDonations.length === 0 ? (
          <div className="donations-empty">
            <h3>{t("myDonations.emptyTitle")}</h3>
            <p>{t("myDonations.emptyText")}</p>
            <Link className="donations-link" to="/give-hope">
              {t("myDonations.browseCauses")}
            </Link>
          </div>
        ) : (
          <div className="donations-grid">
            {sortedDonations.map((donation) => (
              <article key={donation.id} className="donation-history-card">
                <div className="donation-history-head">
                  <div>
                    <p className="donation-cause-name">{donation.causeName}</p>
                    <h3>{formatEtb(donation.amount)}</h3>
                  </div>
                  <span className="donation-status">
                    {t(`myDonations.status.${donation.status}`)}
                  </span>
                </div>
                <div className="donation-history-meta">
                  <div>
                    <span>{t("giveHope.method")}</span>
                    <strong>
                      {t(
                        `giveHope.methods.${methodKeys[donation.paymentMethod] ?? "bankTransfer"}`,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>{t("appointments.date")}</span>
                    <strong>{formatDate(donation.createdAt)}</strong>
                  </div>
                  <div>
                    <span>{t("myDonations.donor")}</span>
                    <strong>{donation.donorName}</strong>
                  </div>
                  <div>
                    <span>{t("appointments.phone")}</span>
                    <strong>{donation.donorPhone}</strong>
                  </div>
                </div>
                {(donation.reference.trim() || donation.note.trim()) && (
                  <div className="donation-history-note">
                    {donation.reference.trim() && (
                      <>
                        <span>{t("myDonations.reference")}</span>
                        <p>{donation.reference}</p>
                      </>
                    )}
                    {donation.note.trim() && <p>{donation.note}</p>}
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

export default MyDonations;
