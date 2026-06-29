# Phased Execution Plan: CT & AI Student Project Dashboard (Demo Build)

This document outlines a **9-phase execution plan** to build the Computational Thinking & AI Student Project Dashboard. 

To ensure high-quality and steady feedback:
- **No code is implemented in this planning document.**
- **Each phase is designed to be completed in a single session.**
- **After every single phase, the application remains fully runnable.** You can open it in your browser, visually interact with the changes, and decide if you want to proceed.
- **We prioritize a premium, modern aesthetic** (clean typography, harmonious color palette, responsive layout, and smooth interactions) starting from the very first phase.

---

## Technical Stack & Architecture Assumption
- **Frontend Framework:** React (scaffolded with Vite for extremely fast hot-reloading).
- **Styling:** Custom Vanilla CSS utilizing CSS variables for cohesive design tokens (colors, spacing, typography, borders, shadows).
- **State Management:** React Context API or standard hook-based state initialized with a hardcoded `seedData.js` object, merged dynamically with client-side updates persisted in `localStorage`.
- **Database/Auth:** Out of scope for this demo. Done entirely client-side using stored mock user accounts and checking credentials.

---

## Phase-by-Phase Breakdown

### Phase 1: Project Setup & Styled Login Screen
* **Objective:** Establish the project structure, load initial seed data structures, and build a beautiful, animated login interface.
* **Runnable State:** 
  - You can run `npm run dev` and open the app in your browser.
  - A premium login card with a modern dark-mode gradient background is displayed.
  - Features a toggle or tab bar to switch between roles (**Student**, **Teacher**, **Principal**) which automatically pre-fills standard demo credentials to speed up testing.
  - Clicking "Login" validates credentials client-side and transitions to a placeholder screen showing "Welcome, [User Name] ([Role])" with a functioning "Logout" button.
* **Aesthetics & UI:**
  - Font: Google Font (e.g., *Outfit* or *Inter*).
  - Clean card design with glassmorphism style (semi-transparent backdrop, subtle white border, and soft box shadow).
  - Micro-animations: smooth hover scaling on inputs and buttons, ease-in transition on login failure messages.

---

### Phase 2: Shell Layouts, Routing, & LocalStorage Persistence
* **Objective:** Build the dashboard layouts for the three distinct roles, implement routing, and configure state persistence.
* **Runnable State:** 
  - Logging in as a student, teacher, or principal routes you to their respective dashboard pages (e.g., `/student`, `/teacher`, `/principal`).
  - Accessing a dashboard route without logging in automatically redirects back to `/login`.
  - The dashboards share a professional sidebar or top-navbar displaying the active user's details, role badge, and a "Logout" button.
  - The app automatically initializes `localStorage` with default seed data if no data is found. Any changes in state are written to `localStorage` (tested in this phase by clearing storage and observing the defaults reload).
* **Aesthetics & UI:**
  - Sidebar layout with active link states, responsive collapsible menu.
  - Soft background shades (e.g., off-white background with pure white cards/panels).
  - Slide-in page transitions.

---

### Phase 3: Student Dashboard - Milestone List & Status Badges
* **Objective:** Implement the read-only portions of the Student Dashboard, displaying their project details and progress metrics.
* **Runnable State:**
  - Log in as a student (e.g., `student1`).
  - See the project header containing the title: *"Invent Your Own Number System"* and a key driving question.
  - See dynamic, high-level summary cards showing current progress: e.g., **"Overall Score: 13/100"** and **"Milestones Completed: 1 of 5"**.
  - See a beautifully styled list/timeline of all 5 milestones, complete with color-coded status badges:
    - `Not Started` (Grey)
    - `Submitted` (Amber/Orange)
    - `Graded` (Emerald Green)
  - Clicking any milestone expands/opens a details panel showing the instructions and maximum marks.
* **Aesthetics & UI:**
  - Circular progress ring or sleek linear progress bar representing overall project completion.
  - Cards featuring subtle hover elevations (`box-shadow` changes) and smooth layout shifts when milestones are expanded.

---

### Phase 4: Student Milestone Submissions
* **Objective:** Enable students to submit text responses for their milestones.
* **Runnable State:**
  - Log in as a student (e.g., `student2`).
  - Select a milestone in the `Not Started` state.
  - A modern textarea appears under the instructions. Type a response and click a "Submit Response" button.
  - Upon submission, the milestone badge instantly changes to `Submitted`, the edit window locks (becoming read-only), and a confirmation toast appears.
  - Refresh the page to confirm that the text remains saved and the status remains `Submitted`.
* **Aesthetics & UI:**
  - Textarea has a character count indicator and placeholder helper text.
  - Smooth scale and pulse animations on the "Submit" button.
  - Slide-in toast notification banner on successful action.

---

### Phase 5: Teacher Dashboard - Summary Cards & Student Roster
* **Objective:** Build the main Teacher Dashboard landing view displaying class overview metrics and a student tracking roster.
* **Runnable State:**
  - Log in as a teacher (e.g., `teacher1` - Mr. Iyer).
  - See key classroom performance cards at the top:
    - **Class Average Score** (calculated dynamically from graded submissions)
    - **Completion Rate %**
    - **Grading Queue** (count of submissions needing grading)
  - See a table of only the students assigned to that teacher (Aarav, Diya, Kabir).
  - The table columns display: Student Name, Completion Status (e.g. `2/5 Milestones`), Total Marks Earned, and a Call-To-Action column ("Needs Grading" vs. "Completed").
* **Aesthetics & UI:**
  - Clean table formatting with zebra-striping, ample cell padding, and header sorting options.
  - Hover highlights on table rows.
  - Colored indicator lights for students who are falling behind (e.g., 0 completed milestones).

---

### Phase 6: Teacher Grading Panel & Rubrics
* **Objective:** Build the interactive grading interface where teachers inspect submissions and input marks.
* **Runnable State:**
  - Log in as `teacher1`.
  - Click on a student (e.g., `student2`). A detailed view opens, rendering all 5 milestones for that specific student.
  - Select a milestone with a `Submitted` status to see the student's text response.
  - An inline grading card appears containing:
    - A marks entry input box (validated client-side so it cannot exceed the milestone's maximum marks, e.g. `0 - 20`).
    - A feedback text area.
    - A grading rubric cheat-sheet box matching the CBSE Class 8 guidelines.
    - A "Save Grade" button.
  - Clicking "Save Grade" updates the status to `Graded`, updates the student's marks, recalculated classroom summaries immediately, and saves the new state.
* **Aesthetics & UI:**
  - Slide-out drawer or clean overlay modal for student grading details.
  - Validation messages for invalid marks inputs (e.g., text instead of numbers, or marks greater than max).
  - Highlighting for "Submitted" items to direct the teacher's attention.

---

### Phase 7: Principal Dashboard - School-Wide Metrics & Teacher Rollup
* **Objective:** Implement the high-level Principal view showing aggregate school data and teacher-by-teacher rollups.
* **Runnable State:**
  - Log in as the principal (`principal` - Mrs. Rao).
  - View overall school summary metrics: **Total Students enrolled**, **Overall Average Score**, and **Completion Rate**.
  - See a table containing all teachers (Mr. Iyer, Ms. Fernandes).
  - Columns show: Teacher Name, Class Size, Average Score, and Class Completion Rate.
* **Aesthetics & UI:**
  - Big bold KPI (Key Performance Indicator) cards at the top.
  - Visual graphs or progress bars inside table cells showing relative averages.

---

### Phase 8: Principal Drill-down (Read-Only Views)
* **Objective:** Add drill-down navigation allowing the principal to review class and individual student data without editing rights.
* **Runnable State:**
  - Log in as `principal`.
  - Click a teacher row in the summary table. The view changes to show that teacher's student roster.
  - Click a student's row. The view drills down further to show the student's 5 milestones, submissions, marks, and feedback.
  - **Verification:** All inputs, text areas, and save buttons are completely replaced with plain text or read-only badges. The principal cannot change any submission or grading details.
  - A clear breadcrumb path (e.g. `Overview > Mr. Iyer > Aarav`) is visible at the top to allow easy navigation back.
* **Aesthetics & UI:**
  - Breadcrumb navigation component with hover and click states.
  - "View Mode Only" notification banner on top of drill-down screens.

---

### Phase 9: Verification, UI Polish, & Demo Script Dry Run
* **Objective:** Conduct edge-case checks, clean up transitions, and dry-run the exact user demonstration script.
* **Runnable State:**
  - The application is complete and fully functional.
  - The developer or reviewer executes the 4-step Demo Script:
    1. Login as `student2` -> Submit milestone response.
    2. Login as `teacher1` -> Review, grade, and feedback milestone.
    3. Login as `principal` -> Verify teacher aggregates and drill down to see `student2`'s marks.
  - Responsive design check: the application is usable on multiple desktop viewport widths.
  - Reset Demo button: A developer/user button in the footer that clears `localStorage` and resets seed data back to the clean default layout.
* **Aesthetics & UI:**
  - Smooth dashboard entry transitions.
  - Polish shadow values, border-radii, scrollbar styles, and contrast ratios.

---

## Verification Strategy per Phase
Every phase ends with an explicit check checklist. 
To mark a phase complete:
1. The app must compile without warnings or errors.
2. The user must be able to boot the development server (`npm run dev`).
3. The specified features must be interactive in the browser.
4. Refreshing the browser page must maintain expected state.
