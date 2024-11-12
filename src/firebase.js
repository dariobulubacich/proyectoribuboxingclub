import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDeZxeYVgJq3PRbdlovgo2kquREGaj0ljE",
  authDomain: "prueba-imputs-con-firebase.firebaseapp.com",
  projectId: "prueba-imputs-con-firebase",
  storageBucket: "prueba-imputs-con-firebase.firebasestorage.app",
  messagingSenderId: "213594161179",
  appId: "1:213594161179:web:21a08ff674e2321aabb8be",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
