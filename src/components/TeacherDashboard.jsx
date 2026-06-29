import React, { useState } from 'react';

export default function TeacherDashboard({ 
  teacher, 
  dbData, 
  onSaveGrade, 
  readOnly = false, 
  onBackClick = null 
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(dbData.project.milestones[0].id);
  
  // Grading inputs state
  const [inputMarks, setInputMarks] = useState('');
  const [inputFeedback, setInputFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const milestones = dbData.project.milestones;
  
  // Get students assigned to this teacher
  const classStudents = dbData.users.filter(
    (u) => u.role === 'student' && u.teacherId === teacher.id
  );

  const studentIds = classStudents.map(s => s.id);

  // Get submissions of class students
  const classSubmissions = dbData.submissions.filter(
    (sub) => studentIds.includes(sub.studentId)
  );

  // Compute classroom summary metrics
  const totalSubmissionsPossible = classStudents.length * milestones.length;
  const completedSubmissions = classSubmissions.filter(
    (sub) => sub.status === 'submitted' || sub.status === 'graded'
  ).length;
  const completionRate = totalSubmissionsPossible > 0 
    ? Math.round((completedSubmissions / totalSubmissionsPossible) * 100) 
    : 0;

  // Class Average Calculation:
  // For each student, get the sum of marks of their graded milestones.
  // Average is the mean of students' total scores.
  const studentTotalScores = classStudents.map(student => {
    const studentSubs = classSubmissions.filter(s => s.studentId === student.id && s.status === 'graded');
    return studentSubs.reduce((sum, s) => sum + (s.marks || 0), 0);
  });
  
  const classAverage = studentTotalScores.length > 0
    ? (studentTotalScores.reduce((sum, score) => sum + score, 0) / studentTotalScores.length).toFixed(1)
    : '0.0';

  const pendingGradingCount = classSubmissions.filter(s => s.status === 'submitted').length;

  // Selected Student Details
  const selectedStudent = dbData.users.find(u => u.id === selectedStudentId);
  const selectedStudentSubs = dbData.submissions.filter(s => s.studentId === selectedStudentId);
  
  // Selected Milestone details
  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);
  const activeSubmission = selectedStudentSubs.find(s => s.milestoneId === selectedMilestoneId);

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setErrorMsg('');
    setSaveSuccess('');
    
    // Default to first milestone and pre-load existing grades if present
    const firstMilestoneId = milestones[0].id;
    setSelectedMilestoneId(firstMilestoneId);
    
    const sub = dbData.submissions.find(
      s => s.studentId === studentId && s.milestoneId === firstMilestoneId
    );
    if (sub && sub.status === 'graded') {
      setInputMarks(sub.marks.toString());
      setInputFeedback(sub.feedback || '');
    } else {
      setInputMarks('');
      setInputFeedback('');
    }
  };

  const handleSelectMilestone = (milestoneId) => {
    setSelectedMilestoneId(milestoneId);
    setErrorMsg('');
    setSaveSuccess('');

    const sub = selectedStudentSubs.find(s => s.milestoneId === milestoneId);
    if (sub && sub.status === 'graded') {
      setInputMarks(sub.marks.toString());
      setInputFeedback(sub.feedback || '');
    } else {
      setInputMarks('');
      setInputFeedback('');
    }
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    setErrorMsg('');
    setSaveSuccess('');

    const marksNum = parseFloat(inputMarks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > selectedMilestone.maxMarks) {
      setErrorMsg(`Please enter a valid mark between 0 and ${selectedMilestone.maxMarks}.`);
      return;
    }

    onSaveGrade(selectedStudentId, selectedMilestoneId, marksNum, inputFeedback.trim());
    setSaveSuccess('Grade and feedback saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  return (
    <div className="teacher-dashboard animate-fade-in">
      {/* Header and Back navigation (if Principal drill-down) */}
      <div className="dashboard-sub-header">
        {onBackClick && (
          <button onClick={onBackClick} className="btn btn-secondary back-btn">
            ← Back to School Overview
          </button>
        )}
        <div className="dashboard-title-area">
          <h2>Class Roster: {teacher.name}</h2>
          <p className="subtitle">
            {readOnly ? 'Principal Read-Only Inspection Panel' : 'Evaluations & Grading Dashboard'}
          </p>
        </div>
      </div>

      {/* Classroom Stats Grid */}
      <div className="stats-row">
        <div className="card stat-card card-hover">
          <div className="stat-value">{classStudents.length}</div>
          <div className="stat-label">Assigned Students</div>
        </div>
        <div className="card stat-card card-hover">
          <div className="stat-value">{classAverage} <span className="stat-denominator">/ 100</span></div>
          <div className="stat-label">Class Average Score</div>
        </div>
        <div className="card stat-card card-hover">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Milestone Completion Rate</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
        <div className="card stat-card card-hover">
          <div className="stat-value">{pendingGradingCount}</div>
          <div className="stat-label">Submissions Pending Grade</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Student Roster List */}
        <div className="grid-left-col">
          <div className="card roster-card">
            <h3>Students Progress</h3>
            <div className="table-responsive">
              <table className="roster-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Milestones</th>
                    <th>Total Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(student => {
                    const subs = dbData.submissions.filter(s => s.studentId === student.id);
                    const completedCount = subs.filter(s => s.status === 'submitted' || s.status === 'graded').length;
                    const gradedSubs = subs.filter(s => s.status === 'graded');
                    const totalMarks = gradedSubs.reduce((sum, s) => sum + (s.marks || 0), 0);
                    
                    const hasPending = subs.some(s => s.status === 'submitted');
                    const isFullyCompleted = completedCount === milestones.length && !hasPending;
                    
                    let statusLabel = 'In Progress';
                    let statusClass = 'status-in-progress';
                    if (hasPending) {
                      statusLabel = 'Needs Grading';
                      statusClass = 'status-needs-grading';
                    } else if (isFullyCompleted) {
                      statusLabel = 'Completed';
                      statusClass = 'status-completed';
                    } else if (completedCount === 0) {
                      statusLabel = 'Not Started';
                      statusClass = 'status-not-started-text';
                    }

                    const isSelected = student.id === selectedStudentId;

                    return (
                      <tr 
                        key={student.id} 
                        onClick={() => handleSelectStudent(student.id)}
                        className={`roster-row ${isSelected ? 'selected' : ''}`}
                      >
                        <td className="student-name-cell">
                          <strong>{student.name}</strong>
                        </td>
                        <td>
                          <div className="table-progress-cell">
                            <span className="progress-fraction">{completedCount} / {milestones.length}</span>
                            <div className="mini-progress-bar">
                              <div 
                                className="mini-progress-fill" 
                                style={{ width: `${(completedCount / milestones.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="roster-marks">
                            <strong>{totalMarks}</strong> / 100
                          </span>
                        </td>
                        <td>
                          <span className={`status-indicator-badge ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Student Progression Details & Grading Form */}
        <div className="grid-right-col">
          <div className="card inspection-panel-card">
            {selectedStudent ? (
              <div className="student-inspection-view">
                <div className="panel-header">
                  <span className="panel-label">Student Profile</span>
                  <h3>{selectedStudent.name}</h3>
                  <p className="student-meta">Assigned class pipeline: Computational Thinking</p>
                </div>

                {/* Milestone mini-tabs */}
                <div className="milestone-tabs">
                  {milestones.map((m, idx) => {
                    const sub = selectedStudentSubs.find(s => s.milestoneId === m.id);
                    const status = sub ? sub.status : 'not_started';
                    const isActive = m.id === selectedMilestoneId;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`m-tab-btn ${isActive ? 'active' : ''} tab-status-${status}`}
                        onClick={() => handleSelectMilestone(m.id)}
                      >
                        M{idx + 1}
                        <span className="dot"></span>
                      </button>
                    );
                  })}
                </div>

                <div className="inspected-milestone-box">
                  <div className="milestone-header-row">
                    <h4>Milestone {milestones.findIndex(m => m.id === selectedMilestoneId) + 1}: {selectedMilestone.title}</h4>
                    <span className="max-marks-badge">Max Marks: {selectedMilestone.maxMarks}</span>
                  </div>

                  <div className="inspect-instructions">
                    <p><strong>Instructions:</strong> {selectedMilestone.instructions}</p>
                  </div>

                  <div className="grading-action-area">
                    {/* 1. NOT STARTED */}
                    {!activeSubmission && (
                      <div className="no-submission-alert">
                        <span className="alert-icon">⚪</span>
                        <p>This student has not submitted a response for this milestone yet.</p>
                      </div>
                    )}

                    {/* 2. SUBMITTED OR GRADED */}
                    {activeSubmission && (
                      <div className="submission-eval-container">
                        <div className="student-response-viewer">
                          <h5>Student Response:</h5>
                          <div className="text-viewer-box">
                            {activeSubmission.response}
                          </div>
                        </div>

                        {/* Grading Form / Grade Card */}
                        <div className="evaluation-card-container">
                          <h5>Milestone Evaluation</h5>
                          
                          {saveSuccess && (
                            <div className="alert alert-success animate-fade-in">
                              <span>✓</span> {saveSuccess}
                            </div>
                          )}

                          {errorMsg && (
                            <div className="alert alert-danger animate-fade-in">
                              <span>⚠</span> {errorMsg}
                            </div>
                          )}

                          {readOnly ? (
                            // Read-only state for Principal
                            <div className="read-only-evaluation-results">
                              {activeSubmission.status === 'graded' ? (
                                <div className="grade-result-card">
                                  <div className="score-block">
                                    <span className="score-num">{activeSubmission.marks}</span>
                                    <span className="score-lbl">/ {selectedMilestone.maxMarks} Marks</span>
                                  </div>
                                  <div className="feedback-block">
                                    <h6>Teacher Feedback:</h6>
                                    <p className="feedback-content">"{activeSubmission.feedback || 'No comments provided.'}"</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="no-grade-alert">
                                  <span className="alert-icon">🕒</span>
                                  <p>Submitted response. Not graded by class teacher yet.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Edit/Add Grades form for Teacher
                            <form onSubmit={handleGradeSubmit} className="grading-form">
                              <div className="form-row">
                                <div className="input-group input-marks-group">
                                  <label htmlFor="eval-marks">Award Marks (Max {selectedMilestone.maxMarks})</label>
                                  <input
                                    id="eval-marks"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max={selectedMilestone.maxMarks}
                                    value={inputMarks}
                                    onChange={(e) => setInputMarks(e.target.value)}
                                    placeholder="Enter score"
                                    required
                                  />
                                </div>
                                
                                <div className="rubric-hint-box">
                                  <h6>CBSE CT Evaluation Rubric:</h6>
                                  <ul>
                                    <li><strong>Full Marks:</strong> Complete, correct, clear logic.</li>
                                    <li><strong>Partial Marks:</strong> Attempted, minor place-value errors.</li>
                                    <li><strong>Low Marks:</strong> Conceptual errors or incomplete.</li>
                                  </ul>
                                </div>
                              </div>

                              <div className="input-group">
                                <label htmlFor="eval-feedback">Feedback / Comments</label>
                                <textarea
                                  id="eval-feedback"
                                  rows="3"
                                  value={inputFeedback}
                                  onChange={(e) => setInputFeedback(e.target.value)}
                                  placeholder="Provide actionable feedback for student improvement..."
                                ></textarea>
                              </div>

                              <button type="submit" className="btn btn-primary save-grade-btn">
                                {activeSubmission.status === 'graded' ? 'Update Marks' : 'Post Evaluation Grade'}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-panel-view">
                <div className="empty-state-visual">📋</div>
                <h4>Select a student from the roster</h4>
                <p>Click on any student row in the class directory to view their milestone progression, read submissions, and record marks.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .teacher-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 3rem;
        }

        .dashboard-sub-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .back-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .dashboard-title-area h2 {
          font-size: 1.75rem;
        }

        .dashboard-title-area .subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 900px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          text-align: left;
        }

        .stat-value {
          font-family: var(--font-heading);
          font-size: 1.85rem;
          font-weight: 700;
          line-height: 1.1;
        }

        .stat-denominator {
          font-size: 1rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .progress-bar-container {
          width: 100%;
          height: 5px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-full);
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--role-color);
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        /* Dashboard Grid Layout */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 1.5rem;
        }

        @media (max-width: 950px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .roster-card {
          text-align: left;
          padding: 1.25rem;
        }

        .roster-card h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }

        .roster-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .roster-table th {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          padding: 0.75rem 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .roster-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .roster-row {
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .roster-row:hover {
          background-color: var(--bg-tertiary);
        }

        .roster-row.selected {
          background-color: var(--role-color-light);
        }

        .student-name-cell strong {
          color: var(--text-primary);
        }

        .table-progress-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 100px;
        }

        .progress-fraction {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .mini-progress-bar {
          height: 4px;
          background-color: var(--border-color);
          border-radius: var(--radius-full);
          width: 100%;
          overflow: hidden;
        }

        .mini-progress-fill {
          height: 100%;
          background-color: var(--role-color);
          border-radius: var(--radius-full);
        }

        .roster-marks {
          color: var(--text-secondary);
        }

        .roster-marks strong {
          color: var(--text-primary);
        }

        /* Status colors */
        .status-indicator-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .status-needs-grading {
          background-color: var(--status-submitted-bg);
          color: var(--status-submitted);
          border: 1px solid var(--status-submitted-border);
        }

        .status-completed {
          background-color: var(--status-graded-bg);
          color: var(--status-graded);
          border: 1px solid var(--status-graded-border);
        }

        .status-in-progress {
          background-color: rgba(99, 102, 241, 0.08);
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.25);
        }

        .status-not-started-text {
          background-color: var(--bg-tertiary);
          color: var(--text-tertiary);
          border: 1px solid var(--border-color);
        }

        /* Right column inspection details */
        .inspection-panel-card {
          text-align: left;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .panel-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .panel-header h3 {
          font-size: 1.5rem;
          margin-top: 0.25rem;
        }

        .student-meta {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Milestone navigation mini-tabs */
        .milestone-tabs {
          display: flex;
          gap: 0.5rem;
          background-color: var(--bg-tertiary);
          padding: 0.35rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 1.25rem;
        }

        .m-tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 0.5rem;
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          transition: all var(--transition-fast);
        }

        .m-tab-btn:hover {
          color: var(--text-primary);
        }

        .m-tab-btn.active {
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
          color: var(--role-color);
        }

        .m-tab-btn .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-tertiary);
        }

        .m-tab-btn.tab-status-submitted .dot {
          background-color: var(--status-submitted);
        }

        .m-tab-btn.tab-status-graded .dot {
          background-color: var(--status-graded);
        }

        .m-tab-btn.tab-status-not_started .dot {
          background-color: var(--text-tertiary);
        }

        /* Inspected milestone area */
        .inspected-milestone-box {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          background-color: var(--bg-primary);
        }

        .milestone-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .milestone-header-row h4 {
          font-size: 1.05rem;
          line-height: 1.3;
        }

        .inspect-instructions {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .no-submission-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--bg-tertiary);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .student-response-viewer {
          margin-bottom: 1.5rem;
        }

        .student-response-viewer h5 {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
        }

        .text-viewer-box {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          font-size: 0.95rem;
          line-height: 1.6;
          white-space: pre-wrap;
          color: var(--text-primary);
        }

        /* Evaluation Block & Grading Form */
        .evaluation-card-container {
          border-top: 1px dashed var(--border-color);
          padding-top: 1.25rem;
        }

        .evaluation-card-container h5 {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          margin-bottom: 1rem;
          letter-spacing: 0.02em;
        }

        .grading-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 1rem;
        }

        @media (max-width: 500px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .input-marks-group input {
          font-size: 1.15rem;
          font-weight: 700;
          text-align: center;
          padding: 0.6rem;
        }

        .rubric-hint-box {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .rubric-hint-box h6 {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .rubric-hint-box ul {
          list-style: none;
          padding-left: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .save-grade-btn {
          align-self: flex-start;
          padding: 0.65rem 1.5rem;
        }

        .alert-danger {
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
        }

        .no-grade-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.15);
          color: var(--status-submitted);
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }

        /* Empty states */
        .empty-state-visual {
          font-size: 3rem;
          margin-bottom: 0.75rem;
          opacity: 0.5;
        }

        .empty-panel-view h4 {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
