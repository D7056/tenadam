import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppointmentContext,
  getDisplayStatus,
} from "../context/appointmentContext";
import "../css/appointments.css";

function Appointments() {
  const { t } = useTranslation();
  const appointmentContext = useContext(AppointmentContext);
  const appointments = appointmentContext?.appointments ?? [];

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((left, right) => {
        const leftStamp = `${left.dateKey}T${left.time}`;
        const rightStamp = `${right.dateKey}T${right.time}`;
        return rightStamp.localeCompare(leftStamp);
      }),
    [appointments],
  );

  const upcomingCount = appointments.filter(
    (appointment) => getDisplayStatus(appointment) === "upcoming",
  ).length;

  return (
    <main className="appointments-page container content-with-nav">
      <section className="appointments-hero">
        <div className="appointments-copy">
          <p className="appointments-eyebrow">{t("appointments.myAppointments")}</p>
          <h1>{t("appointments.heroTitle")}</h1>
          <p className="appointments-text">{t("appointments.heroText")}</p>
        </div>

        <div className="appointments-stats">
          <div className="appointments-stat-card">
            <span className="appointments-stat-value">
              {appointments.length}
            </span>
            <span className="appointments-stat-label">
              {t("appointments.totalBooked")}
            </span>
          </div>
          <div className="appointments-stat-card">
            <span className="appointments-stat-value">{upcomingCount}</span>
            <span className="appointments-stat-label">
              {t("appointments.upcoming")}
            </span>
          </div>
        </div>
      </section>

      <section className="appointments-section">
        <div className="appointments-header">
          <div>
            <p className="section-label">{t("appointments.listLabel")}</p>
            <h2>{t("appointments.allEntries")}</h2>
          </div>
          <Link className="appointments-link" to="/doctorlisting">
            {t("appointments.bookNew")}
          </Link>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="appointments-empty">
            <h3>{t("appointments.emptyTitle")}</h3>
            <p>{t("appointments.emptyText")}</p>
            <Link className="appointments-link" to="/appointment">
              {t("appointments.scheduleNow")}
            </Link>
          </div>
        ) : (
          <div className="appointments-grid">
            {sortedAppointments.map((appointment) => (
              <article key={appointment.id} className="appointment-card">
                <div className="appointment-card-head">
                  <div>
                    <p className="appointment-doctor">
                      {appointment.doctorName}
                    </p>
                    <h3>{appointment.specialty}</h3>
                  </div>
                  <span className="appointment-status">
                    {t(`appointments.status.${getDisplayStatus(appointment)}`)}
                  </span>
                </div>

                <p className="appointment-clinic">{appointment.clinic}</p>

                <div className="appointment-meta">
                  <div>
                    <span>{t("appointments.date")}</span>
                    <strong>{appointment.dateLabel}</strong>
                  </div>
                  <div>
                    <span>{t("appointments.time")}</span>
                    <strong>{appointment.timeLabel}</strong>
                  </div>
                  <div>
                    <span>{t("appointments.patient")}</span>
                    <strong>{appointment.patientName}</strong>
                  </div>
                  <div>
                    <span>{t("appointments.phone")}</span>
                    <strong>{appointment.patientPhone}</strong>
                  </div>
                </div>

                <div className="appointment-note">
                  <span>{t("appointments.reason")}</span>
                  <p>{appointment.reason}</p>
                  {appointment.reasonNote.trim() && (
                    <p>{appointment.reasonNote}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Appointments;
