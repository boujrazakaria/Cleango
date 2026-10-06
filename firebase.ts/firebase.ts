import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkFn4k0pKatQpvhzt_ldcxrgExFFQFAsQ",
  authDomain: "cleango-6a704.firebaseapp.com",
  projectId: "cleango-6a704",
  storageBucket: "cleango-6a704.firebasestorage.app",
  messagingSenderId: "786531504533",
  appId: "1:786531504533:web:912bdff0fa9fbd220a269c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;