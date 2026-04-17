/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          REVIVE DENTAL — ONE-TIME ADMIN SEEDER SCRIPT           ║
 * ║                                                                  ║
 * ║  This script creates Firebase Auth accounts + Firestore records  ║
 * ║  for all 3 clinic admin emails.                                  ║
 * ║                                                                  ║
 * ║  HOW TO RUN:                                                     ║
 * ║    node seedAdmins.js                                            ║
 * ║                                                                  ║
 * ║  Run this ONCE. It is safe to re-run — existing accounts         ║
 * ║  will be updated, not duplicated.                                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();
const { admin, db } = require('./config/firebase');

// ─────────────────────────────────────────────────────────────────
//  ADMIN ACCOUNTS — Set passwords here before running the script
// ─────────────────────────────────────────────────────────────────

const ADMINS = [
  {
    email:    'revivedentalclinicp@gmail.com',
    password: 'ReviveDental@2024',       // ← change this password
    display:  'Revive Dental (Main)',
  },
  {
    email:    'revivedentalspecialityclinicp@gmail.com',
    password: 'ReviveDental@2024',       // ← change this password
    display:  'Revive Dental Speciality',
  },
  {
    email:    'revivedentalclinicdigital@gmail.com',
    password: 'ReviveDental@2024',       // ← change this password
    display:  'Revive Dental Digital',
  },
];

// ─────────────────────────────────────────────────────────────────

const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

async function seedAdmin({ email, password, display }) {
  const normalised = email.toLowerCase();
  let uid;

  // Step 1 — Create or get Firebase Auth user
  try {
    const existing = await auth.getUserByEmail(normalised);
    uid = existing.uid;

    // Update password if account already exists
    await auth.updateUser(uid, {
      password,
      displayName: display,
      emailVerified: true,
    });
    console.log(`  ✏️  Updated existing Auth account: ${normalised}  (uid: ${uid})`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      // Create fresh account
      const created = await auth.createUser({
        email:         normalised,
        password,
        displayName:   display,
        emailVerified: true,
      });
      uid = created.uid;
      console.log(`  ✅  Created new Auth account:    ${normalised}  (uid: ${uid})`);
    } else {
      throw err;
    }
  }

  // Step 2 — Write / merge Firestore admins document
  const docRef = db.collection('admins').doc(uid);
  await docRef.set(
    {
      uid,
      email:     normalised,
      role:      'admin',
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }          // won't overwrite extra fields already there
  );
  console.log(`  📄  Firestore admins/${uid} written for ${normalised}`);
}

async function main() {
  console.log('\n🦷  Revive Dental — Admin Seeder\n');
  console.log('──────────────────────────────────────────');

  for (const admin of ADMINS) {
    console.log(`\n▶  Processing: ${admin.email}`);
    try {
      await seedAdmin(admin);
    } catch (err) {
      console.error(`  ❌  Failed for ${admin.email}:`, err.message);
    }
  }

  console.log('\n──────────────────────────────────────────');
  console.log('✅  Done! All admin accounts have been seeded.');
  console.log('\n📋  Admin Login Details:');
  ADMINS.forEach(a => {
    console.log(`     ${a.email}  →  password: ${a.password}`);
  });
  console.log('\n🔗  Admin portal: /admin\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
