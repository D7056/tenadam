import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type ChildrenProp = {
  children: ReactNode;
};

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  dosage?: string;
  dealerId?: string;
  dealerName?: string;
};

type CartContextType = {
  counter: number;
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "tenadam_cart_v1";

export function CartContextProvider({ children }: ChildrenProp) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const counter = items.reduce((s, it) => s + it.quantity, 0);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + (item.quantity ?? 1) }
            : p,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity ?? 1,
          image: item.image,
          dosage: item.dosage,
          dealerId: item.dealerId,
          dealerName: item.dealerName,
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)),
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, it) => s + (it.price ?? 0) * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        counter,
        items,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
