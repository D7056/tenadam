import { createContext, type ReactNode, useState } from "react";

export type PharmacyOrder = {
  id: string;
  patientName: string;
  medication: string;
  dosage: string;
  quantity: number;
  address?: string;
  contact?: string;
  createdAt: number;
  status: "pending" | "preparing" | "completed" | "cancelled";
};

type PharmacyContextType = {
  orders: PharmacyOrder[];
  addOrder: (order: PharmacyOrder) => void;
  updateOrderStatus: (id: string, status: PharmacyOrder["status"]) => void;
};

type ChildrenProp = {
  children: ReactNode;
};

export const PharmacyContext = createContext<PharmacyContextType | undefined>(
  undefined,
);

export function PharmacyContextProvider({ children }: ChildrenProp) {
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);

  const addOrder = (order: PharmacyOrder) => {
    setOrders((prev) => [...prev, order]);
  };

  const updateOrderStatus = (id: string, status: PharmacyOrder["status"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  };

  return (
    <PharmacyContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </PharmacyContext.Provider>
  );
}
