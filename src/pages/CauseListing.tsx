import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AvatarImage from "../assets/avatar.png";
import Charity from "../assets/charity.webp";
import "../css/cause-listing.css";

type CauseCategory = "individual" | "organization";

type ApiCause = {
  id: number;
  category: CauseCategory;
  name: string;
  tagline: string;
  description: string;
  location: string;
  goal_amount: string;
  raised_amount: string;
};

type DisplayCause = {
  id: string;
  category: CauseCategory;
  name: string;
  tagline: string;
  location: string;
  image: string;
  goalAmount: number;
  raisedAmount: number;
};

const filters: { key: string; value: CauseCategory | "All" }[] = [
  { key: "all", value: "All" },
  { key: "individuals", value: "individual" },
  { key: "organizations", value: "organization" },
];

export default function CauseListing() {
  const { t } = useTranslation();
  const formatEtb = (amount: number) =>
    t("common.priceLabel", { price: amount.toLocaleString() });
  const [activeFilter, setActiveFilter] = useState<CauseCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [causes, setCauses] = useState<DisplayCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadCauses = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/causes/");
        if (!response.ok) throw new Error("Failed to fetch causes");
        const data = await response.json();
        const results: ApiCause[] = data.results ?? data;

        setCauses(
          results.map((cause) => ({
            id: String(cause.id),
            category: cause.category,
            name: cause.name,
            tagline: cause.tagline,
            location: cause.location,
            image: cause.category === "organization" ? Charity : AvatarImage,
            goalAmount: Number(cause.goal_amount),
            raisedAmount: Number(cause.raised_amount),
          })),
        );
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadCauses();
  }, []);

  const filteredCauses = causes.filter(
    (cause) =>
      (activeFilter === "All" || cause.category === activeFilter) &&
      (cause.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cause.tagline.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <main className="cause-listing-page content-with-nav">
      <section className="cause-listing-hero">
        <div>
          <h1>{t("causeListing.title")}</h1>
          <p>{t("causeListing.subtitle")}</p>

          <div className="cause-search-wrapper">
            <i className="material-icons cause-search-icon">search</i>
            <input
              type="text"
              placeholder={t("causeListing.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="cause-hero-actions">
            <Link to="/submit-cause" className="cause-share-btn">
              <i className="material-icons">add_circle</i>
              {t("causeListing.shareYourCause")}
            </Link>
            <Link to="/my-causes" className="cause-my-submissions-link">
              {t("causeListing.mySubmissions")}
            </Link>
          </div>
        </div>
      </section>

      <section className="cause-filter-rail-container">
        <div className="cause-filter-rail">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`cause-filter-pill${activeFilter === filter.value ? " active" : ""}`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {t(`causeListing.filters.${filter.key}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="cause-grid-container">
        {loading ? (
          <p>{t("causeListing.loading")}</p>
        ) : loadError ? (
          <p>{t("causeListing.loadError")}</p>
        ) : filteredCauses.length === 0 ? (
          <p>{t("causeListing.noCausesYet")}</p>
        ) : (
        <div className="cause-grid">
          {filteredCauses.map((cause) => {
            const percent = Math.min(
              100,
              Math.round((cause.raisedAmount / cause.goalAmount) * 100),
            );

            return (
              <Link
                key={cause.id}
                to={`/give-hope/${cause.id}`}
                className="master-cause-card"
              >
                <div className="cause-card-header">
                  <img
                    src={cause.image}
                    alt={cause.name}
                    className="cause-avatar"
                  />
                  <span className={`cause-category-badge ${cause.category}`}>
                    {cause.category === "individual"
                      ? t("causeListing.individual")
                      : t("causeListing.organization")}
                  </span>
                </div>

                <div className="cause-card-body">
                  <h3>{cause.name}</h3>
                  <p className="cause-tagline">{cause.tagline}</p>
                  <p className="cause-location">
                    <i className="material-icons">location_on</i>
                    {cause.location}
                  </p>

                  <div className="cause-progress-track">
                    <div
                      className="cause-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="cause-progress-labels">
                    <span>
                      <strong>{formatEtb(cause.raisedAmount)}</strong>{" "}
                      {t("causeListing.raised")}
                    </span>
                    <span>
                      {t("causeListing.goalLabel", {
                        percent,
                        goal: formatEtb(cause.goalAmount),
                      })}
                    </span>
                  </div>
                </div>

                <div className="cause-card-footer">
                  <span className="donate-btn">{t("causeListing.donate")}</span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </section>
    </main>
  );
}
