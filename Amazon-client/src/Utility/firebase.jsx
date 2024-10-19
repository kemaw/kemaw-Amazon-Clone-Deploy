// Import the functions you need from the SDKs you need

import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALd1lM6kFF9Myr-SkcySrzjiDdIwRID54",
  authDomain: "clone-kemaw.firebaseapp.com",
  projectId: "clone-kemaw",
  storageBucket: "clone-kemaw.appspot.com",
  messagingSenderId: "32357095168",
  appId: "1:32357095168:web:4a31af9db92279573cc5e5",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = app.firestore();
