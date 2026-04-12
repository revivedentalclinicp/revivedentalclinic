import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookAppointment from './pages/BookAppointment';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function WithNav({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WithNav><Home /></WithNav>} />
      <Route path="/login" element={<WithNav><Login /></WithNav>} />
      <Route path="/signup" element={<WithNav><Signup /></WithNav>} />
      <Route path="/book" element={<WithNav><BookAppointment /></WithNav>} />
      <Route path="/services" element={<WithNav><Services /></WithNav>} />
      <Route path="/doctors" element={<WithNav><Doctors /></WithNav>} />
      <Route path="/dashboard" element={<WithNav><Dashboard /></WithNav>} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
