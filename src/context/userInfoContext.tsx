import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
type UserInfo = {
  id?: string;
  name: string;
  email: string;
  img?: string;
  category?: string;
};

type UserInfoContextType = {
  userInfo?: UserInfo;
  loading: boolean;
};
export const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined,
);

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = React.useState<UserInfo | undefined>(
    undefined,
  );
  const [loading, setLoading] = React.useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserInfo(undefined);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserInfo({
          id: user.uid,
          name: snap.data().firstName,
          email: snap.data().email,
        });
        setLoading(false);
      }
      return () => unsub();
    });
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo, loading }}>
      {children}
    </UserInfoContext.Provider>
  );
}
