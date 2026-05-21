import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  HelpCircle,
  Clock, 
  Award, 
  Flame,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuestionData {
  id: number;
  question: string;
  type: 'mcq' | 'fill_in_the_blank' | 'sentence_correction' | 'vocabulary' | 'scenario';
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizEngineProps {
  lessonId: number;
  questions: QuestionData[];
  onComplete: (data: { score: number; accuracy: number; xpEarned: number; newStreak: number }) => void;
  onClose: () => void;
}

export default function QuizEngine({ lessonId, questions, onComplete, onClose }: QuizEngineProps) {
  const { token, updateUser } = useAuthStore();
  
  // State variables
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Result state
  const [xpEarned, setXpEarned] = useState(0);
  const [newStreak, setNewStreak] = useState(0);

  // Timer
  useEffect(() => {
    if (quizFinished) return;
    const timer = setInterval(() => {
      setTimeTaken(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quizFinished]);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center glass-card max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="font-bold text-white mb-2">No Questions Available</h3>
        <p className="text-sm text-slate-400 mb-6">This lesson doesn't have any practice questions configured yet.</p>
        <button onClick={onClose} className="px-6 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (option: string) => {
    if (isChecked) return;
    setSelectedAnswer(option);
  };

  const handleCheck = () => {
    if (isChecked) return;
    
    let answer = '';
    if (currentQuestion.type === 'fill_in_the_blank' || currentQuestion.type === 'sentence_correction') {
      answer = textAnswer.trim();
    } else {
      answer = selectedAnswer;
    }

    if (!answer) return;

    // Normalizing string comparisons for fill_in_the_blanks
    const normalizedUser = answer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
    const normalizedCorrect = currentQuestion.correct_answer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();

    const correct = normalizedUser === normalizedCorrect;
    
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      setScore(s => s + 1);
    } else {
      // Add topic or question type to wrong items
      setWrongTopics(w => [...w, currentQuestion.type]);
    }
  };

  const handleContinue = () => {
    // Reset answers
    setSelectedAnswer('');
    setTextAnswer('');
    setIsChecked(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(c => c + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    setIsSubmitting(true);
    
    // Submit score to backend
    try {
      const finalScore = score + (isCorrect ? 1 : 0); // Include final answer if correct
      const actualScore = isChecked ? finalScore : score;
      
      const response = await fetch('http://localhost:5000/api/learning/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          score: actualScore,
          total_questions: questions.length,
          time_taken: timeTaken,
          wrong_answers: wrongTopics
        })
      });

      if (response.ok) {
        const data = await response.json();
        setXpEarned(data.xp_earned);
        setNewStreak(data.new_streak);
        
        // Update global auth store with new values
        updateUser({
          xp: data.total_xp,
          streak: data.new_streak
        });
      }
    } catch (err) {
      console.error("Failed to submit quiz score:", err);
      // Fallback local calculations if offline
      const localAcc = score / questions.length;
      setXpEarned(Math.round(localAcc * 20));
      setNewStreak(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((currentIdx) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-[#06070a] z-50 overflow-y-auto flex flex-col justify-between">
      {/* TOP HEADER STATUS */}
      <div className="max-w-3xl w-full mx-auto px-6 py-6 flex items-center justify-between gap-6">
        <button onClick={onClose} className="text-slate-400 hover:text-white font-extrabold text-2xl transition">
          ✕
        </button>
        {/* PROGRESS BAR */}
        <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-duo-green transition-all duration-300 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* QUIZ CONTENT BODY */}
      <div className="max-w-2xl w-full mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        {!quizFinished ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* CATEGORY TAG */}
              <div className="self-start px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[10px] uppercase font-bold tracking-widest">
                Question Type: {currentQuestion.type.replace(/_/g, ' ')}
              </div>

              {/* QUESTION TEXT */}
              <h3 className="text-xl font-bold text-white font-sans leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* INPUT RENDER */}
              <div className="mt-4 flex flex-col gap-3">
                {/* 1. MCQS OR VOCAB OR DIALOGUE SCENARIOS */}
                {(currentQuestion.type === 'mcq' || 
                  currentQuestion.type === 'vocabulary' || 
                  currentQuestion.type === 'scenario') && (
                  <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((opt, index) => {
                      const isSelected = selectedAnswer === opt;
                      return (
                        <button
                          key={index}
                          disabled={isChecked}
                          onClick={() => handleSelectOption(opt)}
                          className={`
                            w-full text-left px-5 py-4 rounded-xl border font-medium text-sm transition-all flex items-center justify-between
                            ${isSelected 
                              ? 'bg-brand/10 border-brand-500 text-brand-200' 
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                            }
                            ${isChecked && opt === currentQuestion.correct_answer ? '!bg-duo-green/10 !border-duo-green !text-duo-green' : ''}
                            ${isChecked && isSelected && !isCorrect ? '!bg-red-500/10 !border-red-500 !text-red-400' : ''}
                          `}
                        >
                          <span>{opt}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                            Option {String.fromCharCode(65 + index)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. FILL IN THE BLANK OR SENTENCE CORRECTION */}
                {(currentQuestion.type === 'fill_in_the_blank' || 
                  currentQuestion.type === 'sentence_correction') && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      disabled={isChecked}
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Type your response here..."
                      className={`
                        glass-input w-full font-medium text-sm py-4
                        ${isChecked && isCorrect ? '!bg-duo-green/10 !border-duo-green !text-duo-green focus:ring-duo-green' : ''}
                        ${isChecked && !isCorrect ? '!bg-red-500/10 !border-red-500 !text-red-400 focus:ring-red-500' : ''}
                      `}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheck();
                      }}
                    />
                    
                    {isChecked && !isCorrect && (
                      <div className="text-xs text-red-400 px-1">
                        Correct Answer: <strong className="font-semibold text-white">{currentQuestion.correct_answer}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* COMPLETION RESULTS VIEW */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-slate-900/40 p-8 flex flex-col items-center text-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center border border-brand-500/30">
              <Award className="w-8 h-8 text-duo-yellow fill-duo-yellow/10" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white font-sans">
                Lesson Completed!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You've successfully finished the lesson curriculum and graded practice.
              </p>
            </div>

            {/* METRICS PILLS */}
            <div className="grid grid-cols-3 gap-3 w-full mt-2">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</span>
                <span className="text-lg font-extrabold text-white mt-1">{score} / {questions.length}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">XP Earned</span>
                <span className="text-lg font-extrabold text-duo-yellow mt-1">+{xpEarned} XP</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Streak</span>
                <span className="text-lg font-extrabold text-duo-orange mt-1 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-duo-orange fill-duo-orange/20" />
                  {newStreak}d
                </span>
              </div>
            </div>

            {/* PERFORMANCE ANALYSIS */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 w-full flex items-center gap-4 text-left">
              <Clock className="w-5 h-5 text-slate-500" />
              <div>
                <h5 className="font-bold text-xs text-white">Time Taken</h5>
                <p className="text-xs text-slate-400">
                  You resolved this course module in <strong>{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => onComplete({ score, accuracy: score / questions.length, xpEarned, newStreak })}
              disabled={isSubmitting}
              className="btn-premium w-full py-4 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting progress...
                </>
              ) : (
                <>
                  Done & Unlock Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* DUOLINGO-STYLE SLIDING BOTTOM CHECK DRAWER */}
      {!quizFinished && (
        <div className={`
          border-t transition-all duration-300 px-6 py-6 
          ${isChecked 
            ? isCorrect 
              ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300' 
              : 'bg-red-950/80 border-red-900/60 text-red-200' 
            : 'bg-slate-950/80 border-slate-900 text-slate-400'
          }
        `}>
          <div className="max-w-2xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* EXPLANATIONS AND BANNER */}
            <div className="flex items-start gap-4">
              {isChecked ? (
                isCorrect ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-duo-green shrink-0 mt-0.5 animate-bounce-slow" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white font-sans uppercase tracking-wide">Awesome Job! Perfect!</h4>
                      <p className="text-xs text-emerald-400 mt-0.5">Correct response selected. Let's claim +5 XP bonus points!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white font-sans uppercase tracking-wide">Incorrect Answer</h4>
                      <div className="text-xs text-red-300 font-medium leading-relaxed max-w-lg mt-0.5">
                        <strong className="text-white block mb-0.5">Grammar Explanation:</strong>
                        {currentQuestion.explanation}
                      </div>
                    </div>
                  </>
                )
              ) : (
                <>
                  <HelpCircle className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 font-sans uppercase tracking-wide">Stuck?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Select or type an option above to trigger verification.</p>
                  </div>
                </>
              )}
            </div>

            {/* BUTTON CONTROLS */}
            <div>
              {!isChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={
                    (currentQuestion.type === 'fill_in_the_blank' || currentQuestion.type === 'sentence_correction')
                      ? !textAnswer.trim()
                      : !selectedAnswer
                  }
                  className="btn-duo-success px-10 py-3 disabled:bg-slate-800 disabled:border-b-0 disabled:text-slate-600 disabled:translate-y-0 disabled:brightness-100 text-xs font-black w-full md:w-auto"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  className={`
                    px-10 py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border-b-[4px] active:border-b-0 active:translate-y-[4px] uppercase tracking-wider text-white transition-all w-full md:w-auto
                    ${isCorrect 
                      ? 'bg-duo-green hover:bg-duo-green-light border-duo-green-dark' 
                      : 'bg-red-500 hover:bg-red-400 border-red-700'
                    }
                  `}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
