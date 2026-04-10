// frontend/components/common/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brain, LayoutDashboard, Users, AlertTriangle, UserCog, Shield, LogOut } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/students', icon: Users, label: 'All Students' },
  { to: '/admin/counselors', icon: UserCog, label: 'Counselors' },  // NEW
  { to: '/admin/alerts', icon: AlertTriangle, label: 'Crisis Alerts' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-slate-900 flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-amber-400" />
            <span className="font-display font-bold text-white">MindCare Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-semibold text-white">{user?.full_name}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
          <button onClick={async () => { await logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-900/20 w-full text-sm font-medium transition-all">
            <LogOut size={18} /><span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}