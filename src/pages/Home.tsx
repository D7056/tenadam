import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Cards from "../components/Cards";
import MedicineImage from "../assets/medicine.jpeg";
import Appointment from "../assets/appointment.jpg";
import Charity from "../assets/charity.webp";
import { Link } from "react-router-dom";
import { CartContext } from "../context/cartContext";
import { AppointmentContext } from "../context/appointmentContext";

import "../css/Home.css";

function Home() {
  const { t } = useTranslation();
  const cart = useContext(CartContext);
  const appointmentContext = useContext(AppointmentContext);

  const cartItemCount = cart?.counter ?? 0;
  const hasCartItems = cartItemCount > 0;

  const nextAppointment = useMemo(() => {
    const upcoming = (appointmentContext?.appointments ?? []).filter(
      (appointment) => appointment.status === "upcoming",
    );
    return [...upcoming].sort((left, right) =>
      `${left.dateKey}T${left.time}`.localeCompare(
        `${right.dateKey}T${right.time}`,
      ),
    )[0];
  }, [appointmentContext?.appointments]);

  const hasNotifications = hasCartItems || !!nextAppointment;

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          
          <div className="hero-eyebrow"><h1>{t("home.heroTitle")}</h1></div>
          <p className="hero-text">{t("home.heroText")}</p>

          <div className="hero-actions">
            <Link className="hero-action primary" to="/medicine">
              {t("home.shopMedicine")}
            </Link>
            <Link className="hero-action secondary" to="/doctorlisting">
              {t("home.bookAppointment")}
            </Link>
          </div>

          <div className="hero-badges">
            <span>{t("home.badgeTrusted")}</span>
            <span>{t("home.badgeMobile")}</span>
            <span>{t("home.badgeCommunity")}</span>
          </div>
        </div>

        <div className="hero-panel">
          {hasCartItems && (
            <Link to="/cart" className="hero-panel-card stat-card">
              <span className="stat-value">
                {t("home.cartItemCount", { count: cartItemCount })}
              </span>
              <span className="stat-label">
                {t("home.cartLabel", { total: cart!.total.toFixed(0) })}
              </span>
            </Link>
          )}

          {nextAppointment && (
            <Link to="/appointments" className="hero-panel-card stat-card">
              <span className="stat-value">{nextAppointment.timeLabel}</span>
              <span className="stat-label">
                {t("home.nextAppointmentLabel", {
                  date: nextAppointment.dateLabel,
                  doctor: nextAppointment.doctorName,
                })}
              </span>
            </Link>
          )}

          {!hasNotifications && (
            <div className="hero-panel-card stat-card">
              <span className="stat-value">24/7</span>
              <span className="stat-label">{t("home.browseAnytime")}</span>
            </div>
          )}
        </div>

        <div className="home-feature-rail">
          <div className="section-heading compact">
            <div>
              <p className="section-eyebrow">{t("home.popularActions")}</p>
              <h2>{t("home.choosePath")}</h2>
            </div>
          </div>

          <div className="menu-container-home">
            <div className="home-grid">
              <Cards
                title={t("home.buyMedicineTitle")}
                description={t("home.buyMedicineDesc")}
                buttons={[
                  {
                    text: t("home.shopNow"),
                    link: "/medicine",
                    effects: undefined,
                  },
                ]}
                image={MedicineImage}
                hideReadMore
              />
              <Cards
                title={t("home.bookApptTitle")}
                description={t("home.bookApptDesc")}
                buttons={[
                  {
                    text: t("home.bookNow"),
                    link: "/doctorlisting",
                    effects: undefined,
                  },
                ]}
                image={Appointment}
                hideReadMore
              />
              <Cards
                title={t("home.supportCauseTitle")}
                description={t("home.supportCauseDesc")}
                buttons={[
                  {
                    text: t("home.giveHope"),
                    link: "/give-hope",
                    effects: undefined,
                  },
                ]}
                image={Charity}
                hideReadMore
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
