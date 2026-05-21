import os
import json
from datetime import datetime, timedelta
from backend.models import db, User, Track, Module, Lesson, Question, StudentProgress, QuizAttempt

def init_db(app):
    """Initializes the database, creating all tables if they don't exist, and seeds it."""
    with app.app_context():
        # Setup tables
        db.create_all()
        
        # Check if database is already seeded
        if User.query.first() is not None:
            print("Database already seeded. Skipping seed.")
            return
            
        print("Database is empty. Seeding foundation data...")
        seed_data()
        print("Seeding completed successfully!")

def seed_data():
    # 1. Create Faculty and Student Users
    faculty = User(
        name="Dr. Sarah Jenkins",
        email="faculty@example.com",
        role="faculty",
        streak=0,
        xp=0
    )
    faculty.set_password("password123")
    db.session.add(faculty)
    
    # Pre-seeded Student 1 (Adithya - High active student)
    student1 = User(
        name="Palamoor Adithya",
        email="student@example.com",
        role="student",
        learning_goal="Interview Preparation",
        english_level="Intermediate (B2)",
        confidence_level=3,
        weak_areas=json.dumps(["Speaking Speed", "Business Idioms"]),
        learning_style="Interactive Scenarios",
        daily_goal="Serious (30 XP/day)",
        streak=12,
        xp=340
    )
    student1.set_password("password123")
    db.session.add(student1)

    # Pre-seeded Student 2 (John - Struggling Student)
    student2 = User(
        name="John Doe",
        email="john@example.com",
        role="student",
        learning_goal="Communication Improvement",
        english_level="Beginner (A2)",
        confidence_level=1,
        weak_areas=json.dumps(["Grammar Foundations", "Sentence Structure"]),
        learning_style="Visual Lessons",
        daily_goal="Regular (20 XP/day)",
        streak=3,
        xp=110
    )
    student2.set_password("password123")
    db.session.add(student2)

    # Pre-seeded Student 3 (Emma - High Performer)
    student3 = User(
        name="Emma Watson",
        email="emma@example.com",
        role="student",
        learning_goal="IELTS Preparation",
        english_level="Advanced (C1)",
        confidence_level=5,
        weak_areas=json.dumps(["Cue Card Length", "Complex Prepositions"]),
        learning_style="Fast Pace",
        daily_goal="Insane (50 XP/day)",
        streak=28,
        xp=750
    )
    student3.set_password("password123")
    db.session.add(student3)
    
    db.session.commit()

    # Create Student Progress rows
    progress1 = StudentProgress(
        user_id=student1.id,
        completed_lessons=json.dumps([1]),
        total_xp=340,
        current_streak=12,
        weak_topics=json.dumps({"Business Idioms": 2, "Grammar Agreement": 1}),
        last_activity_date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    progress2 = StudentProgress(
        user_id=student2.id,
        completed_lessons=json.dumps([]),
        total_xp=110,
        current_streak=3,
        weak_topics=json.dumps({"Simple Present": 4, "Tenses": 3}),
        last_activity_date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    progress3 = StudentProgress(
        user_id=student3.id,
        completed_lessons=json.dumps([1, 3]),
        total_xp=750,
        current_streak=28,
        weak_topics=json.dumps({"Prepositions": 1}),
        last_activity_date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    db.session.add_all([progress1, progress2, progress3])
    db.session.commit()

    # 2. CREATE TRACKS
    t1 = Track(title="Grammar Foundations", description="Master core English rules, subject-verb agreements, and complex tenses for flawless communication.", category="Grammar")
    t2 = Track(title="Vocabulary Builder", description="Unlock high-impact industry idioms, professional adjectives, and academic vocabulary to express thoughts accurately.", category="Vocabulary")
    t3 = Track(title="Spoken English", description="Elevate communication confidence, clear up common mispronunciations, and master tone in daily conversations.", category="Speaking")
    t4 = Track(title="Interview Communication", description="Crack technical and HR interviews with structural confidence, structured pitch formulas, and stellar body language.", category="Interviews")
    t5 = Track(title="IELTS Preparation", description="Boost your speaking band scores and perfect cue card descriptions with strategic templates.", category="IELTS")
    
    db.session.add_all([t1, t2, t3, t4, t5])
    db.session.commit()

    # 3. CREATE MODULES
    # Track 1 Modules
    m1_1 = Module(track_id=t1.id, title="Mastering Tenses & Agreement", order_index=1)
    # Track 2 Modules
    m2_1 = Module(track_id=t2.id, title="Corporate & Professional Speak", order_index=1)
    # Track 3 Modules
    m3_1 = Module(track_id=t3.id, title="Confidence in Conversations", order_index=1)
    # Track 4 Modules
    m4_1 = Module(track_id=t4.id, title="Cracking the HR Rounds", order_index=1)
    # Track 5 Modules
    m5_1 = Module(track_id=t5.id, title="IELTS Speaking Part 2 Mastery", order_index=1)

    db.session.add_all([m1_1, m2_1, m3_1, m4_1, m5_1])
    db.session.commit()

    # 4. CREATE LESSONS
    # Track 1, Module 1, Lesson 1
    l1_1 = Lesson(
        module_id=m1_1.id,
        title="Present Continuous vs Simple Present",
        content="""### Present Simple vs Present Continuous
Many English learners confuse when to state facts versus ongoing actions. Let's break this down:

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
*   d1_1: **"I know the answer."** (Correct!)
*   ❌ *Incorrect:* "This soup is tasting delicious."
*   d1_2: **"This soup tastes delicious."** (Correct!)
""",
        order_index=1,
        xp_reward=20
    )

    # Track 2, Module 1, Lesson 1
    l2_1 = Lesson(
        module_id=m2_1.id,
        title="High-Impact Business Idioms",
        content="""### Essential Business Idioms for Corporate Meetings
In professional tech companies and EdTech startups, professionals use idioms to communicate efficiently. Let's learn 3 primary ones:

#### 1. "Touch Base"
*   **Definition:** To briefly meet, talk, or make contact with someone to receive an update.
*   **Example:** "Let's *touch base* on Friday to review the product mockups."

#### 2. "Hit the Ground Running"
*   **Definition:** To start a new activity or job immediately with a lot of energy, enthusiasm, and productivity.
*   **Example:** "With his background in React, John *hit the ground running* on our new dashboard feature."

#### 3. "Circle Back"
*   **Definition:** To return to an issue, topic, or person at a later time.
*   **Example:** "We don't have the marketing budget details today, so let's *circle back* to this next week."
""",
        order_index=1,
        xp_reward=20
    )

    # Track 3, Module 1, Lesson 1
    l3_1 = Lesson(
        module_id=m3_1.id,
        title="Expressing Opinions and Disagreements Polite",
        content="""### Mastering Polite Disagreements
Confidence is not about always agreeing; it's about voicing your opinions without sounding hostile or rude.

#### The "Softener" Technique
Before you disagree, start with a "softener" to validate the other person's perspective. It shows active listening.
*   "I see where you are coming from, but..."
*   "That's an interesting point, however..."
*   "I understand your concern, though..."

#### ❌ Aggressive vs. ✔ Polite Forms
*   ❌ *Aggressive:* "You are completely wrong about the design."
*   ✔ *Polite:* "I see your point, but I feel a darker glassmorphism background might look more premium."
*   ❌ *Aggressive:* "That will never work."
*   ✔ *Polite:* "That's an interesting idea, though I'm worried it might slow down our backend query performance."
""",
        order_index=1,
        xp_reward=25
    )

    # Track 4, Module 1, Lesson 1
    l4_1 = Lesson(
        module_id=m4_1.id,
        title="Elevating your 'Tell Me About Yourself' Pitch",
        content="""### The Perfect HR Pitch: Present-Past-Future Formula
The 'Tell me about yourself' question is the hook of your entire interview. Most candidates list their resume bullet points chronologically, which is boring. Use the **PPF Formula** instead:

#### 1. The PRESENT (30 seconds)
State your current role, a high-level accomplishment, and your core area of expertise.
*   *Example:* "I am currently a senior engineering student specializing in React and cloud-native systems. Over the past year, I've designed and launched two full-stack SaaS prototypes..."

#### 2. The PAST (30 seconds)
Highlight one or two key historical milestones, internships, or academic projects that prove your capabilities.
*   *Example:* "Prior to this, I interned at an AI startup where I optimized their database query speeds by 40% and learned the value of robust code validation..."

#### 3. The FUTURE (20 seconds)
Conclude by stating why you are excited about *this specific role* and how it aligns with your future trajectory.
*   *Example:* "I'm looking to take my skills to a fast-growing platform like yours, where I can build responsive UIs and help scale EdTech infrastructures."
""",
        order_index=1,
        xp_reward=30
    )

    # Track 5, Module 1, Lesson 1
    l5_1 = Lesson(
        module_id=m5_1.id,
        title="Structuring Part 2 Cue Cards",
        content="""### Cracking the IELTS Speaking Part 2
In Part 2, you receive a cue card with a topic and 4 prompts. You must speak continuously for **1 to 2 minutes**. Most candidates fail because they run out of ideas after 40 seconds. 

Use the **PPF (Past-Present-Future) Storytelling Technique** to speak with rich structure:

#### Topic: Describe a book you read that you found useful.

1.  **The Context (Present/Past - 20s):** Introduce the book.
    *   *Draft:* "I'd like to talk about 'Atomic Habits' by James Clear, which I picked up last summer during my exams."
2.  **The Core Details (Present - 40s):** Answer the main prompts. What was it about?
    *   *Draft:* "The core thesis is that tiny 1% daily changes compound into massive life transformations over time. It's written in an extremely accessible, Notion-style clean formatting."
3.  **The Impact (Past/Present - 30s):** Why did you find it useful? How did you apply it?
    *   *Draft:* "It completely shifted my morning routine. I began coding for just 30 minutes every single day, which eventually helped me master TypeScript..."
4.  **The Horizon (Future - 20s):** How do you view it going forward?
    *   *Draft:* "I plan to reread it next month, and I've already recommended it to my classmates who struggle with streak consistency."
""",
        order_index=1,
        xp_reward=30
    )

    db.session.add_all([l1_1, l2_1, l3_1, l4_1, l5_1])
    db.session.commit()

    # 5. CREATE QUESTIONS FOR LESSON 1 (Tenses)
    q1_1 = Question(
        lesson_id=l1_1.id,
        question="Every Monday morning, the engineering team _____ a standup meeting to align on milestones.",
        type="fill_in_the_blank",
        correct_answer="holds",
        explanation="Every Monday implies a habit/repeated routine, which requires the Simple Present ('holds') rather than the continuous form ('is holding')."
    )
    q1_2 = Question(
        lesson_id=l1_1.id,
        question="Which of the following sentences represents correct grammar usage of stative verbs?",
        type="mcq",
        options=json.dumps([
            "I am preferring Tailwind CSS over normal CSS for styling.",
            "I prefer Tailwind CSS over normal CSS for styling.",
            "I have been preferring Tailwind CSS for a few weeks.",
            "I am going to be preferring Tailwind CSS."
        ]),
        correct_answer="I prefer Tailwind CSS over normal CSS for styling.",
        explanation="'Prefer' is a stative verb describing a mental state, not an ongoing physical action. Stative verbs do not take continuous '-ing' forms."
    )
    q1_3 = Question(
        lesson_id=l1_1.id,
        question="Correct this sentence: 'Look at the sky! It rains heavily right now.'",
        type="sentence_correction",
        correct_answer="Look at the sky! It is raining heavily right now.",
        explanation="'Right now' refers to an action occurring at the exact moment of speaking. Thus, it requires the Present Continuous tense ('is raining')."
    )
    q1_4 = Question(
        lesson_id=l1_1.id,
        question="Select the synonym of 'temporary' that fits a changing situation:",
        type="vocabulary",
        options=json.dumps(["Permanent", "Transient", "Eternal", "Perpetual"]),
        correct_answer="Transient",
        explanation="'Transient' means lasting only for a short time; impermanent or temporary, which represents the dynamic state of transient work."
    )
    q1_5 = Question(
        lesson_id=l1_1.id,
        question="Scenario: You are in a daily standup. A colleague asks if you are finished. How do you explain that you are CURRENTLY in the middle of coding the login page?",
        type="scenario",
        options=json.dumps([
            "I code the login page every day.",
            "I was coding the login page yesterday.",
            "I am coding the login page right now, and I will submit it soon.",
            "I have coded the login page last week."
        ]),
        correct_answer="I am coding the login page right now, and I will submit it soon.",
        explanation="To represent an ongoing action in a real-world scenario, the Present Continuous ('I am coding right now') communicates it perfectly."
    )

    # 6. CREATE QUESTIONS FOR LESSON 2 (Business Idioms)
    q2_1 = Question(
        lesson_id=l2_1.id,
        question="During the meeting, the project manager said: 'We are running out of time, so let's _____ on this item during our Friday sync.'",
        type="fill_in_the_blank",
        correct_answer="touch base",
        explanation="'Touch base' means to briefly contact or catch up with someone, which fits perfectly for a subsequent sync-up meeting."
    )
    q2_2 = Question(
        lesson_id=l2_1.id,
        question="What does it mean if a new full-stack engineer 'hits the ground running'?",
        type="mcq",
        options=json.dumps([
            "They had a bad accident on their first day of work.",
            "They start working immediately with great energy and high productivity.",
            "They literally ran around the office during onboarding.",
            "They spent their first three weeks reading documentation without writing code."
        ]),
        correct_answer="They start working immediately with great energy and high productivity.",
        explanation="'Hit the ground running' means to start a new activity or career immediately with enthusiasm and high output."
    )
    q2_3 = Question(
        lesson_id=l2_1.id,
        question="Correct this usage: 'Let's circle back the pricing issue until we have the market research.'",
        type="sentence_correction",
        correct_answer="Let's circle back to the pricing issue when we have the market research.",
        explanation="The idiom is 'circle back to [something]', and it's logical to sync *when* or *once* we have the data, rather than *until*."
    )
    q2_4 = Question(
        lesson_id=l2_1.id,
        question="Vocabulary: What is the meaning of the corporate jargon 'synergy'?",
        type="vocabulary",
        options=json.dumps(["Extreme tiredness", "Combined interaction or cooperative action", "Single isolation", "Financial debt"]),
        correct_answer="Combined interaction or cooperative action",
        explanation="'Synergy' describes the cooperation of two or more organizations, substances, or teams to produce a combined effect greater than the sum of their separate parts."
    )
    q2_5 = Question(
        lesson_id=l2_1.id,
        question="Scenario: You are in an email sync. A client raises a question that requires engineering research. What is the most professional response using our idioms?",
        type="scenario",
        options=json.dumps([
            "I don't know, ask someone else.",
            "I will touch base with the dev team and circle back to you with the results by tomorrow.",
            "I am hitting the ground running to tell you I don't know.",
            "I'm ignoring your question for now."
        ]),
        correct_answer="I will touch base with the dev team and circle back to you with the results by tomorrow.",
        explanation="This integrates both 'touch base' (talking to the dev team) and 'circle back' (returning with the answer) elegantly and professionally."
    )

    # 7. CREATE QUESTIONS FOR LESSON 3 (Polite Disagreement)
    q3_1 = Question(
        lesson_id=l3_1.id,
        question="Which of the following is a respectful 'softener' to start a disagreement?",
        type="mcq",
        options=json.dumps([
            "You are absolutely wrong about this.",
            "I see where you are coming from, but...",
            "That's completely illogical.",
            "Let's not talk about your idea."
        ]),
        correct_answer="I see where you are coming from, but...",
        explanation="This softener validates the speaker's viewpoint, demonstrating active listening before presenting an alternative opinion."
    )
    q3_2 = Question(
        lesson_id=l3_1.id,
        question="Scenario: A colleague suggests using plain CSS instead of Tailwind, claiming it's faster. You disagree. Which response is most professional?",
        type="scenario",
        options=json.dumps([
            "No, plain CSS is outdated and terrible.",
            "I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.",
            "You don't understand modern web app requirements.",
            "Fine, do whatever you want."
        ]),
        correct_answer="I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.",
        explanation="This uses a softener ('I understand your concern about speed') followed by a clear, objective business justification for Tailwind CSS."
    )
    q3_3 = Question(
        lesson_id=l3_1.id,
        question="Fill in the blank to soften this rejection: 'That is a good suggestion, ________, our server architecture might not support that real-time load.'",
        type="fill_in_the_blank",
        correct_answer="however",
        explanation="'However' acts as a smooth, professional conjunction to transition from a softener to an objective technological limitation."
    )
    q3_4 = Question(
        lesson_id=l3_1.id,
        question="Correct this aggressive phrasing: 'Your database schema choice is a disaster.'",
        type="sentence_correction",
        correct_answer="I appreciate your design, but we might run into scalability issues with this database schema.",
        explanation="Replacing personal attacks ('is a disaster') with constructive, objective feedback ('scalability issues') preserves professional relationships."
    )
    q3_5 = Question(
        lesson_id=l3_1.id,
        question="Vocabulary: What does 'tactful' communication mean?",
        type="vocabulary",
        options=json.dumps(["Extremely loud", "Sensitivity in dealing with difficult issues to avoid offense", "Being brutal and direct", "Slow to respond"]),
        correct_answer="Sensitivity in dealing with difficult issues to avoid offense",
        explanation="Being 'tactful' is a core skill in professional English, meaning showing skill and sensitivity when managing difficult or conflicting viewpoints."
    )

    # 8. CREATE QUESTIONS FOR LESSON 4 (HR Pitch)
    q4_1 = Question(
        lesson_id=l4_1.id,
        question="The 'PPF Formula' stands for ________, ________, and ________.",
        type="fill_in_the_blank",
        correct_answer="Present, Past, Future",
        explanation="The formula starts with what you do right now (Present), transitions to your achievements (Past), and ends with why you want this role (Future)."
    )
    q4_2 = Question(
        lesson_id=l4_1.id,
        question="In the 'PPF' HR pitch formula, what should you focus on during the 'FUTURE' section?",
        type="mcq",
        options=json.dumps([
            "Your childhood dreams of becoming an astronaut.",
            "Why you are excited about this specific role and how you can add value to their company.",
            "Detailed explanations of your salary expectations.",
            "A summary of your college grades and GPA."
        ]),
        correct_answer="Why you are excited about this specific role and how you can add value to their company.",
        explanation="The Future section bridges your current capabilities directly to the employer's needs, creating a persuasive closing hook."
    )
    q4_3 = Question(
        lesson_id=l4_1.id,
        question="Correct this passive/weak statement: 'I did some React work at my college club.'",
        type="sentence_correction",
        correct_answer="I designed and implemented a full-stack dashboard for my college club using React.",
        explanation="Using active, action-driven verbs ('designed and implemented') instead of passive verbs ('did some work') conveys high technical ownership."
    )
    q4_4 = Question(
        lesson_id=l4_1.id,
        question="Vocabulary: What is the meaning of 'articulate'?",
        type="vocabulary",
        options=json.dumps(["Showing high physical speed", "Having the ability to speak fluently and coherently", "Being extremely stubborn", "Using complex, outdated vocabulary"]),
        correct_answer="Having the ability to speak fluently and coherently",
        explanation="To 'articulate' means to express an idea or feeling fluently and clearly in spoken or written English."
    )
    q4_5 = Question(
        lesson_id=l4_1.id,
        question="Scenario: An interviewer asks: 'Tell me about yourself.' Which introduction hook is best?",
        type="scenario",
        options=json.dumps([
            "Hello, my name is Amit. I was born in 2004. I like watching movies and reading books...",
            "Hi, I'm Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I'm building FluentFlow AI...",
            "Well, you can read my resume. It has all my projects listed on page 1.",
            "I am currently looking for any job that pays well because I need to pay off my loans."
        ]),
        correct_answer="Hi, I'm Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I'm building FluentFlow AI...",
        explanation="A high-impact hook starts with your professional identity, core technical stack, and a highly active project (the 'Present')."
    )

    # 9. CREATE QUESTIONS FOR LESSON 5 (IELTS Cue Card)
    q5_1 = Question(
        lesson_id=l5_1.id,
        question="In IELTS Speaking Part 2, you must speak continuously for at least _____ minutes.",
        type="fill_in_the_blank",
        correct_answer="1 to 2",
        explanation="The examiner gives you exactly 1 minute to prepare, and you must speak continuously for between 1 and 2 minutes."
    )
    q5_2 = Question(
        lesson_id=l5_1.id,
        question="How does the PPF storytelling technique help you speak longer in IELTS Part 2?",
        type="mcq",
        options=json.dumps([
            "It teaches you how to memorize essays word-for-word.",
            "It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.",
            "It allows you to speak very slowly with long pauses.",
            "It teaches you how to speak using only simple present tense sentences."
        ]),
        correct_answer="It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.",
        explanation="Structuring details across past memories, current practices, and future plans naturally provides ample high-quality content."
    )
    q5_3 = Question(
        lesson_id=l5_1.id,
        question="Correct this common spoken IELTS grammar error: 'I am reading this book since three years.'",
        type="sentence_correction",
        correct_answer="I have been reading this book for three years.",
        explanation="For an action that started in the past and continues into the present, use the Present Perfect Continuous ('have been reading') with 'for' (duration)."
    )
    q5_4 = Question(
        lesson_id=l5_1.id,
        question="Vocabulary: Choose the word that represents a 'compelling and useful' piece of advice:",
        type="vocabulary",
        options=json.dumps(["Superfluous", "Invaluable", "Redundant", "Trivial"]),
        correct_answer="Invaluable",
        explanation="'Invaluable' means extremely useful or indispensable, which is perfect for describing high-quality support or reading material."
    )
    q5_5 = Question(
        lesson_id=l5_1.id,
        question="Scenario: You run out of points on a Cue Card prompt with 40 seconds left. What is the best strategy?",
        type="scenario",
        options=json.dumps([
            "Stop speaking immediately and stare at the examiner.",
            "Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.",
            "Repeat the same paragraph again using exactly the same words.",
            "Complain to the examiner that the topic is too difficult."
        ]),
        correct_answer="Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.",
        explanation="Switching to the 'Future' dimension of the PPF technique is the most natural way to expand your content while demonstrating advanced tense control."
    )

    db.session.add_all([
        q1_1, q1_2, q1_3, q1_4, q1_5,
        q2_1, q2_2, q2_3, q2_4, q2_5,
        q3_1, q3_2, q3_3, q3_4, q3_5,
        q4_1, q4_2, q4_3, q4_4, q4_5,
        q5_1, q5_2, q5_3, q5_4, q5_5
    ])
    
    db.session.commit()

    # 10. SEED SOME DUMMY ATTEMPTS TO POPULATE ANALYTICS
    # Adithya's Attempt
    att1 = QuizAttempt(
        user_id=student1.id,
        lesson_id=l1_1.id,
        score=4,
        accuracy=0.8,
        xp_earned=20,
        time_taken=120,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    # Emma's Attempts
    att2 = QuizAttempt(
        user_id=student3.id,
        lesson_id=l1_1.id,
        score=5,
        accuracy=1.0,
        xp_earned=25,
        time_taken=95,
        created_at=datetime.utcnow() - timedelta(days=4)
    )
    att3 = QuizAttempt(
        user_id=student3.id,
        lesson_id=l3_1.id,
        score=5,
        accuracy=1.0,
        xp_earned=30,
        time_taken=105,
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    db.session.add_all([att1, att2, att3])
    db.session.commit()
