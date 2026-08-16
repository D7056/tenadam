import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AvatarImage from "../assets/avatar.png";
import "../css/doctor-listing.css";

type ApiDoctor = {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  clinic: string;
  fee_enabled: boolean;
  fee_amount: string | null;
};

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  image: string;
  feeEnabled: boolean;
  feeAmount: number | null;
};

export default function DoctorListing() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/providers/doctors/",
        );
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        const results: ApiDoctor[] = data.results ?? data;

        setDoctors(
          results.map((doc) => ({
            id: doc.id,
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialty: doc.specialty,
            clinic: doc.clinic,
            image: AvatarImage,
            feeEnabled: doc.fee_enabled,
            feeAmount: doc.fee_amount ? Number(doc.fee_amount) : null,
          })),
        );
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const specialties = [
    "All",
    ...Array.from(new Set(doctors.map((doc) => doc.specialty))),
  ];

  const filteredDoctors = doctors.filter(
    (doc) =>
      (activeFilter === "All" || doc.specialty === activeFilter) &&
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="listing-page content-with-nav">
      {/* Search & Hero Section */}
      <section className="listing-hero">
        <div className="listing-hero-content">
          <h1>{t("doctorListing.heroTitle")}</h1>
          <p>{t("doctorListing.heroSubtitle")}</p>

          <div className="search-bar-wrapper">
            <i className="material-icons search-icon">search</i>
            <input
              type="text"
              placeholder={t("doctorListing.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Filter Rail */}
      {specialties.length > 1 && (
        <section className="filter-rail-container">
          <div className="filter-rail">
            {specialties.map((spec) => (
              <button
                key={spec}
                type="button"
                className={`filter-pill ${activeFilter === spec ? "active" : ""}`}
                onClick={() => setActiveFilter(spec)}
              >
                {spec === "All" ? t("doctorListing.specialties.all") : spec}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Doctor Grid */}
      <section className="doctor-grid-container">
        {loading ? (
          <p>{t("doctorListing.loading")}</p>
        ) : loadError ? (
          <p>{t("doctorListing.loadError")}</p>
        ) : filteredDoctors.length === 0 ? (
          <p>{t("doctorListing.noDoctorsYet")}</p>
        ) : (
          <div className="doctor-grid">
            {filteredDoctors.map((doctor) => (
              <Link
                key={doctor.id}
                to={`/book/${doctor.id}`}
                className="master-doctor-card"
              >
                <div className="card-header">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="card-avatar"
                  />
                </div>

                <div className="card-body">
                  <h3>{doctor.name}</h3>
                  <p className="specialty-text">{doctor.specialty}</p>
                  <p className="clinic-text">
                    <i className="material-icons">location_on</i>{" "}
                    {doctor.clinic}
                  </p>
                </div>

                <div className="card-footer">
                  {doctor.feeEnabled && doctor.feeAmount != null && (
                    <div className="availability">
                      <span className="avail-label">
                        {t("doctorListing.bookingFee")}
                      </span>
                      <span className="avail-time">
                        {t("common.priceLabel", {
                          price: doctor.feeAmount.toFixed(2),
                        })}
                      </span>
                    </div>
                  )}
                  <span className="book-btn">{t("doctorListing.book")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
