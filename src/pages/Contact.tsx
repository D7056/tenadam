import { useTranslation } from "react-i18next";
import "../css/simple-page.css";

export default function Contact() {
  const { t } = useTranslation();
  return (
    <main className="simple-page content-with-nav">
      <div className="simple-page-inner">
        <p className="simple-eyebrow">{t("contact.eyebrow")}</p>
        <h1>{t("contact.title")}</h1>
        <p className="simple-page-lead">{t("contact.lead")}</p>

        <div className="simple-card-grid">
          <div className="simple-card">
            <i className="material-icons">call</i>
            <h3>{t("contact.phone")}</h3>
            <p>{t("contact.phoneHours")}</p>
            <a href="tel:+251911000000">+251 911 000 000</a>
          </div>
          <div className="simple-card">
            <i className="material-icons">mail</i>
            <h3>{t("contact.email")}</h3>
            <p>{t("contact.emailResponse")}</p>
            <a href="mailto:support@tenadam.com">support@tenadam.com</a>
          </div>
          <div className="simple-card">
            <i className="material-icons">location_on</i>
            <h3>{t("contact.office")}</h3>
            <p>{t("contact.officeAddress")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
