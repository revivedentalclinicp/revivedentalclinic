const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function createUser({ uid, name, email }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, name, email })
  });
  if (!res.ok) throw new Error('Failed to register user proxy');
  return res.json();
}

export async function getUser(uid) {
  const res = await fetch(`${API_URL}/auth/profile/${uid}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch user');
  }
  return res.json();
}
