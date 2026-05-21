import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import StudentDashboard from './pages/StudentDashboard';
import LearningTracks from './pages/LearningTracks';
import FacultyDashboard from './pages/FacultyDashboard';

// Secure Routing: Student Gate
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'student') return <Navigate to="/faculty" replace />;
  
  return <>{children}</>;
}

// Secure Routing: Faculty Gate
function FacultyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'faculty') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

// Root Redirection Gateway
function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'faculty') return <Navigate to="/faculty" replace />;
  
  // If student hasn't completed onboarding, direct them there
  if (user?.role === 'student' && !user.learning_goal) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC PATHS */}
        <Route path="/login" element={<Login />} />
        
        {/* STUDENT PATHS (SECURED) */}
        <Route 
          path="/onboarding" 
          element={
            <StudentRoute>
              <Onboarding />
            </StudentRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          } 
        />
        <Route 
          path="/tracks" 
          element={
            <StudentRoute>
              <LearningTracks />
            </StudentRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <StudentRoute>
              {/* Leaderboard is embedded in the dashboard table or rendered as a student tracks sibling, let's direct straight to the dashboard leaderboard snaps! */}
              <StudentDashboard />
            </StudentRoute>
          } 
        />

        {/* FACULTY PATHS (SECURED) */}
        <Route 
          path="/faculty" 
          element={
            <FacultyRoute>
              <FacultyDashboard />
            </FacultyRoute>
          } 
        />
        <Route 
          path="/faculty/students" 
          element={
            <FacultyRoute>
              <FacultyDashboard />
            </FacultyRoute>
          } 
        />

        {/* FALLBACK ROOT GATEWAY */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
