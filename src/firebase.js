import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAu5VHy8IyQmeTettqfui6I_zUGGdm-28w",
    authDomain: "collegemash-fde92.firebaseapp.com",
    projectId: "collegemash-fde92",
    storageBucket: "collegemash-fde92.appspot.com",
    messagingSenderId: "917282926405",
    appId: "1:917282926405:web:5ff92a32cddd56ff7dd82c",
    measurementId: "G-WYC9GM0JK8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized:", app);
console.log("Auth instance:", auth);

export { db, auth, signInWithEmailAndPassword };

