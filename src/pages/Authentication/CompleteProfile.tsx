import { useState } from "react";
import "../../css/form.css";
import heroImage from "../../assets/hero-image.png";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DropDown from "../../components/DropDown";

function destinationForRole(): string {
  const roles = localStorage.getItem("roles");
  if (roles !== "provider") return "/";

  const serviceType = localStorage.getItem("service_type");
  if (serviceType === "delivery_man") return "/deliveryman";
  if (serviceType === "doctor") return "/doctor";
  return "/medicinedealer";
}

function CompleteProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isProvider = localStorage.getItem("roles") === "provider";

  const [employmentStatus, setEmploymentStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const region = e.currentTarget.region.value;
    const city = e.currentTarget.city.value;
    const addressLine = e.currentTarget.addressLine.value;

    const payload: Record<string, string> = {
      region,
      city,
      address_line: addressLine,
    };

    if (isProvider) {
      payload.employer =
        employmentStatus === "Employed"
          ? e.currentTarget.employer.value
          : "self-employed";
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/complete-profile/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("tenadam_auth_token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        alert(t("auth.completeProfileError"));
        return;
      }

      localStorage.setItem("tenadam_profile_completed", "true");
      navigate(destinationForRole());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-logo-link">
          <img src={heroImage} alt="Tenadam" className="hero-image" />
        </Link>

        <div className="auth-card">
          <p className="auth-eyebrow">{t("auth.oneMoreStep")}</p>
          <h1>{t("auth.completeProfileTitle")}</h1>
          <p className="auth-subtitle">{t("auth.completeProfileSubtitle")}</p>

          <form className="form" onSubmit={onSubmit}>
            {isProvider && (
              <>
                <div className="field-group">
                  <label className="field-label" htmlFor="employmentStatus">
                    {t("auth.employmentStatus")}
                  </label>
                  <DropDown
                    name="employmentStatus"
                    label={t("auth.selectEmploymentStatus")}
                    options={[
                      t("auth.employed"),
                      t("auth.selfEmployed"),
                    ]}
                    onChange={(e) => setEmploymentStatus(
                      e.target.value === t("auth.employed")
                        ? "Employed"
                        : "Self-employed",
                    )}
                    required
                  />
                </div>

                {employmentStatus === "Employed" && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="employer">
                      {t("auth.employer")}
                    </label>
                    <input
                      id="employer"
                      type="text"
                      name="employer"
                      placeholder={t("auth.employerPlaceholder")}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="region">
                {t("auth.region")}
              </label>
              <input
                id="region"
                type="text"
                name="region"
                placeholder={t("auth.regionPlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="city">
                {t("auth.cityWoreda")}
              </label>
              <input
                id="city"
                type="text"
                name="city"
                placeholder={t("auth.cityWoredaPlaceholder")}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="addressLine">
                {t("auth.addressLine")}
              </label>
              <input
                id="addressLine"
                type="text"
                name="addressLine"
                placeholder={t("auth.addressLinePlaceholder")}
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {t("auth.continueButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
