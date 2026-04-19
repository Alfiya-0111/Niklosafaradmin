import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is in admins collection
        const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
        if (adminDoc.exists()) {
          setUser(firebaseUser);
          setAdminData(adminDoc.data());
        } else {
          // Not an admin — sign out
          await signOut(auth);
          setUser(null);
          setAdminData(null);
        }
      } else {
        setUser(null);
        setAdminData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, adminData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);