import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type AppointmentItem = {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  dateKey: string;
  dateLabel: string;
  time: string;
  timeLabel: string;
  reason: string;
  reasonNote: string;
  patientName: string;
  patientPhone: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
};

type ChildrenProp = {
  children: ReactNode;
};

export function isAppointmentPastDue(appointment: AppointmentItem) {
  if (appointment.status !== "upcoming") return false;
  const appointmentTime = new Date(
    `${appointment.dateKey}T${appointment.time}`,
  ).getTime();
  return !Number.isNaN(appointmentTime) && appointmentTime < Date.now();
}

export function getDisplayStatus(
  appointment: AppointmentItem,
): AppointmentItem["status"] | "past" {
  return isAppointmentPastDue(appointment) ? "past" : appointment.status;
}

type AppointmentContextType = {
  appointments: AppointmentItem[];
  counter: number;
  addAppointment: (
    appointment: Omit<AppointmentItem, "id" | "createdAt">,
  ) => void;
  updateAppointmentStatus: (
    id: string,
    status: AppointmentItem["status"],
  ) => void;
  removeAppointment: (id: string) => void;
  clearAppointments: () => void;
};

const STORAGE_KEY = "tenadam_appointments_v1";

export const AppointmentContext = createContext<
  AppointmentContextType | undefined
>(undefined);

export function AppointmentContextProvider({ children }: ChildrenProp) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppointmentItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  const counter = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === "upcoming" &&
          !isAppointmentPastDue(appointment),
      ).length,
    [appointments],
  );

  const addAppointment = (
    appointment: Omit<AppointmentItem, "id" | "createdAt">,
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    setAppointments((prev) => [
      {
        ...appointment,
        id,
        createdAt,
      },
      ...prev,
    ]);
  };

  const updateAppointmentStatus = (
    id: string,
    status: AppointmentItem["status"],
  ) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    );
  };

  const removeAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.filter((appointment) => appointment.id !== id),
    );
  };

  const clearAppointments = () => setAppointments([]);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        counter,
        addAppointment,
        updateAppointmentStatus,
        removeAppointment,
        clearAppointments,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}
