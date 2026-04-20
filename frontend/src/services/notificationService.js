import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Subscribes to notifications for a specific user
 * @param {string} userId - User document ID
 * @param {function} callback - Callback function receiving the notifications array
 * @returns {function} Unsubscribe function
 */
export function subscribeNotifications(userId, callback) {
  if (!userId) return () => {};
  
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort locally to avoid requiring a Firebase Composite Index
    data.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(data);
  });
}

/**
 * Adds a new notification
 * @param {string} userId - User document ID
 * @param {string} message - Notification text
 * @param {string} type - 'appointment', 'system', 'profile'
 */
export async function addNotification(userId, message, type = 'appointment') {
  if (!userId) return;
  await addDoc(collection(db, 'notifications'), {
    userId,
    message,
    type,
    read: false,
    createdAt: serverTimestamp()
  });
}

/**
 * Marks a specific notification as read
 * @param {string} notificationId - The ID of the notification document
 */
export async function markNotificationAsRead(notificationId) {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, {
    read: true
  });
}
