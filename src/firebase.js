// src/firebase.js (Admin project)
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";  // ✅ Realtime DB
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMax_eoj6dzobyL6T6-pmzx-D69QCXlY8",
  authDomain: "niklosafar.firebaseapp.com",
  databaseURL: "https://niklosafar-default-rtdb.firebaseio.com",  // 🔥 YEH HONA CHAHIYE!
  projectId: "niklosafar",
  storageBucket: "niklosafar.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);   // ✅ Realtime DB
export const auth = getAuth(app);