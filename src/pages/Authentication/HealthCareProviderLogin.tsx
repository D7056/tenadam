import { useRef, useState } from "react";
import "../../css/form.css";
import heroImage from "../../assets/hero-image.png";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function HealthCareProviderLogin() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneNumber = e.currentTarget.phone.value
    const password = e.currentTarget.password.value;

    const response= await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone_number:phoneNumber, password:password }),
    });

    if (!response.ok) {
      alert(t("auth.invalidCredentials"));
      return;
    }

    const data = await response.json();
    localStorage.setItem('tenadam_auth_token', data.token);
    localStorage.setItem('tenadam_provider_role', data.roles);
    localStorage.setItem('roles', data.roles);
    localStorage.setItem('first_name', data.first_name);
    localStorage.setItem('last_name', data.last_name);
    localStorage.setItem('phone_number', data.phone_number);
    localStorage.setItem('service_type', data.service_type);
    localStorage.setItem('email', data.email);
    localStorage.setItem('tenadam_profile_completed', String(data.profile_completed));

    if (!data.profile_completed) {
      navigate("/complete-profile");
    } else if (data.service_type === "delivery_man") {
      navigate("/deliveryman");
    } else if (data.service_type === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/medicinedealer");
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    passwordRef.current?.focus();
    setIsVisible((prev: boolean) => !prev);
  };
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-logo-link">
          <img src={heroImage} alt="Tenadam" className="hero-image" />
        </Link>

        <div className="auth-card">
          <p className="auth-eyebrow">{t("auth.providerPortal")}</p>
          <h1>{t("auth.providerLogIn")}</h1>
          <p className="auth-subtitle">{t("auth.providerLoginSubtitle")}</p>

          <form className="form" onSubmit={onSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="phone">
                {t("appointment.phoneNumber")}
              </label>
              <div className="tel-field auth-input-shell">
                <span className="tel-prefix">+251</span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="9xx xxx xxx"
                  required={true}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                {t("auth.password")}
              </label>
              <div className="password-field auth-input-shell">
                <input
                  id="password"
                  type={isVisible ? "text" : "password"}
                  name="password"
                  placeholder={t("auth.enterPassword")}
                  required={true}
                  ref={passwordRef}
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={t("auth.showPassword")}
                  onClick={handleVisibilityToggle}
                >
                  <i className="material-icons">
                    {isVisible ? "visibility_off" : "visibility"}
                  </i>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit">
              {t("auth.logIn")}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/forgotpassword">{t("auth.forgotPassword")}</Link>
            <Link to="/doctorregister" className="auth-footer-primary">
              {t("auth.newProviderRegister")}
            </Link>
            <Link to="/login">{t("auth.logInAsPatient")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCareProviderLogin;
