import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonChat } from './ui';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-full max-w-lg p-8">
          <SkeletonChat />
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
