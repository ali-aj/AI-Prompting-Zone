import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    // User is logged in, redirect based on userType
    switch (user.userType) {
      case 'student':
        return <Navigate to="/practice" replace />;
      case 'admin':
        return <Navigate to="/club/dashboard" replace />;
      case 'super_admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // User is not logged in, render the children (the sign-in/up page)
  return <>{children}</>;
};

export default PublicOnlyRoute; 