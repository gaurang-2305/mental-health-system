// frontend/src/App.jsx
// NOTE: This is a TEMPLATE — fill in your existing route structure below.
// The key fix is importing counselor and admin pages from their own files
// instead of as named exports from the Dashboard barrel files.

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

// ─── Layouts (keep your existing layout imports) ──────────────────────────────
// import StudentLayout  from './layouts/StudentLayout';
// import CounselorLayout from './layouts/CounselorLayout';
// import AdminLayout    from './layouts/AdminLayout';

// ─── Auth pages ───────────────────────────────────────────────────────────────
import Login        from './pages/auth/Login';
import Register     from './pages/auth/Register';
import AdminLogin   from './pages/auth/AdminLogin';

// ─── Shared pages ─────────────────────────────────────────────────────────────
import NotFound       from './pages/shared/NotFound';
import Chatbot        from './pages/shared/Chatbot';
import Notifications  from './pages/shared/Notifications';

// ─── Student pages ────────────────────────────────────────────────────────────
import Dashboard        from './pages/student/Dashboard';
import MoodTracker      from './pages/student/MoodTracker';
import Survey           from './pages/student/Survey';
import Journal          from './pages/student/Journal';
import Goals            from './pages/student/Goals';
import Appointments     from './pages/student/Appointments';
import SleepTracker     from './pages/student/SleepTracker';
import LifestyleTracker from './pages/student/LifestyleTracker';
import StressRelief     from './pages/student/StressRelief';
import PeerForum        from './pages/student/PeerForum';
import Profile          from './pages/student/Profile';
import Recommendations  from './pages/student/Recommendations';
import Feedback         from './pages/student/Feedback';
import WeeklyReport     from './pages/student/WeeklyReport';

// ─── Counselor pages ──────────────────────────────────────────────────────────
// ✅ Import from standalone files (NOT from CounselorDashboard named exports)
import CounselorDashboard  from './pages/counselor/CounselorDashboard';
import CrisisAlerts        from './pages/counselor/CrisisAlerts';
import ManageAppointments  from './pages/counselor/ManageAppointments';
import StudentStatus       from './pages/counselor/StudentStatus';
import StressReports       from './pages/counselor/StressReports';

// ─── Admin pages ──────────────────────────────────────────────────────────────
// ✅ Import from standalone files (NOT from AdminDashboard named exports)
import AdminDashboard   from './pages/admin/AdminDashboard';
import ManageUsers      from './pages/admin/ManageUsers';
import Analytics        from './pages/admin/Analytics';
import ExportReports    from './pages/admin/ExportReports';
import BackupRecovery   from './pages/admin/BackupRecovery';
import SystemMonitoring from './pages/admin/SystemMonitoring';
// AdminCrisisAlerts is only in AdminDashboard.jsx — import as named export
import { AdminCrisisAlerts } from './pages/admin/AdminDashboard';

// ─── Route guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={`/${role}`} replace />;
  return children;
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}`} replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/login"       element={<Login />} />
              <Route path="/register"    element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/"            element={<RoleRedirect />} />

              {/* Student routes */}
              <Route path="/student" element={<RequireAuth allowedRoles={['student']}><Dashboard /></RequireAuth>} />
              <Route path="/student/mood"          element={<RequireAuth allowedRoles={['student']}><MoodTracker /></RequireAuth>} />
              <Route path="/student/survey"        element={<RequireAuth allowedRoles={['student']}><Survey /></RequireAuth>} />
              <Route path="/student/journal"       element={<RequireAuth allowedRoles={['student']}><Journal /></RequireAuth>} />
              <Route path="/student/goals"         element={<RequireAuth allowedRoles={['student']}><Goals /></RequireAuth>} />
              <Route path="/student/appointments"  element={<RequireAuth allowedRoles={['student']}><Appointments /></RequireAuth>} />
              <Route path="/student/sleep"         element={<RequireAuth allowedRoles={['student']}><SleepTracker /></RequireAuth>} />
              <Route path="/student/lifestyle"     element={<RequireAuth allowedRoles={['student']}><LifestyleTracker /></RequireAuth>} />
              <Route path="/student/stress-relief" element={<RequireAuth allowedRoles={['student']}><StressRelief /></RequireAuth>} />
              <Route path="/student/forum"         element={<RequireAuth allowedRoles={['student']}><PeerForum /></RequireAuth>} />
              <Route path="/student/profile"       element={<RequireAuth allowedRoles={['student']}><Profile /></RequireAuth>} />
              <Route path="/student/recommendations" element={<RequireAuth allowedRoles={['student']}><Recommendations /></RequireAuth>} />
              <Route path="/student/feedback"      element={<RequireAuth allowedRoles={['student']}><Feedback /></RequireAuth>} />
              <Route path="/student/report"        element={<RequireAuth allowedRoles={['student']}><WeeklyReport /></RequireAuth>} />
              <Route path="/student/chatbot"       element={<RequireAuth allowedRoles={['student']}><Chatbot /></RequireAuth>} />
              <Route path="/student/notifications" element={<RequireAuth allowedRoles={['student']}><Notifications /></RequireAuth>} />

              {/* Counselor routes */}
              <Route path="/counselor"               element={<RequireAuth allowedRoles={['counselor']}><CounselorDashboard /></RequireAuth>} />
              <Route path="/counselor/alerts"        element={<RequireAuth allowedRoles={['counselor']}><CrisisAlerts /></RequireAuth>} />
              <Route path="/counselor/appointments"  element={<RequireAuth allowedRoles={['counselor']}><ManageAppointments /></RequireAuth>} />
              <Route path="/counselor/students"      element={<RequireAuth allowedRoles={['counselor']}><StudentStatus /></RequireAuth>} />
              <Route path="/counselor/stress"        element={<RequireAuth allowedRoles={['counselor']}><StressReports /></RequireAuth>} />
              <Route path="/counselor/chatbot"       element={<RequireAuth allowedRoles={['counselor']}><Chatbot /></RequireAuth>} />
              <Route path="/counselor/notifications" element={<RequireAuth allowedRoles={['counselor']}><Notifications /></RequireAuth>} />
              <Route path="/counselor/profile"       element={<RequireAuth allowedRoles={['counselor']}><Profile /></RequireAuth>} />

              {/* Admin routes */}
              <Route path="/admin"               element={<RequireAuth allowedRoles={['admin']}><AdminDashboard /></RequireAuth>} />
              <Route path="/admin/users"         element={<RequireAuth allowedRoles={['admin']}><ManageUsers /></RequireAuth>} />
              <Route path="/admin/analytics"     element={<RequireAuth allowedRoles={['admin']}><Analytics /></RequireAuth>} />
              <Route path="/admin/alerts"        element={<RequireAuth allowedRoles={['admin']}><AdminCrisisAlerts /></RequireAuth>} />
              <Route path="/admin/export"        element={<RequireAuth allowedRoles={['admin']}><ExportReports /></RequireAuth>} />
              <Route path="/admin/backup"        element={<RequireAuth allowedRoles={['admin']}><BackupRecovery /></RequireAuth>} />
              <Route path="/admin/monitoring"    element={<RequireAuth allowedRoles={['admin']}><SystemMonitoring /></RequireAuth>} />
              <Route path="/admin/notifications" element={<RequireAuth allowedRoles={['admin']}><Notifications /></RequireAuth>} />
              <Route path="/admin/profile"       element={<RequireAuth allowedRoles={['admin']}><Profile /></RequireAuth>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}