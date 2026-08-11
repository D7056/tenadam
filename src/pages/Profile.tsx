import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AvatarImage from "../assets/avatar.png";
import "../css/profile.css";
import {
  loadDoctorSettings,
  saveDoctorSettings,
} from "../utils/doctorSettings";

type EditableField = "name" | "email" | "phone_number";
const DURATIONS = [15, 30, 45, 60];
type ProfileRecord = {
  role: "user" | "provider";
  name: string;
  email: string | null;
  phone_number: string | null;
  serviceType: string | null;
};

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(
    null,
  );
  const [draftValue, setDraftValue] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [durationMinutes, setDurationMinutes] = useState(
    () => loadDoctorSettings().durationMinutes,
  );
  const [feeEnabled, setFeeEnabled] = useState(
    () => loadDoctorSettings().feeEnabled,
  );
  const [feeAmount, setFeeAmount] = useState(
    () => loadDoctorSettings().feeAmount,
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    loadProfileFromStorage();
    setAvatarUrl(localStorage.getItem("avatar_url"));
  }, []);

  useEffect(() => {
    if (!settingsSaved) return;
    const timeout = setTimeout(() => setSettingsSaved(false), 2500);
    return () => clearTimeout(timeout);
  }, [settingsSaved]);

 const handleSaveSettings = async () => {
  const response = await fetch(
    "http://127.0.0.1:8000/api/appointments/availability/settings",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("tenadam_auth_token")}`,
      },
      body: JSON.stringify({
        duration_minutes: durationMinutes,
        fee_enabled: feeEnabled,
        fee_amount: feeAmount,
      }),
    },
  );

  if (!response.ok) {
    alert(t("profile.settingsSaveError"));
    return;
  }

  saveDoctorSettings({ durationMinutes, feeEnabled, feeAmount });
  setSettingsSaved(true);
};

  const loadProfileFromStorage = () => {
    const roles = localStorage.getItem("roles");
    const first_name = localStorage.getItem("first_name");
    const last_name = localStorage.getItem("last_name");
    const email = localStorage.getItem("email");
    const phone_number = localStorage.getItem("phone_number");
    const service_type = localStorage.getItem("service_type");

    if (!roles || !first_name) {
      setLoading(false);
      return;
    }

    setProfile({
      role: roles === "provider" ? "provider" : "user",
      name: [first_name, last_name].filter(Boolean).join(" "),
      email: email,
      phone_number: phone_number,
      serviceType: service_type,
    });
    setLoading(false);
  };
  const startEdit = (field: EditableField, currentValue: string | null) => {
    setEditingField(field);
    setDraftValue(currentValue ?? "");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue("");
  };

  const toggleEditMode = () => {
    cancelEdit();
    setEditMode((prev) => !prev);
  };

  const saveEdit = async () => {
    if (!editingField || !profile) return;
    const value = draftValue.trim();

    const payload =
      editingField === "name"
        ? (() => {
            const [firstName, ...rest] = value.split(/\s+/).filter(Boolean);
            return { first_name: firstName ?? "", last_name: rest.join(" ") };
          })()
        : { [editingField]: value };

    const response = await fetch("http://127.0.0.1:8000/api/edit/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("tenadam_auth_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert(t("profile.updateError"));
      return;
    }

    if (editingField === "name") {
      localStorage.setItem("first_name", payload.first_name ?? "");
      localStorage.setItem("last_name", payload.last_name ?? "");
      setProfile({ ...profile, name: value });
    } else {
      localStorage.setItem(editingField, value);
      setProfile({ ...profile, [editingField]: value });
    }

    setEditingField(null);
    setDraftValue("");
  };
  const triggerAvatarPick = () => avatarInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem("avatar_url", dataUrl);
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("tenadam_auth_token");


    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/api/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
      } catch (error) {
        console.error("Failed to invalidate token on server:", error);
      }
    }

    localStorage.removeItem("tenadam_auth_token");
    localStorage.removeItem("roles");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("phone_number");
    localStorage.removeItem("service_type");
    localStorage.removeItem("email");

 
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main className="profile-page content-with-nav">
        <div className="profile-inner">
          <div className="profile-card">
            <p>{t("profile.loading")}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page content-with-nav">
        <div className="profile-inner">
          <div className="profile-card">
            <img
              className="profile-avatar-large"
              src={AvatarImage}
              alt={t("nav.guest")}
            />
            <h1>{t("profile.guestTitle")}</h1>
            <p className="profile-lead">{t("profile.guestLead")}</p>
            <div className="profile-guest-actions">
              <Link className="profile-btn-primary" to="/login">
                {t("profile.logIn")}
              </Link>
              <Link className="profile-btn-secondary" to="/register">
                {t("profile.createAccount")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page content-with-nav">
      <div className="profile-inner">
        <div className="profile-card">
          <button
            type="button"
            className="profile-edit-toggle"
            onClick={toggleEditMode}
          >
            <i className="material-icons">{editMode ? "check" : "edit"}</i>
            {editMode ? t("profile.done") : t("profile.editProfile")}
          </button>

          <div className="profile-avatar-wrap">
            <img
              className="profile-avatar-large"
              src={avatarUrl || AvatarImage}
              alt={profile.name || t("profile.title")}
            />
            {editMode && (
              <button
                type="button"
                className="profile-avatar-edit-btn"
                aria-label={t("profile.editAvatar")}
                onClick={triggerAvatarPick}
              >
                <i className="material-icons">photo_camera</i>
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
          <div className="profile-name-row">
            {editingField === "name" ? (
              <input
                className="profile-name-input"
                type="text"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                autoFocus
              />
            ) : (
              <h1>{profile.name || t("profile.yourAccount")}</h1>
            )}
            {editMode && (
              <div className="profile-detail-actions">
                {editingField === "name" ? (
                  <>
                    <button
                      type="button"
                      className="profile-edit-icon-btn"
                      aria-label={t("profile.save")}
                      onClick={saveEdit}
                    >
                      <i className="material-icons">check</i>
                    </button>
                    <button
                      type="button"
                      className="profile-edit-icon-btn"
                      aria-label={t("profile.cancel")}
                      onClick={cancelEdit}
                    >
                      <i className="material-icons">close</i>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="profile-edit-icon-btn"
                    aria-label={t("profile.editName")}
                    onClick={() => startEdit("name", profile.name)}
                  >
                    <i className="material-icons">edit</i>
                  </button>
                )}
              </div>
            )}
          </div>

          <span className="profile-role-badge">
            {profile.role === "provider"
              ? profile.serviceType?.replace("_", " ").toUpperCase() || t("profile.provider")
              : t("profile.patient")}
          </span>

          <div className="profile-detail-grid">
            {profile.email && (
              <div className="profile-detail-row">
                <i className="material-icons">email</i>
                <div className="profile-detail-main">
                  <span>{t("profile.email")}</span>
                  {editingField === "email" ? (
                    <input
                      className="profile-detail-input"
                      type="email"
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <strong>{profile.email}</strong>
                  )}
                </div>
                {editMode && (
                  <div className="profile-detail-actions">
                    {editingField === "email" ? (
                      <>
                        <button
                          type="button"
                          className="profile-edit-icon-btn"
                          aria-label={t("profile.save")}
                          onClick={saveEdit}
                        >
                          <i className="material-icons">check</i>
                        </button>
                        <button
                          type="button"
                          className="profile-edit-icon-btn"
                          aria-label={t("profile.cancel")}
                          onClick={cancelEdit}
                        >
                          <i className="material-icons">close</i>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="profile-edit-icon-btn"
                        aria-label={t("profile.editEmail")}
                        onClick={() => startEdit("email", profile.email)}
                      >
                        <i className="material-icons">edit</i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {profile.phone_number && (
              <div className="profile-detail-row">
                <i className="material-icons">phone</i>
                <div className="profile-detail-main">
                  <span>{t("appointments.phone")}</span>
                  {editingField === "phone_number" ? (
                    <input
                      className="profile-detail-input"
                      type="tel"
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <strong>{profile.phone_number}</strong>
                  )}
                </div>
                {editMode && (
                  <div className="profile-detail-actions">
                    {editingField === "phone_number" ? (
                      <>
                        <button
                          type="button"
                          className="profile-edit-icon-btn"
                          aria-label={t("profile.save")}
                          onClick={saveEdit}
                        >
                          <i className="material-icons">check</i>
                        </button>
                        <button
                          type="button"
                          className="profile-edit-icon-btn"
                          aria-label={t("profile.cancel")}
                          onClick={cancelEdit}
                        >
                          <i className="material-icons">close</i>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="profile-edit-icon-btn"
                        aria-label={t("profile.editPhone")}
                        onClick={() =>
                          startEdit("phone_number", profile.phone_number)
                        }
                      >
                        <i className="material-icons">edit</i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {profile.role === "provider" && profile.serviceType === "doctor" && (
            <div className="profile-doctor-settings">
              <h2 className="profile-section-title">
                {t("profile.doctorSettingsTitle")}
              </h2>

              <div className="profile-detail-row">
                <i className="material-icons">schedule</i>
                <div className="profile-detail-main">
                  <span>{t("availability.duration")}</span>
                  <select
                    className="profile-settings-select"
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(Number(e.target.value))
                    }
                  >
                    {DURATIONS.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {t("availability.durationOption", { minutes })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="profile-detail-row">
                <i className="material-icons">payments</i>
                <div className="profile-detail-main">
                  <label className="profile-fee-toggle">
                    <input
                      type="checkbox"
                      checked={feeEnabled}
                      onChange={(e) => setFeeEnabled(e.target.checked)}
                    />
                    {t("availability.requireFee")}
                  </label>
                  {feeEnabled && (
                    <input
                      className="profile-detail-input profile-fee-input"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder={t("availability.feeAmount")}
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      required={feeEnabled}
                    />
                  )}
                </div>
              </div>

              <div className="profile-guest-actions">
                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={handleSaveSettings}
                >
                  {t("profile.save")}
                </button>
              </div>
              {settingsSaved && (
                <p className="profile-settings-saved">
                  <i className="material-icons">check_circle</i>
                  {t("profile.settingsSaved")}
                </p>
              )}
            </div>
          )}

          <div className="profile-guest-actions">
            <button className="profile-btn-secondary" onClick={handleLogout}>
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}