import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout, ProtectedRoute } from './components/layout/ProtectedRoute';
import { Loader } from './components/ui/index.jsx';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// Student pages
import Dashboard from './pages/student/Dashboard';
import MoodTracker from './pages/student/MoodTracker';
import Survey from './pages/student/Survey';
import SleepTracker from './pages/student/SleepTracker';
import LifestyleTracker from './pages/student/LifestyleTracker';
import Journal from './pages/student/Journal';
import Goals from './pages/student/Goals';
import Appointments from './pages/student/Appointments';
import PeerForum from './pages/student/PeerForum';
import StressRelief from './pages/student/StressRelief';
import Recommendations from './pages/student/Recommendations';
import Profile from './pages/student/Profile';
import { WeeklyReport } from './pages/student/WeeklyReport';
import Feedback from './pages/student/Feedback';
import Chatbot from './pages/shared/Chatbot';

// Counselor pages
import CounselorDashboard, { CrisisAlerts, ManageAppointments, StudentStatus, StressReports } from './pages/counselor/CounselorDashboard';

// Admin pages
import AdminDashboard, { ManageUsers, Analytics, AdminCrisisAlerts, ExportReports, BackupRecovery, SystemMonitoring } from './pages/admin/AdminDashboard';

function RoleRedirect() {
  const { role, loading } = useAuth();
  if (loading) return <Loader />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'counselor') return <Navigate to="/counselor" replace />;
  return <Navigate to="/student" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/student/mood" element={<ProtectedRoute><AppLayout><MoodTracker /></AppLayout></ProtectedRoute>} />
          <Route path="/student/survey" element={<ProtectedRoute><AppLayout><Survey /></AppLayout></ProtectedRoute>} />
          <Route path="/student/sleep" element={<ProtectedRoute><AppLayout><SleepTracker /></AppLayout></ProtectedRoute>} />
          <Route path="/student/lifestyle" element={<ProtectedRoute><AppLayout><LifestyleTracker /></AppLayout></ProtectedRoute>} />
          <Route path="/student/journal" element={<ProtectedRoute><AppLayout><Journal /></AppLayout></ProtectedRoute>} />
          <Route path="/student/goals" element={<ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>} />
          <Route path="/student/appointments" element={<ProtectedRoute><AppLayout><Appointments /></AppLayout></ProtectedRoute>} />
          <Route path="/student/forum" element={<ProtectedRoute><AppLayout><PeerForum /></AppLayout></ProtectedRoute>} />
          <Route path="/student/stress-relief" element={<ProtectedRoute><AppLayout><StressRelief /></AppLayout></ProtectedRoute>} />
          <Route path="/student/recommendations" element={<ProtectedRoute><AppLayout><Recommendations /></AppLayout></ProtectedRoute>} />
          <Route path="/student/chatbot" element={<ProtectedRoute><AppLayout><Chatbot /></AppLayout></ProtectedRoute>} />
          <Route path="/student/report" element={<ProtectedRoute><AppLayout><WeeklyReport /></AppLayout></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
          <Route path="/student/feedback" element={<ProtectedRoute><AppLayout><Feedback /></AppLayout></ProtectedRoute>} />

          {/* Counselor routes */}
          <Route path="/counselor" element={<ProtectedRoute><AppLayout><CounselorDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/counselor/students" element={<ProtectedRoute><AppLayout><StudentStatus /></AppLayout></ProtectedRoute>} />
          <Route path="/counselor/alerts" element={<ProtectedRoute><AppLayout><CrisisAlerts /></AppLayout></ProtectedRoute>} />
          <Route path="/counselor/appointments" element={<ProtectedRoute><AppLayout><ManageAppointments /></AppLayout></ProtectedRoute>} />
          <Route path="/counselor/stress-reports" element={<ProtectedRoute><AppLayout><StressReports /></AppLayout></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AppLayout><ManageUsers /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/alerts" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminCrisisAlerts /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/export" element={<ProtectedRoute requiredRole="admin"><AppLayout><ExportReports /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/backup" element={<ProtectedRoute requiredRole="admin"><AppLayout><BackupRecovery /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/monitoring" element={<ProtectedRoute requiredRole="admin"><AppLayout><SystemMonitoring /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;