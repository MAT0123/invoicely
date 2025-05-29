import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVO5DIimFsPBhAq_lYTd7DGv4WrasPmgI",
  authDomain: "invoicely-f9dec.firebaseapp.com",
  projectId: "invoicely-f9dec",
  storageBucket: "invoicely-f9dec.firebasestorage.app",
  messagingSenderId: "465747096133",
  appId: "1:465747096133:web:35ecb1564bb1b85cdd292c",
  measurementId: "G-RHKN0VCM97"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)