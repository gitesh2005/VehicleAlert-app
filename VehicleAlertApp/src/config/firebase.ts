import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth, ConfirmationResult } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBD_u83lOlnDqzEqU_YJKkwpn4aAIR4Mgo",
  authDomain: "vehiclealert-772d3.firebaseapp.com",
  projectId: "vehiclealert-772d3",
  storageBucket: "vehiclealert-772d3.firebasestorage.app",
  messagingSenderId: "678227503644",
  appId: "1:678227503644:web:7db1dad20b59f1ce2ccdd9",
  measurementId: "G-YZ0VQ246D5"
};

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

let analytics: Analytics | undefined;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

let confirmationResult: ConfirmationResult | null = null;

export const setConfirmationResult = (result: ConfirmationResult) => {
  confirmationResult = result;
};

export const getConfirmationResult = () => {
  return confirmationResult;
};

export { auth, db, analytics };
