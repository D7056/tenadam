import { useRef, useState } from "react";
import "../../css/form.css";
import heroImage from "../../assets/hero-image.png";
import { Link } from "react-router-dom";
import DropDown from "../../components/DropDown";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";



const serviceTypeToCategory: Record<string, string> = {
  "Medicine Dealer": "medicine_dealer",
  "Delivery Man": "delivery_man",
  "Doctor": "doctor",
};

const doctorTypeToCategory: Record<string, string> = {
  "General Practitioner / Family Physician": "general_practitioner",
  "Internist (Internal Medicine)": "internal_medicine",
  "Pediatrician (Child Specialist)": "pediatrician",
  "Geriatrician (Elderly Care)": "geriatrician",
  "General Surgeon": "general_surgeon",
  "Orthopedic Surgeon (Bones & Joints)": "orthopedic_surgeon",
  "Neurosurgeon (Brain & Spine)": "neurosurgeon",
  "Cardiothoracic Surgeon (Heart & Chest)": "cardiothoracic_surgeon",
  "Plastic & Reconstructive Surgeon": "plastic_surgeon",
  "Cardiologist (Heart Specialist)": "cardiologist",
  "Dermatologist (Skin, Hair & Nails)": "dermatologist",
  "Endocrinologist (Hormones & Diabetes)": "endocrinologist",
  "Gastroenterologist (Digestive System)": "gastroenterologist",
  "Hematologist (Blood Disorders)": "hematologist",
  "Nephrologist (Kidney Specialist)": "nephrologist",
  "Neurologist (Brain & Nervous System)": "neurologist",
  "Oncologist (Cancer Specialist)": "oncologist",
  "Pulmonologist (Lungs & Respiratory)": "pulmonologist",
  "Rheumatologist (Autoimmune & Joints)": "rheumatologist",
  "Gynecologist": "gynecologist",
  "Obstetrician (Pregnancy & Childbirth)": "obstetrician",
  "Urologist (Urinary & Male Reproductive)": "urologist",
  "Psychiatrist (Mental Health)": "psychiatrist",
  "Ophthalmologist (Eye Specialist)": "ophthalmologist",
  "ENT Specialist (Otolaryngologist)": "ent_specialist",
  "Dentist / Oral Surgeon": "dentist",
  "Allergist / Immunologist": "allergist",
  "Anesthesiologist": "anesthesiologist",
  "Radiologist (Imaging)": "radiologist",
  "Pathologist (Lab Diagnostics)": "pathologist",
  "Emergency Medicine Specialist": "emergency_physician",
  "Physiatrist (Physical Medicine & Rehab)": "physiatrist",
};

const DOCTOR_TYPE_OPTIONS = Object.keys(doctorTypeToCategory);

function HealthCareProviderRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const serviceType = e.currentTarget.servicetype.value;
    const phoneNumber = e.currentTarget.phone.value;
    const password = e.currentTarget.password.value;
    const firstName = e.currentTarget.firstname.value;
    const lastName = e.currentTarget.lastname.value;
    const email = e.currentTarget.email.value;

    const category = serviceTypeToCategory[serviceType];

    const payload: Record<string, string> = {
      service_type: category,
      phone_number: phoneNumber,
      password: password,
      first_name: firstName,
      last_name: lastName,
      roles: 'provider',
      email: email,
    };

    if (category === "doctor") {
      const doctorType = e.currentTarget.doctorType.value;
      payload.doctor_type = doctorTypeToCategory[doctorType];
    }

    const response = await fetch('http://127.0.0.1:8000/api/register-provider/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      alert(t("auth.registerError"));
      return;
    }

    const data = await response.json();
    localStorage.setItem('tenadam_auth_token', data.token);
    localStorage.setItem('tenadam_provider_role', data.roles);
    localStorage.setItem('roles', data.roles);
    localStorage.setItem('first_name', data.user.first_name);
    localStorage.setItem('last_name', data.user.last_name);
    localStorage.setItem('phone_number', data.user.phone_number);
    localStorage.setItem('service_type', category);
    localStorage.setItem('email', data.user.email);
    localStorage.setItem('tenadam_profile_completed', String(data.profile_completed));

    navigate("/complete-profile");
  };



  const [isVisible, setIsVisible] = useState(false);
  const [serviceType, setServiceType] = useState("");
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
          <p className="auth-eyebrow">{t("auth.providerPortal")}</p>
          <h1>{t("auth.registerAsProviderTitle")}</h1>
          <p className="auth-subtitle">{t("auth.providerRegisterSubtitle")}</p>

          <form className="form" onSubmit={onSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="servicetype">
                {t("auth.serviceType")}
              </label>
              <DropDown
                label="Select a service"
                options={["Medicine Dealer", "Delivery Man", "Doctor"]}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>

            {serviceType === "Doctor" && (
              <div className="field-group">
                <label className="field-label" htmlFor="doctorType">
                  {t("auth.doctorType")}
                </label>
                <DropDown
                  name="doctorType"
                  label={t("auth.selectSpecialty")}
                  options={DOCTOR_TYPE_OPTIONS}
                  required
                />
              </div>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="firstname">
                {t("auth.firstName")}
              </label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="Mayemo"
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
                placeholder="Debela"
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
                placeholder="example@mail.com"
                required={true}
              />
            </div>

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
              {t("auth.submit")}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/doctorlogin" className="auth-footer-primary">
              {t("auth.alreadyHaveAccount")}
            </Link>
            <Link to="/login">{t("auth.newUserRegisterAsPatient")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCareProviderRegister;
