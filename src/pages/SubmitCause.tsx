import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/appointment.css";
import "../css/form.css";

type Category = "individual" | "organization";
function SubmitCause() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("tenadam_auth_token");

  const [category, setCategory] = useState<Category>("individual");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!token) {
    return <Navigate to="/login" />;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category", category);
    formData.append("name", name);
    formData.append("tagline", tagline);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("goal_amount", goalAmount);
    documents.forEach((file) => formData.append("documents", file));

    setSubmitting(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/causes/submit/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        alert(t("submitCause.submitError"));
        return;
      }

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="appointment-page container content-with-nav">
        <div className="appointment-shell">
          <section className="booking-card hero-card success-card">
            <p className="eyebrow">{t("submitCause.thankYou")}</p>
            <h1>{t("submitCause.submittedTitle")}</h1>
            <p className="muted-copy">{t("submitCause.submittedText")}</p>
            <button
              className="cta-button"
              type="button"
              onClick={() => navigate("/my-causes")}
            >
              {t("myCauses.title")}
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
  return (
    <div className="appointment-page container content-with-nav">
      <div className="appointment-shell">
        <section className="booking-card hero-card">
          <Link className="back-link" to="/give-hope">
            <i className="material-icons">arrow_back</i>{" "}
            {t("giveHope.allCauses")}
          </Link>
          <p className="eyebrow">{t("submitCause.eyebrow")}</p>
          <h1>{t("submitCause.title")}</h1>
          <p className="muted-copy">{t("submitCause.subtitle")}</p>
        </section>

        <form className="form appointment-form" onSubmit={onSubmit}>
          <section className="booking-card">
            <div className="field-group">
              <label className="field-label">
                {t("submitCause.category")}
              </label>
              <div className="method-grid">
                <button
                  type="button"
                  className={`method-card${category === "individual" ? " active" : ""}`}
                  onClick={() => setCategory("individual")}
                >
                  <div className="method-card-header">
                    <i className="material-icons">person</i>
                    <strong>{t("causeListing.individual")}</strong>
                  </div>
                </button>
                <button
                  type="button"
                  className={`method-card${category === "organization" ? " active" : ""}`}
                  onClick={() => setCategory("organization")}
                >
                  <div className="method-card-header">
                    <i className="material-icons">groups</i>
                    <strong>{t("causeListing.organization")}</strong>
                  </div>
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="causeName">
                {t("submitCause.name")}
              </label>
              <input
                id="causeName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("submitCause.namePlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="causeTagline">
                {t("submitCause.tagline")}
              </label>
              <input
                id="causeTagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder={t("submitCause.taglinePlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="causeDescription">
                {t("submitCause.description")}
              </label>
              <textarea
                id="causeDescription"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("submitCause.descriptionPlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="causeLocation">
                {t("submitCause.location")}
              </label>
              <input
                id="causeLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("submitCause.locationPlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="causeGoal">
                {t("submitCause.goalAmount")}
              </label>
              <input
                id="causeGoal"
                type="number"
                min={1}
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder={t("submitCause.goalAmountPlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="causeDocuments">
                {t("submitCause.documents")}
              </label>
              <input
                id="causeDocuments"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setDocuments(Array.from(e.target.files ?? []))
                }
              />
              <p className="muted-copy">{t("submitCause.documentsHint")}</p>
              {documents.length > 0 && (
                <ul className="submit-cause-file-list">
                  {documents.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {t("submitCause.submit")}
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}

export default SubmitCause;
