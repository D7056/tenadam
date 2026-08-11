import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { auth, db } from "../firebase";
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

type UserRecord = {
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  telephone?: string;
  phone?: string;
  email?: string;
};

type PaymentMethodId = "bank" | "telebirr";

// TODO: replace with the real account details before launch.
const paymentMethods: {
  id: PaymentMethodId;
  label: string;
  icon: string;
  lines: { label: string; value: string }[];
}[] = [
  {
    id: "bank",
    label: "Bank Transfer",
    icon: "account_balance",
    lines: [
      { label: "Bank", value: "Commercial Bank of Ethiopia" },
      { label: "Account name", value: "Tenadam Charity Fund" },
      { label: "Account number", value: "1000123456789" },
    ],
  },
  {
    id: "telebirr",
    label: "Telebirr",
    icon: "smartphone",
    lines: [
      { label: "Telebirr merchant", value: "Tenadam Charity Fund" },
      { label: "Phone number", value: "0912 345 678" },
    ],
  },
];

const presetAmounts = [100, 250, 500, 1000, 2500];

const methodLabelKeys: Record<string, string> = {
  "Bank Transfer": "bankTransfer",
  Telebirr: "telebirr",
};

const lineLabelKeys: Record<string, string> = {
  Bank: "bank",
  "Account name": "accountName",
  "Account number": "accountNumber",
  "Telebirr merchant": "telebirrMerchant",
  "Phone number": "phoneNumber",
};

export default function GiveHope() {
  const { t } = useTranslation();
  const methodLabel = (label: string) =>
    t(`giveHope.methods.${methodLabelKeys[label] ?? "bankTransfer"}`);
  const lineLabel = (label: string) =>
    t(`giveHope.lineLabels.${lineLabelKeys[label] ?? "bank"}`);
  const formatEtb = (value: number) =>
    t("common.priceLabel", { price: value.toFixed(2) });
  const donationContext = useContext(DonationContext);
  const { causeId } = useParams();
  const [cause, setCause] = useState<DisplayCause | null>(null);
  const [causeLoading, setCauseLoading] = useState(true);
  const [causeError, setCauseError] = useState(false);

  const [amount, setAmount] = useState<number | null>(presetAmounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [methodId, setMethodId] = useState<PaymentMethodId>("bank");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [copiedLine, setCopiedLine] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);

  const selectedMethod =
    paymentMethods.find((method) => method.id === methodId) ??
    paymentMethods[0];
  const finalAmount = customAmount ? Number(customAmount) : amount;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }

      const collections = ["users", "providers"];

      for (const collection of collections) {
        const snapshot = await getDoc(doc(db, collection, user.uid));
        if (!snapshot.exists()) {
          continue;
        }

        const data = snapshot.data() as UserRecord;
        const fullName =
          [data.firstName, data.lastName].filter(Boolean).join(" ") ||
          data.name ||
          user.displayName ||
          "";

        setDonorName(fullName);
        setDonorPhone(data.phoneNumber || data.telephone || data.phone || "");
        setDonorEmail(data.email || user.email || "");
        return;
      }
    });

    return () => unsub();
  }, []);

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

  const handleCopy = async (line: string) => {
    try {
      await navigator.clipboard.writeText(line);
      setCopiedLine(line);
      setTimeout(() => setCopiedLine(""), 1500);
    } catch {

    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cause) return;

    if (!finalAmount || finalAmount <= 0) {
      alert(t("giveHope.alertMissingAmount"));
      return;
    }

    if (!donorName.trim() || !donorPhone.trim()) {
      alert(t("giveHope.alertMissingContact"));
      return;
    }

    donationContext?.addDonation({
      amount: finalAmount,
      paymentMethod: methodId,
      causeId: cause.id,
      causeName: cause.name,
      donorName,
      donorPhone,
      donorEmail,
      note,
      reference,
    });

    setSubmittedAmount(finalAmount);
  };

  const handleReset = () => {
    setSubmittedAmount(null);
    setAmount(presetAmounts[1]);
    setCustomAmount("");
    setNote("");
    setReference("");
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

  if (submittedAmount !== null) {
    return (
      <div className="appointment-page donation-page container content-with-nav">
        <div className="appointment-shell">
          <section className="booking-card hero-card success-card">
            <p className="eyebrow">{t("giveHope.thankYou")}</p>
            <h1>{t("giveHope.confirmationTitle")}</h1>
            <div className="confirmation-card">
              <p className="muted-copy">
                {t("giveHope.confirmationText", {
                  amount: formatEtb(submittedAmount),
                  cause: cause.name,
                  method: methodLabel(selectedMethod.label),
                })}
              </p>

              <div className="method-card active">
                <div className="method-card-header">
                  <i className="material-icons">{selectedMethod.icon}</i>
                  <strong>{methodLabel(selectedMethod.label)}</strong>
                </div>
                {selectedMethod.lines.map((line) => (
                  <div className="payment-line" key={line.label}>
                    <span>{lineLabel(line.label)}</span>
                    <strong>{line.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <button className="cta-button" type="button" onClick={handleReset}>
              {t("giveHope.makeAnother")}
            </button>
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

          <section className="booking-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("giveHope.step2")}</p>
                <h2>{t("giveHope.howWillYouSend")}</h2>
              </div>
            </div>

            <div className="method-grid">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`method-card${method.id === methodId ? " active" : ""}`}
                  onClick={() => setMethodId(method.id)}
                >
                  <div className="method-card-header">
                    <i className="material-icons">{method.icon}</i>
                    <strong>{methodLabel(method.label)}</strong>
                  </div>
                  {method.id === methodId &&
                    method.lines.map((line) => (
                      <div className="payment-line" key={line.label}>
                        <span>{lineLabel(line.label)}</span>
                        <strong
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCopy(line.value);
                          }}
                        >
                          {line.value}
                          <i className="material-icons copy-icon">
                            {copiedLine === line.value ? "check" : "content_copy"}
                          </i>
                        </strong>
                      </div>
                    ))}
                </button>
              ))}
            </div>
            <p className="muted-copy payment-hint">
              {t("giveHope.paymentHint")}
            </p>
          </section>

          <section className="booking-card patient-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("giveHope.step3")}</p>
                <h2>{t("giveHope.whoIsThisFrom")}</h2>
              </div>
              <span className="availability-chip">
                {t("appointment.guestFriendly")}
              </span>
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
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="donorEmail">
                  {t("giveHope.emailOptional")}
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
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="reference">
                  {t("giveHope.referenceOptional")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">receipt_long</i>
                  <input
                    id="reference"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder={t("giveHope.referencePlaceholder")}
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
                <p className="eyebrow">{t("giveHope.step4")}</p>
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
              <div>
                <span className="summary-label">{t("giveHope.method")}</span>
                <strong>{methodLabel(selectedMethod.label)}</strong>
              </div>
            </div>

            <div className="desktop-cta">
              <button className="cta-button" type="submit">
                {t("giveHope.confirmDonation")}
              </button>
            </div>
          </section>

          <div className="mobile-cta" aria-hidden="true">
            <button className="cta-button" type="submit">
              {t("giveHope.confirmDonation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
