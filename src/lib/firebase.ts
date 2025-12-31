import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBp2R-SGh5u2ByEVM5AYPnfYCiaLX7Lw-k",
  authDomain: "projetos-bruno-1d53d.firebaseapp.com",
  projectId: "projetos-bruno-1d53d",
  storageBucket: "projetos-bruno-1d53d.firebasestorage.app",
  messagingSenderId: "77998473929",
  appId: "1:77998473929:web:67e37bc7df5a577e5d8318",
  measurementId: "G-WZQRW5ZJX7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
