import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // If not authenticated, redirect to club signin
    return <Navigate to="/club/signin" />;
  }

  // Allow access for both admin and student users
  if (user.userType === 'admin' || user.userType === 'student') {
    return children;
  }

  // Default redirect for any other user type
  return <Navigate to="/student/signin" />;
};

export const StudentOnlyRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/student/signin" />;
  }

  // Only allow student users
  if (user.userType === 'student') {
    return children;
  }

  // Redirect admin users to their dashboard
  if (user.userType === 'admin') {
    return <Navigate to="/club/dashboard" />;
  }

  // Default redirect for any other user type
  return <Navigate to="/student/signin" />;
};

export default PrivateRoute;
