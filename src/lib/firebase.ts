// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcyfjcKQptsvgabnaIE4AS2sLOqOfXOOI",
  authDomain: "taskmanager-6e38d.firebaseapp.com",
  projectId: "taskmanager-6e38d",
  storageBucket: "taskmanager-6e38d.firebasestorage.app",
  messagingSenderId: "319246982035",
  appId: "1:319246982035:web:fbd6f268bd3ac6e4fbe666",
  measurementId: "G-FS6TLRG6CH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

export { auth, googleAuthProvider }