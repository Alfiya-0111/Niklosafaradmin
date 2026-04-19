import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMax_eoj6dzobyL6T6-pmzx-D69QCXlY8",
  authDomain: "niklosafar.firebaseapp.com",
  projectId: "niklosafar",
  storageBucket: "niklosafar.firebasestorage.app",
  messagingSenderId: "716029795483",
  appId: "1:716029795483:web:08026a75f8fbd932f1fa3e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);