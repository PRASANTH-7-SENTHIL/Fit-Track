// ============================================================
// FitTrack AI - Firebase Configuration & Authentication
// ============================================================
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref as storageRef,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAMvbn4yzn0gfVc5JmjX46N9i3sun6wfew",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fit-track-ai-f23e0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fit-track-ai-f23e0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fit-track-ai-f23e0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "194220203006",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:194220203006:web:b49d6d19fcc1ea8daffeaf",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-E75CS4ZCB7",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Client-side Analytics support
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Auth Helper Functions
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signInWithApple() {
  return await signInWithPopup(auth, appleProvider);
}

export async function signInWithMicrosoft() {
  return await signInWithPopup(auth, microsoftProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

export async function logOut() {
  return await firebaseSignOut(auth);
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Firestore Database Sync Helpers
export async function syncProfileToFirestore(uid: string, profileData: any) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { profile: profileData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync profile error:', err);
  }
}

export async function syncDailyNutritionToFirestore(uid: string, date: string, nutritionData: any) {
  try {
    const docRef = doc(db, 'users', uid, 'nutrition', date);
    await setDoc(docRef, { ...nutritionData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync nutrition error:', err);
  }
}

export async function syncDailyActivityToFirestore(uid: string, date: string, activityData: any) {
  try {
    const docRef = doc(db, 'users', uid, 'activity', date);
    await setDoc(docRef, { ...activityData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync activity error:', err);
  }
}

export async function syncWeightToFirestore(uid: string, weightEntry: any) {
  try {
    const docRef = doc(db, 'users', uid, 'weights', weightEntry.id);
    await setDoc(docRef, weightEntry, { merge: true });
  } catch (err) {
    console.warn('Firestore sync weight error:', err);
  }
}

export async function syncWorkoutToFirestore(uid: string, sessionEntry: any) {
  try {
    const docRef = doc(db, 'users', uid, 'workouts', sessionEntry.id);
    await setDoc(docRef, sessionEntry, { merge: true });
  } catch (err) {
    console.warn('Firestore sync workout error:', err);
  }
}

// Firestore Database Read Helpers
export async function loadProfileFromFirestore(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().profile || null;
    }
  } catch (err) {
    console.warn('Firestore load profile error:', err);
  }
  return null;
}

export async function loadDailyActivityFromFirestore(uid: string, date: string) {
  try {
    const docRef = doc(db, 'users', uid, 'activity', date);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() || null;
    }
  } catch (err) {
    console.warn('Firestore load activity error:', err);
  }
  return null;
}

export async function loadDailyNutritionFromFirestore(uid: string, date: string) {
  try {
    const docRef = doc(db, 'users', uid, 'nutrition', date);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() || null;
    }
  } catch (err) {
    console.warn('Firestore load nutrition error:', err);
  }
  return null;
}

export async function loadWeightsFromFirestore(uid: string) {
  try {
    const colRef = collection(db, 'users', uid, 'weights');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.warn('Firestore load weights error:', err);
    return [];
  }
}

export async function loadWorkoutsFromFirestore(uid: string) {
  try {
    const colRef = collection(db, 'users', uid, 'workouts');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.warn('Firestore load workouts error:', err);
    return [];
  }
}

export async function loadFullUserDataFromFirebase(uid: string, date: string) {
  try {
    const [profile, activity, nutrition, weights, workouts] = await Promise.all([
      loadProfileFromFirestore(uid),
      loadDailyActivityFromFirestore(uid, date),
      loadDailyNutritionFromFirestore(uid, date),
      loadWeightsFromFirestore(uid),
      loadWorkoutsFromFirestore(uid),
    ]);
    return { profile, activity, nutrition, weights, workouts };
  } catch (err) {
    console.warn('Firestore full load error:', err);
    return null;
  }
}

// Upload user profile photo to Firebase Storage & Firestore
export async function uploadProfilePhotoToFirebase(uid: string, dataUrl: string): Promise<string> {
  let finalUrl = dataUrl;

  // 1. Try Firebase Storage with a strict 4-second timeout so it NEVER hangs
  try {
    if (storage) {
      const storagePromise = (async () => {
        const fileRef = storageRef(storage, `profile_pictures/${uid}/avatar.jpg`);
        await uploadString(fileRef, dataUrl, 'data_url', {
          contentType: 'image/jpeg',
        });
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL || dataUrl;
      })();

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage timeout (4s)')), 4000)
      );

      finalUrl = await Promise.race([storagePromise, timeoutPromise]);
    }
  } catch (storageErr) {
    console.warn('[Firebase Storage] Notice (using local persistence fallback):', storageErr);
  }

  // 2. Update Firebase Auth Profile if authenticated (only accepts http/https URLs)
  try {
    if (auth.currentUser && auth.currentUser.uid === uid) {
      if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
        await updateProfile(auth.currentUser, {
          photoURL: finalUrl,
        });
      }
    }
  } catch (authErr) {
    console.warn('[Firebase Auth] Photo URL update notice:', authErr);
  }

  // 3. Update Firestore Document with a 3-second timeout
  try {
    const firestorePromise = (async () => {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, { photoURL: finalUrl, updatedAt: new Date().toISOString() }, { merge: true });
    })();

    const firestoreTimeout = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout (3s)')), 3000)
    );

    await Promise.race([firestorePromise, firestoreTimeout]);
  } catch (firestoreErr) {
    console.warn('[Firestore] Profile photo sync notice:', firestoreErr);
  }

  return finalUrl;
}

export { app, auth, db, storage, analytics };
