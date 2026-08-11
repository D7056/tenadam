import { useTranslation } from "react-i18next";
import "../css/simple-page.css";

export default function About() {
  const { t } = useTranslation();
  return (
    <main className="simple-page content-with-nav">
      <div className="simple-page-inner">
        <p className="simple-eyebrow">{t("about.eyebrow")}</p>
        <h1>{t("about.title")}</h1>
        <p className="simple-page-lead">{t("about.lead")}</p>

        <div className="simple-card-grid">
          <div className="simple-card">
            <i className="material-icons">medication</i>
            <h3>{t("about.orderMedicineTitle")}</h3>
            <p>{t("about.orderMedicineText")}</p>
          </div>
          <div className="simple-card">
            <i className="material-icons">event_available</i>
            <h3>{t("about.bookCareTitle")}</h3>
            <p>{t("about.bookCareText")}</p>
          </div>
          <div className="simple-card">
            <i className="material-icons">volunteer_activism</i>
            <h3>{t("home.giveHope")}</h3>
            <p>{t("about.giveHopeText")}</p>
          </div>
        </div>

        <div className="simple-section">
          <h2>{t("about.missionTitle")}</h2>
          <p>{t("about.missionText1")}</p>
          <p>{t("about.missionText2")}</p>
        </div>
      </div>
    </main>
  );
}
