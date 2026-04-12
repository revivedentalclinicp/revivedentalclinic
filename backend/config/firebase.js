require('dotenv').config();
const admin = require('firebase-admin');

let credential;

// Build service account object from environment variables 
const envServiceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  // Fix newlines if needed, since platforms like Render can sometimes escape \n
  private_key: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined
};

// Check if all needed environment variables are present
if (envServiceAccount.project_id && envServiceAccount.client_email && envServiceAccount.private_key) {
  credential = admin.credential.cert(envServiceAccount);
} else {
  // If not, fallback to reading the json file (useful for local dev without .env)
  try {
    const localServiceAccount = require('./serviceAccountKey.json');
    credential = admin.credential.cert(localServiceAccount);
  } catch (err) {
    console.error('ERROR: Missing Firebase credentials. Provide environment variables or serviceAccountKey.json');
  }
}

admin.initializeApp({
  credential
});

const db = admin.firestore();

module.exports = { admin, db };
