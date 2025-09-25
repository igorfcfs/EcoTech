// firebaseConfig.js
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3LD3f1kKxK_B8ChnbwC5yLd5YUJAXe84",
  authDomain: "ecotech-64860.firebaseapp.com",
  projectId: "ecotech-64860",
  storageBucket: "ecotech-64860.appspot.com",
  appId: "1:756196447902:android:89155cf2ba27c447d4cd8f",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, firebaseConfig, storage };


