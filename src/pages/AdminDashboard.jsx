import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdEdit, MdDelete, MdLogout, MdWarning } from "react-icons/md";
import { BsCarFrontFill } from "react-icons/bs";
import { TbRoute } from "react-icons/tb";
import { auth } from "../firebase/config";
import { subscribeToCars, addCar, updateCar, deleteCar } from "../firebase/carsService";
import CarForm from "../components/admin/CarForm";

function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 5;
}
function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function AdminDashboard() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToCars((liveCars) => {
      setCars(liveCars);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const handleAddNew = () => { setEditingCar(null); setFormOpen(true); };
  const handleEdit = (car) => { setEditingCar(car); setFormOpen(true); };

  const handleDelete = async (car) => {
    if (!window.confirm(`"${car.carName}" delete karna hai? Ye undo nahi hoga.`)) return;
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
      console.error(err);
      alert("Save nahi ho paya. Dobara try karein.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSubscription = async (car) => {
    await updateCar(car.id, { subscriptionActive: !car.subscriptionActive });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A1A", color: "#F5F3ED", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #FF8B5E, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TbRoute size={17} color="#14182B" />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 }}>ConnectCab Admin</span>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3C4", borderRadius: 9, padding: "9px 16px",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>
          <MdLogout size={15} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600 }}>Cars ({cars.length})</h2>
          <button onClick={handleAddNew} style={{
            display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #FF8B5E, #FF6B35)",
            color: "#14182B", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <MdAdd size={16} /> Add New Car
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#9CA3C4", fontSize: 14 }}>Loading...</p>
        ) : cars.length === 0 ? (
          <p style={{ color: "#9CA3C4", fontSize: 14 }}>Abhi koi car add nahi hui. "Add New Car" par click karke shuru karein.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cars.map((car) => (
              <div key={car.id} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,139,94,0.1)", border: "1px solid rgba(255,139,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BsCarFrontFill size={20} color="#FF8B5E" />
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontWeight: 700, fontSize: 14.5 }}>{car.carName}</p>
                  <p style={{ color: "#9CA3C4", fontSize: 12 }}>{car.type} · {car.seats} seater · {car.ownerName} {car.ownerPhone ? `· ${car.ownerPhone}` : ""}</p>
                  <p style={{ color: "#6B7299", fontSize: 11.5, marginTop: 3 }}>
                    {(car.destinations || []).length} destination{(car.destinations || []).length !== 1 ? "s" : ""} covered
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 130 }}>
                  <button onClick={() => toggleSubscription(car)} style={{
                    background: car.subscriptionActive ? "rgba(94,212,196,0.12)" : "rgba(232,96,122,0.12)",
                    border: `1px solid ${car.subscriptionActive ? "rgba(94,212,196,0.35)" : "rgba(232,96,122,0.35)"}`,
                    color: car.subscriptionActive ? "#5ED4C4" : "#E8607A",
                    borderRadius: 40, padding: "5px 13px", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                  }}>
                    {car.subscriptionActive ? "Active" : "Inactive"}
                  </button>
                  {car.subscriptionExpiry && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                      color: isExpired(car.subscriptionExpiry) ? "#E8607A" : isExpiringSoon(car.subscriptionExpiry) ? "#FFB088" : "#6B7299",
                    }}>
                      {(isExpired(car.subscriptionExpiry) || isExpiringSoon(car.subscriptionExpiry)) && <MdWarning size={12} />}
                      {isExpired(car.subscriptionExpiry) ? "Expired " : "Expires "}{car.subscriptionExpiry}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleEdit(car)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3C4", borderRadius: 9, padding: 9, cursor: "pointer" }}>
                    <MdEdit size={15} />
                  </button>
                  <button onClick={() => handleDelete(car)} style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.3)", color: "#E8607A", borderRadius: 9, padding: 9, cursor: "pointer" }}>
                    <MdDelete size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
