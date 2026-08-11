export type DoctorSettings = {
  durationMinutes: number;
  feeEnabled: boolean;
  feeAmount: string;
};

export const DOCTOR_SETTINGS_STORAGE_KEY = "tenadam_doctor_settings_v1";

export const DEFAULT_DOCTOR_SETTINGS: DoctorSettings = {
  durationMinutes: 30,
  feeEnabled: false,
  feeAmount: "",
};
export function loadDoctorSettings(): DoctorSettings {
  try {
    const raw = localStorage.getItem(DOCTOR_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_DOCTOR_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DoctorSettings>;
    return {
      durationMinutes:
        parsed.durationMinutes ?? DEFAULT_DOCTOR_SETTINGS.durationMinutes,
      feeEnabled: parsed.feeEnabled ?? DEFAULT_DOCTOR_SETTINGS.feeEnabled,
      feeAmount: parsed.feeAmount ?? DEFAULT_DOCTOR_SETTINGS.feeAmount,
    };
  } catch {
    return DEFAULT_DOCTOR_SETTINGS;
  }
}

export function saveDoctorSettings(settings: DoctorSettings): void {
  localStorage.setItem(DOCTOR_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
