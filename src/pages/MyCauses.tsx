import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/cause-listing.css";

type ApiCause = {
  id: number;
  category: "individual" | "organization";
  name: string;
  tagline: string;
  location: string;
  goal_amount: string;
  raised_amount: string;
  approved: boolean;
  created_at: string;
};

function MyCauses() {
  const { t } = useTranslation();
  const token = localStorage.getItem("tenadam_auth_token");
  const [causes, setCauses] = useState<ApiCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadMyCauses = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/causes/mine/",
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setCauses(data.results ?? data);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadMyCauses();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <main className="cause-listing-page content-with-nav">
      <section className="cause-listing-hero">
        <div>
          <h1>{t("myCauses.title")}</h1>
          <p>{t("myCauses.subtitle")}</p>
          <Link to="/submit-cause" className="cause-share-btn">
            <i className="material-icons">add_circle</i>
            {t("causeListing.shareYourCause")}
          </Link>
        </div>
      </section>

      <section className="cause-grid-container">
        {loading ? (
          <p>{t("myCauses.loading")}</p>
        ) : loadError ? (
          <p>{t("myCauses.loadError")}</p>
        ) : causes.length === 0 ? (
          <p>{t("myCauses.noneYet")}</p>
        ) : (
          <div className="cause-grid">
            {causes.map((cause) => (
              <div key={cause.id} className="master-cause-card">
                <div className="cause-card-header">
                  <span className={`cause-category-badge ${cause.category}`}>
                    {cause.category === "individual"
                      ? t("causeListing.individual")
                      : t("causeListing.organization")}
                  </span>
                  <span
                    className={`my-cause-status-badge ${cause.approved ? "approved" : "pending"}`}
                  >
                    {cause.approved
                      ? t("myCauses.approved")
                      : t("myCauses.pending")}
                  </span>
                </div>

                <div className="cause-card-body">
                  <h3>{cause.name}</h3>
                  <p className="cause-tagline">{cause.tagline}</p>
                  <p className="cause-location">
                    <i className="material-icons">location_on</i>
                    {cause.location}
                  </p>
                </div>

                {cause.approved && (
                  <div className="cause-card-footer">
                    <Link to={`/give-hope/${cause.id}`} className="donate-btn">
                      {t("myCauses.viewLive")}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyCauses;
