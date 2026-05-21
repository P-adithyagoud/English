-- ====================================================================
-- FLUENTFLOW AI - COMPLETE SUPABASE / POSTGRESQL SCHEMA & SEED SCRIPT
-- ====================================================================

-- 1. DROP EXISTING TABLES (Enforces clean recreate if run multiple times)
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE SCHEMAS & TABLES

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    learning_goal VARCHAR(100),
    english_level VARCHAR(100),
    confidence_level INTEGER DEFAULT 1,
    weak_areas TEXT, -- JSON array string
    learning_style VARCHAR(100),
    daily_goal VARCHAR(100),
    streak INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRACKS TABLE (Grammar, Vocabulary, Speaking, etc.)
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100)
);

-- MODULES TABLE
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- LESSONS TABLE
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Markdown curriculum
    order_index INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 15
);

-- QUESTIONS TABLE
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'fill_in_the_blank', 'sentence_correction', 'vocabulary', 'scenario')),
    options TEXT, -- JSON array of options for MCQs
    correct_answer TEXT NOT NULL,
    explanation TEXT
);

-- QUIZ ATTEMPTS TABLE
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    time_taken INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STUDENT PROGRESS TABLE
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    completed_lessons TEXT DEFAULT '[]', -- JSON array
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    weak_topics TEXT DEFAULT '{}', -- JSON object map
    last_activity_date DATE DEFAULT CURRENT_DATE
);

-- 3. INDEXES FOR SCALED QUERY PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_modules_track ON modules(track_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_questions_lesson ON questions(lesson_id);
CREATE INDEX idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX idx_progress_user ON student_progress(user_id);

-- 4. SEED AUTHENTICATED USERS (With 'password123' pbkdf2/scrypt hashes embedded directly)
INSERT INTO users (id, name, email, role, password_hash, learning_goal, english_level, confidence_level, weak_areas, learning_style, daily_goal, streak, xp, created_at) VALUES
(1, 'Dr. Sarah Jenkins', 'faculty@example.com', 'faculty', 'scrypt:32768:8:1$RvEj5ydGEYkOEjgy$3e0da477851fbc765c6e6d99f235a0fcf7d1f1631ad4d5678971d8dfc6f57ca309af2e14f6a210507c1f3163c01f9e6eff721d0c1051fc03e0e259c9189a0e1f', NULL, NULL, 1, NULL, NULL, NULL, 0, 0, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(2, 'Palamoor Adithya', 'student@example.com', 'student', 'scrypt:32768:8:1$hnbhv1sS5iaHTnmR$98882edad6a8f5e6f63ddab0b26521a8b83975bebac4e01b19aeb15ad8ef22dd6799b7997602d1bb8a70e9ef055f4609a8a8bedf7585e570ce5f0183867bd554', 'Interview Preparation', 'Intermediate (B2)', 3, '["Speaking Speed", "Business Idioms"]', 'Interactive Scenarios', 'Serious (30 XP/day)', 12, 340, CURRENT_TIMESTAMP - INTERVAL '12 days'),
(3, 'John Doe', 'john@example.com', 'student', 'scrypt:32768:8:1$gUSBr7vlSBhvKaCX$ced3d86047e8ecf32ba5aa7d381743046688f54b78dc446b946378de68e13e4bc63cd293d2626cebce4ce95d32cdcc7111efc8cb3fe71525fab9dd9a0b40883b', 'Communication Improvement', 'Beginner (A2)', 1, '["Grammar Foundations", "Sentence Structure"]', 'Visual Lessons', 'Regular (20 XP/day)', 3, 110, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'Emma Watson', 'emma@example.com', 'student', 'scrypt:32768:8:1$su8gGYb3Y689EqPt$012223bb3c70e9841f39a70b414c5d6f5acce0f2ec026b98de12f88ff9502554a5de734645dd6481706f488cea2d9fb1f76dd1fb7db21ebf68ae5566e21d640d', 'IELTS Preparation', 'Advanced (C1)', 5, '["Cue Card Length", "Complex Prepositions"]', 'Fast Pace', 'Insane (50 XP/day)', 28, 750, CURRENT_TIMESTAMP - INTERVAL '30 days');

SELECT setval('users_id_seq', COALESCE(max(id), 1)) FROM users;

-- 5. SEED COURSE TRACKS
INSERT INTO tracks (id, title, description, category) VALUES
(1, 'Grammar Foundations', 'Master core English rules, subject-verb agreements, and complex tenses for flawless communication.', 'Grammar'),
(2, 'Vocabulary Builder', 'Unlock high-impact industry idioms, professional adjectives, and academic vocabulary to express thoughts accurately.', 'Vocabulary'),
(3, 'Spoken English', 'Elevate communication confidence, clear up common mispronunciations, and master tone in daily conversations.', 'Speaking'),
(4, 'Interview Communication', 'Crack technical and HR interviews with structural confidence, structured pitch formulas, and stellar body language.', 'Interviews'),
(5, 'IELTS Preparation', 'Boost your speaking band scores and perfect cue card descriptions with strategic templates.', 'IELTS');

SELECT setval('tracks_id_seq', COALESCE(max(id), 1)) FROM tracks;

-- 6. SEED MODULE CATEGORIES
INSERT INTO modules (id, track_id, title, order_index) VALUES
(1, 1, 'Mastering Tenses & Agreement', 1),
(2, 2, 'Corporate & Professional Speak', 1),
(3, 3, 'Confidence in Conversations', 1),
(4, 4, 'Cracking the HR Rounds', 1),
(5, 5, 'IELTS Speaking Part 2 Mastery', 1),
(6, 1, 'Simple Sentences', 2),
(7, 1, 'Daily Actions', 3),
(8, 2, 'My World', 2),
(9, 2, 'Work & College Basics', 3),
(10, 3, 'Saying Hello', 2),
(11, 3, 'About Me', 3),
(12, 4, 'Interview Basics', 2),
(13, 4, 'Common HR Questions', 3),
(14, 5, 'Listening & Reading Basics', 2),
(15, 5, 'Speaking & Writing Basics', 3);

SELECT setval('modules_id_seq', COALESCE(max(id), 1)) FROM modules;

-- 7. SEED CURRICULUM LESSONS (With clean escaped single quotes)
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES
(1, 1, 'Present Continuous vs Simple Present', '### Present Simple vs Present Continuous
Many English learners confuse when to state facts versus ongoing actions. Let''s break this down:

#### 1. The Simple Present (`Subject + Verb [s/es]`)
We use the Simple Present for **habits, repeated actions, and permanent truths**.
*   *Habit:* "I **study** English every morning at 7:00 AM."
*   *Fact:* "The Sun **rises** in the east."
*   *State:* "He **works** as an engineering lead at Google."

#### 2. The Present Continuous (`Subject + is/am/are + Verb-ing`)
We use the Present Continuous for **actions happening right now, at the moment of speaking**, or for temporary situations.
*   *Right Now:* "I **am studying** grammar continuous rules right now."
*   *Temporary:* "She **is working** from home this week due to repairs."

#### 3. Common Statics Traps (Verbs you cannot use in Continuous)
Certain "stative" verbs describe states, not actions. Avoid writing them in continuous format:
*   ❌ *Incorrect:* "I am knowing the answer."
*   ✔: **"I know the answer."** (Correct!)
*   ❌ *Incorrect:* "This soup is tasting delicious."
*   ✔: **"This soup tastes delicious."** (Correct!)', 1, 20),

(2, 2, 'High-Impact Business Idioms', '### Essential Business Idioms for Corporate Meetings
In professional tech companies and EdTech startups, professionals use idioms to communicate efficiently. Let''s learn 3 primary ones:

#### 1. "Touch Base"
*   **Definition:** To briefly meet, talk, or make contact with someone to receive an update.
*   **Example:** "Let''s *touch base* on Friday to review the product mockups."

#### 2. "Hit the Ground Running"
*   **Definition:** To start a new activity or job immediately with a lot of energy, enthusiasm, and productivity.
*   **Example:** "With his background in React, John *hit the ground running* on our new dashboard feature."

#### 3. "Circle Back"
*   **Definition:** To return to an issue, topic, or person at a later time.
*   **Example:** "We don''t have the marketing budget details today, so let''s *circle back* to this next week."', 1, 20),

(3, 3, 'Expressing Opinions and Disagreements Polite', '### Mastering Polite Disagreements
Confidence is not about always agreeing; it''s about voicing your opinions without sounding hostile or rude.

#### The "Softener" Technique
Before you disagree, start with a "softener" to validate the other person''s perspective. It shows active listening.
*   "I see where you are coming from, but..."
*   "That''s an interesting point, however..."
*   "I understand your concern, though..."

#### ❌ Aggressive vs. ✔ Polite Forms
*   ❌ *Aggressive:* "You are completely wrong about the design."
*   ✔ *Polite:* "I see your point, but I feel a darker glassmorphism background might look more premium."
*   ❌ *Aggressive:* "That will never work."
*   ✔ *Polite:* "That''s an interesting idea, though I''m worried it might slow down our backend query performance."', 1, 25),

(4, 4, 'Elevating your ''Tell Me About Yourself'' Pitch', '### The Perfect HR Pitch: Present-Past-Future Formula
The ''Tell me about yourself'' question is the hook of your entire interview. Most candidates list their resume bullet points chronologically, which is boring. Use the **PPF Formula** instead:

#### 1. The PRESENT (30 seconds)
State your current role, a high-level accomplishment, and your core area of expertise.
*   *Example:* "I am currently a senior engineering student specializing in React and cloud-native systems. Over the past year, I''ve designed and launched two full-stack SaaS prototypes..."

#### 2. The PAST (30 seconds)
Highlight one or two key historical milestones, internships, or academic projects that prove your capabilities.
*   *Example:* "Prior to this, I interned at an AI startup where I optimized their database query speeds by 40% and learned the value of robust code validation..."

#### 3. The FUTURE (20 seconds)
Conclude by stating why you are excited about *this specific role* and how it aligns with your future trajectory.
*   *Example:* "I''m looking to take my skills to a fast-growing platform like yours, where I can build responsive UIs and help scale EdTech infrastructures."', 1, 30),

(5, 5, 'Structuring Part 2 Cue Cards', '### Cracking the IELTS Speaking Part 2
In Part 2, you receive a cue card with a topic and 4 prompts. You must speak continuously for **1 to 2 minutes**. Most candidates fail because they run out of ideas after 40 seconds. 

Use the **PPF (Past-Present-Future) Storytelling Technique** to speak with rich structure:

#### Topic: Describe a book you read that you found useful.

1.  **The Context (Present/Past - 20s):** Introduce the book.
    *   *Draft:* "I''d like to talk about ''Atomic Habits'' by James Clear, which I picked up last summer during my exams."
2.  **The Core Details (Present - 40s):** Answer the main prompts. What was it about?
    *   *Draft:* "The core thesis is that tiny 1% daily changes compound into massive life transformations over time. It''s written in an extremely accessible, Notion-style clean formatting."
3.  **The Impact (Past/Present - 30s):** Why did you find it useful? How did you apply it?
    *   *Draft:* "It completely shifted my morning routine. I began coding for just 30 minutes every single day, which eventually helped me master TypeScript..."
4.  **The Horizon (Future - 20s):** How do you view it going forward?
    *   *Draft:* "I plan to reread it next month, and I''ve already recommended it to my classmates who struggle with streak consistency."', 1, 30),

(6, 6, 'Using Am, Is, and Are', '### Using Am, Is, and Are
Learn the simple rules for the present tense of the verb "to be":
* Use **am** with **I** (e.g., "I am a student.")
* Use **is** with **he, she, it**, or any singular noun (e.g., "He is a doctor.")
* Use **are** with **you, we, they**, or any plural noun (e.g., "They are engineering students.")', 1, 10),

(7, 7, 'Adding ''s'' or ''es''', '### Adding ''s'' or ''es''
In the Simple Present tense, when the subject is third-person singular (**he, she, it**, or a single name), we must add **-s** or **-es** to the base verb:
* Verb: *eat* -> "He **eats** an apple."
* Verb: *go* -> "She **goes** to college."
* Verb: *watch* -> "It **watches** the room."', 1, 15),

(8, 8, 'Family & Friends', '### Family & Friends Vocabulary
Learn key nouns to describe relationships in your world:
* **Mother''s/Father''s brother**: Uncle
* **Mother''s/Father''s sister**: Aunt
* **Aunt''s/Uncle''s children**: Cousin', 1, 10),

(9, 9, 'Polite Words', '### Polite Words in Communication
Using soft, polite words makes a huge difference in college and corporate environments:
* Say **"Sorry"** when you make a mistake.
* Say **"Thank you"** when someone helps you.
* Say **"Excuse me"** to politely get attention.', 1, 15),

(10, 10, 'Greetings for Morning, Afternoon, and Night', '### Greet Professionally Based on Time
* **Good Morning**: Morning until 12:00 PM (noon).
* **Good Afternoon**: 12:00 PM until around 5:00 PM.
* **Good Evening**: 5:00 PM onwards.', 1, 10),

(11, 11, 'Talking about your Hometown', '### Describing Your Hometown
When introducing yourself, talking about your hometown is a wonderful way to connect. Use these key vocabulary structures:
*   "I **am from** [City Name], which is famous for..."
*   "It is a **bustling metropolis** (large city) / a **serene town** (quiet place)."
*   "I have been living there **for** ten years / **since** my childhood."', 1, 15),

(12, 12, 'Greeting the Interviewer', '### Professional Interview Greetings
First impressions matter! Make a perfect start to your interview:
1.  **Smile and stand straight**: Conveys absolute confidence.
2.  **Greetings based on time**:
    *   Morning (until 12 PM): "Good morning, sir/madam."
    *   Afternoon (12 PM - 5 PM): "Good afternoon, sir/madam."
3.  **Soft reply**: "It is a pleasure to meet you today."', 1, 15),

(13, 13, 'Your Strengths', '### How to Pitch Your Strengths
Employers want to know what makes you a great candidate. Use clear, active statements:
*   "My greatest strength is my **adaptability**. I hit the ground running with new technologies."
*   "I am a **hard worker** and a highly **articulate** team member."
*   Always back up your strength with a short example!', 1, 20),

(14, 14, 'Listening for Names and Numbers', '### IELTS Listening: Names and Numbers
In Part 1 of the IELTS Listening exam, you will hear a phone conversation. You must write down details:
1.  **Spelling of Names**: Listen carefully as speakers spell out unusual names (e.g. "S-M-I-T-H").
2.  **Numbers**: Phone numbers, credit cards, or dates are read out. Double-check for zeroes ("oh" or "zero").', 1, 20),

(15, 15, 'Using Connectors', '### Cohesion and Coherence: Using Connectors
To get a high band score in IELTS Writing and Speaking, you must connect sentences beautifully:
*   **Contrast (opposite ideas)**: Use "but", "however", or "although".
    *   *Example:* "I like apples, **but** I do not like oranges."
*   **Addition (extra details)**: Use "and", "furthermore", or "in addition".
*   **Cause & Effect**: Use "because", "so", or "therefore".', 1, 25);

SELECT setval('lessons_id_seq', COALESCE(max(id), 1)) FROM lessons;

-- 8. SEED DIVERSE GRADED QUESTIONS
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES
-- Lesson 1 Questions
(1, 1, 'Every Monday morning, the engineering team _____ a standup meeting to align on milestones.', 'fill_in_the_blank', NULL, 'holds', 'Every Monday implies a habit/repeated routine, which requires the Simple Present (''holds'') rather than the continuous form (''is holding'').'),
(2, 1, 'Which of the following sentences represents correct grammar usage of stative verbs?', 'mcq', '["I am preferring Tailwind CSS over normal CSS for styling.", "I prefer Tailwind CSS over normal CSS for styling.", "I have been preferring Tailwind CSS for a few weeks.", "I am going to be preferring Tailwind CSS."]', 'I prefer Tailwind CSS over normal CSS for styling.', '''Prefer'' is a stative verb describing a mental state, not an ongoing physical action. Stative verbs do not take continuous ''-ing'' forms.'),
(3, 1, 'Correct this sentence: ''Look at the sky! It rains heavily right now.''', 'sentence_correction', NULL, 'Look at the sky! It is raining heavily right now.', '''Right now'' refers to an action occurring at the exact moment of speaking. Thus, it requires the Present Continuous tense (''is raining'').'),
(4, 1, 'Select the synonym of ''temporary'' that fits a changing situation:', 'vocabulary', '["Permanent", "Transient", "Eternal", "Perpetual"]', 'Transient', '''Transient'' means lasting only for a short time; impermanent or temporary, which represents the dynamic state of transient work.'),
(5, 1, 'Scenario: You are in a daily standup. A colleague asks if you are finished. How do you explain that you are CURRENTLY in the middle of coding the login page?', 'scenario', '["I code the login page every day.", "I was coding the login page yesterday.", "I am coding the login page right now, and I will submit it soon.", "I have coded the login page last week."]', 'I am coding the login page right now, and I will submit it soon.', 'To represent an ongoing action in a real-world scenario, the Present Continuous (''I am coding right now'') communicates it perfectly.'),

-- Lesson 2 Questions
(6, 2, 'During the meeting, the project manager said: ''We are running out of time, so let''s _____ on this item during our Friday sync.''', 'fill_in_the_blank', NULL, 'touch base', '''Touch base'' means to briefly contact or catch up with someone, which fits perfectly for a subsequent sync-up meeting.'),
(7, 2, 'What does it mean if a new full-stack engineer ''hits the ground running''?', 'mcq', '["They had a bad accident on their first day of work.", "They start working immediately with great energy and high productivity.", "They literally ran around the office during onboarding.", "They spent their first three weeks reading documentation without writing code."]', 'They start working immediately with great energy and high productivity.', '''Hit the ground running'' means to start a new activity or career immediately with enthusiasm and high output.'),
(8, 2, 'Correct this usage: ''Let''s circle back the pricing issue until we have the market research.''', 'sentence_correction', NULL, 'Let''s circle back to the pricing issue when we have the market research.', 'The idiom is ''circle back to [something]'', and it''s logical to sync *when* or *once* we have the data, rather than *until*.'),
(9, 2, 'Vocabulary: What is the meaning of the corporate jargon ''synergy''?', 'vocabulary', '["Extreme tiredness", "Combined interaction or cooperative action", "Single isolation", "Financial debt"]', 'Combined interaction or cooperative action', '''Synergy'' describes the cooperation of two or more organizations, substances, or teams to produce a combined effect greater than the sum of their separate parts.'),
(10, 2, 'Scenario: You are in an email sync. A client raises a question that requires engineering research. What is the most professional response using our idioms?', 'scenario', '["I don''t know, ask someone else.", "I will touch base with the dev team and circle back to you with the results by tomorrow.", "I am hitting the ground running to tell you I don''t know.", "I''m ignoring your question for now."]', 'I will touch base with the dev team and circle back to you with the results by tomorrow.', 'This integrates both ''touch base'' (talking to the dev team) and ''circle back'' (returning with the answer) elegantly and professionally.'),

-- Lesson 3 Questions
(11, 3, 'Which of the following is a respectful ''softener'' to start a disagreement?', 'mcq', '["You are absolutely wrong about this.", "I see where you are coming from, but...", "That''s completely illogical.", "Let''s not talk about your idea."]', 'I see where you are coming from, but...', 'This softener validates the speaker''s viewpoint, demonstrating active listening before presenting an alternative opinion.'),
(12, 3, 'Scenario: A colleague suggests using plain CSS instead of Tailwind, claiming it''s faster. You disagree. Which response is most professional?', 'scenario', '["No, plain CSS is outdated and terrible.", "I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.", "You don''t understand modern web app requirements.", "Fine, do whatever you want."]', 'I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.', 'This uses a softener (''I understand your concern about speed'') followed by a clear, objective business justification for Tailwind CSS.'),
(13, 3, 'Fill in the blank to soften this rejection: ''That is a good suggestion, ________, our server architecture might not support that real-time load.''', 'fill_in_the_blank', NULL, 'however', '''however'' acts as a professional conjunction to transition from a softener to an objective technological limitation.'),
(14, 3, 'Correct this aggressive phrasing: ''Your database schema choice is a disaster.''', 'sentence_correction', NULL, 'I appreciate your design, but we might run into scalability issues with this database schema.', 'Replacing personal attacks (''is a disaster'') with constructive, objective feedback (''scalability issues'') preserves professional relationships.'),
(15, 3, 'Vocabulary: What does ''tactful'' communication mean?', 'vocabulary', '["Extremely loud", "Sensitivity in dealing with difficult issues to avoid offense", "Being brutal and direct", "Slow to respond"]', 'Sensitivity in dealing with difficult issues to avoid offense', 'Being ''tactful'' is a core skill in professional English, meaning showing skill and sensitivity when managing difficult or conflicting viewpoints.'),

-- Lesson 4 Questions
(16, 4, 'The ''PPF Formula'' stands for ________, ________, and ________.', 'fill_in_the_blank', NULL, 'Present, Past, Future', 'The formula starts with what you do right now (Present), transitions to your achievements (Past), and ends with why you want this role (Future).'),
(17, 4, 'In the ''PPF'' HR pitch formula, what should you focus on during the ''FUTURE'' section?', 'mcq', '["Your childhood dreams of becoming an astronaut.", "Why you are excited about this specific role and how you can add value to their company.", "Detailed explanations of your salary expectations.", "A summary of your college grades and GPA."]', 'Why you are excited about this specific role and how you can add value to their company.', 'The Future section bridges your current capabilities directly to the employer''s needs, creating a persuasive closing hook.'),
(18, 4, 'Correct this passive/weak statement: ''I did some React work at my college club.''', 'sentence_correction', NULL, 'I designed and implemented a full-stack dashboard for my college club using React.', 'Using active, action-driven verbs (''designed and implemented'') instead of passive verbs (''did some work'') conveys high technical ownership.'),
(19, 4, 'Vocabulary: What is the meaning of ''articulate''?', 'vocabulary', '["Showing high physical speed", "Having the ability to speak fluently and coherently", "Being extremely stubborn", "Using complex, outdated vocabulary"]', 'Having the ability to speak fluently and coherently', 'To ''articulate'' means to express an idea or feeling fluently and clearly in spoken or written English.'),
(20, 4, 'Scenario: An interviewer asks: ''Tell me about yourself.'' Which introduction hook is best?', 'scenario', '["Hello, my name is Amit. I was born in 2004. I like watching movies and reading books...", "Hi, I''m Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I''m building FluentFlow AI...", "Well, you can read my resume. It has all my projects listed on page 1.", "I am currently looking for any job that pays well because I need to pay off my loans."]', 'Hi, I''m Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I''m building FluentFlow AI...', 'A high-impact hook starts with your professional identity, core technical stack, and a highly active project (the ''Present'').'),

-- Lesson 5 Questions
(21, 5, 'In IELTS Speaking Part 2, you must speak continuously for at least _____ minutes.', 'fill_in_the_blank', NULL, '1 to 2', 'The examiner gives you exactly 1 minute to prepare, and you must speak continuously for between 1 and 2 minutes.'),
(22, 5, 'How does the PPF storytelling technique help you speak longer in IELTS Part 2?', 'mcq', '["It teaches you how to memorize essays word-for-word.", "It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.", "It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas."]', 'It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.', 'Structuring details across past memories, current practices, and future plans naturally provides ample high-quality content.'),
(23, 5, 'Correct this common spoken IELTS grammar error: ''I am reading this book since three years.''', 'sentence_correction', NULL, 'I have been reading this book for three years.', 'For an action that started in the past and continues into the present, use the Present Perfect Continuous (''have been reading'') with ''for'' (duration).'),
(24, 5, 'Vocabulary: Choose the word that represents a ''compelling and useful'' piece of advice:', 'vocabulary', '["Superfluous", "Invaluable", "Redundant", "Trivial"]', 'Invaluable', '''Invaluable'' means extremely useful or indispensable, which is perfect for describing high-quality support or reading material.'),
(25, 5, 'Scenario: You run out of points on a Cue Card prompt with 40 seconds left. What is the best strategy?', 'scenario', '["Stop speaking immediately and stare at the examiner.", "Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.", "Repeat the same paragraph again using exactly the same words.", "Complain to the examiner that the topic is too difficult."]', 'Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.', 'Switching to the ''Future'' dimension of the PPF technique is the most natural way to expand your content while demonstrating advanced tense control.'),

-- New Graded Beginner Questions (Questions 26 to 35)
-- Lesson 6 Question
(26, 6, 'Choose the correct word to complete the sentence: ''I ____ a student.''', 'mcq', '["is", "am", "are", "be"]', 'am', 'Great job! We always use ''am'' when we talk about ourselves using ''I''.'),

-- Lesson 7 Question
(27, 7, 'Choose the correct sentence:', 'sentence_correction', NULL, 'He eats an apple.', 'Perfect! When we talk about one person (He, She, or It) doing something every day, we add an ''s'' to the action word. Eat becomes eats!'),

-- Lesson 8 Question
(28, 8, 'What do you call your mother''s brother?', 'mcq', '["Uncle", "Aunt", "Brother", "Cousin"]', 'Uncle', 'Yes! In English, your mother''s or father''s brother is called your ''Uncle''.'),

-- Lesson 9 Question
(29, 9, 'When you make a mistake, you should say: ''I am _____.''', 'fill_in_the_blank', NULL, 'Sorry', 'Well done! Saying ''Sorry'' shows you are polite and kind when a mistake happens.'),

-- Lesson 10 Question
(30, 10, 'Greet someone professionally in the evening after 6 PM:', 'mcq', '["Good morning", "Good afternoon", "Good evening", "Goodbye"]', 'Good evening', 'Excellent! Use ''Good evening'' to greet someone professionally after 5:00 PM or 6:00 PM.'),

-- Lesson 11 Question
(31, 11, 'Which of the following is the best way to say where you are from?', 'mcq', '["I am from Hyderabad.", "I going to Hyderabad.", "My name is Hyderabad.", "I am in Hyderabad."]', 'I am from Hyderabad.', 'Spot on! ''I am from [City]'' is the perfect, natural way to tell someone where your hometown is.'),

-- Lesson 12 Question
(32, 12, 'You enter the interview room at 10 AM. The HR manager is sitting at the desk. What should you say?', 'scenario', '["Hi bro.", "Good morning, sir/madam.", "I want a job.", "What is your name?"]', 'Good morning, sir/madam.', 'Wonderful! ''Good morning, sir/madam'' is polite, professional, and shows respect.'),

-- Lesson 13 Question
(33, 13, 'The HR asks: ''What is your strength?'' Choose the best beginner-friendly answer:', 'mcq', '["I am a very hard worker.", "I don''t know.", "I sleep a lot.", "I am angry."]', 'I am a very hard worker.', 'Great choice! Employers love hard workers. It''s a simple, honest, and powerful answer.'),

-- Lesson 14 Question
(34, 14, 'In the audio, the man says: ''My phone number is nine-eight-seven, zero-zero-two.'' Write the number.', 'fill_in_the_blank', NULL, '987002', 'Spot on! In IELTS Listening, catching simple numbers correctly is an easy way to boost your score.'),

-- Lesson 15 Question
(35, 15, 'Join these two simple sentences: ''I like apples. I do not like oranges.''', 'sentence_correction', NULL, 'I like apples but I do not like oranges.', 'Brilliant! We use ''but'' to connect two opposite ideas. This makes your English sound much more natural!');

SELECT setval('questions_id_seq', COALESCE(max(id), 1)) FROM questions;

-- 9. SEED DUMMY PERFORMANCE ATTEMPTS
INSERT INTO quiz_attempts (id, user_id, lesson_id, score, accuracy, xp_earned, time_taken, created_at) VALUES
(1, 2, 1, 4, 0.8, 20, 120, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 4, 1, 5, 1.0, 25, 95,  CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 4, 3, 5, 1.0, 30, 105, CURRENT_TIMESTAMP - INTERVAL '1 day');

SELECT setval('quiz_attempts_id_seq', COALESCE(max(id), 1)) FROM quiz_attempts;

-- 10. SEED INITIAL STUDENT PROGRESS
INSERT INTO student_progress (id, user_id, completed_lessons, total_xp, current_streak, weak_topics, last_activity_date) VALUES
(1, 2, '[1]', 340, 12, '{"Business Idioms": 2, "Grammar Agreement": 1}', CURRENT_DATE),
(2, 3, '[]',  110, 3,  '{"Simple Present": 4, "Tenses": 3}',             CURRENT_DATE),
(3, 4, '[1, 3]', 750, 28, '{"Prepositions": 1}',                            CURRENT_DATE);

SELECT setval('student_progress_id_seq', COALESCE(max(id), 1)) FROM student_progress;
