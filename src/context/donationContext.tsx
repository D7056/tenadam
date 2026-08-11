import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DonationItem = {
  id: string;
  amount: number;
  paymentMethod: "bank" | "telebirr" | "chapa";
  causeId: string;
  causeName: string;
  donorName: string;
  donorPhone: string;
  donorEmail: string;
  note: string;
  reference: string;
  status: "pending" | "confirmed";
  createdAt: string;
};

type ChildrenProp = {
  children: ReactNode;
};

type DonationContextType = {
  donations: DonationItem[];
  counter: number;
  addDonation: (

    donation: Omit<DonationItem, "id" | "createdAt" | "status"> & {
      status?: DonationItem["status"];
    },
  ) => void;
  removeDonation: (id: string) => void;
  clearDonations: () => void;
};



const STORAGE_KEY = "tenadam_donations_v1";

export const DonationContext = createContext<DonationContextType | undefined>(
  undefined,
);

export function DonationContextProvider({ children }: ChildrenProp) {
  const [donations, setDonations] = useState<DonationItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DonationItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
    } catch {}
  }, [donations]);

  const counter = useMemo(() => donations.length, [donations]);

  const addDonation = (
    donation: Omit<DonationItem, "id" | "createdAt" | "status"> & {
      status?: DonationItem["status"];
    },
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    setDonations((prev) => [
      {
        ...donation,
        id,
        createdAt,
        status: donation.status ?? "pending",
      },
      ...prev,
    ]);
  };

  const removeDonation = (id: string) => {
    setDonations((prev) => prev.filter((donation) => donation.id !== id));
  };

  const clearDonations = () => setDonations([]);

  return (
    <DonationContext.Provider
      value={{
        donations,
        counter,
        addDonation,
        removeDonation,
        clearDonations,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}
