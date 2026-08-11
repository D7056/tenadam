import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

type AuthState = {
  user: any;
  role: "user" | "provider" | null;
  category?: string;
  loading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, role: null, loading: false });
        return;
      }

  
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        setState({ user, role: "user", loading: false });
        return;
      }

      // Check providers
      const providerSnap = await getDoc(doc(db, "providers", user.uid));
      if (providerSnap.exists()) {
        setState({
          user,
          role: "provider",
          category: providerSnap.data().category,
          loading: false,
        });
      }
    });

    return () => unsub();
  }, []);

  return state;
}
