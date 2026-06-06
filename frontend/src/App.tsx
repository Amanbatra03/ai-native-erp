import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Briefcase,
  MessageSquare, CalendarDays, Zap,
  Wallet, Sparkles, Package, Shield, Sun, Moon, Monitor,
  LogOut, ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import AIChat from './pages/AIChat';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import Deals from './pages/Deals';
import Employees from './pages/Employees';
import LeaveRequests from './pages/LeaveRequests';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';
import Marketing from './pages/Marketing';
import Login from './pages/Login';
import AuditLog from './pages/AuditLog';

// ── Nav helpers ──────────────────────────────────────────────────────────────

const NavSection = ({ label }: { label: string }) => (
  <p className="px-3 pt-5 pb-1 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-[0.1em]">
    {label}
  </p>
);

const SidebarItem = ({
  to, icon: Icon, label,
}: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-blue-600 text-white shadow-[0_1px_3px_rgba(37,99,235,0.4)]'
          : 'text-[var(--text-3)] hover:bg-white/[0.05] hover:text-[var(--text-1)]'
      )
    }
  >
    <Icon size={16} className="shrink-0" />
    <span>{label}</span>
  </NavLink>
);

// ── Theme toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'dark' as const, icon: Moon },
    { value: 'system' as const, icon: Monitor },
    { value: 'light' as const, icon: Sun },
  ];
  return (
    <div className="flex items-center bg-[var(--bg-input)] rounded-lg p-0.5 border border-[var(--border)]">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={value}
          className={clsx(
            'p-1.5 rounded-md transition-all duration-150',
            theme === value
              ? 'bg-[var(--bg-surface)] text-[var(--text-1)] shadow-sm'
              : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
          )}
        >
          <Icon size={12} />
        </button>
      ))}
    </div>
  );
}

// ── Protected route ──────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Main shell ───────────────────────────────────────────────────────────────

function Shell() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const canHR = isAdmin || user?.role === 'hr';
  const canFinance = isAdmin || user?.role === 'finance';
  const canCRM = isAdmin || user?.role === 'crm';

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] w-full">
      {/* Sidebar */}
      <aside className="w-60 border-r border-[var(--border)] flex flex-col bg-[var(--bg-surface)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--border)]">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center font-bold text-sm shadow-[0_0_0_1px_rgba(37,99,235,0.5)]">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">AI ERP</span>
            <span className="ml-1.5 text-[9px] text-blue-500 font-bold uppercase tracking-wider">v4.0</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col px-2 py-2 overflow-y-auto">
          <NavSection label="Main" />
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />

          {canCRM && (
            <>
              <NavSection label="CRM" />
              <SidebarItem to="/companies" icon={Building2} label="Companies" />
              <SidebarItem to="/contacts" icon={Users} label="Contacts" />
              <SidebarItem to="/deals" icon={Briefcase} label="Deals" />
            </>
          )}

          {canHR && (
            <>
              <NavSection label="HR" />
              <SidebarItem to="/employees" icon={Users} label="Employees" />
              <SidebarItem to="/leave-requests" icon={CalendarDays} label="Leave Requests" />
            </>
          )}

          {canFinance && (
            <>
              <NavSection label="Finance & Supply" />
              <SidebarItem to="/transactions" icon={Wallet} label="Transactions" />
              <SidebarItem to="/inventory" icon={Package} label="Inventory" />
            </>
          )}

          {canCRM && (
            <>
              <NavSection label="Growth" />
              <SidebarItem to="/marketing" icon={Zap} label="Marketing" />
            </>
          )}

          {isAdmin && (
            <>
              <NavSection label="Compliance" />
              <SidebarItem to="/audit-log" icon={Shield} label="Audit Log" />
            </>
          )}

          <div className="my-3 border-t border-[var(--border)]" />
          <SidebarItem to="/ai-chat" icon={MessageSquare} label="AI Assistant" />
        </nav>

        {/* Footer: theme + user */}
        <div className="border-t border-[var(--border)] px-3 py-3 space-y-2">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all duration-150"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs shrink-0">
                {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium text-[var(--text-1)] truncate">{user?.full_name}</p>
                <p className="text-[10px] text-[var(--text-3)] truncate capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={12} className={clsx('text-[var(--text-3)] transition-transform duration-150', userMenuOpen && 'rotate-180')} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-[10px] text-[var(--text-3)]">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors duration-100"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[var(--bg-base)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/leave-requests" element={<LeaveRequests />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/audit-log" element={isAdmin ? <AuditLog /> : <Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoute><Shell /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
