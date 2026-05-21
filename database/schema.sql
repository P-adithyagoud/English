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
