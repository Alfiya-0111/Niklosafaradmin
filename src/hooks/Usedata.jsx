import { useEffect, useState } from "react";
import {
  collection, onSnapshot, doc, updateDoc,
  query, orderBy, addDoc, serverTimestamp, deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateStatus = (id, status) =>
    updateDoc(doc(db, "bookings", id), { status, updatedAt: serverTimestamp() });

  const addNote = (id, note) =>
    updateDoc(doc(db, "bookings", id), { note, updatedAt: serverTimestamp() });

  const deleteBooking = (id) => deleteDoc(doc(db, "bookings", id));

  const addBooking = (data) =>
    addDoc(collection(db, "bookings"), { ...data, status: "pending", createdAt: serverTimestamp() });

  return { bookings, loading, updateStatus, addNote, deleteBooking, addBooking };
}

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "customers"), (snap) => {
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { customers, loading };
}