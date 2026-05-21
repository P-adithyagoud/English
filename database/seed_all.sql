-- ====================================================================
-- FLUENTFLOW AI - PRODUCTION-READY SUPABASE SCHEMAS (UUID + JSONB)
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DROP EXISTING TABLES IN REVERSE RELATIONSHIP ORDER
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE TABLES WITH NATIVE UUID & JSONB SUPPORT

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    learning_goal VARCHAR(100),
    english_level VARCHAR(100),
    confidence_level INTEGER DEFAULT 1,
    weak_areas JSONB DEFAULT '[]'::jsonb,
    learning_style VARCHAR(100),
    daily_goal VARCHAR(100),
    streak INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRACKS TABLE
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100)
);

-- MODULES TABLE
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- LESSONS TABLE
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 15
);

-- QUESTIONS TABLE
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'fill_in_the_blank', 'sentence_correction', 'vocabulary', 'scenario')),
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT
);

-- STUDENT PROGRESS TABLE
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    completed_lessons JSONB DEFAULT '[]'::jsonb,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    weak_topics JSONB DEFAULT '{}'::jsonb,
    last_activity_date DATE DEFAULT CURRENT_DATE
);

-- QUIZ ATTEMPTS TABLE
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    time_taken INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. GIN INDEXES FOR STRUCTURAL JSONB QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_weak_areas ON users USING gin (weak_areas);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON student_progress USING gin (completed_lessons);
CREATE INDEX IF NOT EXISTS idx_progress_weak_topics ON student_progress USING gin (weak_topics);

-- 4. STANDARD INDEXES FOR FOREIGN KEY SEARCH OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_modules_track ON modules(track_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON student_progress(user_id);


-- ====================================================================
-- SEED DATA INSERTION
-- ====================================================================

-- 1. SEED USERS
INSERT INTO users (id, role, name, email, password_hash, learning_goal, english_level, confidence_level, weak_areas, learning_style, daily_goal, streak, xp, created_at) VALUES ('5fce7940-fb78-5ecb-b83a-ddbb5ea168d9', 'faculty', 'Dr. Sarah Jenkins', 'faculty@example.com', 'scrypt:32768:8:1$HXGudmhk9cburAPH$177da80c728db95d9665f9539859a9d3e998f69235171fe118188526c2e63f203cc1b34005c10dea3dcf6a3d6c6340bd4e53a26852b48f27e02cc324d2a8b573', NULL, NULL, 1, NULL, NULL, NULL, 0, 0, '2026-05-21 16:44:55+00');
INSERT INTO users (id, role, name, email, password_hash, learning_goal, english_level, confidence_level, weak_areas, learning_style, daily_goal, streak, xp, created_at) VALUES ('8c9f050e-f770-5ad3-a4a4-08c0b71c166a', 'student', 'Palamoor Adithya', 'student@example.com', 'scrypt:32768:8:1$fNOlyFKXVWADzrFm$27a0be513ac6810435ee716231d251d74f441f08e8dc64b779127094b7a643fb2a6d4185b5d4d4bfcfb19a1568a37de4fee73526f5f32e217987fe914435d50d', 'Interview Preparation', 'Intermediate (B2)', 3, '["Speaking Speed", "Business Idioms"]'::jsonb, 'Interactive Scenarios', 'Serious (30 XP/day)', 12, 372, '2026-05-21 16:44:55+00');
INSERT INTO users (id, role, name, email, password_hash, learning_goal, english_level, confidence_level, weak_areas, learning_style, daily_goal, streak, xp, created_at) VALUES ('a5c770c8-6150-5106-b2c2-942598cc96cf', 'student', 'John Doe', 'john@example.com', 'scrypt:32768:8:1$Dv69d8KuXfSMQKik$931a21bb4de9cd6800f3c508726d7ba4423984d895b4a9b77af42ea36c3809b9adcc33b9cf21916770ee0a2128cc3b298b35f15b7906b96d40133d0c399ccfa0', 'Communication Improvement', 'Beginner (A2)', 1, '["Grammar Foundations", "Sentence Structure"]'::jsonb, 'Visual Lessons', 'Regular (20 XP/day)', 3, 110, '2026-05-21 16:44:55+00');
INSERT INTO users (id, role, name, email, password_hash, learning_goal, english_level, confidence_level, weak_areas, learning_style, daily_goal, streak, xp, created_at) VALUES ('977debdb-14a3-5ac2-8fbb-00edb90e00d6', 'student', 'Emma Watson', 'emma@example.com', 'scrypt:32768:8:1$lYPhm6CCdBM1qCTG$adaf287f8a6b7bc8bd9edff24586f4fdca63a60ae881740a1d0c96e5f8b490e22ad65c21a61549d581dfe0632ee9be04d6c4aca508bcfb9fb00be7d326f17f42', 'IELTS Preparation', 'Advanced (C1)', 5, '["Cue Card Length", "Complex Prepositions"]'::jsonb, 'Fast Pace', 'Insane (50 XP/day)', 28, 750, '2026-05-21 16:44:55+00');

-- 2. SEED TRACKS
INSERT INTO tracks (id, title, description, category) VALUES ('f1656374-8664-5772-91bc-dccae4edc7be', 'Grammar Foundations', 'Master core English rules, subject-verb agreements, and complex tenses for flawless communication.', 'Grammar');
INSERT INTO tracks (id, title, description, category) VALUES ('38499d3e-0e7e-5598-abf1-f66fdd52129a', 'Vocabulary Builder', 'Unlock high-impact industry idioms, professional adjectives, and academic vocabulary to express thoughts accurately.', 'Vocabulary');
INSERT INTO tracks (id, title, description, category) VALUES ('d7d5f111-db8f-5617-be36-ec64bd75bd03', 'Spoken English', 'Elevate communication confidence, clear up common mispronunciations, and master tone in daily conversations.', 'Speaking');
INSERT INTO tracks (id, title, description, category) VALUES ('cdf8bb2a-0cab-5964-81bf-1c6bc4fdc34e', 'Interview Communication', 'Crack technical and HR interviews with structural confidence, structured pitch formulas, and stellar body language.', 'Interviews');
INSERT INTO tracks (id, title, description, category) VALUES ('93e8d06d-d0ff-5b27-a068-00142dfe1182', 'IELTS Preparation', 'Boost your speaking band scores and perfect cue card descriptions with strategic templates.', 'IELTS');

-- 3. SEED MODULES
INSERT INTO modules (id, track_id, title, order_index) VALUES ('3052487e-2d96-58c4-a541-2bd1829e5eb5', 'f1656374-8664-5772-91bc-dccae4edc7be', 'Mastering Tenses & Agreement', 1);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('dc5a4c52-7b1a-5d8f-9321-fc17917506a8', '38499d3e-0e7e-5598-abf1-f66fdd52129a', 'Corporate & Professional Speak', 1);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('1b9b5a3b-b77e-572a-8da3-6241968f7e36', 'd7d5f111-db8f-5617-be36-ec64bd75bd03', 'Confidence in Conversations', 1);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('c73db127-5127-577b-a14e-3e6ebf244162', 'cdf8bb2a-0cab-5964-81bf-1c6bc4fdc34e', 'Cracking the HR Rounds', 1);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('ba5c6812-8c40-5be6-a1f2-030c1dde1d10', '93e8d06d-d0ff-5b27-a068-00142dfe1182', 'IELTS Speaking Part 2 Mastery', 1);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('00eddd4e-fa5e-553b-b829-5eb8b05c55cd', 'f1656374-8664-5772-91bc-dccae4edc7be', 'Simple Sentences', 2);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('7cdd76ac-18bd-5c38-92b2-8a15e70adf1d', 'f1656374-8664-5772-91bc-dccae4edc7be', 'Daily Actions', 3);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('9fba1462-3e0e-55a4-9ee4-0c2662bf7f41', '38499d3e-0e7e-5598-abf1-f66fdd52129a', 'My World', 2);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('acfe6ddd-0817-56a4-bb1a-a2ccab7b0bc6', '38499d3e-0e7e-5598-abf1-f66fdd52129a', 'Work & College Basics', 3);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('0955bdf0-c9a6-5327-8c79-4609e6b9ee96', 'd7d5f111-db8f-5617-be36-ec64bd75bd03', 'Saying Hello', 2);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('603456e3-227c-5b07-8271-b660e6afe5df', 'd7d5f111-db8f-5617-be36-ec64bd75bd03', 'About Me', 3);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('f8b3afdd-b5ee-5fad-b801-ab483f3fa08a', 'cdf8bb2a-0cab-5964-81bf-1c6bc4fdc34e', 'Interview Basics', 2);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('5f7b7be4-3e16-59f7-9532-4bd27735ea37', 'cdf8bb2a-0cab-5964-81bf-1c6bc4fdc34e', 'Common HR Questions', 3);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('ec696b25-dddd-5c9e-9d2a-250024a133a1', '93e8d06d-d0ff-5b27-a068-00142dfe1182', 'Listening & Reading Basics', 2);
INSERT INTO modules (id, track_id, title, order_index) VALUES ('b92b4400-461f-58eb-b69d-03bc965e521d', '93e8d06d-d0ff-5b27-a068-00142dfe1182', 'Speaking & Writing Basics', 3);

-- 4. SEED LESSONS
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('2565216d-d9ca-5c46-816b-4dd16bee29a3', '3052487e-2d96-58c4-a541-2bd1829e5eb5', 'Present Continuous vs Simple Present', '### Present Simple vs Present Continuous
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
*   ✔: **"This soup tastes delicious."** (Correct!)', 1, 20);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('5b3141fc-0dfd-540b-a26e-93b3a02a69ba', 'dc5a4c52-7b1a-5d8f-9321-fc17917506a8', 'High-Impact Business Idioms', '### Essential Business Idioms for Corporate Meetings
In professional tech companies and EdTech startups, professionals use idioms to communicate efficiently. Let''s learn 3 primary ones:

#### 1. "Touch Base"
*   **Definition:** To briefly meet, talk, or make contact with someone to receive an update.
*   **Example:** "Let''s *touch base* on Friday to review the product mockups."

#### 2. "Hit the Ground Running"
*   **Definition:** To start a new activity or job immediately with a lot of energy, enthusiasm, and productivity.
*   **Example:** "With his background in React, John *hit the ground running* on our new dashboard feature."

#### 3. "Circle Back"
*   **Definition:** To return to an issue, topic, or person at a later time.
*   **Example:** "We don''t have the marketing budget details today, so let''s *circle back* to this next week.', 1, 20);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('88f905db-66b7-5403-b049-0fd493ec54df', '1b9b5a3b-b77e-572a-8da3-6241968f7e36', 'Expressing Opinions and Disagreements Polite', '### Mastering Polite Disagreements
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
*   ✔ *Polite:* "That''s an interesting idea, though I''m worried it might slow down our backend query performance.', 1, 25);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('d99a133f-eebd-5dd3-b7ca-07f012a9ed31', 'c73db127-5127-577b-a14e-3e6ebf244162', 'Elevating your ''Tell Me About Yourself'' Pitch', '### The Perfect HR Pitch: Present-Past-Future Formula
The ''Tell me about yourself'' question is the hook of your entire interview. Most candidates list their resume bullet points chronologically, which is boring. Use the **PPF Formula** instead:

#### 1. The PRESENT (30 seconds)
State your current role, a high-level accomplishment, and your core area of expertise.
*   *Example:* "I am currently a senior engineering student specializing in React and cloud-native systems. Over the past year, I''ve designed and launched two full-stack SaaS prototypes..."

#### 2. The PAST (30 seconds)
Highlight one or two key historical milestones, internships, or academic projects that prove your capabilities.
*   *Example:* "Prior to this, I interned at an AI startup where I optimized their database query speeds by 40% and learned the value of robust code validation..."

#### 3. The FUTURE (20 seconds)
Conclude by stating why you are excited about *this specific role* and how it aligns with your future trajectory.
*   *Example:* "I''m looking to take my skills to a fast-growing platform like yours, where I can build responsive UIs and help scale EdTech infrastructures."'', 1, 30),

#### Topic: Describe a book you read that you found useful.

1.  **The Context (Present/Past - 20s):** Introduce the book.
    *   *Draft:* "I''d like to talk about ''Atomic Habits'' by James Clear, which I picked up last summer during my exams."
2.  **The Core Details (Present - 40s):** Answer the main prompts. What was it about?
    *   *Draft:* "The core thesis is that tiny 1% daily changes compound into massive life transformations over time. It''s written in an extremely accessible, Notion-style clean formatting."
3.  **The Impact (Past/Present - 30s):** Why did you find it useful? How did you apply it?
    *   *Draft:* "It completely shifted my morning routine. I began coding for just 30 minutes every single day, which eventually helped me master TypeScript..."
4.  **The Horizon (Future - 20s):** How do you view it going forward?
    *   *Draft:* "I plan to reread it next month, and I''ve already recommended it to my classmates who struggle with streak consistency.', 1, 30);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('4ec967c0-30a9-5b7d-90a3-eb2a5eeb13eb', 'ba5c6812-8c40-5be6-a1f2-030c1dde1d10', 'Structuring Part 2 Cue Cards', '### Cracking the IELTS Speaking Part 2
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
    *   *Draft:* "I plan to reread it next month, and I''ve already recommended it to my classmates who struggle with streak consistency.', 1, 30);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('c6806b0b-4f16-5c9e-ae49-d47f2707ff04', '00eddd4e-fa5e-553b-b829-5eb8b05c55cd', 'Using Am, Is, and Are', '### Using Am, Is, and Are
Learn the simple rules for the present tense of the verb "to be":
* Use **am** with **I** (e.g., "I am a student.")
* Use **is** with **he, she, it**, or any singular noun (e.g., "He is a doctor.")
* Use **are** with **you, we, they**, or any plural noun (e.g., "They are engineering students.")', 1, 10);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('8af3b173-b725-51df-b72e-3e6242814a87', '7cdd76ac-18bd-5c38-92b2-8a15e70adf1d', 'Adding ''s'' or ''es''', '### Adding ''s'' or ''es''
In the Simple Present tense, when the subject is third-person singular (**he, she, it**, or a single name), we must add **-s** or **-es** to the base verb:
* Verb: *eat* -> "He **eats** an apple."
* Verb: *go* -> "She **goes** to college."
* Verb: *watch* -> "It **watches** the room." ', 1, 15);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('8df95d20-9ded-58f1-977d-10dfa62056bc', '9fba1462-3e0e-55a4-9ee4-0c2662bf7f41', 'Family & Friends', '### Family & Friends Vocabulary
Learn key nouns to describe relationships in your world:
* **Mother''s/Father''s brother**: Uncle
* **Mother''s/Father''s sister**: Aunt
* **Aunt''s/Uncle''s children**: Cousin', 1, 10);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('9319fab4-c339-5017-9236-88a3c026836e', 'acfe6ddd-0817-56a4-bb1a-a2ccab7b0bc6', 'Polite Words', '### Polite Words in Communication
Using soft, polite words makes a huge difference in college and corporate environments:
* Say **"Sorry"** when you make a mistake.
* Say **"Thank you"** when someone helps you.
* Say **"Excuse me"** to politely get attention.', 1, 15);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('d6ac9f9a-ed35-5965-bdcb-56e63bf3da02', '0955bdf0-c9a6-5327-8c79-4609e6b9ee96', 'Greetings for Morning, Afternoon, and Night', '### Greet Professionally Based on Time
* **Good Morning**: Morning until 12:00 PM (noon).
* **Good Afternoon**: 12:00 PM until around 5:00 PM.
* **Good Evening**: 5:00 PM onwards.', 1, 10);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('3e60befa-a8e2-5309-a24a-097f6120ebd1', '603456e3-227c-5b07-8271-b660e6afe5df', 'Talking about your Hometown', '### Describing Your Hometown
When introducing yourself, talking about your hometown is a wonderful way to connect. Use these key vocabulary structures:
*   "I **am from** [City Name], which is famous for..."
*   "It is a **bustling metropolis** (large city) / a **serene town** (quiet place)."
*   "I have been living there **for** ten years / **since** my childhood." ', 1, 15);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('73abb2cf-17ae-5f19-ae82-bb87e6f13a9b', 'f8b3afdd-b5ee-5fad-b801-ab483f3fa08a', 'Greeting the Interviewer', '### Professional Interview Greetings
First impressions matter! Make a perfect start to your interview:
1.  **Smile and stand straight**: Conveys absolute confidence.
2.  **Greetings based on time**:
    *   Morning (until 12 PM): "Good morning, sir/madam."
    *   Afternoon (12 PM - 5 PM): "Good afternoon, sir/madam."
3.  **Soft reply**: "It is a pleasure to meet you today." ', 1, 15);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('dd850ed8-9320-562d-8893-564fd0a33eb5', '5f7b7be4-3e16-59f7-9532-4bd27735ea37', 'Your Strengths', '### How to Pitch Your Strengths
Employers want to know what makes you a great candidate. Use clear, active statements:
*   "My greatest strength is my **adaptability**. I hit the ground running with new technologies."
*   "I am a **hard worker** and a highly **articulate** team member."
*   Always back up your strength with a short example!', 1, 20);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('95f9ea48-912d-5913-83cf-2e86a4eb846a', 'ec696b25-dddd-5c9e-9d2a-250024a133a1', 'Listening for Names and Numbers', '### IELTS Listening: Names and Numbers
In Part 1 of the IELTS Listening exam, you will hear a phone conversation. You must write down details:
1.  **Spelling of Names**: Listen carefully as speakers spell out unusual names (e.g. "S-M-I-T-H").
2.  **Numbers**: Phone numbers, credit cards, or dates are read out. Double-check for zeroes ("oh" or "zero").', 1, 20);
INSERT INTO lessons (id, module_id, title, content, order_index, xp_reward) VALUES ('600c7842-bbec-5f2b-b221-3457084872cd', 'b92b4400-461f-58eb-b69d-03bc965e521d', 'Using Connectors', '### Cohesion and Coherence: Using Connectors
To get a high band score in IELTS Writing and Speaking, you must connect sentences beautifully:
*   **Contrast (opposite ideas)**: Use "but", "however", or "although".
    *   *Example:* "I like apples, **but** I do not like oranges."
*   **Addition (extra details)**: Use "and", "furthermore", or "in addition".
*   **Cause & Effect**: Use "because", "so", or "therefore".', 1, 25);

-- 5. SEED QUESTIONS
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('e6da89ae-c696-41d1-bfc8-a3571a6e37c8', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 'Every Monday morning, the engineering team _____ a standup meeting to align on milestones.', 'fill_in_the_blank', NULL, 'holds', 'Every Monday implies a habit/repeated routine, which requires the Simple Present (''holds'') rather than the continuous form (''is holding'').');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('f772b6aa-c666-4f74-b287-2e165c72143c', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 'Which of the following sentences represents correct grammar usage of stative verbs?', 'mcq', '["I am preferring Tailwind CSS over normal CSS for styling.", "I prefer Tailwind CSS over normal CSS for styling.", "I have been preferring Tailwind CSS for a few weeks.", "I am going to be preferring Tailwind CSS."]'::jsonb, 'I prefer Tailwind CSS over normal CSS for styling.', '''Prefer'' is a stative verb describing a mental state, not an ongoing physical action. Stative verbs do not take continuous ''-ing'' forms.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('931d596c-1a9d-4b10-a7c6-d824a408f3a4', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 'Correct this sentence: ''Look at the sky! It rains heavily right now.''', 'sentence_correction', NULL, 'Look at the sky! It is raining heavily right now.', '''Right now'' refers to an action occurring at the exact moment of speaking. Thus, it requires the Present Continuous tense (''is raining'').');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('7d1c8dec-21f5-4aad-bc75-31f1ce79b05e', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 'Select the synonym of ''temporary'' that fits a changing situation:', 'vocabulary', '["Permanent", "Transient", "Eternal", "Perpetual"]'::jsonb, 'Transient', '''Transient'' means lasting only for a short time; impermanent or temporary, which represents the dynamic state of transient work.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('45b5dba5-6c9d-43f0-9ecb-afcc32ab4d1d', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 'Scenario: You are in a daily standup. A colleague asks if you are finished. How do you explain that you are CURRENTLY in the middle of coding the login page?', 'scenario', '["I code the login page every day.", "I was coding the login page yesterday.", "I am coding the login page right now, and I will submit it soon.", "I have coded the login page last week."]'::jsonb, 'I am coding the login page right now, and I will submit it soon.', 'To represent an ongoing action in a real-world scenario, the Present Continuous (''I am coding right now'') communicates it perfectly.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('373f82d4-ade5-40d6-848b-61359ea0e195', '5b3141fc-0dfd-540b-a26e-93b3a02a69ba', 'During the meeting, the project manager said: ''We are running out of time, so let''s _____ on this item during our Friday sync.''', 'fill_in_the_blank', NULL, 'touch base', '''Touch base'' means to briefly contact or catch up with someone, which fits perfectly for a subsequent sync-up meeting.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('bfda5d38-a498-49b5-bea8-8da3dddf28c3', '5b3141fc-0dfd-540b-a26e-93b3a02a69ba', 'What does it mean if a new full-stack engineer ''hits the ground running''?', 'mcq', '["They had a bad accident on their first day of work.", "They start working immediately with great energy and high productivity.", "They literally ran around the office during onboarding.", "They spent their first three weeks reading documentation without writing code."]'::jsonb, 'They start working immediately with great energy and high productivity.', '''Hit the ground running'' means to start a new activity or career immediately with enthusiasm and high output.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('5f3defeb-3391-4a36-bdff-2690f8538041', '5b3141fc-0dfd-540b-a26e-93b3a02a69ba', 'Correct this usage: ''Let''s circle back the pricing issue until we have the market research.''', 'sentence_correction', NULL, 'Let''s circle back to the pricing issue when we have the market research.', 'The idiom is ''circle back to [something]'', and it''s logical to sync *when* or *once* we have the data, rather than *until*.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('162ea86e-4402-4f86-9592-1f3ea12d5aeb', '5b3141fc-0dfd-540b-a26e-93b3a02a69ba', 'Vocabulary: What is the meaning of the corporate jargon ''synergy''?', 'vocabulary', '["Extreme tiredness", "Combined interaction or cooperative action", "Single isolation", "Financial debt"]'::jsonb, 'Combined interaction or cooperative action', '''Synergy'' describes the cooperation of two or more organizations, substances, or teams to produce a combined effect greater than the sum of their separate parts.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('1fc8c437-7183-4132-bf5b-ab8c566d8640', '5b3141fc-0dfd-540b-a26e-93b3a02a69ba', 'Scenario: You are in an email sync. A client raises a question that requires engineering research. What is the most professional response using our idioms?', 'scenario', '["I don''t know, ask someone else.", "I will touch base with the dev team and circle back to you with the results by tomorrow.", "I am hitting the ground running to tell you I don''t know.", "I''m ignoring your question for now."]'::jsonb, 'I will touch base with the dev team and circle back to you with the results by tomorrow.', 'This integrates both ''touch base'' (talking to the dev team) and ''circle back'' (returning with the answer) elegantly and professionally.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('f035d27c-d611-47bc-8951-03c917ab967f', '88f905db-66b7-5403-b049-0fd493ec54df', 'Which of the following is a respectful ''softener'' to start a disagreement?', 'mcq', '["You are absolutely wrong about this.", "I see where you are coming from, but...", "That''s completely illogical.", "Let''s not talk about your idea."]'::jsonb, 'I see where you are coming from, but...', 'This softener validates the speaker''s viewpoint, demonstrating active listening before presenting an alternative opinion.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('392569b7-f549-49bc-8998-e92f0f83cbf7', '88f905db-66b7-5403-b049-0fd493ec54df', 'Scenario: A colleague suggests using plain CSS instead of Tailwind, claiming it''s faster. You disagree. Which response is most professional?', 'scenario', '["No, plain CSS is outdated and terrible.", "I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.", "You don''t understand modern web app requirements.", "Fine, do whatever you want."]'::jsonb, 'I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.', 'This uses a softener (''I understand your concern about speed'') followed by a clear, objective business justification for Tailwind CSS.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('a39f9828-a587-416b-bdd3-d504b61f1587', '88f905db-66b7-5403-b049-0fd493ec54df', 'Fill in the blank to soften this rejection: ''That is a good suggestion, ________, our server architecture might not support that real-time load.''', 'fill_in_the_blank', NULL, 'however', '''however'' acts as a professional conjunction to transition from a softener to an objective technological limitation.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('62c0b744-0b4c-425d-9c5a-13acdc6cb2ce', '88f905db-66b7-5403-b049-0fd493ec54df', 'Correct this aggressive phrasing: ''Your database schema choice is a disaster.''', 'sentence_correction', NULL, 'I appreciate your design, but we might run into scalability issues with this database schema.', 'Replacing personal attacks (''is a disaster'') with constructive, objective feedback (''scalability issues'') preserves professional relationships.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('9318cb5e-f8bc-4d00-a47a-1426e2352d5f', '88f905db-66b7-5403-b049-0fd493ec54df', 'Vocabulary: What does ''tactful'' communication mean?', 'vocabulary', '["Extremely loud", "Sensitivity in dealing with difficult issues to avoid offense", "Being brutal and direct", "Slow to respond"]'::jsonb, 'Sensitivity in dealing with difficult issues to avoid offense', 'Being ''tactful'' is a core skill in professional English, meaning showing skill and sensitivity when managing difficult or conflicting viewpoints.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('87b59ecc-6d44-41a3-baeb-fa529cbd04d7', 'd99a133f-eebd-5dd3-b7ca-07f012a9ed31', 'The ''PPF Formula'' stands for ________, ________, and ________.', 'fill_in_the_blank', NULL, 'Present, Past, Future', 'The formula starts with what you do right now (Present), transitions to your achievements (Past), and ends with why you want this role (Future).');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('36dc5e9b-45e5-4538-a3b7-99e4eba81d32', 'd99a133f-eebd-5dd3-b7ca-07f012a9ed31', 'In the ''PPF'' HR pitch formula, what should you focus on during the ''FUTURE'' section?', 'mcq', '["Your childhood dreams of becoming an astronaut.", "Why you are excited about this specific role and how you can add value to their company.", "Detailed explanations of your salary expectations.", "A summary of your college grades and GPA."]'::jsonb, 'Why you are excited about this specific role and how you can add value to their company.', 'The Future section bridges your current capabilities directly to the employer''s needs, creating a persuasive closing hook.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('10186386-6629-4ed3-8699-3d2f5a0b1092', 'd99a133f-eebd-5dd3-b7ca-07f012a9ed31', 'Correct this passive/weak statement: ''I did some React work at my college club.''', 'sentence_correction', NULL, 'I designed and implemented a full-stack dashboard for my college club using React.', 'Using active, action-driven verbs (''designed and implemented'') instead of passive verbs (''did some work'') conveys high technical ownership.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('9b0d02c8-9b61-4ca8-9569-06b0f71c7d35', 'd99a133f-eebd-5dd3-b7ca-07f012a9ed31', 'Vocabulary: What is the meaning of ''articulate''?', 'vocabulary', '["Showing high physical speed", "Having the ability to speak fluently and coherently", "Being extremely stubborn", "Using complex, outdated vocabulary"]'::jsonb, 'Having the ability to speak fluently and coherently', 'To ''articulate'' means to express an idea or feeling fluently and clearly in spoken or written English.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('8a5a3369-1926-4056-bc10-230e5880a95c', 'd99a133f-eebd-5dd3-b7ca-07f012a9ed31', 'Scenario: An interviewer asks: ''Tell me about yourself.'' Which introduction hook is best?', 'scenario', '["Hello, my name is Amit. I was born in 2004. I like watching movies and reading books...", "Hi, I''m Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I''m building FluentFlow AI...", "Well, you can read my resume. It has all my projects listed on page 1.", "I am currently looking for any job that pays well because I need to pay off my loans."]'::jsonb, 'Hi, I''m Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I''m building FluentFlow AI...', 'A high-impact hook starts with your professional identity, core technical stack, and a highly active project (the ''Present'').');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('e37e2051-87e9-466a-a70a-6aeed08ee2cd', '4ec967c0-30a9-5b7d-90a3-eb2a5eeb13eb', 'In IELTS Speaking Part 2, you must speak continuously for at least _____ minutes.', 'fill_in_the_blank', NULL, '1 to 2', 'The examiner gives you exactly 1 minute to prepare, and you must speak continuously for between 1 and 2 minutes.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('16eafa57-9c30-4e31-bc48-99d84c0d335d', '4ec967c0-30a9-5b7d-90a3-eb2a5eeb13eb', 'How does the PPF storytelling technique help you speak longer in IELTS Part 2?', 'mcq', '["It teaches you how to memorize essays word-for-word.", "It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.", "It allows you to speak very slowly with long pauses.", "It teaches you how to speak using only simple present tense sentences."]'::jsonb, 'It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.', 'Structuring details across past memories, current practices, and future plans naturally provides ample high-quality content.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('d83ee37a-ca92-4d36-b00a-c2a0db4cb909', '4ec967c0-30a9-5b7d-90a3-eb2a5eeb13eb', 'Correct this common spoken IELTS grammar error: ''I am reading this book since three years.''', 'sentence_correction', NULL, 'I have been reading this book for three years.', 'For an action that started in the past and continues into the present, use the Present Perfect Continuous (''have been reading'') with ''for'' (duration).');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('662f31f3-15a4-4af8-9cd6-e54a36199897', '4ec967c0-30a9-5b7d-90a3-eb2a5eeb13eb', 'Vocabulary: Choose the word that represents a ''compelling and useful'' piece of advice:', 'vocabulary', '["Superfluous", "Invaluable", "Redundant", "Trivial"]'::jsonb, 'Invaluable', '''Invaluable'' means extremely useful or indispensable, which is perfect for describing high-quality support or reading material.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('15a112e8-709c-4d04-99c7-c280f75af372', '4ec967c0-30a9-5b7d-90a3-eb2a5eeb13eb', 'Scenario: You run out of points on a Cue Card prompt with 40 seconds left. What is the best strategy?', 'scenario', '["Stop speaking immediately and stare at the examiner.", "Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.", "Repeat the same paragraph again using exactly the same words.", "Complain to the examiner that the topic is too difficult."]'::jsonb, 'Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.', 'Switching to the ''Future'' dimension of the PPF technique is the most natural way to expand your content while demonstrating advanced tense control.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('d4b61f27-b92b-45d3-ad69-76e6d6ffd13d', 'c6806b0b-4f16-5c9e-ae49-d47f2707ff04', 'Choose the correct word to complete the sentence: ''I ____ a student.''', 'mcq', '["is", "am", "are", "be"]'::jsonb, 'am', 'Great job! We always use ''am'' when we talk about ourselves using ''I''.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('b087db1d-292b-4240-adb6-ab3ccc1e6221', '8af3b173-b725-51df-b72e-3e6242814a87', 'Choose the correct sentence:', 'sentence_correction', NULL, 'He eats an apple.', 'Perfect! When we talk about one person (He, She, or It) doing something every day, we add an ''s'' to the action word. Eat becomes eats!');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('9f4dd2c3-c64d-43f4-b15b-550e804f7852', '8df95d20-9ded-58f1-977d-10dfa62056bc', 'What do you call your mother''s brother?', 'mcq', '["Uncle", "Aunt", "Brother", "Cousin"]'::jsonb, 'Uncle', 'Yes! In English, your mother''s or father''s brother is called your ''Uncle''.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('cdf0694f-4877-45cb-85a7-968f3a47e11f', '9319fab4-c339-5017-9236-88a3c026836e', 'When you make a mistake, you should say: ''I am _____.''', 'fill_in_the_blank', NULL, 'Sorry', 'Well done! Saying ''Sorry'' shows you are polite and kind when a mistake happens.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('c3af87d2-d8e8-4f8f-ae3a-6b0079976477', 'd6ac9f9a-ed35-5965-bdcb-56e63bf3da02', 'Greet someone professionally in the evening after 6 PM:', 'mcq', '["Good morning", "Good afternoon", "Good evening", "Goodbye"]'::jsonb, 'Good evening', 'Excellent! Use ''Good evening'' to greet someone professionally after 5:00 PM or 6:00 PM.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('96d04638-3fdd-48c2-8a02-71187df36ea8', '3e60befa-a8e2-5309-a24a-097f6120ebd1', 'Which of the following is the best way to say where you are from?', 'mcq', '["I am from Hyderabad.", "I going to Hyderabad.", "My name is Hyderabad.", "I am in Hyderabad."]'::jsonb, 'I am from Hyderabad.', 'Spot on! ''I am from [City]'' is the perfect, natural way to tell someone where your hometown is.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('889fddac-f57f-48bc-b4c0-3d09dcaa846e', '73abb2cf-17ae-5f19-ae82-bb87e6f13a9b', 'You enter the interview room at 10 AM. The HR manager is sitting at the desk. What should you say?', 'scenario', '["Hi bro.", "Good morning, sir/madam.", "I want a job.", "What is your name?"]'::jsonb, 'Good morning, sir/madam.', 'Wonderful! ''Good morning, sir/madam'' is polite, professional, and shows respect.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('ed19a5fd-fd3a-49e5-8a5a-0c2a02a33d7e', 'dd850ed8-9320-562d-8893-564fd0a33eb5', 'The HR asks: ''What is your strength?'''' Choose the best beginner-friendly answer:', 'mcq', '["I am a very hard worker.", "I don''t know.", "I sleep a lot.", "I am angry."]'::jsonb, 'I am a very hard worker.', 'Great choice! Employers love hard workers. It''s a simple, honest, and powerful answer.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('1e3f7d5a-a657-4512-a05c-813029ad036a', '95f9ea48-912d-5913-83cf-2e86a4eb846a', 'In the audio, the man says: ''My phone number is nine-eight-seven, zero-zero-two.'' Write the number.', 'fill_in_the_blank', NULL, '987002', 'Spot on! In IELTS Listening, catching simple numbers correctly is an easy way to boost your score.');
INSERT INTO questions (id, lesson_id, question, type, options, correct_answer, explanation) VALUES ('5941b8c3-09d8-465f-8c92-3e00b0c0bb54', '600c7842-bbec-5f2b-b221-3457084872cd', 'Join these two simple sentences: ''I like apples. I do not like oranges.''', 'sentence_correction', NULL, 'I like apples but I do not like oranges.', 'Brilliant! We use ''but'' to connect two opposite ideas. This makes your English sound much more natural!');

-- 6. SEED STUDENT PROGRESS
INSERT INTO student_progress (id, user_id, completed_lessons, total_xp, current_streak, weak_topics, last_activity_date) VALUES ('e9bba6a1-a949-4648-a428-315d0e844973', '8c9f050e-f770-5ad3-a4a4-08c0b71c166a', '["2565216d-d9ca-5c46-816b-4dd16bee29a3"]'::jsonb, 372, 12, '{"Business Idioms": 2, "Grammar Agreement": 1, "Simple Present": 2}'::jsonb, '2026-05-21');
INSERT INTO student_progress (id, user_id, completed_lessons, total_xp, current_streak, weak_topics, last_activity_date) VALUES ('717c8046-6b32-48cb-9b1b-5aa1c70f65a6', 'a5c770c8-6150-5106-b2c2-942598cc96cf', '[]'::jsonb, 110, 3, '{"Simple Present": 4, "Tenses": 3}'::jsonb, '2026-05-21');
INSERT INTO student_progress (id, user_id, completed_lessons, total_xp, current_streak, weak_topics, last_activity_date) VALUES ('7721e7ca-ffe2-4f90-a774-3fa6bfa47bf8', '977debdb-14a3-5ac2-8fbb-00edb90e00d6', '["2565216d-d9ca-5c46-816b-4dd16bee29a3", "88f905db-66b7-5403-b049-0fd493ec54df"]'::jsonb, 750, 28, '{"Prepositions": 1}'::jsonb, '2026-05-21');

-- 7. SEED QUIZ ATTEMPTS
INSERT INTO quiz_attempts (id, user_id, lesson_id, score, accuracy, xp_earned, time_taken, created_at) VALUES ('e8a9c8dc-196c-47d8-99e2-40615334ab1c', '8c9f050e-f770-5ad3-a4a4-08c0b71c166a', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 4, 0.8, 20, 120, '2026-05-19 16:44:55+00');
INSERT INTO quiz_attempts (id, user_id, lesson_id, score, accuracy, xp_earned, time_taken, created_at) VALUES ('ee764118-82a2-44c8-b3be-6d94b3495e64', '977debdb-14a3-5ac2-8fbb-00edb90e00d6', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 5, 1.0, 25, 95, '2026-05-17 16:44:55+00');
INSERT INTO quiz_attempts (id, user_id, lesson_id, score, accuracy, xp_earned, time_taken, created_at) VALUES ('e51a9952-7bbf-4570-8d11-9a9794e7f121', '977debdb-14a3-5ac2-8fbb-00edb90e00d6', '88f905db-66b7-5403-b049-0fd493ec54df', 5, 1.0, 30, 105, '2026-05-20 16:44:55+00');
INSERT INTO quiz_attempts (id, user_id, lesson_id, score, accuracy, xp_earned, time_taken, created_at) VALUES ('8a0609dd-ceec-4fa2-bd2b-a70d9548642a', '8c9f050e-f770-5ad3-a4a4-08c0b71c166a', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 4, 0.8, 16, 85, '2026-05-21 16:45:33+00');
INSERT INTO quiz_attempts (id, user_id, lesson_id, score, accuracy, xp_earned, time_taken, created_at) VALUES ('5cded254-adc4-4c39-b5ad-453469f141ee', '8c9f050e-f770-5ad3-a4a4-08c0b71c166a', '2565216d-d9ca-5c46-816b-4dd16bee29a3', 4, 0.8, 16, 85, '2026-05-21 16:45:42+00');
