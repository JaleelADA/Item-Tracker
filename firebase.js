import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore"; // Corrected import statement

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwdzuIoHzJ9uAzdz4qZ4ih92jj9r_B_tw",
  authDomain: "inventory-management-2fa19.firebaseapp.com",
  projectId: "inventory-management-2fa19",
  storageBucket: "inventory-management-2fa19.appspot.com",
  messagingSenderId: "445043298323",
  appId: "1:445043298323:web:dbe76ce84225bfb230afe6",
  measurementId: "G-5Z9X124KQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app); // Corrected function name

export {firestore}