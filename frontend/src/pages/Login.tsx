import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setAuth(data.token, data.user);
        
        // Redirect based on role
        if (data.user.role === 'faculty') {
          navigate('/faculty');
        } else {
          // If student has completed onboarding (e.g. has learning_goal set), skip onboarding
          if (data.user.learning_goal) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Is the Flask backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Login Helper
  const handleQuickDemo = async (demoEmail: string) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'password123' })
      });

      const data = await response.json();
      if (response.ok) {
        setAuth(data.token, data.user);
        if (data.user.role === 'faculty') {
          navigate('/faculty');
        } else {
          if (data.user.learning_goal) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed. Ensure backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-[#05060a]">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-duo-blue/5 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full flex flex-col gap-8 relative z-10">
        {/* LOGO TITLE */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-brand w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand/40 border border-brand-400/20">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-3xl text-white font-sans tracking-wide leading-none">
              FluentFlow <span className="text-brand-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Enterprise gamified platform for gesprochenes Englisch & IELTS Prep
            </p>
          </div>
        </div>

        {/* AUTH BOX */}
        <div className="glass-card bg-slate-900/60 p-8 border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col gap-6">
          <h3 className="font-extrabold text-lg text-white font-sans text-center">
            Sign in to your learning track
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* EMAIL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="glass-input pl-11 w-full text-xs"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-input pl-11 w-full text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium py-4 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Decrypting Session...' : 'Authenticate Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-3">
            <hr className="flex-1 border-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Demo Fast Pass
            </span>
            <hr className="flex-1 border-slate-800" />
          </div>

          {/* QUICK DEMO CREDENTIAL CARDS */}
          <div className="flex flex-col gap-2.5">
            {/* STUDENT */}
            <button
              onClick={() => handleQuickDemo('student@example.com')}
              disabled={isLoading}
              className="w-full text-left bg-slate-950/60 border border-slate-800 hover:border-brand-500/30 rounded-xl p-3 flex items-center gap-3 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-300">
                <GraduationCap className="w-4 h-4 group-hover:scale-110 transition" />
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-white">Student Experience Dashboard</h5>
                <p className="text-[10px] text-slate-500">Quick sign-in: student@example.com</p>
              </div>
            </button>

            {/* FACULTY */}
            <button
              onClick={() => handleQuickDemo('faculty@example.com')}
              disabled={isLoading}
              className="w-full text-left bg-slate-950/60 border border-slate-800 hover:border-brand-500/30 rounded-xl p-3 flex items-center gap-3 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition" />
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-white">Faculty Analytics Portal</h5>
                <p className="text-[10px] text-slate-500">Quick sign-in: faculty@example.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
