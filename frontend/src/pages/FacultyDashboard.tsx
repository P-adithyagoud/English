import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Users, 
  Award, 
  Flame, 
  TrendingUp, 
  Search, 
  ArrowUpDown,
  PlusCircle, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface FacultyAnalytics {
  total_students: number;
  total_attempts: number;
  average_accuracy: number;
  average_streak: number;
  average_completion_rate: number;
  top_performers: Array<{ id: number; name: string; email: string; xp: number; streak: number }>;
  struggling_students: Array<{ id: number; name: string; email: string; xp: number; accuracy: number; streak: number }>;
  weekly_engagement: Array<{ day: string; active: number }>;
  accuracy_distribution: Array<{ range: string; count: number }>;
}

interface StudentPerformance {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  english_level: string;
  learning_goal: string;
  average_accuracy: number;
  completed_lessons_count: number;
  weak_topics: Record<string, number>;
}

export default function FacultyDashboard() {
  const { token } = useAuthStore();
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGoal, setFilterGoal] = useState('All');
  const [sortField, setSortField] = useState<'xp' | 'streak' | 'accuracy'>('xp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Student Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);

  // Lesson Creation CRUD State
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonModuleId, setNewLessonModuleId] = useState('1'); // Default to mastering tenses
  const [newLessonXP] = useState(20);
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  // Practice Questions in new lesson
  const [newQuestions, setNewQuestions] = useState<Array<{
    question: string;
    type: 'mcq' | 'fill_in_the_blank' | 'sentence_correction' | 'vocabulary' | 'scenario';
    options: string[];
    correct_answer: string;
    explanation: string;
  }>>([
    {
      question: "Which of the following describes present actions occurring right now?",
      type: "mcq",
      options: ["Simple Present", "Present Continuous", "Past Perfect", "Future Continuous"],
      correct_answer: "Present Continuous",
      explanation: "Present Continuous represents dynamic actions that are currently taking place in real time."
    }
  ]);

  const fetchFacultyData = async () => {
    setIsLoading(true);
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      
      const [analyticsRes, studentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/faculty/analytics', { headers: authHeader }),
        fetch('http://localhost:5000/api/faculty/students', { headers: authHeader })
      ]);

      if (analyticsRes.ok && studentsRes.ok) {
        const analyticsData = await analyticsRes.json();
        const studentsData = await studentsRes.json();
        setAnalytics(analyticsData);
        setStudents(studentsData.students);
      } else {
        setError('Failed to fetch faculty aggregates');
      }
    } catch (err) {
      setError('Cannot connect to API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, [token]);

  const handleSort = (field: 'xp' | 'streak' | 'accuracy') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleAddQuestionRow = () => {
    setNewQuestions([...newQuestions, {
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: ""
    }]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...newQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setNewQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...newQuestions];
    const opts = [...updated[qIndex].options];
    opts[oIndex] = value;
    updated[qIndex].options = opts;
    setNewQuestions(updated);
  };

  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess('');

    if (!newLessonTitle || !newLessonContent) {
      setCrudError('Title and content are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/faculty/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          module_id: parseInt(newLessonModuleId),
          title: newLessonTitle,
          content: newLessonContent,
          xp_reward: newLessonXP,
          questions: newQuestions
        })
      });

      if (response.ok) {
        setCrudSuccess('Lesson and graded micro-quiz added to roadmap successfully!');
        setNewLessonTitle('');
        setNewLessonContent('');
        setNewQuestions([
          {
            question: "Which of the following describes present actions occurring right now?",
            type: "mcq",
            options: ["Simple Present", "Present Continuous", "Past Perfect", "Future Continuous"],
            correct_answer: "Present Continuous",
            explanation: "Present Continuous represents dynamic actions that are currently taking place in real time."
          }
        ]);
        setTimeout(() => {
          setIsAddingLesson(false);
          setCrudSuccess('');
        }, 1500);
        fetchFacultyData();
      } else {
        const errData = await response.json();
        setCrudError(errData.message || 'Failed to submit lesson.');
      }
    } catch (err) {
      setCrudError('Database seeding request offline.');
    }
  };

  // Searching, Filtering & Sorting Logical Operations
  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGoal = filterGoal === 'All' || s.learning_goal === filterGoal;
      return matchesSearch && matchesGoal;
    })
    .sort((a, b) => {
      let valA: any = a[sortField === 'accuracy' ? 'average_accuracy' : sortField];
      let valB: any = b[sortField === 'accuracy' ? 'average_accuracy' : sortField];
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing institutional records...</span>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="font-extrabold text-white text-lg">Administrative Sync Error</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{error || 'Server error occurred.'}</p>
          <button onClick={fetchFacultyData} className="btn-premium px-6 py-2.5 text-xs font-bold">
            Reconnect Server
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] pl-64 pt-20">
      <Sidebar />
      <Header />

      <main className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* TOP ROW: ACTIONS & HEADINGS */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white font-sans">
              Faculty Administration Hub
            </h2>
            <p className="text-xs text-slate-400">
              Review analytical summaries, monitor struggling student targets, and append learning track lessons.
            </p>
          </div>
          
          <button
            onClick={() => setIsAddingLesson(true)}
            className="btn-premium px-5 py-3 text-xs font-bold flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Append New Course Module
          </button>
        </div>

        {/* METRICS DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Students</span>
              <span className="text-2xl font-extrabold text-white mt-1">{analytics.total_students} Students</span>
              <span className="text-[9px] text-brand-300 font-semibold mt-1">Enrollment stable</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Overall Quiz Submissions</span>
              <span className="text-2xl font-extrabold text-white mt-1">{analytics.total_attempts} Submits</span>
              <span className="text-[9px] text-slate-500 font-semibold mt-1">High engagement activity</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average Course Accuracy</span>
              <span className="text-2xl font-extrabold text-duo-green mt-1">
                {Math.round(analytics.average_accuracy * 100)}%
              </span>
              <span className="text-[9px] text-slate-500 font-semibold mt-1">Targets met standard (75%)</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-duo-green">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg. Completion Rate</span>
              <span className="text-2xl font-extrabold text-white mt-1">
                {Math.round(analytics.average_completion_rate * 100)}%
              </span>
              <span className="text-[9px] text-slate-500 font-semibold mt-1">Lessons fully unlocked</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-duo-orange">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* GRAPHICAL SUMMARY SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STRUGGLING STUDENTS LISTS (1 col) */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Struggling Student Targets
              </h4>
              <p className="text-[10px] text-slate-500">Requires attention: average quiz accuracy under 75%</p>
            </div>

            <div className="flex flex-col gap-3">
              {analytics.struggling_students.length > 0 ? (
                analytics.struggling_students.map((stud) => (
                  <div key={stud.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-xs text-white">{stud.name}</h5>
                      <span className="text-[10px] text-slate-500">{stud.email}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-red-400">{Math.round(stud.accuracy * 100)}% Acc</span>
                      <span className="text-[9px] text-slate-500 font-semibold">{stud.xp} XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                  <Check className="w-6 h-6 text-duo-green mx-auto mb-2" />
                  <span className="text-xs text-emerald-300 font-bold block">No Students Struggling!</span>
                  <p className="text-[9px] text-slate-500 mt-0.5">All student accuracies score above limits.</p>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE STUDENT ENGAGEMENT TIME SERIES (2 cols) */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-4">
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                Active Student Growth Timelines
              </h4>
              <p className="text-[10px] text-slate-500">Engagement indices tracked over past week</p>
            </div>

            {/* BAR GRAPH METRICS */}
            <div className="h-44 w-full flex items-end gap-6 justify-between px-2 pt-4 relative mt-2">
              <div className="absolute inset-x-0 bottom-6 border-b border-slate-800/60 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-20 border-b border-slate-800/30 pointer-events-none" />

              {analytics.weekly_engagement.map((d, idx) => {
                const maxVal = Math.max(...analytics.weekly_engagement.map(x => x.active), 5);
                const height = (d.active / maxVal) * 110;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-950 border border-slate-800 text-[9px] font-extrabold text-brand-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 font-mono">
                      {d.active} active
                    </div>
                    <div 
                      className="w-12 bg-gradient-to-t from-brand to-duo-blue rounded-t-lg transition-all duration-300"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[10px] font-bold text-slate-500">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PERFORMANCE SPREADSHEETS FILTER CONTROLS */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                Detailed Students Performance Table
              </h4>
              <p className="text-[10px] text-slate-500">Search student records, sort XP points, or filter preparation goal choices</p>
            </div>
            
            {/* CONTROLS */}
            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="glass-input pl-9 text-[11px] py-2 w-48 focus:w-56"
                />
              </div>

              {/* FILTER BY GOAL */}
              <div className="relative">
                <select
                  value={filterGoal}
                  onChange={(e) => setFilterGoal(e.target.value)}
                  className="glass-input text-[11px] py-2 pr-8 pl-3 bg-slate-950"
                >
                  <option value="All">All Focus Goals</option>
                  <option value="Interview Preparation">Interview Prep</option>
                  <option value="IELTS Preparation">IELTS Prep</option>
                  <option value="Communication Improvement">Comm Improvement</option>
                  <option value="Learning English">General English</option>
                </select>
              </div>
            </div>
          </div>

          {/* SPREADSHEET */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold select-none">
                  <th className="py-3 px-2">Student Name</th>
                  <th className="py-3 px-2">English Level</th>
                  <th className="py-3 px-2">Prep Goal Focus</th>
                  
                  {/* SORTABLES */}
                  <th className="py-3 px-2 cursor-pointer hover:text-white transition" onClick={() => handleSort('xp')}>
                    <span className="flex items-center gap-1.5">
                      XP Score
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </span>
                  </th>
                  
                  <th className="py-3 px-2 cursor-pointer hover:text-white transition" onClick={() => handleSort('streak')}>
                    <span className="flex items-center gap-1.5">
                      Streak Count
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </span>
                  </th>

                  <th className="py-3 px-2 cursor-pointer hover:text-white transition" onClick={() => handleSort('accuracy')}>
                    <span className="flex items-center gap-1.5">
                      Average Accuracy
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </span>
                  </th>
                  
                  <th className="py-3 px-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300 font-medium">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-900/10 transition">
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-white text-xs">{stud.name}</div>
                        <span className="text-[10px] text-slate-500">{stud.email}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400">
                          {stud.english_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-bold text-slate-400">{stud.learning_goal}</td>
                      <td className="py-3.5 px-2 font-extrabold text-duo-yellow">{stud.xp} XP</td>
                      <td className="py-3.5 px-2 font-extrabold text-duo-orange">{stud.streak} days</td>
                      <td className="py-3.5 px-2">
                        <span className={`font-bold ${stud.average_accuracy >= 0.75 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {Math.round(stud.average_accuracy * 100)}% accuracy
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => setSelectedStudent(stud)}
                          className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-brand text-[10px] font-bold text-slate-400 hover:text-white transition"
                        >
                          Profile Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 font-semibold">
                      No student records match search descriptors.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DETAILED STUDENT MODAL INSIGHTS */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-[#05060a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-lg w-full p-8 relative flex flex-col gap-6 animate-pulse-slow">
            <button 
              onClick={() => setSelectedStudent(null)} 
              className="absolute right-6 top-6 text-slate-500 hover:text-white font-extrabold text-lg"
            >
              ✕
            </button>

            <div>
              <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider">Student Insight Profile</span>
              <h3 className="text-xl font-extrabold text-white mt-1">{selectedStudent.name}</h3>
              <p className="text-xs text-slate-500">{selectedStudent.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full bg-slate-950/60 p-4 border border-slate-850 rounded-2xl">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">XP Points</span>
                <span className="text-base font-extrabold text-duo-yellow mt-1">{selectedStudent.xp} XP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Active Streak</span>
                <span className="text-base font-extrabold text-duo-orange mt-1">{selectedStudent.streak} days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Quiz Accuracy</span>
                <span className="text-base font-extrabold text-emerald-400 mt-1">{Math.round(selectedStudent.average_accuracy * 100)}%</span>
              </div>
            </div>

            {/* WEAK TOPICS */}
            <div className="flex flex-col gap-2.5">
              <h5 className="font-bold text-xs text-white">Focus Mistakes Distribution</h5>
              
              {Object.keys(selectedStudent.weak_topics).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedStudent.weak_topics).map(([topic, count]) => (
                    <span key={topic} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-300 font-bold">
                      {topic}: {count} errors
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">No weaknesses registered. Highly perfect accuracy recorded.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full btn-premium py-3.5 text-xs font-bold"
            >
              Close Insight Review
            </button>
          </div>
        </div>
      )}

      {/* APPEND NEW LESSON CRUD MODAL */}
      {isAddingLesson && (
        <div className="fixed inset-0 bg-[#05060a]/90 backdrop-blur-md z-50 flex items-center justify-center overflow-y-auto p-6">
          <div className="glass-card max-w-2xl w-full p-8 relative flex flex-col gap-6">
            <button 
              onClick={() => setIsAddingLesson(false)} 
              className="absolute right-6 top-6 text-slate-500 hover:text-white font-extrabold text-lg"
            >
              ✕
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-white">Append New Course Module</h3>
              <p className="text-xs text-slate-500 mt-1">Design a comprehensive lesson complete with interactive practice questions.</p>
            </div>

            {crudError && <div className="bg-red-500/10 border border-red-500/20 text-xs text-red-400 p-3 rounded-xl">{crudError}</div>}
            {crudSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 p-3 rounded-xl">{crudSuccess}</div>}

            <form onSubmit={handleSubmitLesson} className="flex flex-col gap-4 overflow-y-auto max-h-[450px] pr-2">
              <div className="grid grid-cols-2 gap-4">
                {/* LESSON TITLE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Lesson Title</label>
                  <input
                    type="text"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="Present Perfect Continuous Masterclass"
                    className="glass-input text-xs py-3 w-full"
                    required
                  />
                </div>

                {/* TARGET MODULE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Target Module Category</label>
                  <select
                    value={newLessonModuleId}
                    onChange={(e) => setNewLessonModuleId(e.target.value)}
                    className="glass-input text-xs py-3 bg-slate-950"
                  >
                    <option value="1">Grammar: Mastering Tenses</option>
                    <option value="2">Vocabulary: Corporate Jargon</option>
                    <option value="3">Speaking: Polite Conversations</option>
                    <option value="4">HR Round: Structural Elevator Pitch</option>
                    <option value="5">IELTS Prep: Cue Cards Part 2</option>
                  </select>
                </div>
              </div>

              {/* LESSON CONTENT */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Lesson Content (Markdown Supported)</label>
                <textarea
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  placeholder="### Conceptual Introduction..."
                  rows={5}
                  className="glass-input text-xs font-mono w-full"
                  required
                />
              </div>

              {/* QUESTIONS SUB-FORM */}
              <div className="flex flex-col gap-3 mt-2 border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-white">Graded Practice Questions (Micro-Quiz)</h5>
                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold text-brand hover:border-brand-500 hover:text-brand-300 transition"
                  >
                    + Append Question
                  </button>
                </div>

                {newQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl flex flex-col gap-3 relative">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-600">Question #{idx + 1}</span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase text-slate-500 font-bold">Question Description</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                        placeholder="Every monday, we ____ a code audit."
                        className="glass-input text-xs py-2.5"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* TYPE */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-slate-500 font-bold">Question Format</label>
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                          className="glass-input text-xs py-2 bg-slate-950"
                        >
                          <option value="mcq">MCQ Choice List</option>
                          <option value="fill_in_the_blank">Fill in the Blanks</option>
                          <option value="sentence_correction">Sentence Correction</option>
                          <option value="vocabulary">Vocab Matching</option>
                          <option value="scenario">Dialogue Scenario</option>
                        </select>
                      </div>

                      {/* CORRECT ANSWER */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-slate-500 font-bold">Correct Solution</label>
                        <input
                          type="text"
                          value={q.correct_answer}
                          onChange={(e) => handleQuestionChange(idx, 'correct_answer', e.target.value)}
                          placeholder="holds (Case insensitive)"
                          className="glass-input text-xs py-2"
                          required
                        />
                      </div>
                    </div>

                    {/* OPTIONS (MCQS ONLY) */}
                    {q.type === 'mcq' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase text-slate-500 font-bold">Multiple Choices (4 Options)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map((optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              value={q.options[optIdx] || ''}
                              onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="glass-input text-[11px] py-1.5"
                              required
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EXPLANATION */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase text-slate-500 font-bold">AI Detailed Explanation</label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                        placeholder="Every monday triggers a simple present verb..."
                        className="glass-input text-[11px] py-2"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4 border-t border-slate-800/80 pt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingLesson(false)}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-slate-800 hover:bg-slate-800/20 text-slate-500 hover:text-white transition text-xs font-bold"
                >
                  Cancel Append
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-premium py-3.5 text-xs font-bold"
                >
                  Publish Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
