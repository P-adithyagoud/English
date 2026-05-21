import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QuizEngine from '../components/QuizEngine';
import type { QuestionData } from '../components/QuizEngine';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  PlayCircle
} from 'lucide-react';

interface TrackData {
  id: number;
  title: string;
  description: string;
  category: string;
  modules: Array<{
    id: number;
    title: string;
    order_index: number;
    lessons: Array<{
      id: number;
      title: string;
      order_index: number;
      xp_reward: number;
      completed: boolean;
    }>;
  }>;
}

export default function LearningTracks() {
  const { token } = useAuthStore();
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  
  // Quiz Player State
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [lessonQuestions, setLessonQuestions] = useState<QuestionData[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/learning/tracks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks);
        if (data.tracks.length > 0) {
          // Set first track as active by default
          setActiveTrackId(data.tracks[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load tracks roadmap:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [token]);

  const handleLaunchLesson = async (lessonId: number) => {
    setIsQuestionsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/learning/lessons/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLessonQuestions(data.lesson.questions);
        setActiveLessonId(lessonId);
      }
    } catch (err) {
      console.error("Failed to launch lesson quiz:", err);
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const handleQuizComplete = () => {
    setActiveLessonId(null);
    setLessonQuestions([]);
    fetchTracks(); // Reload roadmaps with updated checks
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Roadmap...</span>
        </div>
      </div>
    );
  }

  const currentTrack = tracks.find(t => t.id === activeTrackId);

  return (
    <div className="min-h-screen bg-[#06070a] pl-64 pt-20">
      <Sidebar />
      <Header />

      <main className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* HEADING ROADMAP */}
        <div>
          <h2 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand" />
            Structured Curriculum Roadmap
          </h2>
          <p className="text-xs text-slate-400">
            Explore active tracks, review concepts, and resolve micro-quizzes to earn XP multipliers
          </p>
        </div>

        {/* ROADMAP TABS */}
        <div className="flex gap-2.5 overflow-x-auto border-b border-slate-800/80 pb-3 w-full">
          {tracks.map((track) => {
            const active = track.id === activeTrackId;
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrackId(track.id)}
                className={`
                  px-5 py-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                  ${active 
                    ? 'bg-brand/10 border-brand-500 text-brand-300 font-extrabold shadow-lg' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/30'
                  }
                `}
              >
                {track.title}
              </button>
            );
          })}
        </div>

        {/* ACTIVE TRACK DETAILS */}
        {currentTrack && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
            {/* LEFT COLUMN: TRACK DETAILS */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="glass-card bg-slate-900/40 p-6 flex flex-col gap-3">
                <span className="text-[9px] uppercase font-extrabold text-brand-400 tracking-widest font-mono">
                  Active learning track
                </span>
                <h3 className="text-lg font-extrabold text-white font-sans leading-tight">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentTrack.description}
                </p>
                <div className="h-[1px] bg-slate-800 w-full my-1" />
                
                {/* TRACK METRICS */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Category focus:</span>
                  <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-brand-300 uppercase tracking-wider font-extrabold">
                    {currentTrack.category}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MODULE CHRONOLOGICAL TIMELINE (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {currentTrack.modules.map((mod, modIdx) => (
                <div key={mod.id} className="flex flex-col gap-4">
                  {/* Module Header */}
                  <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2">
                    <div className="bg-slate-950 border border-slate-800 text-[10px] font-extrabold text-brand-400 w-6 h-6 rounded-md flex items-center justify-center font-mono">
                      {modIdx + 1}
                    </div>
                    <h4 className="font-extrabold text-sm text-white font-sans">
                      {mod.title}
                    </h4>
                  </div>

                  {/* Lessons Listing */}
                  <div className="flex flex-col gap-3">
                    {mod.lessons.map((les, lesIdx) => (
                      <div 
                        key={les.id}
                        className={`
                          glass-card p-4 flex items-center justify-between gap-4 transition duration-200
                          ${les.completed 
                            ? 'bg-slate-950/20 border-slate-900/60' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-brand-500/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4.5">
                          {/* CHECK INDICATOR */}
                          {les.completed ? (
                            <CheckCircle className="w-5 h-5 text-duo-green shrink-0 animate-pulse-slow" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-700 shrink-0" />
                          )}
                          
                          <div className="flex flex-col">
                            <h5 className={`font-bold text-xs ${les.completed ? 'text-slate-400' : 'text-white'}`}>
                              Lesson {lesIdx + 1}: {les.title}
                            </h5>
                            <span className="text-[10px] text-slate-500 mt-1 font-mono">
                              Worth +{les.xp_reward} Base XP Points
                            </span>
                          </div>
                        </div>

                        {/* LAUNCH TRIGGERS */}
                        <button
                          onClick={() => handleLaunchLesson(les.id)}
                          disabled={isQuestionsLoading}
                          className={`
                            px-4 py-2 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1.5 border border-transparent
                            ${les.completed 
                              ? 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' 
                              : 'bg-brand/15 hover:bg-brand text-brand-300 hover:text-white'
                            }
                          `}
                        >
                          {les.completed ? 'Review Quiz' : 'Launch Module'}
                          <PlayCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ACTIVE QUIZ MODAL PLAYER */}
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
