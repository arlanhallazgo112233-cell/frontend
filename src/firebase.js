import {
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

import {
  getFirestore,
} from 'firebase/firestore';

// This is the exact Web App configuration shown in Firebase Console for grabiii-react.
const firebaseConfig = {
  apiKey: 'AIzaSyBnMMlqoaaSEhKCm1t_q8wTexu905-T9s0',
  authDomain: 'grabiii-react.firebaseapp.com',
  projectId: 'grabiii-react',
  storageBucket: 'grabiii-react.firebasestorage.app',
  messagingSenderId: '469311229143',
  appId: '1:469311229143:web:8487799971135c65c3f492',
  measurementId: 'G-605GL8S2NE',
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const googleProvider =
  new GoogleAuthProvider();

// Keep the login session after browser refresh.
export const authPersistence = setPersistence(
  auth,
  browserLocalPersistence
);