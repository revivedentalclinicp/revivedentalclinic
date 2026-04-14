import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
