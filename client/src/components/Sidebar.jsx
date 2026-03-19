import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, TrendingUp, Bot, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Loans', path: '/loans', icon: Wallet },
  { name: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'AI Advisor', path: '/advisor', icon: Bot },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-slate-900 text-white p-2 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">FinAI Advisor</h1>
          <p className="text-xs text-slate-500 font-medium">Smart Finance</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
