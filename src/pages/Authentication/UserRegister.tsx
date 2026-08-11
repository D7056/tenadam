import { useRef, useState, } from "react";
import "../../css/form.css";
import heroImage from "../../assets/hero-image.png";
import { Link, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";



function UserRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const phoneNumber = e.currentTarget.telephone.value;
    const password = e.currentTarget.password.value;
    const firstName = e.currentTarget.firstname.value;
    const lastName = e.currentTarget.lastname.value;
    
    const response= await fetch('http://127.0.0.1:8000/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
       
        phone_number: phoneNumber,
        password: password,
        first_name: firstName,
        last_name: lastName,
        roles:'customer',
        email:email,

      }),
    })

    if (!response.ok) {
      alert(t("auth.registerError"));
      return;
    }

    const data = await response.json();
    localStorage.setItem('tenadam_auth_token', data.token);
    localStorage.setItem('tenadam_user_role', data.roles);
    localStorage.setItem('roles', data.roles);
    localStorage.setItem('first_name', data.first_name);
    localStorage.setItem('last_name', data.last_name);
    localStorage.setItem('phone_number', data.phone_number);
    localStorage.setItem('email', data.email);
    localStorage.setItem('tenadam_profile_completed', String(data.profile_completed));

    navigate('/complete-profile');
    


    
  };

  const [isVisible, setIsVisible] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
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
          <p className="auth-eyebrow">{t("auth.createAccount")}</p>
          <h1>{t("auth.joinTenadam")}</h1>
          <p className="auth-subtitle">{t("auth.userRegisterSubtitle")}</p>

          <form className="form" onSubmit={onSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="firstname">
                {t("auth.firstName")}
              </label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="Dararcho"
                required={true}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="lastname">
                {t("auth.lastName")}
              </label>
              <input
                id="lastname"
                type="text"
                name="lastname"
                placeholder="Elias"
                required={true}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="email">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required={true}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="telephone">
                {t("appointment.phoneNumber")}
              </label>
              <div className="tel-field auth-input-shell">
                <span className="tel-prefix">+251</span>
                <input
                  id="telephone"
                  type="tel"
                  name="telephone"
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
                  placeholder={t("auth.createPassword")}
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
              {t("auth.register")}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-footer-primary">
              {t("auth.alreadyHaveAccount")}
            </Link>
            <Link to="/doctorregister">{t("auth.registerAsProvider")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;
