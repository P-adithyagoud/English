import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';
import Header from '../components/Header';
import ProgressRing from '../components/ProgressRing';
import QuizEngine from '../components/QuizEngine';
import type { QuestionData } from '../components/QuizEngine';
import { 
  Award, 
  Flame, 
  Target, 
  Trophy, 
  TrendingUp, 
  CheckCircle2, 
  Play, 
  AlertCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface DashboardData {
  progress: {
    completed_lessons: number[];
    total_xp: number;
    current_streak: number;
    weak_topics: Record<string, number>;
  };
  total_attempts: number;
  average_accuracy: number;
  leaderboard_rank: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    badge: string;
    unlocked: boolean;
  }>;
  recommended_lesson: {
    id: number;
    title: string;
    track_title: string;
    module_title: string;
    xp_reward: number;
  } | null;
  quiz_history: Array<{
    id: number;
    lesson_title: string;
    score: number;
    accuracy: number;
    xp_earned: number;
    time_taken: number;
    created_at: string;
  }>;
}

export default function StudentDashboard() {
  const { user, token, logout } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz Player State
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [lessonQuestions, setLessonQuestions] = useState<QuestionData[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Cannot connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleStartLesson = async (lessonId: number) => {
    setIsQuestionsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/learning/lessons/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const resData = await response.json();
        setLessonQuestions(resData.lesson.questions);
        setActiveLessonId(lessonId);
      }
    } catch (err) {
      console.error("Failed to load lesson questions:", err);
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const handleQuizComplete = () => {
    setActiveLessonId(null);
    setLessonQuestions([]);
    fetchDashboardData(); // Reload stats, XP, streak, achievements
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !user) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="font-extrabold text-white text-lg">Dashboard Error</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{error || 'Unknown initialization error.'}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={fetchDashboardData} className="btn-premium px-6 py-2.5 text-xs font-bold">
              Retry Connection
            </button>
            <button onClick={() => logout()} className="px-6 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition duration-200">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate weak topics lists
  const weakTopics = Object.entries(data.progress.weak_topics);

  // Generate responsive mock weekly timeline items for visual chart
  const weeklyXPData = [
    { day: 'Mon', xp: 20 },
    { day: 'Tue', xp: 50 },
    { day: 'Wed', xp: 30 },
    { day: 'Thu', xp: 0 },
    { day: 'Fri', xp: 60 },
    { day: 'Sat', xp: 20 },
    { day: 'Sun', xp: 45 }
  ];

  return (
    <div className="min-h-screen bg-[#06070a] pl-64 pt-20">
      <Sidebar />
      <Header />

      <main className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* TOP ROW GRID - STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* XP WIDGET */}
          <div className="glass-card bg-slate-900/40 p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total XP Score</span>
              <span className="text-2xl font-extrabold text-white mt-1">{user.xp} XP</span>
              <span className="text-[9px] text-brand-300 font-semibold mt-1">Level {Math.floor(user.xp / 100) + 1} Scholar</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* STREAK */}
          <div className="glass-card bg-slate-900/40 p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Streak</span>
              <span className="text-2xl font-extrabold text-duo-orange mt-1">{user.streak} Days</span>
              <span className="text-[9px] text-slate-500 font-semibold mt-1">Keep it up, don't break it!</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-duo-orange">
              <Flame className="w-6 h-6 animate-bounce-slow" />
            </div>
          </div>

          {/* ACCURACY SUMMARY */}
          <div className="glass-card bg-slate-900/40 p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg. Accuracy</span>
              <span className="text-2xl font-extrabold text-white mt-1">
                {Math.round(data.average_accuracy * 100)}%
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold mt-1">Across {data.total_attempts} modules</span>
            </div>
            <div>
              <ProgressRing 
                radius={24} 
                stroke={3.5} 
                progress={data.average_accuracy * 100} 
                colorClass="stroke-duo-green" 
              />
            </div>
          </div>

          {/* LEADERBOARD STANDINGS */}
          <div className="glass-card bg-slate-900/40 p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Global Standings</span>
              <span className="text-2xl font-extrabold text-white mt-1">Rank #{data.leaderboard_rank}</span>
              <span className="text-[9px] text-slate-500 font-semibold mt-1">Top {Math.max(10, Math.round(10 / data.leaderboard_rank))}% of users</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-duo-blue">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION - RECOMMENDED LESSONS & STREAK TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PERSONALIZED NEXT LESSON (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-bold text-base text-white font-sans flex items-center gap-2">
              <Play className="w-4 h-4 text-brand-300" />
              Your Next Personalized Lesson
            </h3>

            {data.recommended_lesson ? (
              <div className="glass-card glass-card-brand bg-gradient-to-r from-brand-900/20 to-slate-900/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-bold text-brand-300 tracking-wider">
                    {data.recommended_lesson.track_title} • {data.recommended_lesson.module_title}
                  </span>
                  <h4 className="text-lg font-bold text-white leading-tight">
                    {data.recommended_lesson.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md mt-1">
                    Master interactive scenarios and build extreme spoken communication confidence today.
                  </p>
                </div>
                <button
                  onClick={() => handleStartLesson(data.recommended_lesson!.id)}
                  disabled={isQuestionsLoading}
                  className="btn-premium px-8 py-4 text-xs font-bold uppercase tracking-wider shrink-0 flex items-center justify-center gap-2"
                >
                  {isQuestionsLoading ? 'Loading Core...' : 'Launch Lesson'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-duo-green mx-auto mb-2" />
                <h4 className="font-bold text-sm text-white">All Tracks Completed!</h4>
                <p className="text-xs text-slate-400 mt-1">Excellent work! You can revise any lesson from the Tracks roadmap.</p>
              </div>
            )}

            {/* ANALYTICAL XP CHART WIDGET */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    Weekly XP Engagement Metrics
                  </h4>
                  <p className="text-[10px] text-slate-500">Your gamified XP earnings over the past week</p>
                </div>
                <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-semibold font-mono">
                  +135 XP Total
                </span>
              </div>

              {/* DYNAMIC SVG CHART AREA */}
              <div className="h-32 w-full mt-2 flex items-end gap-3 justify-between px-2 pt-4 relative">
                <div className="absolute inset-x-0 bottom-6 border-b border-slate-800/60 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-16 border-b border-slate-800/30 pointer-events-none" />

                {weeklyXPData.map((d, idx) => {
                  const maxXP = 60;
                  const barHeight = d.xp > 0 ? (d.xp / maxXP) * 80 : 4; // percent
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      {d.xp > 0 && (
                        <div className="absolute -top-6 bg-slate-950 border border-slate-800 text-[9px] font-extrabold text-brand-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none font-mono">
                          +{d.xp}XP
                        </div>
                      )}
                      {/* Bar */}
                      <div 
                        className={`
                          w-8 rounded-t-md transition-all duration-500 ease-out
                          ${d.xp > 0 ? 'bg-gradient-to-t from-brand to-brand-400' : 'bg-slate-800'}
                          group-hover:brightness-110
                        `}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR METRICS - WEAK TOPICS & BADGES (1 col) */}
          <div className="flex flex-col gap-6">
            {/* BADGES / ACHIEVEMENTS */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-duo-yellow" />
                Unlocked Achievements
              </h4>
              <div className="flex flex-col gap-3">
                {data.achievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className={`
                      p-3 rounded-xl border flex items-center gap-3 transition-all duration-300
                      ${ach.unlocked 
                        ? 'bg-slate-900/80 border-slate-800/80' 
                        : 'bg-slate-950/20 border-slate-900 opacity-40'
                      }
                    `}
                  >
                    <div className="text-2xl">{ach.badge}</div>
                    <div>
                      <h5 className={`font-bold text-xs ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {ach.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEAK FOCUS AREAS ALERT */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                Recommended focus areas
              </h4>
              
              {weakTopics.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-1">
                    Based on your incorrect answers in quizzes, we suggest spending extra review time on:
                  </p>
                  {weakTopics.map(([topic, count]) => (
                    <div key={topic} className="bg-red-500/5 border border-red-500/10 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-red-300">
                      <span>{topic}</span>
                      <span className="text-[9px] bg-red-500/10 px-2 py-0.5 rounded text-red-400">
                        {count} mistakes
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-duo-green shrink-0" />
                  <p className="text-[10px] text-emerald-300 font-medium leading-relaxed">
                    Zero weaknesses documented yet! Keep up the perfect answers in your next modules.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - QUIZ HISTORY LOGS */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Recent Quiz Attempts History
              </h4>
              <p className="text-[10px] text-slate-500">A detailed log of your past module answers and performance ratings</p>
            </div>
          </div>

          {data.quiz_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
                    <th className="py-3 px-2">Lesson Title</th>
                    <th className="py-3 px-2">Accuracy</th>
                    <th className="py-3 px-2">Points Claimed</th>
                    <th className="py-3 px-2">Time Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300 font-medium">
                  {data.quiz_history.map((hist) => (
                    <tr key={hist.id} className="hover:bg-slate-900/20 transition">
                      <td className="py-3 px-2 font-bold text-white">{hist.lesson_title}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          hist.accuracy >= 0.8 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : hist.accuracy >= 0.6 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-red-500/10 text-red-400'
                        }`}>
                          {Math.round(hist.accuracy * 100)}% Accuracy
                        </span>
                      </td>
                      <td className="py-3 px-2 font-extrabold text-duo-yellow">+{hist.xp_earned} XP</td>
                      <td className="py-3 px-2 text-slate-500 font-mono">
                        {Math.floor(hist.time_taken / 60)}m {hist.time_taken % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">You haven't resolved any quizzes yet! Launch the recommended lesson above to begin.</p>
          )}
        </div>
      </main>

      {/* RENDER THE GAMIFIED FULL-SCREEN QUIZ ENGINE */}
      {activeLessonId && (
        <QuizEngine
          lessonId={activeLessonId}
          questions={lessonQuestions}
          onComplete={handleQuizComplete}
          onClose={() => setActiveLessonId(null)}
        />
      )}
    </div>
  );
}
