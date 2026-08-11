import { useRef, useState } from "react";
import "../../css/form.css";
import heroImage from "../../assets/hero-image.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


function UserLogin() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: e.currentTarget.phone.value,
        password: e.currentTarget.password.value,
      }),
    });

    if (!response.ok) {
      alert(t("auth.invalidCredentials"));
      return;
    }

    const data = await response.json();
    localStorage.setItem("tenadam_auth_token", data.token);
    localStorage.setItem("first_name", data.first_name);
    localStorage.setItem("last_name", data.last_name);
    localStorage.setItem("phone_number", data.phone_number);
    localStorage.setItem("service_type", data.service_type);
    localStorage.setItem("email", data.email);
    localStorage.setItem("roles", data.roles);
    localStorage.setItem("tenadam_profile_completed", String(data.profile_completed));

    navigate(data.profile_completed ? "/" : "/complete-profile");
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
          <p className="auth-eyebrow">{t("auth.welcomeBack")}</p>
          <h1>{t("auth.logInToAccount")}</h1>
          <p className="auth-subtitle">{t("auth.userLoginSubtitle")}</p>

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
            <Link to="/register" className="auth-footer-primary">
              {t("auth.newHereCreateAccount")}
            </Link>
            <Link to="/doctorlogin">{t("auth.logInAsProvider")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
