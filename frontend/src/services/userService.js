import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Subscribes to the live user profile from the `users` collection.
 */
export function subscribeUserProfile(uid, callback) {
  if (!uid) return () => {};
  
  const ref = doc(db, 'users', uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  });
}

/**
 * Merges profile data into the `users` collection.
 */
export async function updateUserProfile(uid, data) {
  if (!uid) return;
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  });
}
