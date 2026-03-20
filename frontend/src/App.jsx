import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

// ─── Home page ────────────────────────────────────────────────────────────────
import HomePage from './pages/HomePage';

// ─── Auth pages ───────────────────────────────────────────────────────────────
import Login      from './pages/auth/Login';
import Register   from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// ─── Shared pages ─────────────────────────────────────────────────────────────
import NotFound      from './pages/shared/NotFound';
import Chatbot       from './pages/shared/Chatbot';
import Notifications from './pages/shared/Notifications';

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
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CrisisAlerts       from './pages/counselor/CrisisAlerts';
import ManageAppointments from './pages/counselor/ManageAppointments';
import StudentStatus      from './pages/counselor/StudentStatus';
import StressReports      from './pages/counselor/StressReports';

// ─── Admin pages ──────────────────────────────────────────────────────────────
import AdminDashboard   from './pages/admin/AdminDashboard';
import ManageUsers      from './pages/admin/ManageUsers';
import Analytics        from './pages/admin/Analytics';
import ExportReports    from './pages/admin/ExportReports';
import BackupRecovery   from './pages/admin/BackupRecovery';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import { AdminCrisisAlerts } from './pages/admin/AdminDashboard';

// ─── Layout ───────────────────────────────────────────────────────────────────
import Sidebar from './components/layout/Sidebar';

// ─── Full-screen loader ───────────────────────────────────────────────────────
function AuthLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--primary)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <span style={{ color: 'var(--text2)', fontSize: 14 }}>Loading MindCare...</span>
    </div>
  );
}

// ─── App layout with sidebar ──────────────────────────────────────────────────
function AppLayout({ children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

// ─── Home or redirect ─────────────────────────────────────────────────────────
// If logged in → go to dashboard. If not → show homepage.
function HomeOrRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (user) return <Navigate to={`/${role}`} replace />;
  return <HomePage />;
}

// ─── Route guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={`/${role}`} replace />;
  return <AppLayout>{children}</AppLayout>;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* ── Home (public) ── */}
              <Route path="/" element={<HomeOrRedirect />} />

              {/* ── Auth (public) ── */}
              <Route path="/login"       element={<Login />} />
              <Route path="/register"    element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* ── Student ── */}
              <Route path="/student"                 element={<RequireAuth allowedRoles={['student']}><Dashboard /></RequireAuth>} />
              <Route path="/student/mood"            element={<RequireAuth allowedRoles={['student']}><MoodTracker /></RequireAuth>} />
              <Route path="/student/survey"          element={<RequireAuth allowedRoles={['student']}><Survey /></RequireAuth>} />
              <Route path="/student/journal"         element={<RequireAuth allowedRoles={['student']}><Journal /></RequireAuth>} />
              <Route path="/student/goals"           element={<RequireAuth allowedRoles={['student']}><Goals /></RequireAuth>} />
              <Route path="/student/appointments"    element={<RequireAuth allowedRoles={['student']}><Appointments /></RequireAuth>} />
              <Route path="/student/sleep"           element={<RequireAuth allowedRoles={['student']}><SleepTracker /></RequireAuth>} />
              <Route path="/student/lifestyle"       element={<RequireAuth allowedRoles={['student']}><LifestyleTracker /></RequireAuth>} />
              <Route path="/student/stress-relief"   element={<RequireAuth allowedRoles={['student']}><StressRelief /></RequireAuth>} />
              <Route path="/student/forum"           element={<RequireAuth allowedRoles={['student']}><PeerForum /></RequireAuth>} />
              <Route path="/student/profile"         element={<RequireAuth allowedRoles={['student']}><Profile /></RequireAuth>} />
              <Route path="/student/recommendations" element={<RequireAuth allowedRoles={['student']}><Recommendations /></RequireAuth>} />
              <Route path="/student/feedback"        element={<RequireAuth allowedRoles={['student']}><Feedback /></RequireAuth>} />
              <Route path="/student/report"          element={<RequireAuth allowedRoles={['student']}><WeeklyReport /></RequireAuth>} />
              <Route path="/student/chatbot"         element={<RequireAuth allowedRoles={['student']}><Chatbot /></RequireAuth>} />
              <Route path="/student/notifications"   element={<RequireAuth allowedRoles={['student']}><Notifications /></RequireAuth>} />

              {/* ── Counselor ── */}
              <Route path="/counselor"               element={<RequireAuth allowedRoles={['counselor']}><CounselorDashboard /></RequireAuth>} />
              <Route path="/counselor/alerts"        element={<RequireAuth allowedRoles={['counselor']}><CrisisAlerts /></RequireAuth>} />
              <Route path="/counselor/appointments"  element={<RequireAuth allowedRoles={['counselor']}><ManageAppointments /></RequireAuth>} />
              <Route path="/counselor/students"      element={<RequireAuth allowedRoles={['counselor']}><StudentStatus /></RequireAuth>} />
              <Route path="/counselor/stress"        element={<RequireAuth allowedRoles={['counselor']}><StressReports /></RequireAuth>} />
              <Route path="/counselor/chatbot"       element={<RequireAuth allowedRoles={['counselor']}><Chatbot /></RequireAuth>} />
              <Route path="/counselor/notifications" element={<RequireAuth allowedRoles={['counselor']}><Notifications /></RequireAuth>} />
              <Route path="/counselor/profile"       element={<RequireAuth allowedRoles={['counselor']}><Profile /></RequireAuth>} />

              {/* ── Admin ── */}
              <Route path="/admin"               element={<RequireAuth allowedRoles={['admin']}><AdminDashboard /></RequireAuth>} />
              <Route path="/admin/users"         element={<RequireAuth allowedRoles={['admin']}><ManageUsers /></RequireAuth>} />
              <Route path="/admin/analytics"     element={<RequireAuth allowedRoles={['admin']}><Analytics /></RequireAuth>} />
              <Route path="/admin/alerts"        element={<RequireAuth allowedRoles={['admin']}><AdminCrisisAlerts /></RequireAuth>} />
              <Route path="/admin/export"        element={<RequireAuth allowedRoles={['admin']}><ExportReports /></RequireAuth>} />
              <Route path="/admin/backup"        element={<RequireAuth allowedRoles={['admin']}><BackupRecovery /></RequireAuth>} />
              <Route path="/admin/monitoring"    element={<RequireAuth allowedRoles={['admin']}><SystemMonitoring /></RequireAuth>} />
              <Route path="/admin/notifications" element={<RequireAuth allowedRoles={['admin']}><Notifications /></RequireAuth>} />
              <Route path="/admin/profile"       element={<RequireAuth allowedRoles={['admin']}><Profile /></RequireAuth>} />

              {/* ── 404 ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}