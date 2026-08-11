import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/doctor-dashboard.css";
import "../css/form.css";
import { loadDoctorSettings } from "../utils/doctorSettings";

type AvailabilityRange = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
};


type ApiRange = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type ApiPeriod = {
  id: number;
  active_from: string;
  active_until: string | null;
  ranges: ApiRange[];
};

type ApiCustomTime = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  note: string;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const API_BASE = "http://127.0.0.1:8000/api/appointments";

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatClock(time: string): string {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${minuteString} ${suffix}`;
}

function generateSlotTimes(
  startTime: string,
  endTime: string,
  durationMinutes: number,
): string[] {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const slots: string[] = [];

  for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
    slots.push(toTimeString(t));
  }

  return slots;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${localStorage.getItem("tenadam_auth_token")}`,
  };
}

function Availability() {
  const { t } = useTranslation();

  const [periods, setPeriods] = useState<ApiPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState(false);

  const [ranges, setRanges] = useState<AvailabilityRange[]>([]);
  const [activeFrom, setActiveFrom] = useState(todayIso());
  const [activeUntil, setActiveUntil] = useState("");
  const durationMinutes = loadDoctorSettings().durationMinutes;

  const [customTimes, setCustomTimes] = useState<ApiCustomTime[]>([]);
  const [customTimesLoading, setCustomTimesLoading] = useState(true);
  const [customTimesError, setCustomTimesError] = useState(false);
  const [customSaving, setCustomSaving] = useState(false);

  const [day, setDay] = useState(DAYS[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [customDate, setCustomDate] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [customNote, setCustomNote] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPeriods = async () => {
    setPeriodsLoading(true);
    setPeriodsError(false);
    try {
      const response = await fetch(`${API_BASE}/my-availability/`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("failed");
      const data = await response.json();
      setPeriods(data.results ?? data);
    } catch {
      setPeriodsError(true);
    } finally {
      setPeriodsLoading(false);
    }
  };

  const loadCustomTimes = async () => {
    setCustomTimesLoading(true);
    setCustomTimesError(false);
    try {
      const response = await fetch(`${API_BASE}/my-custom-availability/`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("failed");
      const data = await response.json();
      const results: ApiCustomTime[] = data.results ?? data;
      setCustomTimes(
        results.sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            a.start_time.localeCompare(b.start_time),
        ),
      );
    } catch {
      setCustomTimesError(true);
    } finally {
      setCustomTimesLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
    loadCustomTimes();
  }, []);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(timeout);
  }, [saved]);

  const addRange = () => {
    if (!startTime || !endTime || startTime >= endTime) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setRanges((prev) => [...prev, { id, day, startTime, endTime }]);
    setStartTime("");
    setEndTime("");
  };

  const removeRange = (id: string) => {
    setRanges((prev) => prev.filter((range) => range.id !== id));
  };

  const addCustomTime = async () => {
    if (!customDate || !customStart || !customEnd || customStart >= customEnd)
      return;

    setCustomSaving(true);
    try {
      const response = await fetch(`${API_BASE}/custom-availability/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          date: customDate,
          start_time: customStart,
          end_time: customEnd,
          note: customNote.trim(),
        }),
      });

      if (!response.ok) {
        alert(t("availability.saveError"));
        return;
      }

      setCustomDate("");
      setCustomStart("");
      setCustomEnd("");
      setCustomNote("");
      await loadCustomTimes();
    } finally {
      setCustomSaving(false);
    }
  };

  const removeCustomTime = async (id: number) => {
    const response = await fetch(`${API_BASE}/custom-availability/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!response.ok) {
      alert(t("availability.saveError"));
      return;
    }
    setCustomTimes((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ranges.length === 0) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/availability/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          active_from: activeFrom,
          active_until: activeUntil || null,
          ranges: ranges.map((range) => ({
            day_of_week: DAYS.indexOf(range.day),
            start_time: range.startTime,
            end_time: range.endTime,
          })),
        }),
      });

      if (!response.ok) {
        alert(t("availability.saveError"));
        return;
      }

      setRanges([]);
      setActiveFrom(todayIso());
      setActiveUntil("");
      setSaved(true);
      await loadPeriods();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="doctor-dashboard-page content-with-nav">
      <section className="doctor-dashboard-hero">
        <p className="doctor-dashboard-eyebrow">
          {t("doctorDashboard.dashboardEyebrow")}
        </p>
        <h1>{t("availability.title")}</h1>
        
      </section>

      <section className="doctor-dashboard-section">
        <div className="availability-toolbar">
          <Link to="/doctor" className="availability-back-link">
            <i className="material-icons">arrow_back</i>
            {t("availability.backToDashboard")}
          </Link>
        </div>

        <div className="availability-periods">
          <h2 className="availability-periods-title">
            {t("availability.yourPeriods")}
          </h2>

          {periodsLoading ? (
            <p className="availability-empty-text">{t("availability.loading")}</p>
          ) : periodsError ? (
            <p className="availability-generated-warning">
              {t("availability.loadError")}
            </p>
          ) : periods.length === 0 ? (
            <p className="availability-empty-text">
              {t("availability.noPeriodsYet")}
            </p>
          ) : (
            <div className="availability-period-list">
              {periods.map((period) => (
                <div className="availability-period-card" key={period.id}>
                  <div className="availability-period-dates">
                    {formatDateLabel(period.active_from)} –{" "}
                    {period.active_until
                      ? formatDateLabel(period.active_until)
                      : t("availability.ongoing")}
                  </div>
                  <div className="availability-slot-list">
                    {period.ranges.map((range) => {
                      const dayName = DAYS[range.day_of_week];
                      const generated = generateSlotTimes(
                        range.start_time,
                        range.end_time,
                        durationMinutes,
                      );
                      return (
                        <div className="availability-slot-row" key={range.id}>
                          <div className="availability-slot-row-main">
                            <div>
                              <span className="availability-slot-day">
                                {t(`availability.days.${dayName.toLowerCase()}`)}
                              </span>
                              <span className="availability-slot-time">
                                {range.start_time} – {range.end_time}
                              </span>
                            </div>
                          </div>
                          {generated.length > 0 ? (
                            <div className="availability-generated-slots">
                              <span className="availability-generated-label">
                                {t("availability.generatedCount", {
                                  count: generated.length,
                                })}
                              </span>
                              <div className="availability-generated-chips">
                                {generated.map((slot) => (
                                  <span
                                    className="availability-generated-chip"
                                    key={slot}
                                  >
                                    {formatClock(slot)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="availability-generated-warning">
                              {t("availability.noSlotsFit")}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form className="form availability-form" onSubmit={handleSave}>
          <div className="field-group">
            <label className="field-label">
              {t("availability.addPeriod")}
            </label>
            <div className="availability-slot-builder">
              <label className="availability-inline-label">
                {t("availability.activeFrom")}
                <input
                  type="date"
                  className="availability-narrow-input"
                  value={activeFrom}
                  onChange={(e) => setActiveFrom(e.target.value)}
                  required
                />
              </label>
              <label className="availability-inline-label">
                {t("availability.activeUntil")}
                <input
                  type="date"
                  className="availability-narrow-input"
                  min={activeFrom}
                  value={activeUntil}
                  onChange={(e) => setActiveUntil(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t("availability.addSlot")}</label>
            <div className="availability-slot-builder">
              <select
                className="availability-narrow-input"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {t(`availability.days.${d.toLowerCase()}`)}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className="availability-narrow-input"
                aria-label={t("availability.startTime")}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <span className="availability-slot-to">
                {t("availability.to")}
              </span>
              <input
                type="time"
                className="availability-narrow-input"
                aria-label={t("availability.endTime")}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <button
                type="button"
                className="availability-add-btn"
                onClick={addRange}
                disabled={!startTime || !endTime || startTime >= endTime}
              >
                {t("availability.addButton")}
              </button>
            </div>

            {ranges.length > 0 ? (
              <div className="availability-slot-list">
                {ranges.map((range) => {
                  const generated = generateSlotTimes(
                    range.startTime,
                    range.endTime,
                    durationMinutes,
                  );

                  return (
                    <div className="availability-slot-row" key={range.id}>
                      <div className="availability-slot-row-main">
                        <div>
                          <span className="availability-slot-day">
                            {t(`availability.days.${range.day.toLowerCase()}`)}
                          </span>
                          <span className="availability-slot-time">
                            {range.startTime} – {range.endTime}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="availability-icon-btn delete"
                          aria-label={t("availability.removeSlot")}
                          onClick={() => removeRange(range.id)}
                        >
                          <i className="material-icons">delete</i>
                        </button>
                      </div>

                      {generated.length > 0 ? (
                        <div className="availability-generated-slots">
                          <span className="availability-generated-label">
                            {t("availability.generatedCount", {
                              count: generated.length,
                            })}
                          </span>
                          <div className="availability-generated-chips">
                            {generated.map((slot) => (
                              <span
                                className="availability-generated-chip"
                                key={slot}
                              >
                                {formatClock(slot)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="availability-generated-warning">
                          {t("availability.noSlotsFit")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="availability-empty-text">
                {t("availability.noSlotsYet")}
              </p>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">
              {t("availability.customTimes")}
            </label>

            {customTimesLoading ? (
              <p className="availability-empty-text">
                {t("availability.loading")}
              </p>
            ) : customTimesError ? (
              <p className="availability-generated-warning">
                {t("availability.loadError")}
              </p>
            ) : customTimes.length === 0 ? (
              <p className="availability-empty-text">
                {t("availability.noCustomTimesYet")}
              </p>
            ) : (
              <div className="availability-slot-list">
                {customTimes.map((entry) => {
                  const generated = generateSlotTimes(
                    entry.start_time,
                    entry.end_time,
                    durationMinutes,
                  );

                  return (
                    <div className="availability-custom-row" key={entry.id}>
                      <div className="availability-slot-row-main">
                        <div>
                          <span className="availability-slot-day">
                            {formatDateLabel(entry.date)}
                          </span>
                          <span className="availability-slot-time">
                            {entry.start_time} – {entry.end_time}
                            {entry.note ? ` · ${entry.note}` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="availability-icon-btn delete"
                          aria-label={t("availability.removeCustomTime")}
                          onClick={() => removeCustomTime(entry.id)}
                        >
                          <i className="material-icons">delete</i>
                        </button>
                      </div>

                      {generated.length > 0 && (
                        <div className="availability-generated-slots">
                          <span className="availability-generated-label">
                            {t("availability.generatedCount", {
                              count: generated.length,
                            })}
                          </span>
                          <div className="availability-generated-chips">
                            {generated.map((slot) => (
                              <span
                                className="availability-generated-chip"
                                key={slot}
                              >
                                {formatClock(slot)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="availability-slot-builder">
              <input
                type="date"
                className="availability-narrow-input"
                min={todayIso()}
                aria-label={t("availability.customDate")}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              <input
                type="time"
                className="availability-narrow-input"
                aria-label={t("availability.startTime")}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="availability-slot-to">
                {t("availability.to")}
              </span>
              <input
                type="time"
                className="availability-narrow-input"
                aria-label={t("availability.endTime")}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <input
                type="text"
                className="availability-narrow-input availability-note-input"
                aria-label={t("availability.customNote")}
                placeholder={t("availability.customNotePlaceholder")}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
              <button
                type="button"
                className="availability-add-btn"
                onClick={addCustomTime}
                disabled={
                  customSaving ||
                  !customDate ||
                  !customStart ||
                  !customEnd ||
                  customStart >= customEnd
                }
              >
                {t("availability.addButton")}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={saving || ranges.length === 0}
          >
            {t("availability.save")}
          </button>
          {saved && (
            <p className="availability-saved-text">
              <i className="material-icons">check_circle</i>
              {t("availability.saved")}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Availability;
