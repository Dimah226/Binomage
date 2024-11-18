
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3syg2r8rTUYXJzRvv6ANdmzGFxECrzeY",
  authDomain: "binomage-82c61.firebaseapp.com",
  projectId: "binomage-82c61",
  storageBucket: "binomage-82c61.firebasestorage.app",
  messagingSenderId: "458767263154",
  appId: "1:458767263154:web:b12e47acfece0a18c2b0ab"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };