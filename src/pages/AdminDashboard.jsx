import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  MdAdd, MdEdit, MdDelete, MdLogout, MdWarning,
  MdDirectionsCar, MdBookmarks, MdPhone, MdCheck,
  MdClose, MdPerson, MdLocationOn, MdAccessTime,
} from "react-icons/md";
import { BsCarFrontFill, BsWhatsapp } from "react-icons/bs";
import { TbRoute } from "react-icons/tb";
import { FaSpinner } from "react-icons/fa";
import { auth } from "../firebase/config";
import { subscribeToCars, addCar, updateCar, deleteCar } from "../firebase/carsService";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase/config";
import CarForm from "../components/admin/CarForm";

// ===== HELPERS =====
function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 5;
}
function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#FF8B5E", bg: "rgba(255,139,94,0.12)", border: "rgba(255,139,94,0.3)" },
  assigned: { label: "Driver Assigned", color: "#5ED4C4", bg: "rgba(94,212,196,0.12)", border: "rgba(94,212,196,0.3)" },
  confirmed: { label: "Confirmed", color: "#28a745", bg: "rgba(40,167,69,0.12)", border: "rgba(40,167,69,0.3)" },
  completed: { label: "Completed", color: "#6B7299", bg: "rgba(107,114,153,0.12)", border: "rgba(107,114,153,0.3)" },
  cancelled: { label: "Cancelled", color: "#E8607A", bg: "rgba(232,96,122,0.12)", border: "rgba(232,96,122,0.3)" },
};

// ===== MAIN COMPONENT =====
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // booking object
  const navigate = useNavigate();

  // Load Cars
  useEffect(() => {
    const unsubscribe = subscribeToCars((liveCars) => {
      setCars(liveCars);
      setLoadingCars(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Bookings
  useEffect(() => {
    const bookingsRef = ref(db, "bookings");
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data)
          .map(([id, b]) => ({ id, ...b }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBookings(arr);
      } else {
        setBookings([]);
      }
      setLoadingBookings(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  // Cars CRUD
  const handleAddNew = () => { setEditingCar(null); setFormOpen(true); };
  const handleEdit = (car) => { setEditingCar(car); setFormOpen(true); };
  const handleDelete = async (car) => {
    if (!window.confirm(`"${car.carName}" delete karna hai?`)) return;
    await deleteCar(car.id);
  };
  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      if (editingCar) await updateCar(editingCar.id, data);
      else await addCar(data);
      setFormOpen(false);
      setEditingCar(null);
    } catch (err) {
      alert("Save nahi ho paya.");
    } finally {
      setSaving(false);
    }
  };
  const toggleSubscription = async (car) => {
    await updateCar(car.id, { subscriptionActive: !car.subscriptionActive });
  };

  // Booking status update
  const updateBookingStatus = async (bookingId, status) => {
    await update(ref(db, `bookings/${bookingId}`), { status, updatedAt: Date.now() });
  };

  // Assign driver
  const assignDriver = async (booking, driver) => {
    await update(ref(db, `bookings/${booking.id}`), {
      status: "assigned",
      assignedDriver: driver.ownerName,
      assignedDriverPhone: driver.ownerPhone,
      assignedCarName: driver.carName,
      updatedAt: Date.now(),
    });
    setAssignModal(null);
  };

  // WhatsApp messages
  const waDriver = (booking) => {
    const msg = encodeURIComponent(
      `🚗 *NAYI BOOKING — ConnectCab*\n\n` +
      `Booking ID: #${booking.id?.slice(-6).toUpperCase()}\n` +
      `Customer: ${booking.riderName} (${booking.riderPhone})\n` +
      `Route: ${booking.fromCity} → ${booking.toCity}\n` +
      `Date: ${booking.travelDate} at ${booking.pickupTime}\n` +
      `Pickup: ${booking.pickupAddress}\n` +
      `Fuel: ${booking.fuelType}\n` +
      `Fare: ₹${booking.price}\n` +
      `Notes: ${booking.notes || "None"}\n\n` +
      `Confirm karein aur customer ko call karein! ✅`
    );
    return `https://wa.me/${booking.assignedDriverPhone?.replace(/[^0-9]/g, "") || ""}?text=${msg}`;
  };

  const waCustomer = (booking) => {
    const msg = encodeURIComponent(
      `✅ *Booking Confirmed — ConnectCab*\n\n` +
      `Booking ID: #${booking.id?.slice(-6).toUpperCase()}\n` +
      `Route: ${booking.fromCity} → ${booking.toCity}\n` +
      `Date: ${booking.travelDate} at ${booking.pickupTime}\n\n` +
      `*Driver Details:*\n` +
      `Naam: ${booking.assignedDriver || "TBD"}\n` +
      `Phone: ${booking.assignedDriverPhone || "TBD"}\n` +
      `Car: ${booking.assignedCarName || booking.carName}\n\n` +
      `Trip pe driver ko ₹${booking.price} pay karein.\n` +
      `Koi help chahiye? +91 90542 70660 pe call karein 🙏`
    );
    return `https://wa.me/91${booking.riderPhone}?text=${msg}`;
  };

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLogo}>
          <div style={styles.logoBox}><TbRoute size={17} color="#14182B" /></div>
          <span style={styles.logoText}>Connect<span style={{ color: "#FF8B5E" }}>Cab</span> Admin</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <MdLogout size={15} /> Logout
        </button>
      </div>

      <div style={styles.container}>
        {/* TABS */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("bookings")}
            style={{ ...styles.tab, ...(activeTab === "bookings" ? styles.tabActive : {}) }}
          >
            <MdBookmarks size={16} />
            Bookings
            {pendingCount > 0 && (
              <span style={styles.badge}>{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            style={{ ...styles.tab, ...(activeTab === "cars" ? styles.tabActive : {}) }}
          >
            <MdDirectionsCar size={16} />
            Cars ({cars.length})
          </button>
        </div>

        {/* ===== BOOKINGS TAB ===== */}
        {activeTab === "bookings" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>All Bookings</h2>
              <div style={styles.statsRow}>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => {
                  const count = bookings.filter(b => b.status === key).length;
                  if (count === 0) return null;
                  return (
                    <div key={key} style={{ ...styles.statChip, background: val.bg, border: `1px solid ${val.border}`, color: val.color }}>
                      {val.label}: {count}
                    </div>
                  );
                })}
              </div>
            </div>

            {loadingBookings ? (
              <div style={styles.loadingBox}>
                <FaSpinner size={24} color="#FF8B5E" style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : bookings.length === 0 ? (
              <div style={styles.emptyBox}>
                <MdBookmarks size={48} color="#444" />
                <p style={{ color: "#9CA3C4", marginTop: 12 }}>Abhi koi booking nahi hai.</p>
              </div>
            ) : (
              <div style={styles.bookingsList}>
                {bookings.map((booking) => {
                  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={booking.id} style={styles.bookingCard}>
                      {/* TOP ROW */}
                      <div style={styles.bookingTop}>
                        <div style={styles.bookingRoute}>
                          <span style={styles.routeText}>
                            {booking.fromCity} → {booking.toCity}
                          </span>
                          <span style={{ ...styles.statusBadge, background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                        <span style={styles.bookingId}>
                          #{booking.id?.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {/* DETAILS GRID */}
                      <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                          <MdPerson size={13} color="#FF8B5E" />
                          <span>{booking.riderName}</span>
                          <a href={`tel:${booking.riderPhone}`} style={styles.phoneLink}>
                            <MdPhone size={12} /> {booking.riderPhone}
                          </a>
                        </div>
                        <div style={styles.detailItem}>
                          <MdAccessTime size={13} color="#FF8B5E" />
                          <span>{booking.travelDate} · {booking.pickupTime}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <MdLocationOn size={13} color="#FF8B5E" />
                          <span>{booking.pickupAddress}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <BsCarFrontFill size={13} color="#FF8B5E" />
                          <span>{booking.carName} · {booking.fuelType} · ₹{booking.price}</span>
                        </div>
                      </div>

                      {/* Driver assigned info */}
                      {booking.assignedDriver && (
                        <div style={styles.assignedBox}>
                          <BsCarFrontFill size={13} color="#5ED4C4" />
                          <span style={{ color: "#5ED4C4", fontSize: 13 }}>
                            Driver: <strong>{booking.assignedDriver}</strong> ({booking.assignedDriverPhone}) — {booking.assignedCarName}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <p style={styles.notesText}>📝 {booking.notes}</p>
                      )}

                      {/* ACTIONS */}
                      <div style={styles.bookingActions}>
                        {/* Assign Driver */}
                        {(booking.status === "pending" || booking.status === "assigned") && (
                          <button
                            onClick={() => setAssignModal(booking)}
                            style={styles.assignBtn}
                          >
                            <BsCarFrontFill size={13} />
                            {booking.assignedDriver ? "Change Driver" : "Assign Driver"}
                          </button>
                        )}

                        {/* WhatsApp Driver */}
                        {booking.assignedDriverPhone && (
                          <a
                            href={waDriver(booking)}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.waDriverBtn}
                          >
                            <BsWhatsapp size={13} /> Driver
                          </a>
                        )}

                        {/* WhatsApp Customer */}
                        {booking.assignedDriver && (
                          <a
                            href={waCustomer(booking)}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.waCustomerBtn}
                          >
                            <BsWhatsapp size={13} /> Customer
                          </a>
                        )}

                        {/* Status Buttons */}
                        {booking.status === "assigned" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            style={styles.confirmBtn}
                          >
                            <MdCheck size={13} /> Confirm
                          </button>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "completed")}
                            style={styles.completeBtn}
                          >
                            <MdCheck size={13} /> Complete
                          </button>
                        )}
                        {booking.status !== "cancelled" && booking.status !== "completed" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            style={styles.cancelBtn}
                          >
                            <MdClose size={13} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== CARS TAB ===== */}
        {activeTab === "cars" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Cars ({cars.length})</h2>
              <button onClick={handleAddNew} style={styles.addCarBtn}>
                <MdAdd size={16} /> Add New Car
              </button>
            </div>

            {loadingCars ? (
              <p style={{ color: "#9CA3C4" }}>Loading...</p>
            ) : cars.length === 0 ? (
              <p style={{ color: "#9CA3C4" }}>Koi car nahi hai. Add New Car pe click karein.</p>
            ) : (
              <div style={styles.carsList}>
                {cars.map((car) => (
                  <div key={car.id} style={styles.carCard}>
                    <div style={styles.carIconBox}>
                      <BsCarFrontFill size={20} color="#FF8B5E" />
                    </div>
                    <div style={styles.carInfo}>
                      <p style={styles.carName}>{car.carName}</p>
                      <p style={styles.carMeta}>
                        {car.type} · {car.seats} seater · {car.ownerName}
                        {car.ownerPhone ? ` · ${car.ownerPhone}` : ""}
                      </p>
                      <p style={styles.carDest}>
                        {(car.destinations || []).length} destination(s) covered
                      </p>
                    </div>
                    <div style={styles.carActions}>
                      <button
                        onClick={() => toggleSubscription(car)}
                        style={{
                          ...styles.subToggle,
                          background: car.subscriptionActive ? "rgba(94,212,196,0.12)" : "rgba(232,96,122,0.12)",
                          border: `1px solid ${car.subscriptionActive ? "rgba(94,212,196,0.35)" : "rgba(232,96,122,0.35)"}`,
                          color: car.subscriptionActive ? "#5ED4C4" : "#E8607A",
                        }}
                      >
                        {car.subscriptionActive ? "Active" : "Inactive"}
                      </button>
                      {car.subscriptionExpiry && (
                        <span style={{
                          fontSize: 11,
                          color: isExpired(car.subscriptionExpiry) ? "#E8607A" : isExpiringSoon(car.subscriptionExpiry) ? "#FFB088" : "#6B7299",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          {(isExpired(car.subscriptionExpiry) || isExpiringSoon(car.subscriptionExpiry)) && <MdWarning size={12} />}
                          {isExpired(car.subscriptionExpiry) ? "Expired " : "Expires "}{car.subscriptionExpiry}
                        </span>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleEdit(car)} style={styles.editBtn}>
                          <MdEdit size={15} />
                        </button>
                        <button onClick={() => handleDelete(car)} style={styles.deleteBtn}>
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ASSIGN DRIVER MODAL ===== */}
      {assignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Driver Assign Karein</h3>
              <button onClick={() => setAssignModal(null)} style={styles.modalClose}>
                <MdClose size={20} />
              </button>
            </div>

            <div style={styles.modalBookingInfo}>
              <p style={{ color: "#9CA3C4", fontSize: 13 }}>
                Booking: <strong style={{ color: "#F5F3ED" }}>
                  {assignModal.fromCity} → {assignModal.toCity}
                </strong>
              </p>
              <p style={{ color: "#9CA3C4", fontSize: 13 }}>
                Customer: <strong style={{ color: "#F5F3ED" }}>{assignModal.riderName}</strong>
              </p>
              <p style={{ color: "#9CA3C4", fontSize: 13 }}>
                Date: <strong style={{ color: "#F5F3ED" }}>{assignModal.travelDate} · {assignModal.pickupTime}</strong>
              </p>
            </div>

            <p style={styles.modalSubtitle}>Available Drivers (Active Cars):</p>

            <div style={styles.driversList}>
              {cars
                .filter(c => c.subscriptionActive)
                .map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => assignDriver(assignModal, driver)}
                    style={{
                      ...styles.driverOption,
                      border: assignModal.assignedDriver === driver.ownerName
                        ? "1px solid #FF8B5E"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={styles.driverIconBox}>
                      <BsCarFrontFill size={16} color="#FF8B5E" />
                    </div>
                    <div>
                      <p style={{ color: "#F5F3ED", fontSize: 14, fontWeight: 600, margin: 0 }}>
                        {driver.ownerName}
                      </p>
                      <p style={{ color: "#9CA3C4", fontSize: 12, margin: "4px 0 0 0" }}>
                        {driver.carName} · {driver.seats} seater · {driver.ownerPhone}
                      </p>
                    </div>
                    {assignModal.assignedDriver === driver.ownerName && (
                      <MdCheck size={18} color="#FF8B5E" style={{ marginLeft: "auto" }} />
                    )}
                  </button>
                ))}
            </div>

            {cars.filter(c => c.subscriptionActive).length === 0 && (
              <p style={{ color: "#E8607A", fontSize: 13, textAlign: "center" }}>
                Koi active driver nahi hai. Pehle car add karein!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Car Form Modal */}
      {formOpen && (
        <CarForm
          initialData={editingCar}
          onSubmit={handleFormSubmit}
          onCancel={() => { setFormOpen(false); setEditingCar(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ===== STYLES =====
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0A0A1A",
    color: "#F5F3ED",
    fontFamily: "'DM Sans', sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoBox: {
    width: 34, height: 34, borderRadius: 9,
    background: "linear-gradient(135deg, #FF8B5E, #FF6B35)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#9CA3C4", borderRadius: 9, padding: "9px 16px",
    fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" },

  // Tabs
  tabs: { display: "flex", gap: 8, marginBottom: 28 },
  tab: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent", color: "#9CA3C4", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
  },
  tabActive: {
    background: "linear-gradient(135deg, #FF8B5E, #FF6B35)",
    color: "#14182B", border: "1px solid transparent",
  },
  badge: {
    background: "#14182B", color: "#FF8B5E",
    borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700,
  },

  // Section
  sectionHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12,
  },
  sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: 0 },
  statsRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  statChip: {
    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  },

  // Bookings
  loadingBox: { display: "flex", justifyContent: "center", padding: "60px 0" },
  emptyBox: {
    textAlign: "center", padding: "60px 24px",
    background: "rgba(255,255,255,0.02)", borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  bookingsList: { display: "flex", flexDirection: "column", gap: 16 },
  bookingCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 20,
  },
  bookingTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8,
  },
  bookingRoute: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  routeText: { fontSize: 16, fontWeight: 700, color: "#F5F3ED" },
  statusBadge: {
    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  bookingId: { color: "#6B7299", fontSize: 12 },
  detailsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 10, marginBottom: 14,
  },
  detailItem: {
    display: "flex", alignItems: "center", gap: 8,
    color: "#9CA3C4", fontSize: 13,
  },
  phoneLink: {
    color: "#5ED4C4", textDecoration: "none",
    display: "flex", alignItems: "center", gap: 4, fontSize: 12,
  },
  assignedBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(94,212,196,0.06)", border: "1px solid rgba(94,212,196,0.2)",
    borderRadius: 8, padding: "8px 12px", marginBottom: 12,
  },
  notesText: { color: "#6B7299", fontSize: 12, marginBottom: 12 },
  bookingActions: { display: "flex", gap: 8, flexWrap: "wrap" },

  // Action buttons
  assignBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,139,94,0.1)", border: "1px solid rgba(255,139,94,0.3)",
    color: "#FF8B5E", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  waDriverBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
    color: "#25D366", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, fontWeight: 600, textDecoration: "none",
  },
  waCustomerBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.4)",
    color: "#25D366", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, fontWeight: 700, textDecoration: "none",
  },
  confirmBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(94,212,196,0.1)", border: "1px solid rgba(94,212,196,0.3)",
    color: "#5ED4C4", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  completeBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(40,167,69,0.1)", border: "1px solid rgba(40,167,69,0.3)",
    color: "#28a745", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  cancelBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.3)",
    color: "#E8607A", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  },

  // Cars tab
  addCarBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "linear-gradient(135deg, #FF8B5E, #FF6B35)",
    color: "#14182B", border: "none", borderRadius: 10,
    padding: "11px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  carsList: { display: "flex", flexDirection: "column", gap: 12 },
  carCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: 18, display: "flex", alignItems: "center",
    gap: 16, flexWrap: "wrap",
  },
  carIconBox: {
    width: 44, height: 44, borderRadius: 12,
    background: "rgba(255,139,94,0.1)", border: "1px solid rgba(255,139,94,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  carInfo: { flex: 1, minWidth: 180 },
  carName: { fontWeight: 700, fontSize: 14.5, margin: 0 },
  carMeta: { color: "#9CA3C4", fontSize: 12, margin: "4px 0 0 0" },
  carDest: { color: "#6B7299", fontSize: 11.5, marginTop: 3 },
  carActions: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  subToggle: {
    borderRadius: 40, padding: "5px 13px",
    fontSize: 11.5, fontWeight: 700, cursor: "pointer",
  },
  editBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#9CA3C4", borderRadius: 9, padding: 9, cursor: "pointer",
  },
  deleteBtn: {
    background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.3)",
    color: "#E8607A", borderRadius: 9, padding: 9, cursor: "pointer",
  },

  // Modal
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(10,10,26,0.85)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, zIndex: 200,
  },
  modal: {
    width: "100%", maxWidth: 500, maxHeight: "85vh", overflowY: "auto",
    background: "#171B30", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18, padding: 28,
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "'Fraunces', serif", fontSize: 18,
    fontWeight: 600, color: "#F5F3ED", margin: 0,
  },
  modalClose: {
    background: "transparent", border: "none",
    color: "#9CA3C4", cursor: "pointer",
  },
  modalBookingInfo: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, padding: 14, marginBottom: 20,
    display: "flex", flexDirection: "column", gap: 6,
  },
  modalSubtitle: {
    color: "#9CA3C4", fontSize: 12, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12,
  },
  driversList: { display: "flex", flexDirection: "column", gap: 10 },
  driverOption: {
    display: "flex", alignItems: "center", gap: 14,
    background: "rgba(255,255,255,0.03)", borderRadius: 12,
    padding: 14, cursor: "pointer", width: "100%", textAlign: "left",
    transition: "all 0.2s",
  },
  driverIconBox: {
    width: 40, height: 40, borderRadius: 10,
    background: "rgba(255,139,94,0.1)", border: "1px solid rgba(255,139,94,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
};