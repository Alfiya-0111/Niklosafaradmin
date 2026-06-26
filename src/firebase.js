import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBMax_eoj6dzobyL6T6-pmzx-D69QCXlY8",
  authDomain: "niklosafar.firebaseapp.com",
  projectId: "niklosafar",
  databaseURL: "https://niklosafar-default-rtdb.firebaseio.com", // ← add karo
  storageBucket: "niklosafar.firebasestorage.app",
  messagingSenderId: "716029795483",
  appId: "1:716029795483:web:53355875ef50d2d7f1fa3e",
  measurementId: "G-LHE4X1HSLS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app); // ← yeh add karo