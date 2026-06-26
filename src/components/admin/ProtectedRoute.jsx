import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = checking, null = not logged in

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9CA3C4", fontSize: 14 }}>Checking login...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
