import { useContext, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DonationContext } from "../context/donationContext";
import AvatarImage from "../assets/avatar.png";
import Charity from "../assets/charity.webp";
import "../css/donation.css";

type DisplayCause = {
  id: string;
  category: "individual" | "organization";
  name: string;
  tagline: string;
  description: string;
  location: string;
  image: string;
  goalAmount: number;
  raisedAmount: number;
};

type DonationStatus = "pending" | "paid" | "failed";

const presetAmounts = [100, 250, 500, 1000, 2500];

export default function GiveHope() {
  const { t } = useTranslation();
  const formatEtb = (value: number) =>
    t("common.priceLabel", { price: value.toFixed(2) });
  const donationContext = useContext(DonationContext);
  const { causeId } = useParams();
  const [searchParams] = useSearchParams();
  const returningTxRef = searchParams.get("tx_ref");

  const [cause, setCause] = useState<DisplayCause | null>(null);
  const [causeLoading, setCauseLoading] = useState(true);
  const [causeError, setCauseError] = useState(false);

  const [amount, setAmount] = useState<number | null>(presetAmounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState(() => {
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    return [firstName, lastName].filter(Boolean).join(" ");
  });
  const [donorPhone, setDonorPhone] = useState(
    () => localStorage.getItem("phone_number") ?? "",
  );
  const [donorEmail, setDonorEmail] = useState(
    () => localStorage.getItem("email") ?? "",
  );
  const [note, setNote] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const [returnStatus, setReturnStatus] = useState<DonationStatus | null>(
    null,
  );
  const [returnAmount, setReturnAmount] = useState<number | null>(null);
  const [checkingReturn, setCheckingReturn] = useState(!!returningTxRef);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  useEffect(() => {
    const loadCause = async () => {
      setCauseLoading(true);
      setCauseError(false);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/causes/${causeId}/`,
        );
        if (!response.ok) throw new Error("Failed to fetch cause");
        const data = await response.json();
        setCause({
          id: String(data.id),
          category: data.category,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          location: data.location,
          image: data.category === "organization" ? Charity : AvatarImage,
          goalAmount: Number(data.goal_amount),
          raisedAmount: Number(data.raised_amount),
        });
      } catch {
        setCauseError(true);
      } finally {
        setCauseLoading(false);
      }
    };

    loadCause();
  }, [causeId]);

  useEffect(() => {
    if (!returningTxRef || !cause) return;

    const checkStatus = async () => {
      setCheckingReturn(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/donations/verify/${returningTxRef}/`,
        );
        if (!response.ok) throw new Error("Failed to verify donation");
        const data = await response.json();
        setReturnStatus(data.status);
        setReturnAmount(Number(data.amount));

        if (data.status === "paid") {
          donationContext?.addDonation({
            amount: Number(data.amount),
            paymentMethod: "chapa",
            causeId: cause.id,
            causeName: cause.name,
            donorName: data.donor_name,
            donorPhone: "",
            donorEmail: "",
            note: "",
            reference: data.tx_ref,
            status: "confirmed",
          });
        }
      } catch {
        setReturnStatus("failed");
      } finally {
        setCheckingReturn(false);
      }
    };

    checkStatus();
    
  }, [returningTxRef, cause]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cause) return;

    if (!finalAmount || finalAmount <= 0) {
      alert(t("giveHope.alertMissingAmount"));
      return;
    }

    if (!donorName.trim() || !donorPhone.trim() || !donorEmail.trim()) {
      alert(t("giveHope.alertMissingContact"));
      return;
    }

    setRedirecting(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/donations/initialize/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cause: Number(cause.id),
            donor_name: donorName,
            donor_phone: donorPhone,
            donor_email: donorEmail,
            note,
            amount: finalAmount,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok || !data.checkout_url) {
        alert(t("giveHope.initializeError"));
        setRedirecting(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      alert(t("giveHope.initializeError"));
      setRedirecting(false);
    }
  };

  if (causeLoading) {
    return (
      <div className="appointment-page donation-page container content-with-nav">
        <p>{t("giveHope.loading")}</p>
      </div>
    );
  }

  if (causeError || !cause) {
    return (
      <div className="appointment-page donation-page container content-with-nav">
        <p>{t("giveHope.notFound")}</p>
        <Link to="/give-hope">{t("giveHope.backToCauses")}</Link>
      </div>
    );
  }

  if (returningTxRef) {
    if (checkingReturn) {
      return (
        <div className="appointment-page donation-page container content-with-nav">
          <p>{t("giveHope.checkingPayment")}</p>
        </div>
      );
    }

    return (
      <div className="appointment-page donation-page container content-with-nav">
        <div className="appointment-shell">
          <section className="booking-card hero-card success-card">
            <p className="eyebrow">{t("giveHope.thankYou")}</p>
            {returnStatus === "paid" ? (
              <>
                <h1>{t("giveHope.confirmationTitlePaid")}</h1>
                <p className="muted-copy">
                  {t("giveHope.confirmationTextPaid", {
                    amount: formatEtb(returnAmount ?? 0),
                    cause: cause.name,
                  })}
                </p>
              </>
            ) : returnStatus === "pending" ? (
              <>
                <h1>{t("giveHope.confirmationTitlePending")}</h1>
                <p className="muted-copy">
                  {t("giveHope.confirmationTextPending")}
                </p>
              </>
            ) : (
              <>
                <h1>{t("giveHope.confirmationTitleFailed")}</h1>
                <p className="muted-copy">
                  {t("giveHope.confirmationTextFailed")}
                </p>
              </>
            )}

            <Link className="cta-button" to={`/give-hope/${cause.id}`}>
              {t("giveHope.makeAnother")}
            </Link>
            <Link className="back-link" to="/give-hope">
              <i className="material-icons">arrow_back</i>{" "}
              {t("giveHope.backToCauses")}
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const percentFunded = Math.min(
    100,
    Math.round((cause.raisedAmount / cause.goalAmount) * 100),
  );

  return (
    <div className="appointment-page donation-page container content-with-nav">
      <div className="appointment-shell">
        <section className="booking-card hero-card">
          <Link className="back-link" to="/give-hope">
            <i className="material-icons">arrow_back</i>{" "}
            {t("giveHope.allCauses")}
          </Link>
          <p className="eyebrow">{t("home.giveHope")}</p>
          <div className="doctor-card">
            <img className="doctor-avatar" src={cause.image} alt={cause.name} />
            <div className="doctor-copy">
              <strong>{cause.name}</strong>
              <span>{cause.tagline}</span>
              <small>{cause.location}</small>
            </div>
          </div>
          <p className="muted-copy cause-description">{cause.description}</p>
          <div className="donation-progress-track">
            <div
              className="donation-progress-fill"
              style={{ width: `${percentFunded}%` }}
            />
          </div>
          <div className="donation-progress-labels">
            <span>
              <strong>
                {t("common.priceLabel", {
                  price: cause.raisedAmount.toLocaleString(),
                })}
              </strong>{" "}
              {t("causeListing.raised")}
            </span>
            <span>
              {t("causeListing.goalLabel", {
                percent: percentFunded,
                goal: t("common.priceLabel", {
                  price: cause.goalAmount.toLocaleString(),
                }),
              })}
            </span>
          </div>
        </section>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <section className="booking-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("giveHope.step1")}</p>
                <h2>{t("giveHope.howMuch")}</h2>
              </div>
            </div>

            <div className="amount-grid">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`amount-chip${!customAmount && amount === preset ? " active" : ""}`}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount("");
                  }}
                >
                  {t("common.priceLabel", { price: preset })}
                </button>
              ))}
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="customAmount">
                {t("giveHope.customAmount")}
              </label>
              <div className="input-shell input-with-icon">
                <i className="material-icons input-icon">payments</i>
                <input
                  id="customAmount"
                  type="number"
                  min={1}
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  placeholder={t("giveHope.customAmountPlaceholder")}
                />
              </div>
            </div>
          </section>

          <section className="booking-card patient-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("giveHope.step2")}</p>
                <h2>{t("giveHope.whoIsThisFrom")}</h2>
              </div>
            </div>

            <div className="patient-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="donorName">
                  {t("appointment.fullName")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">person</i>
                  <input
                    id="donorName"
                    value={donorName}
                    onChange={(event) => setDonorName(event.target.value)}
                    placeholder={t("appointment.fullNamePlaceholder")}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="donorPhone">
                  {t("appointment.phoneNumber")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">phone</i>
                  <input
                    id="donorPhone"
                    value={donorPhone}
                    onChange={(event) => setDonorPhone(event.target.value)}
                    placeholder="09xx xxx xxx"
                    autoComplete="tel"
                    type="tel"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="donorEmail">
                  {t("giveHope.email")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">mail</i>
                  <input
                    id="donorEmail"
                    value={donorEmail}
                    onChange={(event) => setDonorEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    type="email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="note">
                {t("giveHope.noteOptional")}
              </label>
              <div className="input-shell textarea-shell">
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t("giveHope.notePlaceholder")}
                />
              </div>
            </div>
          </section>

          <section className="booking-card summary-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("giveHope.step3")}</p>
                <h2>{t("giveHope.confirmYourDonation")}</h2>
              </div>
            </div>

            <div className="summary-grid">
              <div>
                <span className="summary-label">
                  {t("giveHope.amount")}
                </span>
                <strong>
                  {finalAmount
                    ? formatEtb(finalAmount)
                    : t("giveHope.chooseAmount")}
                </strong>
              </div>
            </div>

            <div className="desktop-cta">
              <button
                className="cta-button"
                type="submit"
                disabled={redirecting}
              >
                {redirecting
                  ? t("giveHope.redirecting")
                  : t("giveHope.confirmDonation")}
              </button>
            </div>
          </section>

          <div className="mobile-cta" aria-hidden="true">
            <button
              className="cta-button"
              type="submit"
              disabled={redirecting}
            >
              {redirecting
                ? t("giveHope.redirecting")
                : t("giveHope.confirmDonation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
