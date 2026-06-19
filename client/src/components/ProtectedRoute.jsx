import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getStoredSession } from '@/lib/api';

export const ProtectedRoute = () => {
  const { token, user } = getStoredSession();

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { token, user } = getStoredSession();

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/overview" replace />;
  }

  return <Outlet />;
};

