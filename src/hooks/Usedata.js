import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

// All bookings subscribe karo
export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingsRef = ref(db, "bookings");
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bookingsArray = Object.entries(data).map(([id, booking]) => ({
          id,
          ...booking,
        }));
        // Latest first
        bookingsArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBookings(bookingsArray);
      } else {
        setBookings([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { bookings, loading };
}

// Single booking ke liye
export function useBooking(bookingId) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const bookingRef = ref(db, `bookings/${bookingId}`);
    const unsubscribe = onValue(bookingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBooking({ id: bookingId, ...data });
      } else {
        setBooking(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [bookingId]);

  return { booking, loading };
}