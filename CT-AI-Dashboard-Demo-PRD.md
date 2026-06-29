# PRD: CT & AI Student Project Dashboard (Demo Build)

**Goal:** A working demo, tonight, showing three role-based logins (Student, Teacher,
Principal) where a student completes a sample Computational Thinking project,
a teacher grades it, and a principal sees rolled-up progress across teachers and students.

**Audience for this doc:** An AI coding assistant building this step by step.
**Time budget:** One evening. Every decision below is made to keep scope buildable in that window.

---

## 1. Demo Scope (read this first)

This is an MVP for a live demo, not a production system. To make that achievable tonight:

- **No real authentication.** Use a small hardcoded list of demo accounts (username + password),
  checked client-side. No password hashing, no backend auth service.
- **No real database.** Seed all data as a JSON object in the app. Persist any *new* activity
  (a submission, a grade) to `localStorage` so it survives a page refresh during the demo.
- **One school, one class structure.** Two teachers, a handful of students each, one principal.
  No multi-school/multi-class complexity.
- **One sample project**, with 5 milestones, used by all students.
- **Submissions are short text answers.** No file upload, no image upload — typing a response
  is enough to prove the workflow.

Everything above is intentionally simple so the *workflow* (login → do project → get graded →
roll up to principal) is the star of the demo, not the infrastructure.

### Explicitly out of scope tonight
- Real security / production auth
- Multiple classes, multiple schools, class enrollment management
- File/photo uploads for project submissions
- Plagiarism checks, AI-graded submissions, notifications/email
- Mobile polish (desktop browser demo is fine)

---

## 2. User Roles & What Each One Can Do

### Student
- Logs in with seeded credentials
- Sees their assigned project and its milestones, with status (Not started / Submitted / Graded)
- Opens a milestone, reads instructions, types and submits a response
- Sees their own marks + teacher feedback once graded
- Sees overall project progress (e.g., "3 of 5 milestones graded, 62/100 so far")

### Teacher
- Logs in with seeded credentials
- Sees only the students assigned to them (their "class")
- Sees each student's progress across all 5 milestones
- Opens a student's submission for any milestone, enters marks + short feedback, saves
- Sees a class summary: average score, % of milestones completed, who's behind

### Principal
- Logs in with seeded credentials
- Sees all teachers and their classes
- Sees rolled-up metrics per teacher (class average score, completion %)
- Can drill into any teacher's class to see that teacher's students
- Can drill into any individual student to see their full progress (read-only — no editing)

**Permission summary**

| Action | Student | Teacher | Principal |
|---|---|---|---|
| View own project/marks | ✅ | — | — |
| Submit milestone response | ✅ (own only) | ❌ | ❌ |
| View students' submissions | ❌ | ✅ (own class) | ✅ (all) |
| Enter/edit marks & feedback | ❌ | ✅ (own class) | ❌ (read-only) |
| View all teachers' rollups | ❌ | ❌ | ✅ |

---

## 3. Sample Project (seed content)

**Project title:** *Invent Your Own Number System*
**Subject:** Computational Thinking (CBSE Class 8 CT & AI curriculum)
**Driving question:** "If you could design a counting system from scratch, how would you
make it work — and how would you teach someone else to use it?"

This project has **5 milestones**, worth a total of **100 marks**.

| # | Milestone | Student instructions | Max marks |
|---|---|---|---|
| 1 | Research existing number systems | Briefly describe how 2 number systems (e.g., binary, Roman, Egyptian) represent numbers, and what base each uses. | 15 |
| 2 | Design your own base system | Choose a base (not 2, 3, or 10). List your digit symbols (0 to base−1) and explain why you chose that base. | 20 |
| 3 | Build a model | Describe (in words, or attach a photo description) how you'd represent place values physically — e.g., using blocks, sticks, or a drawing, similar to the "pipes" idea for binary/ternary. | 20 |
| 4 | Write & test a conversion algorithm | Write step-by-step rules to convert a decimal number into your system, and back. Show the conversion worked out for 2 example numbers. | 25 |
| 5 | Apply it + present | Use your system for one real purpose (e.g., a secret code, a measuring chart) and explain it in 3–4 sentences. | 20 |

**Grading rubric note for teachers (shown in the teacher grading UI as a hint):**
- Full marks: complete, correct, clearly explained
- Partial marks: attempted with minor errors or missing explanation
- Low marks: incomplete or shows misunderstanding of place value/base logic

This table is exactly what should be seeded into the app's data — it's also useful to
pre-fill 2–3 students' submissions so the demo doesn't require live typing through every step.

---

## 4. Data Model

Keep this as one JSON object in the app (e.g., `seedData.js`), shaped like this:

```json
{
  "users": [
    { "id": "p1", "name": "Mrs. Rao", "role": "principal", "username": "principal", "password": "demo123" },
    { "id": "t1", "name": "Mr. Iyer", "role": "teacher", "username": "teacher1", "password": "demo123" },
    { "id": "t2", "name": "Ms. Fernandes", "role": "teacher", "username": "teacher2", "password": "demo123" },
    { "id": "s1", "name": "Aarav", "role": "student", "username": "student1", "password": "demo123", "teacherId": "t1" },
    { "id": "s2", "name": "Diya", "role": "student", "username": "student2", "password": "demo123", "teacherId": "t1" },
    { "id": "s3", "name": "Kabir", "role": "student", "username": "student3", "password": "demo123", "teacherId": "t1" },
    { "id": "s4", "name": "Meera", "role": "student", "username": "student4", "password": "demo123", "teacherId": "t2" },
    { "id": "s5", "name": "Rohan", "role": "student", "username": "student5", "password": "demo123", "teacherId": "t2" },
    { "id": "s6", "name": "Zara", "role": "student", "username": "student6", "password": "demo123", "teacherId": "t2" }
  ],
  "project": {
    "id": "proj1",
    "title": "Invent Your Own Number System",
    "milestones": [
      { "id": "m1", "title": "Research existing number systems", "instructions": "...", "maxMarks": 15 },
      { "id": "m2", "title": "Design your own base system", "instructions": "...", "maxMarks": 20 },
      { "id": "m3", "title": "Build a model", "instructions": "...", "maxMarks": 20 },
      { "id": "m4", "title": "Write & test a conversion algorithm", "instructions": "...", "maxMarks": 25 },
      { "id": "m5", "title": "Apply it + present", "instructions": "...", "maxMarks": 20 }
    ]
  },
  "submissions": [
    {
      "studentId": "s1",
      "milestoneId": "m1",
      "response": "Binary uses base 2 with digits 0-1...",
      "status": "graded",
      "marks": 13,
      "feedback": "Good explanation, missing one example."
    }
  ]
}
```

`submissions` starts pre-populated with a realistic mix: some students fully graded, some
partially submitted, some not started — so every dashboard has something interesting to show
the moment you log in, without needing to perform every step live.

A `submission.status` should be one of: `not_started`, `submitted`, `graded`.

---

## 5. Screens

**Login**
- Single page, 3 tabs or a role selector (Student / Teacher / Principal) + username/password
- On success, route to the matching dashboard

**Student Dashboard**
- Header: project title, overall progress (e.g., "62/100 marks, 3/5 graded")
- List of 5 milestones with status badge (Not started / Submitted / Graded)
- Click a milestone → instructions + text box to submit (if not yet submitted) or
  view their submission + marks/feedback (if graded)

**Teacher Dashboard**
- Class summary at top: number of students, class average, % milestones graded
- Table of students: name, milestones completed, current total marks, status
- Click a student → see all 5 milestones, their submitted text, and an input to enter
  marks (within max) + feedback, with a Save button

**Principal Dashboard**
- Table of teachers: name, number of students, class average, % completion
- Click a teacher → see that teacher's student table (same view teacher sees, but read-only)
- Click a student from there → see their full milestone breakdown (read-only)

---

## 6. Suggested Tech Approach

- **Single React app** (Vite or Create React App), no backend
- **Routing:** simple role-based routes (`/login`, `/student`, `/teacher`, `/principal`),
  guarded by checking the logged-in user's role stored in app state
- **State:** seed data loaded into React state on app load; merge in anything saved to
  `localStorage` from a previous demo run (new submissions/grades)
- **Styling:** keep it clean and simple — a basic dashboard layout with cards/tables is enough;
  don't spend demo time on visual polish beyond readability

This avoids any setup time for a database, server, or real auth — the whole app can run with
`npm run dev` and nothing else.

---

## 7. Step-by-Step Build Plan (for the AI coding tool)

1. **Scaffold:** Set up the React app, seed data file, and a basic login screen that checks
   credentials against the seeded `users` list and stores the logged-in user in state.
2. **Routing & layout:** After login, route to the correct dashboard shell based on role.
   Add a logout button visible on all dashboards.
3. **Student flow:** Build the milestone list + detail/submission view. Wire up "Submit" to
   update the `submissions` array (status → `submitted`) and save to `localStorage`.
4. **Teacher flow:** Build the class table and the per-student grading view. Wire up "Save
   marks" to update the matching submission (status → `graded`, marks, feedback) and persist.
5. **Principal flow:** Build the teacher rollup table (computed from each teacher's students'
   submissions) and the drill-down views, reusing the teacher's student-table component
   in read-only mode.
6. **Seed realistic demo data:** Pre-fill submissions so 1–2 students are mostly graded,
   1 student is in-progress, and 1 student hasn't started — across both teachers — so every
   dashboard looks alive immediately on login.
7. **Final pass:** Confirm the live demo script below works end to end without errors.

---

## 8. Seeded Demo Accounts

| Role | Username | Password | Notes |
|---|---|---|---|
| Principal | `principal` | `demo123` | Sees both teachers |
| Teacher | `teacher1` | `demo123` | Mr. Iyer — students 1–3 |
| Teacher | `teacher2` | `demo123` | Ms. Fernandes — students 4–6 |
| Student | `student1` … `student6` | `demo123` | One per student |

---

## 9. Live Demo Script (for tonight)

1. **Login as `student2`** → show the project, open a milestone that's "Not started,"
   type a sample answer, submit. Point out the status badge changing.
2. **Logout, login as `teacher1`** → show the class table (student2 now shows "Submitted").
   Open student2's submission for that milestone, enter marks + feedback, save.
3. **Logout, login as `principal`** → show the teacher rollup table, point out teacher1's
   class average. Drill into teacher1 → see student2's updated marks reflected there too.
4. **Optional:** drill into teacher2's class to show a second teacher's students, proving
   the rollup isn't hardcoded to one class.

This script touches every requirement in one pass: separate logins, a student doing a real
project step, marks being recorded, and the principal seeing both teacher- and student-level
progress.

---

## 10. Acceptance Criteria for Tonight

- [ ] Can log in as a student, teacher, and principal with separate credentials
- [ ] Student can view the sample project, open a milestone, and submit a response
- [ ] Teacher can see their own students only, open a submission, and assign marks + feedback
- [ ] Marks entered by a teacher are immediately visible on the student's own dashboard
- [ ] Principal can see both teachers, each one's class average/completion, and drill into
      any individual student's progress
- [ ] Refreshing the browser mid-demo doesn't lose any submissions or grades entered so far
