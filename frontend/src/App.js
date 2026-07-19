import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { InterviewModeProvider } from './context/InterviewModeContext';
import { RefreshProvider } from './context/RefreshContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResumeUpload from './pages/ResumeUpload';
import Interview from './pages/Interview';
import InterviewDetail from './pages/InterviewDetail';
import LearningMode from './pages/LearningMode';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewModeProvider>
        <BrowserRouter>
          <RefreshProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <AppLayout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
              <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningMode /></ProtectedRoute>} />
              <Route path="/interview/:id" element={<ProtectedRoute><InterviewDetail /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </RefreshProvider>
        </BrowserRouter>
      </InterviewModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
