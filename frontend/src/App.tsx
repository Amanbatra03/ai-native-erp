import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Briefcase, 
  MessageSquare, Settings, CalendarDays, Zap,
  Target, Wallet, Coins, Sparkles
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

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
      )
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-black text-white w-full">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 flex flex-col p-4 gap-2">
          <div className="flex items-center gap-3 px-4 py-6 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">A</div>
            <span className="text-xl font-bold tracking-tight">AI ERP <span className="text-[10px] text-blue-500">v3.0</span></span>
          </div>
          
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Main</div>
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
            
            <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">CRM</div>
            <SidebarItem to="/companies" icon={Building2} label="Companies" />
            <SidebarItem to="/contacts" icon={Users} label="Contacts" />
            <SidebarItem to="/deals" icon={Briefcase} label="Deals" />

            <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">HR</div>
            <SidebarItem to="/employees" icon={Users} label="Employees" />
            <SidebarItem to="/leave-requests" icon={CalendarDays} label="Leave Requests" />

            <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Finance & SC</div>
            <SidebarItem to="/transactions" icon={Wallet} label="Transactions" />
            <SidebarItem to="/inventory" icon={Briefcase} label="Inventory" />

            <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Growth</div>
            <SidebarItem to="/marketing" icon={Zap} label="Marketing" />
            
            <div className="my-4 border-t border-gray-800" />
            <SidebarItem to="/ai-chat" icon={MessageSquare} label="AI Assistant" />
          </nav>

          <div className="mt-auto border-t border-gray-800 pt-4">
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
            <Route path="/settings" element={<div className="p-8 text-gray-400 font-medium italic">Advanced configuration coming soon in v4.0.</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
