import {  initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDnEzCYJiLFy6u1IfQWxJPtC6vC4i-T63g",
  authDomain: "secx-9d45b.firebaseapp.com",
  databaseURL: "https://secx-9d45b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "secx-9d45b",
  storageBucket: "secx-9d45b.firebasestorage.app",
  messagingSenderId: "798315358760",
  appId: "1:798315358760:web:604172faa21dc68034631d",
  measurementId: "G-VB1KF5TMLG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);