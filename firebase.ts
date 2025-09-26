import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your own Firebase project configuration.
// You can find this in your Firebase project settings.
export const firebaseConfig = {
  apiKey: "AIzaSyBSlhf6t14_mAW4XKvOlRBVJal6JCJ1pSI",
  authDomain: "energy-playbook.firebaseapp.com",
  projectId: "energy-playbook",
  storageBucket: "energy-playbook.firebasestorage.app",
  messagingSenderId: "990524565868",
  appId: "1:990524565868:web:a3aef5b194f0ebf612eb49",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Auth instance using the standard getAuth method.
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleAuthProvider = new GoogleAuthProvider();