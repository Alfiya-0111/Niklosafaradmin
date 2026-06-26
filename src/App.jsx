import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useBookings } from "./hooks/Usedata";  

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}

function AdminApp() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ color: "#fff", textAlign: "center", padding: 40 }}>Loading...</div>;

  return user ? <AdminDashboard /> : <AdminLogin />;
}