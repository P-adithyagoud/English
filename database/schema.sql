-- FluentFlow AI PostgreSQL Schema
-- Suitable for execution directly in Supabase or local PostgreSQL

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    learning_goal VARCHAR(100), -- Interview Prep, IELTS Prep, etc.
    english_level VARCHAR(100), -- Beginner, Intermediate, etc.
    confidence_level INTEGER DEFAULT 1,
    weak_areas TEXT, -- Comma-separated or JSON list
    learning_style VARCHAR(100),
    daily_goal VARCHAR(100),
    streak INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRACKS TABLE (Grammar, Vocabulary, Spoken English, etc.)
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100)
);

-- MODULES TABLE
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- LESSONS TABLE
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Markdown containing educational curriculum
    order_index INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 15
);

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'fill_in_the_blank', 'sentence_correction', 'vocabulary', 'scenario')),
    options TEXT, -- JSON-encoded string for array of options (for MCQs)
    correct_answer TEXT NOT NULL,
    explanation TEXT
);

-- QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
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
CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    completed_lessons TEXT DEFAULT '[]', -- JSON-encoded array of lesson IDs
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    weak_topics TEXT DEFAULT '{}', -- JSON-encoded map of topics and frequency
    last_activity_date DATE DEFAULT CURRENT_DATE
);

-- INDEXES FOR SCALE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_modules_track ON modules(track_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON student_progress(user_id);
