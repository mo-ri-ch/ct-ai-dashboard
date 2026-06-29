import React, { useState } from 'react';

export default function StudentDashboard({ currentUser, dbData, onAddSubmission }) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(dbData.project.milestones[0].id);
  const [responseText, setResponseText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const studentSubmissions = dbData.submissions.filter(s => s.studentId === currentUser.id);
  const milestones = dbData.project.milestones;

  // Calculate totals
  const totalMaxMarks = milestones.reduce((sum, m) => sum + m.maxMarks, 0);
  
  // Completed count
  const completedMilestones = studentSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  
  // Graded count and marks
  const gradedSubmissions = studentSubmissions.filter(s => s.status === 'graded');
  const totalEarnedMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);

  // Selected Milestone details
  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);
  const activeSubmission = studentSubmissions.find(s => s.milestoneId === selectedMilestoneId);

  // Status computation for rendering list
  const getMilestoneStatus = (milestoneId) => {
    const sub = studentSubmissions.find(s => s.milestoneId === milestoneId);
    return sub ? sub.status : 'not_started';
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    onAddSubmission(currentUser.id, selectedMilestoneId, responseText);
    setResponseText('');
    setFeedbackMsg('Milestone response submitted successfully!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="student-dashboard animate-fade-in">
      <div className="project-intro-card card">
        <div className="project-badge">Class 8 CT & AI Project</div>
        <h2>Project: {dbData.project.title}</h2>
        <p className="subject-line">{dbData.project.subject}</p>
        <div className="driving-question">
          <strong>Driving Question:</strong> "{dbData.project.drivingQuestion}"
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Overview & Milestones Timeline */}
        <div className="grid-left-col">
          {/* Progress Cards */}
          <div className="stats-row">
            <div className="card stat-card card-hover">
              <div className="stat-value">{completedMilestones} / {milestones.length}</div>
              <div className="stat-label">Milestones Completed</div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(completedMilestones / milestones.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="card stat-card card-hover">
              <div className="stat-value">{totalEarnedMarks} <span className="stat-denominator">/ {totalMaxMarks}</span></div>
              <div className="stat-label">Total Marks Earned</div>
              <div className="stat-subtext">{gradedSubmissions.length} of {milestones.length} graded</div>
            </div>
          </div>

          {/* Milestone Navigation List */}
          <div className="card milestone-list-card">
            <h3>Project Milestones</h3>
            <div className="milestones-timeline">
              {milestones.map((m, index) => {
                const status = getMilestoneStatus(m.id);
                const isActive = m.id === selectedMilestoneId;
                const sub = studentSubmissions.find(s => s.milestoneId === m.id);

                return (
                  <div 
                    key={m.id} 
                    className={`timeline-item ${isActive ? 'active' : ''} status-${status}`}
                    onClick={() => {
                      setSelectedMilestoneId(m.id);
                      setResponseText('');
                    }}
                  >
                    <div className="timeline-marker">
                      <span className="step-num">{index + 1}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="milestone-title-row">
                        <h4>{m.title}</h4>
                        <span className={`badge badge-${status.replace('_', '-')}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="milestone-meta-row">
                        <span className="max-marks-text">Max Marks: {m.maxMarks}</span>
                        {status === 'graded' && (
                          <span className="earned-marks-text">Awarded: <strong>{sub.marks}</strong> marks</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Milestone Submission / View Details */}
        <div className="grid-right-col">
          <div className="card details-panel-card">
            {selectedMilestone ? (
              <div className="milestone-details-view">
                <div className="panel-header">
                  <span className="panel-label">Selected Milestone</span>
                  <h3>{selectedMilestone.title}</h3>
                  <div className="max-marks-badge">Max Marks: {selectedMilestone.maxMarks}</div>
                </div>

                <div className="instructions-section">
                  <h5>Instructions</h5>
                  <p>{selectedMilestone.instructions}</p>
                </div>

                <div className="action-section">
                  {feedbackMsg && (
                    <div className="alert alert-success animate-fade-in">
                      <span>✓</span> {feedbackMsg}
                    </div>
                  )}

                  {/* 1. NOT STARTED - Show Text Submission form */}
                  {!activeSubmission && (
                    <form onSubmit={handleFormSubmit} className="submission-form">
                      <div className="input-group">
                        <label htmlFor="response-text">Your Submission Response</label>
                        <textarea
                          id="response-text"
                          rows="6"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type your response instructions here..."
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary submit-btn">
                        Submit Milestone Response
                      </button>
                    </form>
                  )}

                  {/* 2. SUBMITTED - Show read-only details (Waiting for grade) */}
                  {activeSubmission && activeSubmission.status === 'submitted' && (
                    <div className="submission-status-box waiting">
                      <div className="status-banner">
                        <span className="status-icon">🕒</span>
                        <div>
                          <h5>Submitted & Awaiting Grade</h5>
                          <p>Your work has been sent to Mr. Iyer for evaluation.</p>
                        </div>
                      </div>
                      <div className="submitted-response-viewer">
                        <h6>Your Submitted Response:</h6>
                        <p className="response-content">{activeSubmission.response}</p>
                      </div>
                    </div>
                  )}

                  {/* 3. GRADED - Show read-only response, marks, and feedback */}
                  {activeSubmission && activeSubmission.status === 'graded' && (
                    <div className="submission-status-box graded">
                      <div className="status-banner">
                        <span className="status-icon">🎉</span>
                        <div>
                          <h5>Evaluated & Graded</h5>
                          <p>Your grade and teacher feedback have been posted below.</p>
                        </div>
                      </div>

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

                      <div className="submitted-response-viewer">
                        <h6>Your Submitted Response:</h6>
                        <p className="response-content">{activeSubmission.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-panel-view">
                <p>Select a milestone from the left to view details and submit your work.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .student-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 3rem;
        }

        .project-intro-card {
          text-align: left;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border-left: 5px solid var(--role-color);
        }

        .project-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--role-color);
          background-color: var(--role-color-light);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .project-intro-card h2 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .subject-line {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .driving-question {
          background-color: var(--bg-secondary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .grid-left-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-card {
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stat-value {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .stat-denominator {
          font-size: 1.1rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .stat-subtext {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 0.25rem;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-full);
          margin-top: 0.75rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--role-color);
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .milestone-list-card {
          text-align: left;
        }

        .milestone-list-card h3 {
          margin-bottom: 1.25rem;
          font-size: 1.2rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .milestones-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .timeline-item:hover {
          border-color: var(--role-color);
          background-color: var(--bg-tertiary);
        }

        .timeline-item.active {
          border-color: var(--role-color);
          box-shadow: 0 0 0 3px var(--role-color-light);
          background-color: var(--bg-secondary);
        }

        .timeline-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          flex-shrink: 0;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .timeline-item.active .timeline-marker {
          background-color: var(--role-color);
          border-color: var(--role-color);
          color: #ffffff;
        }

        /* Timeline status based markers */
        .timeline-item.status-graded .timeline-marker {
          border-color: var(--status-graded);
          color: var(--status-graded);
          background-color: var(--status-graded-bg);
        }
        .timeline-item.status-submitted .timeline-marker {
          border-color: var(--status-submitted);
          color: var(--status-submitted);
          background-color: var(--status-submitted-bg);
        }

        .timeline-content {
          flex: 1;
        }

        .milestone-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .milestone-title-row h4 {
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .milestone-meta-row {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .earned-marks-text {
          color: var(--status-graded);
        }

        /* Right column panel */
        .details-panel-card {
          text-align: left;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
          position: relative;
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
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .max-marks-badge {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--bg-tertiary);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .instructions-section {
          margin-bottom: 1.5rem;
        }

        .instructions-section h5 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .instructions-section p {
          color: var(--text-primary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .submission-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .submission-form label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
          display: block;
        }

        .submit-btn {
          align-self: flex-start;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .alert-success {
          background-color: var(--status-graded-bg);
          border: 1px solid var(--status-graded-border);
          color: var(--status-graded);
        }

        /* Submission status view boxes */
        .submission-status-box {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .submission-status-box.waiting .status-banner {
          background-color: var(--status-submitted-bg);
          color: var(--status-submitted);
        }

        .submission-status-box.graded .status-banner {
          background-color: var(--status-graded-bg);
          color: var(--status-graded);
        }

        .status-banner h5 {
          font-size: 0.95rem;
          font-weight: 700;
          color: inherit;
        }

        .status-banner p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .status-icon {
          font-size: 1.5rem;
        }

        .submitted-response-viewer {
          padding: 1.25rem;
          background-color: var(--bg-primary);
        }

        .submitted-response-viewer h6 {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
        }

        .response-content {
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        /* Graded results score layout */
        .grade-result-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        @media (max-width: 500px) {
          .grade-result-card {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .score-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--status-graded-bg);
          border: 1px solid var(--status-graded-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          min-width: 100px;
          flex-shrink: 0;
        }

        .score-num {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--status-graded);
          line-height: 1;
        }

        .score-lbl {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .feedback-block {
          flex: 1;
          text-align: left;
        }

        .feedback-block h6 {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .feedback-content {
          font-size: 0.95rem;
          font-style: italic;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .empty-panel-view {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          padding: 3rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
