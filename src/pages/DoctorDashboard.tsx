import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AppointmentContext,
  type AppointmentItem,
} from "../context/appointmentContext";
import "../css/doctor-dashboard.css";

const STATUS_ORDER: Record<AppointmentItem["status"], number> = {
  upcoming: 0,
  completed: 1,
  cancelled: 2,
};

const FILTERS: { key: string; value: "all" | AppointmentItem["status"] }[] = [
  { key: "all", value: "all" },
  { key: "upcoming", value: "upcoming" },
  { key: "completed", value: "completed" },
  { key: "cancelled", value: "cancelled" },
];

function DoctorDashboard() {
  const { t } = useTranslation();
  const appointmentContext = useContext(AppointmentContext);
  const appointments = appointmentContext?.appointments ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | AppointmentItem["status"]
  >("all");

  const upcomingCount = appointments.filter(
    (a) => a.status === "upcoming",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  const visibleAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...appointments]
      .filter(
        (appointment) =>
          activeFilter === "all" || appointment.status === activeFilter,
      )
      .filter(
        (appointment) =>
          !query ||
          appointment.patientName.toLowerCase().includes(query) ||
          appointment.reason.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return `${b.dateKey}T${b.time}`.localeCompare(
          `${a.dateKey}T${a.time}`,
        );
      });
  }, [appointments, searchQuery, activeFilter]);

  return (
    <main className="doctor-dashboard-page content-with-nav">
      <section className="doctor-dashboard-hero">
        <p className="doctor-dashboard-eyebrow">
          {t("doctorDashboard.dashboardEyebrow")}
        </p>
        <h1>{t("doctorDashboard.upcomingAppointments")}</h1>
        <p>{t("doctorDashboard.reviewText")}</p>
        <Link to="/doctor/availability" className="doctor-dashboard-availability-btn">
          <i className="material-icons">event_available</i>
          {t("doctorDashboard.availability")}
        </Link>
      </section>

      <div className="doctor-dashboard-stats">
        <div className="doctor-dashboard-stat-card">
          <span className="doctor-dashboard-stat-value">{upcomingCount}</span>
          <span className="doctor-dashboard-stat-label">
            {t("appointments.status.upcoming")}
          </span>
        </div>
        <div className="doctor-dashboard-stat-card">
          <span className="doctor-dashboard-stat-value">
            {completedCount}
          </span>
          <span className="doctor-dashboard-stat-label">
            {t("appointments.status.completed")}
          </span>
        </div>
        <div className="doctor-dashboard-stat-card">
          <span className="doctor-dashboard-stat-value">
            {cancelledCount}
          </span>
          <span className="doctor-dashboard-stat-label">
            {t("appointments.status.cancelled")}
          </span>
        </div>
      </div>

      <section className="doctor-dashboard-section">
        <div className="doctor-dashboard-toolbar">
          <div className="doctor-dashboard-search-wrapper">
            <i className="material-icons doctor-dashboard-search-icon">
              search
            </i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("doctorDashboard.searchPlaceholder")}
            />
          </div>

          <div className="doctor-dashboard-filter-rail">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`doctor-dashboard-filter-pill${activeFilter === filter.value ? " active" : ""}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {t(`doctorDashboard.filters.${filter.key}`)}
              </button>
            ))}
          </div>
        </div>

        <h2>{t("doctorDashboard.allAppointments")}</h2>

        {visibleAppointments.length === 0 ? (
          <div className="doctor-dashboard-empty">
            <p>
              {appointments.length === 0
                ? t("doctorDashboard.emptyText")
                : t("doctorDashboard.noMatching")}
            </p>
          </div>
        ) : (
          <div className="doctor-dashboard-grid">
            {visibleAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="doctor-appointment-card"
              >
                <div className="doctor-appointment-head">
                  <h3>{appointment.patientName}</h3>
                  <span
                    className={`doctor-appointment-status ${appointment.status}`}
                  >
                    {t(`appointments.status.${appointment.status}`)}
                  </span>
                </div>

                <p className="doctor-appointment-datetime">
                  <i className="material-icons">event</i>
                  {appointment.dateLabel} · {appointment.timeLabel}
                </p>

                <div className="doctor-appointment-meta">
                  <div>
                    <span>{t("appointments.reason")}</span>
                    <strong>{appointment.reason}</strong>
                  </div>
                  <div>
                    <span>{t("appointments.phone")}</span>
                    <strong>{appointment.patientPhone}</strong>
                  </div>
                </div>

                {appointment.reasonNote.trim() && (
                  <p className="doctor-appointment-note">
                    {appointment.reasonNote}
                  </p>
                )}

                {appointment.status === "upcoming" && (
                  <div className="doctor-appointment-actions">
                    <button
                      className="doctor-appointment-action-btn complete"
                      onClick={() =>
                        appointmentContext?.updateAppointmentStatus(
                          appointment.id,
                          "completed",
                        )
                      }
                    >
                      {t("doctorDashboard.markCompleted")}
                    </button>
                    <button
                      className="doctor-appointment-action-btn cancel"
                      onClick={() =>
                        appointmentContext?.updateAppointmentStatus(
                          appointment.id,
                          "cancelled",
                        )
                      }
                    >
                      {t("doctorDashboard.cancel")}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DoctorDashboard;
