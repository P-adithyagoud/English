import { useAuthStore } from '../store/authStore';
import { Flame, Award, CheckCircle } from 'lucide-react';

export default function Header() {
  const { user } = useAuthStore();

  if (!user) return null;

  const isStudent = user.role === 'student';

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-slate-950/20 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-8 z-30">
      {/* LEFT SECTION - GREETINGS */}
      <div>
        <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
          Welcome back, {user.name}!
          {isStudent && (
            <span className="text-xs bg-brand/20 border border-brand-500/30 px-2 py-0.5 rounded-full text-brand-300">
              {user.english_level || 'English Learner'}
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400">
          {isStudent 
            ? `Target focus: ${user.learning_goal || 'General Communication Mastery'}`
            : 'Accessing institutional controls & administrative aggregates'}
        </p>
      </div>

      {/* RIGHT SECTION - SYSTEM METRICS */}
      <div className="flex items-center gap-4">
        {isStudent ? (
          <>
            {/* XP PILL */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-duo-yellow fill-duo-yellow/10" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 leading-none">Total XP</span>
                <span className="text-sm font-extrabold text-white leading-tight">{user.xp} XP</span>
              </div>
            </div>

            {/* STREAK PILL */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-duo-orange fill-duo-orange/10" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 leading-none">Streak</span>
                <span className="text-sm font-extrabold text-white leading-tight">{user.streak} days</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Faculty Core Connected</span>
          </div>
        )}

        {/* PROFILE PICTURE */}
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
          {user.name.split(' ').map(n => n.charAt(0)).join('')}
        </div>
      </div>
    </header>
  );
}
