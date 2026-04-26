import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, update, remove } from "firebase/database";  // ✅ Realtime DB

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingsRef = ref(db, "bookings");  // ✅ Realtime DB path
    
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        // Latest first
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBookings(list);
      } else {
        setBookings([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    await update(ref(db, `bookings/${id}`), { status });
  };

  const addNote = async (id, note) => {
    await update(ref(db, `bookings/${id}`), { note });
  };

  const deleteBooking = async (id) => {
    await remove(ref(db, `bookings/${id}`));
  };

  return { bookings, loading, updateStatus, addNote, deleteBooking };
}