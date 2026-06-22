import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { clearSession, fetchCurrentUser, getStoredSession } from '@/lib/api';

const RouteGateLoader = () => (
  <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#c97b6b] border-t-transparent rounded-full animate-spin" />
  </div>
);

const useResolvedSession = () => {
  const { token, user } = getStoredSession();
  const [resolvedUser, setResolvedUser] = useState(user);
  const [loading, setLoading] = useState(Boolean(token) && !user);

  useEffect(() => {
    let isActive = true;

    if (!token || user) {
      setResolvedUser(user);
      setLoading(false);
      return () => {
        isActive = false;
      };
    }

    setLoading(true);

    fetchCurrentUser()
      .then((nextUser) => {
        if (!isActive) return;
        setResolvedUser(nextUser);
      })
      .catch(() => {
        clearSession();
        if (!isActive) return;
        setResolvedUser(null);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token, user]);

  return { token, user: resolvedUser, loading };
};

export const ProtectedRoute = () => {
  const { token, user, loading } = useResolvedSession();

  if (loading) {
    return <RouteGateLoader />;
  }

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { token, user, loading } = useResolvedSession();

  if (loading) {
    return <RouteGateLoader />;
  }

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/overview" replace />;
  }

  return <Outlet />;
};
