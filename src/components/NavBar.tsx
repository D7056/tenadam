import { Link } from "react-router-dom";
import HeroImage from "../assets/hero-image.png";
import { CartContext } from "../context/cartContext.tsx";
import "../css/navbar.css";
import { useContext, useState, useEffect } from "react";
import AvatarImage from "../assets/avatar.png";
import PopOver from "./PopOver.tsx";
import { AppointmentContext } from "../context/appointmentContext.tsx";
import { DonationContext } from "../context/donationContext.tsx";
import { OrderContext } from "../context/orderContext.tsx";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.tsx";

type NavBarProps = {
  name?: string | null;
  img?: string | typeof AvatarImage;
};
function NavBar({ name, img }: NavBarProps) {
  const { t } = useTranslation();
  const cart = useContext(CartContext);
  const appointments = useContext(AppointmentContext);
  const donations = useContext(DonationContext);
  const orders = useContext(OrderContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = async () => {
    localStorage.removeItem("tenadam_auth_token");
    localStorage.removeItem("tenadam_provider_role");
    localStorage.removeItem("roles");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("phone_number");
    localStorage.removeItem("service_type");
    localStorage.removeItem("email");
    window.location.href = "/";

  };
  if (!name) {
    name = localStorage.getItem("first_name");
  }
  const role = localStorage.getItem("roles");
  const servType = localStorage.getItem("service_type");
  const isGuest = !localStorage.getItem("tenadam_auth_token");

  const getDashboardPath = () => {
    if (role === "user") return "/user";
    if (role === "provider") {
      if (servType === "delivery_man") return "/deliveryman";
      if (servType === "medicine_dealer") return "/medicinedealer";
      return "/doctor";
    }
    return "/"; 
  };

  const dashboard = getDashboardPath();
  const isProviderDashboard =
    dashboard === "/medicinedealer" ||
    dashboard === "/doctor" ||
    dashboard === "/deliveryman";

  if (!isProviderDashboard) {
    return (
      <nav className="navbars">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <Link
              to={`${dashboard}`}
              className="navbar-logo-link"
              onClick={closeMenu}
            >
              <span>
                <img
                  className="navbar-logo-image"
                  src={HeroImage}
                  alt="Tenadam Logo"
                />
              </span>
              {t("nav.logo")}
            </Link>
          </div>
          <button
            type="button"
            className="navbar-hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <i className="material-icons">{menuOpen ? "close" : "menu"}</i>
          </button>
          <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
            <li>
              <Link
                className="navbar-link"
                to={`${dashboard}`}
                onClick={closeMenu}
              >
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link className="navbar-link" to="/about" onClick={closeMenu}>
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link className="navbar-link" to="/contact" onClick={closeMenu}>
                {t("nav.contact")}
              </Link>
            </li>
            <li>
              <Link
                className="navbar-link navbar-badge-link"
                to="/cart"
                onClick={closeMenu}
              >
                <span className="navbar-badge-wrap">
                  <i className="material-icons">shopping_cart</i>

                  {cart && cart.counter > 0 && (
                    <span className="counter">{cart.counter}</span>
                  )}
                </span>
                <span className="navbar-link-label">{t("nav.cart")}</span>
              </Link>
            </li>
            <li>
              <Link
                className="navbar-link navbar-badge-link"
                to="/appointments"
                onClick={closeMenu}
              >
                <span className="navbar-badge-wrap">
                  <i className="material-icons">calendar_month</i>
                  {appointments && appointments.counter > 0 && (
                    <span className="counter">{appointments.counter}</span>
                  )}
                </span>
                <span className="navbar-link-label">
                  {t("nav.appointments")}
                </span>
              </Link>
            </li>
            <li>
              <Link
                className="navbar-link navbar-badge-link"
                to="/donations"
                onClick={closeMenu}
              >
                <span className="navbar-badge-wrap">
                  <i className="material-icons">volunteer_activism</i>
                  {donations && donations.counter > 0 && (
                    <span className="counter">{donations.counter}</span>
                  )}
                </span>
                <span className="navbar-link-label">{t("nav.donations")}</span>
              </Link>
            </li>
            <li>
              <Link
                className="navbar-link navbar-badge-link"
                to="/orders"
                onClick={closeMenu}
              >
                <span className="navbar-badge-wrap">
                  <i className="material-icons">receipt_long</i>
                  {orders && orders.counter > 0 && (
                    <span className="counter">{orders.counter}</span>
                  )}
                </span>
                <span className="navbar-link-label">{t("nav.orders")}</span>
              </Link>
            </li>
            <li>
              <LanguageSwitcher />
            </li>
            <li>
              <PopOver
                trigger={
                  <button type="button" className="profile-trigger-btn">
                    <span className="profile-name">
                      {name || t("nav.guest")}
                    </span>
                    <div
                      className="profile-avatar"
                      style={{ backgroundImage: `url(${img || AvatarImage})` }}
                    />
                    <i className="material-icons profile-chevron">
                      expand_more
                    </i>
                  </button>
                }
                placement="bottom-end"
              >
                <div className="profile-overview">
                  {isGuest ? (
                    <Link to="/login" onClick={closeMenu}>
                      <i className="material-icons">login</i>{" "}
                      {t("auth.logIn")}
                    </Link>
                  ) : (
                    <>
                      <Link to="/profile" onClick={closeMenu}>
                        <i className="material-icons">person</i>{" "}
                        {t("nav.viewProfile")}
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="logout-link"
                      >
                        <i className="material-icons">logout</i>{" "}
                        {t("nav.logout")}
                      </Link>
                    </>
                  )}
                </div>
              </PopOver>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
  if (isProviderDashboard) {
    return (
      <nav className="navbars">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <Link
              to={`${dashboard}`}
              className="navbar-logo-link"
              onClick={closeMenu}
            >
              <span>
                <img
                  className="navbar-logo-image"
                  src={HeroImage}
                  alt="Tenadam Logo"
                />
              </span>
              {t("nav.logo")}
            </Link>
          </div>
          <button
            type="button"
            className="navbar-hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <i className="material-icons">{menuOpen ? "close" : "menu"}</i>
          </button>
          <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
            <li>
              <Link
                className="navbar-link"
                to={`${dashboard}`}
                onClick={closeMenu}
              >
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link className="navbar-link" to="/about" onClick={closeMenu}>
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link className="navbar-link" to="/contact" onClick={closeMenu}>
                {t("nav.contact")}
              </Link>
            </li>

            <li>
              <LanguageSwitcher />
            </li>
            <li>
              <PopOver
                trigger={
                  <button type="button" className="profile-trigger-btn">
                    <span className="profile-name">
                      {name || t("nav.guest")}
                    </span>
                    <div
                      className="profile-avatar"
                      style={{ backgroundImage: `url(${img || AvatarImage})` }}
                    />
                    <i className="material-icons profile-chevron">
                      expand_more
                    </i>
                  </button>
                }
                placement="bottom-end"
              >
                <div className="profile-overview">
                  <Link to="/profile" onClick={closeMenu}>
                    <i className="material-icons">person</i>{" "}
                    {t("nav.viewProfile")}
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="logout-link"
                  >
                    <i className="material-icons">logout</i> {t("nav.logout")}
                  </Link>
                </div>
              </PopOver>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}


export default NavBar;
