import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useBookings } from "./hooks/useData";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import AddBooking from "./pages/AddBooking";
import './App.css';

function AdminApp() {
  const { user, loading } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { bookings, loading: bookingsLoading, updateStatus, addNote, deleteBooking, addBooking } = useBookings();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#D4A853]/30 border-t-[#D4A853] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B9BB4] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const renderPage = () => {
    if (bookingsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#D4A853]/30 border-t-[#D4A853] rounded-full animate-spin" />
        </div>
      );
    }
    switch (active) {
      case "dashboard":  return <Dashboard bookings={bookings} />;
      case "bookings":   return <Bookings bookings={bookings} updateStatus={updateStatus} addNote={addNote} deleteBooking={deleteBooking} />;
      case "customers":  return <Customers bookings={bookings} />;
      case "add-booking": return <AddBooking addBooking={addBooking} />;
      default:           return <Dashboard bookings={bookings} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f1f] font-outfit overflow-hidden">
      <Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#1A1A2E] border-b border-[#D4A853]/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[#8B9BB4] hover:text-white cursor-pointer bg-transparent border-none"
              onClick={() => setMobileOpen(true)}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-white text-sm font-medium capitalize">{active.replace("-", " ")}</h2>
              <p className="text-[#8B9BB4] text-xs">NikloSafar Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[#8B9BB4] text-xs">Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}