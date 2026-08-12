import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AvatarImage from "../assets/avatar.png";
import { AppointmentContext } from "../context/appointmentContext";
import "../css/appointment.css";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  image: string;
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

type BookedSlot = {
  date: string;
  start_time: string;
};

type ApiCustomTime = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  note: string;
};

const reasons = [
  "General consultation",
  "Follow-up visit",
  "New symptoms",
  "Test results review",
  "Prescription renewal",
  "Vaccination / preventive care",
];

const reasonKeys: Record<string, string> = {
  "General consultation": "generalConsultation",
  "Follow-up visit": "followUpVisit",
  "New symptoms": "newSymptoms",
  "Test results review": "testResultsReview",
  "Prescription renewal": "prescriptionRenewal",
  "Vaccination / preventive care": "vaccination",
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfWeek(date: Date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + offset);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Returns a Monday-start grid of the given month, padded with `null` so
// every row has 7 cells.
function buildMonthGrid(monthDate: Date): (Date | null)[] {
  const first = startOfMonth(monthDate);
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekdayOffset =
    first.getDay() === 0 ? 6 : first.getDay() - 1;

  const cells: (Date | null)[] = Array(firstWeekdayOffset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatClock(time: string) {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${minuteString} ${suffix}`;
}

function getDoctorById(doctorsList: Doctor[], doctorId: string) {
  return doctorsList.find((doctor) => doctor.id === doctorId) ?? doctorsList[0];
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeString(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function generateSlotTimes(
  startTime: string,
  endTime: string,
  durationMinutes: number,
) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const slots: string[] = [];

  for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
    slots.push(toTimeString(t));
  }

  return slots;
}



function jsWeekdayToBackend(date: Date) {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getSlotsForDate(
  date: Date,
  periods: ApiPeriod[],
  durationMinutes: number,
  bookedSlots: BookedSlot[],
  customTimes: ApiCustomTime[],
) {
  const dateKey = formatDateKey(date);
  const weekday = jsWeekdayToBackend(date);

  const bookedTimes = new Set(
    bookedSlots
      .filter((slot) => slot.date === dateKey)
      .map((slot) => slot.start_time.slice(0, 5)),
  );

  const slots = new Set<string>();
  for (const period of periods) {
    if (period.active_from > dateKey) continue;
    if (period.active_until && period.active_until < dateKey) continue;

    for (const range of period.ranges) {
      if (range.day_of_week !== weekday) continue;
      for (const slot of generateSlotTimes(
        range.start_time,
        range.end_time,
        durationMinutes,
      )) {
        if (!bookedTimes.has(slot)) {
          slots.add(slot);
        }
      }
    }
  }

  for (const custom of customTimes) {
    if (custom.date !== dateKey) continue;
    for (const slot of generateSlotTimes(
      custom.start_time,
      custom.end_time,
      durationMinutes,
    )) {
      if (!bookedTimes.has(slot)) {
        slots.add(slot);
      }
    }
  }

  return Array.from(slots).sort();
}

function findEarliestOpenDate(
  periods: ApiPeriod[],
  durationMinutes: number,
  bookedSlots: BookedSlot[],
  customTimes: ApiCustomTime[],
  horizonDays = 180,
): Date | null {
  const today = new Date();
  for (let i = 0; i < horizonDays; i++) {
    const candidate = addDays(today, i);
    if (
      getSlotsForDate(
        candidate,
        periods,
        durationMinutes,
        bookedSlots,
        customTimes,
      ).length > 0
    ) {
      return candidate;
    }
  }
  return null;
}

export default function Appointment() {
  const { t } = useTranslation();
  const reasonLabel = (item: string) =>
    t(`appointment.reasons.${reasonKeys[item] ?? "generalConsultation"}`);
  const appointmentContext = useContext(AppointmentContext);
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState(reasons[0]);
  const [reasonNote, setReasonNote] = useState("");
  const [patientName, setPatientName] = useState(() => {
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    return [firstName, lastName].filter(Boolean).join(" ");
  });
  const [patientPhone, setPatientPhone] = useState(
    () => localStorage.getItem("phone_number") ?? "",
  );
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [periods, setPeriods] = useState<ApiPeriod[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [customTimes, setCustomTimes] = useState<ApiCustomTime[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const calendarRef = useRef<HTMLDivElement>(null);
  const selectedDoctor = getDoctorById(doctors, selectedDoctorId);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekAnchor, index)),
    [weekAnchor],
  );
  const unavailableDates = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    const set = new Set<string>();
    for (const date of weekDays) {
      const dateKey = formatDateKey(date);
      if (
        dateKey < todayKey ||
        getSlotsForDate(
          date,
          periods,
          durationMinutes,
          bookedSlots,
          customTimes,
        ).length === 0
      ) {
        set.add(dateKey);
      }
    }
    return set;
  }, [weekDays, periods, durationMinutes, bookedSlots, customTimes]);
  const selectedDate = selectedDateKey
    ? parseDateKey(selectedDateKey)
    : weekDays[0];
  const availableSlots = useMemo(
    () =>
      getSlotsForDate(
        selectedDate,
        periods,
        durationMinutes,
        bookedSlots,
        customTimes,
      ),
    [selectedDate, periods, durationMinutes, bookedSlots, customTimes],
  );

  useEffect(() => {
    const loadDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/providers/doctors/",
        );
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        const results = data.results ?? data;

        const mapped: Doctor[] = results.map(
          (doc: {
            id: number;
            first_name: string;
            last_name: string;
            specialty: string;
            clinic: string;
          }) => ({
            id: String(doc.id),
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialty: doc.specialty,
            clinic: doc.clinic,
            image: AvatarImage,
          }),
        );

        setDoctors(mapped);
        const matched = mapped.find((d) => d.id === doctorId);
        setSelectedDoctorId(matched ? matched.id : (mapped[0]?.id ?? ""));
      } catch {
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    loadDoctors();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDoctorId) return;

    const loadSchedule = async () => {
      setScheduleLoading(true);
      setSelectedDateKey("");
      setSelectedTime("");
      try {
        const today = formatDateKey(new Date());
        const sixMonthsOut = formatDateKey(addDays(new Date(), 180));

        const [availabilityRes, bookedRes] = await Promise.all([
          fetch(
            `http://127.0.0.1:8000/api/appointments/doctors/${selectedDoctorId}/availability/`,
          ),
          fetch(
            `http://127.0.0.1:8000/api/appointments/doctors/${selectedDoctorId}/booked-slots/?from=${today}&to=${sixMonthsOut}`,
          ),
        ]);

        const availabilityData = availabilityRes.ok
          ? await availabilityRes.json()
          : null;
        const nextPeriods: ApiPeriod[] = availabilityData?.periods ?? [];
        const nextDuration: number = availabilityData?.duration_minutes ?? 30;
        const nextCustomTimes: ApiCustomTime[] =
          availabilityData?.custom_times ?? [];
        const nextBooked: BookedSlot[] = bookedRes.ok
          ? await bookedRes.json()
          : [];

        setPeriods(nextPeriods);
        setDurationMinutes(nextDuration);
        setBookedSlots(nextBooked);
        setCustomTimes(nextCustomTimes);

        const earliest = findEarliestOpenDate(
          nextPeriods,
          nextDuration,
          nextBooked,
          nextCustomTimes,
        );
        if (earliest) {
          setWeekAnchor(startOfWeek(earliest));
          setSelectedDateKey(formatDateKey(earliest));
        } else {
          setWeekAnchor(startOfWeek(new Date()));
        }
      } catch {
        setPeriods([]);
        setBookedSlots([]);
        setCustomTimes([]);
      } finally {
        setScheduleLoading(false);
      }
    };

    loadSchedule();
  }, [selectedDoctorId]);

  useEffect(() => {
    if (!selectedDateKey) {
      return;
    }

    const nextSlots = getSlotsForDate(
      parseDateKey(selectedDateKey),
      periods,
      durationMinutes,
      bookedSlots,
      customTimes,
    );
    if (!nextSlots.includes(selectedTime)) {
      setSelectedTime(nextSlots[0] ?? "");
    }
  }, [
    selectedDateKey,
    selectedTime,
    periods,
    durationMinutes,
    bookedSlots,
    customTimes,
  ]);

  useEffect(() => {
    if (!calendarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const isSelectedDateUnavailable = unavailableDates.has(selectedDateKey);

  const goToWeek = (direction: number) => {
    setWeekAnchor((current) => addDays(current, direction * 7));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!patientName.trim() || !patientPhone.trim()) {
      alert(t("appointment.alertMissingContact"));
      return;
    }

    if (!selectedDateKey || !selectedTime || isSelectedDateUnavailable) {
      alert(t("appointment.alertMissingSlot"));
      return;
    }

    const endTime = toTimeString(toMinutes(selectedTime) + durationMinutes);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/appointments/book/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor: Number(selectedDoctorId),
            date: selectedDateKey,
            start_time: selectedTime,
            end_time: endTime,
            reason,
            reason_note: reasonNote,
            patient_name: patientName,
            patient_phone: patientPhone,
          }),
        },
      );

      if (!response.ok) {
        alert(t("appointment.bookingFailed"));
        const bookedRes = await fetch(
          `http://127.0.0.1:8000/api/appointments/doctors/${selectedDoctorId}/booked-slots/?from=${formatDateKey(new Date())}&to=${formatDateKey(addDays(new Date(), 180))}`,
        );
        setBookedSlots(bookedRes.ok ? await bookedRes.json() : []);
        return;
      }
    } catch {
      alert(t("appointment.bookingFailed"));
      return;
    }

    appointmentContext?.addAppointment({
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      clinic: selectedDoctor.clinic,
      dateKey: selectedDateKey,
      dateLabel: formatLongDate(selectedDate),
      time: selectedTime,
      timeLabel: formatClock(selectedTime),
      reason,
      reasonNote,
      patientName,
      patientPhone,
      status: "upcoming",
    });

    navigate("/appointments");
  };

  if (doctorsLoading) {
    return (
      <div className="appointment-page container content-with-nav">
        <p>{t("appointment.loadingDoctors")}</p>
      </div>
    );
  }

  if (!selectedDoctor) {
    return (
      <div className="appointment-page container content-with-nav">
        <p>{t("appointment.noDoctorsAvailable")}</p>
        <Link to="/doctorlisting">{t("appointment.browseDoctors")}</Link>
      </div>
    );
  }

  return (
    <div className="appointment-page container content-with-nav">
      <div className="appointment-shell">
        <section className="booking-card hero-card">
          <p className="eyebrow">{t("appointment.bookAppointment")}</p>
          <div className="doctor-card">
            <img
              className="doctor-avatar"
              src={selectedDoctor.image}
              alt={selectedDoctor.name}
            />
            <div className="doctor-copy">
              <strong>{selectedDoctor.name}</strong>
              <span>{selectedDoctor.specialty}</span>
              <small>{selectedDoctor.clinic}</small>
            </div>
          </div>

          <div
            className="doctor-selector"
            aria-label={t("appointment.chooseDoctor")}
          >
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                className={`doctor-pill${doctor.id === selectedDoctorId ? " active" : ""}`}
                onClick={() => setSelectedDoctorId(doctor.id)}
              >
                {doctor.name.split(" ")[1] ?? doctor.name}
              </button>
            ))}
          </div>
        </section>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <section className="booking-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("appointment.step1")}</p>
                <h2>{t("appointment.pickDate")}</h2>
              </div>
              <div
                className="week-nav"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div className="calendar-picker-wrapper" ref={calendarRef}>
                  <button
                    type="button"
                    className="icon-button calendar-icon-btn"
                    aria-label={t("appointment.pickDate")}
                    onClick={() => {
                      setCalendarMonth(startOfMonth(selectedDate));
                      setCalendarOpen((open) => !open);
                    }}
                  >
                    <i className="material-icons">calendar_today</i>
                  </button>

                  {calendarOpen && (
                    <div className="calendar-popover">
                      <div className="calendar-popover-header">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={t("appointment.previousMonth")}
                          onClick={() =>
                            setCalendarMonth(
                              (month) =>
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() - 1,
                                  1,
                                ),
                            )
                          }
                        >
                          <i className="material-icons">chevron_left</i>
                        </button>
                        <strong>
                          {new Intl.DateTimeFormat("en-US", {
                            month: "long",
                            year: "numeric",
                          }).format(calendarMonth)}
                        </strong>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={t("appointment.nextMonth")}
                          onClick={() =>
                            setCalendarMonth(
                              (month) =>
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() + 1,
                                  1,
                                ),
                            )
                          }
                        >
                          <i className="material-icons">chevron_right</i>
                        </button>
                      </div>

                      <div className="calendar-popover-weekdays">
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                          (label) => (
                            <span key={label}>{label}</span>
                          ),
                        )}
                      </div>

                      <div className="calendar-popover-grid">
                        {buildMonthGrid(calendarMonth).map((date, index) => {
                          if (!date) {
                            return (
                              <span
                                key={`empty-${index}`}
                                className="calendar-cell empty"
                              />
                            );
                          }

                          const dateKey = formatDateKey(date);
                          const todayKey = formatDateKey(new Date());
                          const disabled =
                            dateKey < todayKey ||
                            getSlotsForDate(
                              date,
                              periods,
                              durationMinutes,
                              bookedSlots,
                              customTimes,
                            ).length === 0;
                          const active = dateKey === selectedDateKey;

                          return (
                            <button
                              type="button"
                              key={dateKey}
                              className={`calendar-cell${active ? " active" : ""}${disabled ? " disabled" : ""}`}
                              disabled={disabled}
                              onClick={() => {
                                setWeekAnchor(startOfWeek(date));
                                setSelectedDateKey(dateKey);
                                setCalendarOpen(false);
                              }}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => goToWeek(-1)}
                >
                  <i className="material-icons">chevron_left</i>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => goToWeek(1)}
                >
                  <i className="material-icons">chevron_right</i>
                </button>
              </div>
            </div>

            <div
              className="week-strip"
              aria-label={t("appointment.appointmentDates")}
            >
              {weekDays.map((date) => {
                const dateKey = formatDateKey(date);
                const unavailable = unavailableDates.has(dateKey);
                const active = dateKey === selectedDateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`day-chip${active ? " active" : ""}${unavailable ? " unavailable" : ""}`}
                    onClick={() => {
                      if (unavailable) {
                        return;
                      }
                      setSelectedDateKey(dateKey);
                    }}
                    disabled={unavailable}
                    aria-pressed={active}
                  >
                    <span>{formatShortDay(date)}</span>
                    <strong>{date.getDate()}</strong>
                    <small>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                      }).format(date)}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="booking-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("appointment.step2")}</p>
                <h2>{formatLongDate(selectedDate)}</h2>
              </div>
              <span className="availability-chip">
                {scheduleLoading
                  ? t("appointment.loadingSchedule")
                  : isSelectedDateUnavailable
                    ? t("appointment.unavailable")
                    : t("appointment.openSlots", {
                        count: availableSlots.length,
                      })}
              </span>
            </div>

            {scheduleLoading ? (
              <p className="muted-copy">{t("appointment.loadingSchedule")}</p>
            ) : isSelectedDateUnavailable ? (
              <p className="muted-copy">{t("appointment.fullyBooked")}</p>
            ) : (
              <div
                className="slot-grid"
                role="list"
                aria-label={t("appointment.availableSlots")}
              >
                {availableSlots.map((slot) => {
                  const active = slot === selectedTime;
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-pill${active ? " active" : ""}`}
                      onClick={() => setSelectedTime(slot)}
                      aria-pressed={active}
                    >
                      {formatClock(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="booking-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("appointment.step3")}</p>
                <h2>{t("appointment.tellUsWhatYouNeed")}</h2>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="reason">
                {t("appointment.reason")}
              </label>
              <div className="input-shell">
                <select
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                >
                  {reasons.map((item) => (
                    <option key={item} value={item}>
                      {reasonLabel(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="reasonNote">
                {t("appointment.shortNote")}
              </label>
              <div className="input-shell textarea-shell">
                <textarea
                  id="reasonNote"
                  rows={4}
                  value={reasonNote}
                  onChange={(event) => setReasonNote(event.target.value)}
                  placeholder={t("appointment.shortNotePlaceholder")}
                />
              </div>
            </div>
          </section>

          <section className="booking-card patient-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("appointment.step4")}</p>
                <h2>{t("appointment.useContactInfo")}</h2>
              </div>
              <span className="availability-chip">
                {t("appointment.guestFriendly")}
              </span>
            </div>

            <div className="patient-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="patientName">
                  {t("appointment.fullName")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">person</i>
                  <input
                    id="patientName"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder={t("appointment.fullNamePlaceholder")}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="patientPhone">
                  {t("appointment.phoneNumber")}
                </label>
                <div className="input-shell input-with-icon">
                  <i className="material-icons input-icon">phone</i>
                  <input
                    id="patientPhone"
                    value={patientPhone}
                    onChange={(event) => setPatientPhone(event.target.value)}
                    placeholder="09xx xxx xxx"
                    autoComplete="tel"
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="booking-card summary-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{t("appointment.step5")}</p>
                <h2>{t("appointment.confirmDetails")}</h2>
              </div>
            </div>

            <div className="summary-grid">
              <div>
                <span className="summary-label">
                  {t("appointment.doctor")}
                </span>
                <strong>{selectedDoctor.name}</strong>
                <span>{selectedDoctor.specialty}</span>
              </div>
              <div>
                <span className="summary-label">{t("appointment.date")}</span>
                <strong>{formatLongDate(selectedDate)}</strong>
              </div>
              <div>
                <span className="summary-label">{t("appointment.time")}</span>
                <strong>
                  {selectedTime
                    ? formatClock(selectedTime)
                    : t("appointment.chooseSlot")}
                </strong>
              </div>
              <div>
                <span className="summary-label">
                  {t("appointment.reason")}
                </span>
                <strong>{reasonLabel(reason)}</strong>
                {reasonNote.trim() && <span>{reasonNote.trim()}</span>}
              </div>
            </div>

            <div className="desktop-cta">
              <button className="cta-button" type="submit">
                {t("appointment.confirmAppointment")}
              </button>
            </div>
          </section>

          <div className="mobile-cta" aria-hidden="true">
            <button className="cta-button" type="submit">
              {t("appointment.confirmAppointment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
