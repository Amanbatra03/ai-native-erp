import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Briefcase,
  MessageSquare, Settings, CalendarDays, Zap,
  Wallet, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

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

const NavSection = ({ label }: { label: string }) => (
  <p className="px-3 pt-5 pb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-[0.1em]">
    {label}
  </p>
);

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-blue-600 text-white shadow-[0_1px_3px_rgba(37,99,235,0.4)]"
          : "text-gray-500 hover:bg-white/[0.05] hover:text-gray-200"
      )
    }
  >
    <Icon size={16} className="shrink-0" />
    <span>{label}</span>
  </NavLink>
);

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-black text-white w-full">
        {/* Sidebar */}
        <aside className="w-60 border-r border-white/[0.06] flex flex-col bg-[#080808]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06]">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center font-bold text-sm shadow-[0_0_0_1px_rgba(37,99,235,0.5)]">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">AI ERP</span>
              <span className="ml-1.5 text-[9px] text-blue-500 font-bold uppercase tracking-wider">v3.0</span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col px-2 py-2 overflow-y-auto">
            <NavSection label="Main" />
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />

            <NavSection label="CRM" />
            <SidebarItem to="/companies" icon={Building2} label="Companies" />
            <SidebarItem to="/contacts" icon={Users} label="Contacts" />
            <SidebarItem to="/deals" icon={Briefcase} label="Deals" />

            <NavSection label="HR" />
            <SidebarItem to="/employees" icon={Users} label="Employees" />
            <SidebarItem to="/leave-requests" icon={CalendarDays} label="Leave Requests" />

            <NavSection label="Finance & Supply" />
            <SidebarItem to="/transactions" icon={Wallet} label="Transactions" />
            <SidebarItem to="/inventory" icon={Briefcase} label="Inventory" />

            <NavSection label="Growth" />
            <SidebarItem to="/marketing" icon={Zap} label="Marketing" />

            <div className="my-3 border-t border-white/[0.06]" />
            <SidebarItem to="/ai-chat" icon={MessageSquare} label="AI Assistant" />
          </nav>

          <div className="border-t border-white/[0.06] px-2 py-3">
            <SidebarItem to="/settings" icon={Settings} label="Settings" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#050505]">
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
            <Route path="/settings" element={<div className="p-8 text-gray-500 text-sm italic">Advanced configuration coming soon in v4.0.</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
