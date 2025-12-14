import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth(); 

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.userType === 'super_admin';

  if (!isAuthenticated) {
    return <Navigate to="/admin/signin" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute; 