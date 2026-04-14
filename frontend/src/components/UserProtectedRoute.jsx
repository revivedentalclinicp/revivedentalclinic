import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function UserProtectedRoute({ children }) {
  const { currentUser, isAdmin, checkUserStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (currentUser && !isAdmin) {
      checkUserStatus(currentUser).then(res => {
        if (mounted) {
          setIsUser(res);
          setLoading(false);
        }
      });
    } else {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, [currentUser, isAdmin, checkUserStatus]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#2E3192', width: 32, height: 32 }} />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin || !isUser) {
    // Force them back to the admin portal or home if they're not a user
    return <Navigate to="/" replace />;
  }

  return children;
}
