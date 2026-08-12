import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type OrderLineItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  dosage?: string;
};

export type Order = {
  id: string;
  items: OrderLineItem[];
  total: number;
  recipientName: string;
  address: string;
  contact: string;
  status: "pending" | "confirmed" | "delivered";
  createdAt: string;
};

type ChildrenProp = {
  children: ReactNode;
};

type OrderContextType = {
  orders: Order[];
  counter: number;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => void;
  markOrdersSeen: () => void;
};

const STORAGE_KEY = "tenadam_orders_v1";
const SEEN_KEY = "tenadam_orders_seen_v1";

export const OrderContext = createContext<OrderContextType | undefined>(
  undefined,
);

export function OrderContextProvider({ children }: ChildrenProp) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  });

  const [lastSeenAt, setLastSeenAt] = useState<string>(
    () => localStorage.getItem(SEEN_KEY) ?? "",
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(SEEN_KEY, lastSeenAt);
    } catch {}
  }, [lastSeenAt]);

  const counter = useMemo(
    () => orders.filter((order) => order.createdAt > lastSeenAt).length,
    [orders, lastSeenAt],
  );

  const addOrder = (order: Omit<Order, "id" | "createdAt" | "status">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    setOrders((prev) => [
      {
        ...order,
        id,
        createdAt,
        status: "pending",
      },
      ...prev,
    ]);
  };

  const markOrdersSeen = () => setLastSeenAt(new Date().toISOString());

  return (
    <OrderContext.Provider
      value={{ orders, counter, addOrder, markOrdersSeen }}
    >
      {children}
    </OrderContext.Provider>
  );
}
