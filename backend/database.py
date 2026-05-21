import os
import json
import uuid
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
    # Generate stable, reproducible UUIDs using uuid5 based on namespace
    # This prevents duplicate/messy key states if run repeatedly
    NAMESPACE = uuid.NAMESPACE_DNS
    user_ids = {
        1: str(uuid.uuid5(NAMESPACE, "faculty@example.com")),
        2: str(uuid.uuid5(NAMESPACE, "student@example.com")),
        3: str(uuid.uuid5(NAMESPACE, "john@example.com")),
        4: str(uuid.uuid5(NAMESPACE, "emma@example.com"))
    }
    
    track_ids = {i: str(uuid.uuid5(NAMESPACE, f"track-{i}")) for i in range(1, 6)}
    module_ids = {i: str(uuid.uuid5(NAMESPACE, f"module-{i}")) for i in range(1, 16)}
    lesson_ids = {i: str(uuid.uuid5(NAMESPACE, f"lesson-{i}")) for i in range(1, 16)}

    # 1. Create Faculty and Student Users
    faculty = User(
        id=user_ids[1],
        name="Dr. Sarah Jenkins",
        email="faculty@example.com",
        role="faculty",
        streak=0,
        xp=0
    )
    faculty.set_password("password123")
    db.session.add(faculty)
    
    student1 = User(
        id=user_ids[2],
        name="Palamoor Adithya",
        email="student@example.com",
        role="student",
        learning_goal="Interview Preparation",
        english_level="Intermediate (B2)",
        confidence_level=3,
        weak_areas=["Speaking Speed", "Business Idioms"],
        learning_style="Interactive Scenarios",
        daily_goal="Serious (30 XP/day)",
        streak=12,
        xp=340
    )
    student1.set_password("password123")
    db.session.add(student1)

    student2 = User(
        id=user_ids[3],
        name="John Doe",
        email="john@example.com",
        role="student",
        learning_goal="Communication Improvement",
        english_level="Beginner (A2)",
        confidence_level=1,
        weak_areas=["Grammar Foundations", "Sentence Structure"],
        learning_style="Visual Lessons",
        daily_goal="Regular (20 XP/day)",
        streak=3,
        xp=110
    )
    student2.set_password("password123")
    db.session.add(student2)

    student3 = User(
        id=user_ids[4],
        name="Emma Watson",
        email="emma@example.com",
        role="student",
        learning_goal="IELTS Preparation",
        english_level="Advanced (C1)",
        confidence_level=5,
        weak_areas=["Cue Card Length", "Complex Prepositions"],
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
        user_id=user_ids[2],
        completed_lessons=[lesson_ids[1]],
        total_xp=340,
        current_streak=12,
        weak_topics={"Business Idioms": 2, "Grammar Agreement": 1},
        last_activity_date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    progress2 = StudentProgress(
        user_id=user_ids[3],
        completed_lessons=[],
        total_xp=110,
        current_streak=3,
        weak_topics={"Simple Present": 4, "Tenses": 3},
        last_activity_date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    progress3 = StudentProgress(
        user_id=user_ids[4],
        completed_lessons=[lesson_ids[1], lesson_ids[3]],
        total_xp=750,
        current_streak=28,
        weak_topics={"Prepositions": 1},
        last_activity_date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    db.session.add_all([progress1, progress2, progress3])
    db.session.commit()

    # 2. CREATE TRACKS
    t1 = Track(id=track_ids[1], title="Grammar Foundations", description="Master core English rules, subject-verb agreements, and complex tenses for flawless communication.", category="Grammar")
    t2 = Track(id=track_ids[2], title="Vocabulary Builder", description="Unlock high-impact industry idioms, professional adjectives, and academic vocabulary to express thoughts accurately.", category="Vocabulary")
    t3 = Track(id=track_ids[3], title="Spoken English", description="Elevate communication confidence, clear up common mispronunciations, and master tone in daily conversations.", category="Speaking")
    t4 = Track(id=track_ids[4], title="Interview Communication", description="Crack technical and HR interviews with structural confidence, structured pitch formulas, and stellar body language.", category="Interviews")
    t5 = Track(id=track_ids[5], title="IELTS Preparation", description="Boost your speaking band scores and perfect cue card descriptions with strategic templates.", category="IELTS")
    
    db.session.add_all([t1, t2, t3, t4, t5])
    db.session.commit()

    # 3. CREATE MODULES
    modules = [
        Module(id=module_ids[1], track_id=track_ids[1], title="Mastering Tenses & Agreement", order_index=1),
        Module(id=module_ids[2], track_id=track_ids[2], title="Corporate & Professional Speak", order_index=1),
        Module(id=module_ids[3], track_id=track_ids[3], title="Confidence in Conversations", order_index=1),
        Module(id=module_ids[4], track_id=track_ids[4], title="Cracking the HR Rounds", order_index=1),
        Module(id=module_ids[5], track_id=track_ids[5], title="IELTS Speaking Part 2 Mastery", order_index=1),
        Module(id=module_ids[6], track_id=track_ids[1], title="Simple Sentences", order_index=2),
        Module(id=module_ids[7], track_id=track_ids[1], title="Daily Actions", order_index=3),
        Module(id=module_ids[8], track_id=track_ids[2], title="My World", order_index=2),
        Module(id=module_ids[9], track_id=track_ids[2], title="Work & College Basics", order_index=3),
        Module(id=module_ids[10], track_id=track_ids[3], title="Saying Hello", order_index=2),
        Module(id=module_ids[11], track_id=track_ids[3], title="About Me", order_index=3),
        Module(id=module_ids[12], track_id=track_ids[4], title="Interview Basics", order_index=2),
        Module(id=module_ids[13], track_id=track_ids[4], title="Common HR Questions", order_index=3),
        Module(id=module_ids[14], track_id=track_ids[5], title="Listening & Reading Basics", order_index=2),
        Module(id=module_ids[15], track_id=track_ids[5], title="Speaking & Writing Basics", order_index=3)
    ]
    db.session.add_all(modules)
    db.session.commit()

    # 4. CREATE LESSONS
    lessons = [
        Lesson(
            id=lesson_ids[1],
            module_id=module_ids[1],
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
*   ✔: **"I know the answer."** (Correct!)
*   ❌ *Incorrect:* "This soup is tasting delicious."
*   ✔: **"This soup tastes delicious."** (Correct!)""",
            order_index=1,
            xp_reward=20
        ),
        Lesson(
            id=lesson_ids[2],
            module_id=module_ids[2],
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
*   **Example:** "We don't have the marketing budget details today, so let's *circle back* to this next week.""",
            order_index=1,
            xp_reward=20
        ),
        Lesson(
            id=lesson_ids[3],
            module_id=module_ids[3],
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
*   ✔ *Polite:* "That's an interesting idea, though I'm worried it might slow down our backend query performance.""",
            order_index=1,
            xp_reward=25
        ),
        Lesson(
            id=lesson_ids[4],
            module_id=module_ids[4],
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
*   *Example:* "I'm looking to take my skills to a fast-growing platform like yours, where I can build responsive UIs and help scale EdTech infrastructures."', 1, 30),

#### Topic: Describe a book you read that you found useful.

1.  **The Context (Present/Past - 20s):** Introduce the book.
    *   *Draft:* "I'd like to talk about 'Atomic Habits' by James Clear, which I picked up last summer during my exams."
2.  **The Core Details (Present - 40s):** Answer the main prompts. What was it about?
    *   *Draft:* "The core thesis is that tiny 1% daily changes compound into massive life transformations over time. It's written in an extremely accessible, Notion-style clean formatting."
3.  **The Impact (Past/Present - 30s):** Why did you find it useful? How did you apply it?
    *   *Draft:* "It completely shifted my morning routine. I began coding for just 30 minutes every single day, which eventually helped me master TypeScript..."
4.  **The Horizon (Future - 20s):** How do you view it going forward?
    *   *Draft:* "I plan to reread it next month, and I've already recommended it to my classmates who struggle with streak consistency.""",
            order_index=1,
            xp_reward=30
        ),
        Lesson(
            id=lesson_ids[5],
            module_id=module_ids[5],
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
    *   *Draft:* "I plan to reread it next month, and I've already recommended it to my classmates who struggle with streak consistency.""",
            order_index=1,
            xp_reward=30
        ),
        Lesson(
            id=lesson_ids[6],
            module_id=module_ids[6],
            title="Using Am, Is, and Are",
            content="""### Using Am, Is, and Are
Learn the simple rules for the present tense of the verb "to be":
* Use **am** with **I** (e.g., "I am a student.")
* Use **is** with **he, she, it**, or any singular noun (e.g., "He is a doctor.")
* Use **are** with **you, we, they**, or any plural noun (e.g., "They are engineering students.")""",
            order_index=1,
            xp_reward=10
        ),
        Lesson(
            id=lesson_ids[7],
            module_id=module_ids[7],
            title="Adding 's' or 'es'",
            content="""### Adding 's' or 'es'
In the Simple Present tense, when the subject is third-person singular (**he, she, it**, or a single name), we must add **-s** or **-es** to the base verb:
* Verb: *eat* -> "He **eats** an apple."
* Verb: *go* -> "She **goes** to college."
* Verb: *watch* -> "It **watches** the room." """,
            order_index=1,
            xp_reward=15
        ),
        Lesson(
            id=lesson_ids[8],
            module_id=module_ids[8],
            title="Family & Friends",
            content="""### Family & Friends Vocabulary
Learn key nouns to describe relationships in your world:
* **Mother's/Father's brother**: Uncle
* **Mother's/Father's sister**: Aunt
* **Aunt's/Uncle's children**: Cousin""",
            order_index=1,
            xp_reward=10
        ),
        Lesson(
            id=lesson_ids[9],
            module_id=module_ids[9],
            title="Polite Words",
            content="""### Polite Words in Communication
Using soft, polite words makes a huge difference in college and corporate environments:
* Say **"Sorry"** when you make a mistake.
* Say **"Thank you"** when someone helps you.
* Say **"Excuse me"** to politely get attention.""",
            order_index=1,
            xp_reward=15
        ),
        Lesson(
            id=lesson_ids[10],
            module_id=module_ids[10],
            title="Greetings for Morning, Afternoon, and Night",
            content="""### Greet Professionally Based on Time
* **Good Morning**: Morning until 12:00 PM (noon).
* **Good Afternoon**: 12:00 PM until around 5:00 PM.
* **Good Evening**: 5:00 PM onwards.""",
            order_index=1,
            xp_reward=10
        ),
        Lesson(
            id=lesson_ids[11],
            module_id=module_ids[11],
            title="Talking about your Hometown",
            content="""### Describing Your Hometown
When introducing yourself, talking about your hometown is a wonderful way to connect. Use these key vocabulary structures:
*   "I **am from** [City Name], which is famous for..."
*   "It is a **bustling metropolis** (large city) / a **serene town** (quiet place)."
*   "I have been living there **for** ten years / **since** my childhood." """,
            order_index=1,
            xp_reward=15
        ),
        Lesson(
            id=lesson_ids[12],
            module_id=module_ids[12],
            title="Greeting the Interviewer",
            content="""### Professional Interview Greetings
First impressions matter! Make a perfect start to your interview:
1.  **Smile and stand straight**: Conveys absolute confidence.
2.  **Greetings based on time**:
    *   Morning (until 12 PM): "Good morning, sir/madam."
    *   Afternoon (12 PM - 5 PM): "Good afternoon, sir/madam."
3.  **Soft reply**: "It is a pleasure to meet you today." """,
            order_index=1,
            xp_reward=15
        ),
        Lesson(
            id=lesson_ids[13],
            module_id=module_ids[13],
            title="Your Strengths",
            content="""### How to Pitch Your Strengths
Employers want to know what makes you a great candidate. Use clear, active statements:
*   "My greatest strength is my **adaptability**. I hit the ground running with new technologies."
*   "I am a **hard worker** and a highly **articulate** team member."
*   Always back up your strength with a short example!""",
            order_index=1,
            xp_reward=20
        ),
        Lesson(
            id=lesson_ids[14],
            module_id=module_ids[14],
            title="Listening for Names and Numbers",
            content="""### IELTS Listening: Names and Numbers
In Part 1 of the IELTS Listening exam, you will hear a phone conversation. You must write down details:
1.  **Spelling of Names**: Listen carefully as speakers spell out unusual names (e.g. "S-M-I-T-H").
2.  **Numbers**: Phone numbers, credit cards, or dates are read out. Double-check for zeroes ("oh" or "zero").""",
            order_index=1,
            xp_reward=20
        ),
        Lesson(
            id=lesson_ids[15],
            module_id=module_ids[15],
            title="Using Connectors",
            content="""### Cohesion and Coherence: Using Connectors
To get a high band score in IELTS Writing and Speaking, you must connect sentences beautifully:
*   **Contrast (opposite ideas)**: Use "but", "however", or "although".
    *   *Example:* "I like apples, **but** I do not like oranges."
*   **Addition (extra details)**: Use "and", "furthermore", or "in addition".
*   **Cause & Effect**: Use "because", "so", or "therefore".""",
            order_index=1,
            xp_reward=25
        )
    ]
    db.session.add_all(lessons)
    db.session.commit()

    # 5. CREATE QUESTIONS
    questions = [
        # Lesson 1 Questions
        Question(
            lesson_id=lesson_ids[1],
            question="Every Monday morning, the engineering team _____ a standup meeting to align on milestones.",
            type="fill_in_the_blank",
            correct_answer="holds",
            explanation="Every Monday implies a habit/repeated routine, which requires the Simple Present ('holds') rather than the continuous form ('is holding')."
        ),
        Question(
            lesson_id=lesson_ids[1],
            question="Which of the following sentences represents correct grammar usage of stative verbs?",
            type="mcq",
            options=[
                "I am preferring Tailwind CSS over normal CSS for styling.",
                "I prefer Tailwind CSS over normal CSS for styling.",
                "I have been preferring Tailwind CSS for a few weeks.",
                "I am going to be preferring Tailwind CSS."
            ],
            correct_answer="I prefer Tailwind CSS over normal CSS for styling.",
            explanation="'Prefer' is a stative verb describing a mental state, not an ongoing physical action. Stative verbs do not take continuous '-ing' forms."
        ),
        Question(
            lesson_id=lesson_ids[1],
            question="Correct this sentence: 'Look at the sky! It rains heavily right now.'",
            type="sentence_correction",
            correct_answer="Look at the sky! It is raining heavily right now.",
            explanation="'Right now' refers to an action occurring at the exact moment of speaking. Thus, it requires the Present Continuous tense ('is raining')."
        ),
        Question(
            lesson_id=lesson_ids[1],
            question="Select the synonym of 'temporary' that fits a changing situation:",
            type="vocabulary",
            options=["Permanent", "Transient", "Eternal", "Perpetual"],
            correct_answer="Transient",
            explanation="'Transient' means lasting only for a short time; impermanent or temporary, which represents the dynamic state of transient work."
        ),
        Question(
            lesson_id=lesson_ids[1],
            question="Scenario: You are in a daily standup. A colleague asks if you are finished. How do you explain that you are CURRENTLY in the middle of coding the login page?",
            type="scenario",
            options=[
                "I code the login page every day.",
                "I was coding the login page yesterday.",
                "I am coding the login page right now, and I will submit it soon.",
                "I have coded the login page last week."
            ],
            correct_answer="I am coding the login page right now, and I will submit it soon.",
            explanation="To represent an ongoing action in a real-world scenario, the Present Continuous ('I am coding right now') communicates it perfectly."
        ),

        # Lesson 2 Questions
        Question(
            lesson_id=lesson_ids[2],
            question="During the meeting, the project manager said: 'We are running out of time, so let's _____ on this item during our Friday sync.'",
            type="fill_in_the_blank",
            correct_answer="touch base",
            explanation="'Touch base' means to briefly contact or catch up with someone, which fits perfectly for a subsequent sync-up meeting."
        ),
        Question(
            lesson_id=lesson_ids[2],
            question="What does it mean if a new full-stack engineer 'hits the ground running'?",
            type="mcq",
            options=[
                "They had a bad accident on their first day of work.",
                "They start working immediately with great energy and high productivity.",
                "They literally ran around the office during onboarding.",
                "They spent their first three weeks reading documentation without writing code."
            ],
            correct_answer="They start working immediately with great energy and high productivity.",
            explanation="'Hit the ground running' means to start a new activity or career immediately with enthusiasm and high output."
        ),
        Question(
            lesson_id=lesson_ids[2],
            question="Correct this usage: 'Let's circle back the pricing issue until we have the market research.'",
            type="sentence_correction",
            correct_answer="Let's circle back to the pricing issue when we have the market research.",
            explanation="The idiom is 'circle back to [something]', and it's logical to sync *when* or *once* we have the data, rather than *until*."
        ),
        Question(
            lesson_id=lesson_ids[2],
            question="Vocabulary: What is the meaning of the corporate jargon 'synergy'?",
            type="vocabulary",
            options=["Extreme tiredness", "Combined interaction or cooperative action", "Single isolation", "Financial debt"],
            correct_answer="Combined interaction or cooperative action",
            explanation="'Synergy' describes the cooperation of two or more organizations, substances, or teams to produce a combined effect greater than the sum of their separate parts."
        ),
        Question(
            lesson_id=lesson_ids[2],
            question="Scenario: You are in an email sync. A client raises a question that requires engineering research. What is the most professional response using our idioms?",
            type="scenario",
            options=[
                "I don't know, ask someone else.",
                "I will touch base with the dev team and circle back to you with the results by tomorrow.",
                "I am hitting the ground running to tell you I don't know.",
                "I'm ignoring your question for now."
            ],
            correct_answer="I will touch base with the dev team and circle back to you with the results by tomorrow.",
            explanation="This integrates both 'touch base' (talking to the dev team) and 'circle back' (returning with the answer) elegantly and professionally."
        ),

        # Lesson 3 Questions
        Question(
            lesson_id=lesson_ids[3],
            question="Which of the following is a respectful 'softener' to start a disagreement?",
            type="mcq",
            options=[
                "You are absolutely wrong about this.",
                "I see where you are coming from, but...",
                "That's completely illogical.",
                "Let's not talk about your idea."
            ],
            correct_answer="I see where you are coming from, but...",
            explanation="This softener validates the speaker's viewpoint, demonstrating active listening before presenting an alternative opinion."
        ),
        Question(
            lesson_id=lesson_ids[3],
            question="Scenario: A colleague suggests using plain CSS instead of Tailwind, claiming it's faster. You disagree. Which response is most professional?",
            type="scenario",
            options=[
                "No, plain CSS is outdated and terrible.",
                "I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.",
                "You don't understand modern web app requirements.",
                "Fine, do whatever you want."
            ],
            correct_answer="I understand your concern about speed, but Tailwind ensures high responsive consistency and speeds up our feature deployment significantly.",
            explanation="This uses a softener ('I understand your concern about speed') followed by a clear, objective business justification for Tailwind CSS."
        ),
        Question(
            lesson_id=lesson_ids[3],
            question="Fill in the blank to soften this rejection: 'That is a good suggestion, ________, our server architecture might not support that real-time load.'",
            type="fill_in_the_blank",
            correct_answer="however",
            explanation="'however' acts as a professional conjunction to transition from a softener to an objective technological limitation."
        ),
        Question(
            lesson_id=lesson_ids[3],
            question="Correct this aggressive phrasing: 'Your database schema choice is a disaster.'",
            type="sentence_correction",
            correct_answer="I appreciate your design, but we might run into scalability issues with this database schema.",
            explanation="Replacing personal attacks ('is a disaster') with constructive, objective feedback ('scalability issues') preserves professional relationships."
        ),
        Question(
            lesson_id=lesson_ids[3],
            question="Vocabulary: What does 'tactful' communication mean?",
            type="vocabulary",
            options=["Extremely loud", "Sensitivity in dealing with difficult issues to avoid offense", "Being brutal and direct", "Slow to respond"],
            correct_answer="Sensitivity in dealing with difficult issues to avoid offense",
            explanation="Being 'tactful' is a core skill in professional English, meaning showing skill and sensitivity when managing difficult or conflicting viewpoints."
        ),

        # Lesson 4 Questions
        Question(
            lesson_id=lesson_ids[4],
            question="The 'PPF Formula' stands for ________, ________, and ________.",
            type="fill_in_the_blank",
            correct_answer="Present, Past, Future",
            explanation="The formula starts with what you do right now (Present), transitions to your achievements (Past), and ends with why you want this role (Future)."
        ),
        Question(
            lesson_id=lesson_ids[4],
            question="In the 'PPF' HR pitch formula, what should you focus on during the 'FUTURE' section?",
            type="mcq",
            options=[
                "Your childhood dreams of becoming an astronaut.",
                "Why you are excited about this specific role and how you can add value to their company.",
                "Detailed explanations of your salary expectations.",
                "A summary of your college grades and GPA."
            ],
            correct_answer="Why you are excited about this specific role and how you can add value to their company.",
            explanation="The Future section bridges your current capabilities directly to the employer's needs, creating a persuasive closing hook."
        ),
        Question(
            lesson_id=lesson_ids[4],
            question="Correct this passive/weak statement: 'I did some React work at my college club.'",
            type="sentence_correction",
            correct_answer="I designed and implemented a full-stack dashboard for my college club using React.",
            explanation="Using active, action-driven verbs ('designed and implemented') instead of passive verbs ('did some work') conveys high technical ownership."
        ),
        Question(
            lesson_id=lesson_ids[4],
            question="Vocabulary: What is the meaning of 'articulate'?",
            type="vocabulary",
            options=["Showing high physical speed", "Having the ability to speak fluently and coherently", "Being extremely stubborn", "Using complex, outdated vocabulary"],
            correct_answer="Having the ability to speak fluently and coherently",
            explanation="To 'articulate' means to express an idea or feeling fluently and clearly in spoken or written English."
        ),
        Question(
            lesson_id=lesson_ids[4],
            question="Scenario: An interviewer asks: 'Tell me about yourself.' Which introduction hook is best?",
            type="scenario",
            options=[
                "Hello, my name is Amit. I was born in 2004. I like watching movies and reading books...",
                "Hi, I'm Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I'm building FluentFlow AI...",
                "Well, you can read my resume. It has all my projects listed on page 1.",
                "I am currently looking for any job that pays well because I need to pay off my loans."
            ],
            correct_answer="Hi, I'm Amit, a software engineer specializing in responsive React frontends and Flask APIs. Currently, I'm building FluentFlow AI...",
            explanation="A high-impact hook starts with your professional identity, core technical stack, and a highly active project (the 'Present')."
        ),

        # Lesson 5 Questions
        Question(
            lesson_id=lesson_ids[5],
            question="In IELTS Speaking Part 2, you must speak continuously for at least _____ minutes.",
            type="fill_in_the_blank",
            correct_answer="1 to 2",
            explanation="The examiner gives you exactly 1 minute to prepare, and you must speak continuously for between 1 and 2 minutes."
        ),
        Question(
            lesson_id=lesson_ids[5],
            question="How does the PPF storytelling technique help you speak longer in IELTS Part 2?",
            type="mcq",
            options=[
                "It teaches you how to memorize essays word-for-word.",
                "It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.",
                "It allows you to speak very slowly with long pauses.",
                "It teaches you how to speak using only simple present tense sentences."
            ],
            correct_answer="It structures your speech chronologically (what happened, what happens now, and future plans) ensuring you never run out of ideas.",
            explanation="Structuring details across past memories, current practices, and future plans naturally provides ample high-quality content."
        ),
        Question(
            lesson_id=lesson_ids[5],
            question="Correct this common spoken IELTS grammar error: 'I am reading this book since three years.'",
            type="sentence_correction",
            correct_answer="I have been reading this book for three years.",
            explanation="For an action that started in the past and continues into the present, use the Present Perfect Continuous ('have been reading') with 'for' (duration)."
        ),
        Question(
            lesson_id=lesson_ids[5],
            question="Vocabulary: Choose the word that represents a 'compelling and useful' piece of advice:",
            type="vocabulary",
            options=["Superfluous", "Invaluable", "Redundant", "Trivial"],
            correct_answer="Invaluable",
            explanation="'Invaluable' means extremely useful or indispensable, which is perfect for describing high-quality support or reading material."
        ),
        Question(
            lesson_id=lesson_ids[5],
            question="Scenario: You run out of points on a Cue Card prompt with 40 seconds left. What is the best strategy?",
            type="scenario",
            options=[
                "Stop speaking immediately and stare at the examiner.",
                "Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.",
                "Repeat the same paragraph again using exactly the same words.",
                "Complain to the examiner that the topic is too difficult."
            ],
            correct_answer="Transition smoothly to the future: talk about how the topic affects your future plans, next steps, or potential goals.",
            explanation="Switching to the 'Future' dimension of the PPF technique is the most natural way to expand your content while demonstrating advanced tense control."
        ),

        # Lesson 6 Question
        Question(
            lesson_id=lesson_ids[6],
            question="Choose the correct word to complete the sentence: 'I ____ a student.'",
            type="mcq",
            options=["is", "am", "are", "be"],
            correct_answer="am",
            explanation="Great job! We always use 'am' when we talk about ourselves using 'I'."
        ),

        # Lesson 7 Question
        Question(
            lesson_id=lesson_ids[7],
            question="Choose the correct sentence:",
            type="sentence_correction",
            correct_answer="He eats an apple.",
            explanation="Perfect! When we talk about one person (He, She, or It) doing something every day, we add an 's' to the action word. Eat becomes eats!"
        ),

        # Lesson 8 Question
        Question(
            lesson_id=lesson_ids[8],
            question="What do you call your mother's brother?",
            type="mcq",
            options=["Uncle", "Aunt", "Brother", "Cousin"],
            correct_answer="Uncle",
            explanation="Yes! In English, your mother's or father's brother is called your 'Uncle'."
        ),

        # Lesson 9 Question
        Question(
            lesson_id=lesson_ids[9],
            question="When you make a mistake, you should say: 'I am _____.'",
            type="fill_in_the_blank",
            correct_answer="Sorry",
            explanation="Well done! Saying 'Sorry' shows you are polite and kind when a mistake happens."
        ),

        # Lesson 10 Question
        Question(
            lesson_id=lesson_ids[10],
            question="Greet someone professionally in the evening after 6 PM:",
            type="mcq",
            options=["Good morning", "Good afternoon", "Good evening", "Goodbye"],
            correct_answer="Good evening",
            explanation="Excellent! Use 'Good evening' to greet someone professionally after 5:00 PM or 6:00 PM."
        ),

        # Lesson 11 Question
        Question(
            lesson_id=lesson_ids[11],
            question="Which of the following is the best way to say where you are from?",
            type="mcq",
            options=["I am from Hyderabad.", "I going to Hyderabad.", "My name is Hyderabad.", "I am in Hyderabad."],
            correct_answer="I am from Hyderabad.",
            explanation="Spot on! 'I am from [City]' is the perfect, natural way to tell someone where your hometown is."
        ),

        # Lesson 12 Question
        Question(
            lesson_id=lesson_ids[12],
            question="You enter the interview room at 10 AM. The HR manager is sitting at the desk. What should you say?",
            type="scenario",
            options=["Hi bro.", "Good morning, sir/madam.", "I want a job.", "What is your name?"],
            correct_answer="Good morning, sir/madam.",
            explanation="Wonderful! 'Good morning, sir/madam' is polite, professional, and shows respect."
        ),

        # Lesson 13 Question
        Question(
            lesson_id=lesson_ids[13],
            question="The HR asks: 'What is your strength?'' Choose the best beginner-friendly answer:",
            type="mcq",
            options=["I am a very hard worker.", "I don't know.", "I sleep a lot.", "I am angry."],
            correct_answer="I am a very hard worker.",
            explanation="Great choice! Employers love hard workers. It's a simple, honest, and powerful answer."
        ),

        # Lesson 14 Question
        Question(
            lesson_id=lesson_ids[14],
            question="In the audio, the man says: 'My phone number is nine-eight-seven, zero-zero-two.' Write the number.",
            type="fill_in_the_blank",
            correct_answer="987002",
            explanation="Spot on! In IELTS Listening, catching simple numbers correctly is an easy way to boost your score."
        ),

        # Lesson 15 Question
        Question(
            lesson_id=lesson_ids[15],
            question="Join these two simple sentences: 'I like apples. I do not like oranges.'",
            type="sentence_correction",
            correct_answer="I like apples but I do not like oranges.",
            explanation="Brilliant! We use 'but' to connect two opposite ideas. This makes your English sound much more natural!"
        )
    ]
    db.session.add_all(questions)
    db.session.commit()

    # 6. SEED SOME DUMMY ATTEMPTS TO POPULATE ANALYTICS
    attempts = [
        QuizAttempt(
            user_id=user_ids[2],
            lesson_id=lesson_ids[1],
            score=4,
            accuracy=0.8,
            xp_earned=20,
            time_taken=120,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        QuizAttempt(
            user_id=user_ids[4],
            lesson_id=lesson_ids[1],
            score=5,
            accuracy=1.0,
            xp_earned=25,
            time_taken=95,
            created_at=datetime.utcnow() - timedelta(days=4)
        ),
        QuizAttempt(
            user_id=user_ids[4],
            lesson_id=lesson_ids[3],
            score=5,
            accuracy=1.0,
            xp_earned=30,
            time_taken=105,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
    ]
    db.session.add_all(attempts)
    db.session.commit()
