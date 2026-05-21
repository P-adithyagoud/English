import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  GraduationCap, 
  MessageSquare,
  Volume2,
  Briefcase,
  FileText,
  Star,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuthStore();
  
  // Steps: 0 = Profile, 1 = Skill Level, 2 = Focus & Style, 3 = Primary Prep Goal
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [englishLevel, setEnglishLevel] = useState('Intermediate (B2)');
  const [confidence, setConfidence] = useState(3);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [learningStyle] = useState('Gamified Practice');
  const [dailyGoal, setDailyGoal] = useState('Serious (30 XP/day)');
  const [preparingFor, setPreparingFor] = useState('Interview Preparation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleWeakArea = (area: string) => {
    if (weakAreas.includes(area)) {
      setWeakAreas(weakAreas.filter(a => a !== area));
    } else {
      setWeakAreas([...weakAreas, area]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmitOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/student/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          english_level: englishLevel,
          confidence_level: confidence,
          weak_areas: weakAreas,
          learning_style: learningStyle,
          daily_goal: dailyGoal,
          preparing_for: preparingFor
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state locally
        updateUser(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to submit onboarding:', err);
      // fallback
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const levels = [
    { label: 'Beginner (A1/A2)', desc: 'Can introduce myself and speak simple sentences.' },
    { label: 'Intermediate (B1/B2)', desc: 'Can handle conversations and write clearly about standard topics.' },
    { label: 'Advanced (C1/C2)', desc: 'Fluent, spontaneous, and easily speak complex English.' }
  ];

  const weakAreasOptions = [
    'Grammar Foundations',
    'Business Idioms',
    'Pronunciation Clearness',
    'Speech Delivery Speed',
    'Public Speaking Confidence',
    'IELTS Descriptive Topics'
  ];

  const goals = [
    { label: 'Learning English', icon: GraduationCap, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Interview Preparation', icon: Briefcase, color: 'text-violet-400 bg-violet-500/10' },
    { label: 'IELTS Preparation', icon: FileText, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Communication Improvement', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Placement Preparation', icon: Volume2, color: 'text-pink-400 bg-pink-500/10' }
  ];

  return (
    <div className="min-h-screen bg-[#05060a] py-12 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-xl w-full flex flex-col gap-6 relative z-10">
        {/* STEPPER HEADING */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Setup personalized pathway
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400">Step {step + 1} of 4</span>
        </div>

        {/* ONBOARDING STEPS */}
        <div className="glass-card bg-slate-900/60 p-8 border border-slate-800/80 rounded-3xl min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col justify-center"
            >
              {/* STEP 1: ACCOUNT PROFILE */}
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-extrabold text-xl text-white font-sans">
                    Let's personalize your name
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Enter your name as you would like it to appear on your achievements and leaderboard ranks.
                  </p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="glass-input text-sm py-4 w-full"
                    required
                  />
                </div>
              )}

              {/* STEP 2: ENGLISH SKILLS */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <h3 className="font-extrabold text-xl text-white font-sans">
                    Describe your English skills
                  </h3>
                  
                  {/* LEVELS SELECTOR */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Current English Level
                    </span>
                    {levels.map((l) => (
                      <button
                        key={l.label}
                        onClick={() => setEnglishLevel(l.label)}
                        className={`
                          w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between
                          ${englishLevel === l.label 
                            ? 'bg-brand/10 border-brand-500 text-brand-200 font-semibold' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                          }
                        `}
                      >
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">{l.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{l.desc}</div>
                        </div>
                        {englishLevel === l.label && <Check className="w-4 h-4 text-brand-300" />}
                      </button>
                    ))}
                  </div>

                  {/* CONFIDENCE RATING */}
                  <div className="flex flex-col gap-2.5 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Spoken English Confidence Level
                    </span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setConfidence(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star 
                            className={`w-7 h-7 ${star <= confidence ? 'text-duo-yellow fill-duo-yellow' : 'text-slate-700'}`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {confidence <= 2 ? 'Struggle with public flow' : confidence === 3 ? 'Comfortable but make frequent traps' : 'Very fluent in meetings'}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 3: FOCUS AREAS AND LEARNING STYLE */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <h3 className="font-extrabold text-xl text-white font-sans">
                    Tailor your focusing targets
                  </h3>

                  {/* WEAK AREAS */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Weak Areas (Select all that apply)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {weakAreasOptions.map((area) => {
                        const active = weakAreas.includes(area);
                        return (
                          <button
                            key={area}
                            onClick={() => handleToggleWeakArea(area)}
                            className={`
                              px-3 py-2 rounded-xl text-left border text-[11px] font-semibold transition
                              ${active 
                                ? 'bg-brand/10 border-brand-500 text-brand-200' 
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                              }
                            `}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* DAILY GOALS */}
                  <div className="flex flex-col gap-2.5 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Daily Learning Goal
                    </span>
                    <div className="flex gap-2 w-full">
                      {['Casual (10 XP)', 'Regular (20 XP)', 'Serious (30 XP)', 'Insane (50 XP)'].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setDailyGoal(goal)}
                          className={`
                            flex-1 py-3 text-center rounded-xl border text-[10px] font-bold transition
                            ${dailyGoal === goal 
                              ? 'bg-brand/10 border-brand-500 text-brand-200' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:bg-slate-900'
                            }
                          `}
                        >
                          {goal.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: INTENT ON PREPARATION */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-extrabold text-xl text-white font-sans text-center">
                    What are you preparing for?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed text-center mb-2">
                    We personalize tracks, vocab, and quizzes tailored to your selection.
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {goals.map((g) => {
                      const active = preparingFor === g.label;
                      return (
                        <button
                          key={g.label}
                          onClick={() => setPreparingFor(g.label)}
                          className={`
                            w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group
                            ${active 
                              ? 'bg-brand/15 border-brand-500 text-brand-200 font-extrabold' 
                              : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-900'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${g.color} group-hover:scale-105 transition`}>
                              <g.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white">{g.label}</span>
                          </div>
                          {active && <Check className="w-4 h-4 text-brand-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-6 mt-6">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-5 py-3 rounded-xl border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/20 disabled:opacity-0 transition text-xs font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="btn-premium px-8 py-3.5 text-xs font-bold flex items-center gap-2"
            >
              {isSubmitting 
                ? 'Saving selection...' 
                : step === 3 
                  ? 'Complete & Go!' 
                  : 'Continue'
              }
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
