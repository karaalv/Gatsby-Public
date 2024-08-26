/* FIREBASE SERVICES */
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

// App persistence.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialise firebase.
const firebaseConfig = {
  // Redacted for security
};

// Export firebase providers to app.
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(AsyncStorage)
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIRESTORE_STORAGE = getStorage(FIREBASE_APP);

