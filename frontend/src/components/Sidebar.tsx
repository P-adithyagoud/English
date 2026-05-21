import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BookOpen, 
  Trophy, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Flame, 
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isStudent = user.role === 'student';

  const menuItems = isStudent 
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Learning Tracks', path: '/tracks', icon: BookOpen },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
      ]
    : [
        { name: 'Faculty Admin', path: '/faculty', icon: LayoutDashboard },
        { name: 'Students Tracker', path: '/faculty/students', icon: Users },
      ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-slate-800/80 rounded-r-none flex flex-col justify-between py-6 px-4 z-40">
      <div className="flex flex-col gap-8">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-brand w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white font-sans tracking-wide leading-none">
              FluentFlow
            </h1>
            <span className="text-[10px] uppercase font-bold text-brand-400 tracking-widest font-sans">
              AI Learning
            </span>
          </div>
        </div>

        {/* PROFILE MINI-CARD */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-duo-blue flex items-center justify-center font-bold text-sm text-white border border-slate-700">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-xs text-white truncate leading-tight">{user.name}</h4>
            <span className="text-[10px] text-slate-500 capitalize">{user.role} role</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 mb-1">
            Menu
          </span>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-brand/10 border-l-4 border-brand text-brand-300 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white border-l-4 border-transparent'
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="flex flex-col gap-4">
        {isStudent && user.streak > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-duo-orange fill-duo-orange animate-bounce-slow" />
              <span className="text-xs font-bold text-orange-200">Active Streak</span>
            </div>
            <span className="text-sm font-extrabold text-duo-orange">{user.streak} days</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/5 transition-all duration-200 border-l-4 border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
