import React, { useState } from 'react';
import TeacherDashboard from './TeacherDashboard';

export default function PrincipalDashboard({ dbData }) {
  const [drilldownTeacherId, setDrilldownTeacherId] = useState(null);

  const teachers = dbData.users.filter(u => u.role === 'teacher');
  const students = dbData.users.filter(u => u.role === 'student');
  const milestones = dbData.project.milestones;

  // Compute school-wide totals
  const totalStudents = students.length;
  
  // Overall Average Score across all students
  const studentTotalScores = students.map(student => {
    const studentSubs = dbData.submissions.filter(s => s.studentId === student.id && s.status === 'graded');
    return studentSubs.reduce((sum, s) => sum + (s.marks || 0), 0);
  });

  const schoolAverage = studentTotalScores.length > 0
    ? (studentTotalScores.reduce((sum, score) => sum + score, 0) / studentTotalScores.length).toFixed(1)
    : '0.0';

  // Overall Completion Rate %
  const totalSubmissionsPossible = totalStudents * milestones.length;
  const completedSubmissions = dbData.submissions.filter(
    s => s.status === 'submitted' || s.status === 'graded'
  ).length;
  
  const overallCompletionRate = totalSubmissionsPossible > 0
    ? Math.round((completedSubmissions / totalSubmissionsPossible) * 100)
    : 0;

  // Prepare rollup statistics for each teacher
  const teacherRollups = teachers.map(teacher => {
    const teacherStudents = students.filter(s => s.teacherId === teacher.id);
    const teacherStudentIds = teacherStudents.map(s => s.id);
    
    // Submissions for this teacher's class
    const teacherSubs = dbData.submissions.filter(s => teacherStudentIds.includes(s.studentId));
    
    // Class completion rate
    const classTotalSubmissionsPossible = teacherStudents.length * milestones.length;
    const classCompletedSubmissions = teacherSubs.filter(
      s => s.status === 'submitted' || s.status === 'graded'
    ).length;
    const classCompletionRate = classTotalSubmissionsPossible > 0
      ? Math.round((classCompletedSubmissions / classTotalSubmissionsPossible) * 100)
      : 0;

    // Class average
    const classScores = teacherStudents.map(student => {
      const subs = teacherSubs.filter(s => s.studentId === student.id && s.status === 'graded');
      return subs.reduce((sum, s) => sum + (s.marks || 0), 0);
    });
    const classAverage = classScores.length > 0
      ? (classScores.reduce((sum, score) => sum + score, 0) / classScores.length).toFixed(1)
      : '0.0';

    return {
      id: teacher.id,
      name: teacher.name,
      username: teacher.username,
      classSize: teacherStudents.length,
      averageScore: classAverage,
      completionRate: classCompletionRate
    };
  });

  // Render drilldown Teacher Dashboard if set
  if (drilldownTeacherId) {
    const selectedTeacher = teachers.find(t => t.id === drilldownTeacherId);
    return (
      <div className="principal-drilldown-wrapper">
        {/* Breadcrumb Header */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => setDrilldownTeacherId(null)}>
            School Overview
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">{selectedTeacher.name}'s Class</span>
        </div>
        
        <TeacherDashboard 
          teacher={selectedTeacher}
          dbData={dbData}
          onSaveGrade={null}
          readOnly={true}
          onBackClick={() => setDrilldownTeacherId(null)}
        />
      </div>
    );
  }

  return (
    <div className="principal-dashboard animate-fade-in">
      <div className="dashboard-title-area">
        <h2>School Overview</h2>
        <p className="subtitle">Mrs. Rao — School Administrative Performance Indicators</p>
      </div>

      {/* School-wide Metrics Row */}
      <div className="stats-row">
        <div className="card stat-card card-hover">
          <div className="stat-value">{teachers.length}</div>
          <div className="stat-label">Total Teaching Staff</div>
        </div>
        <div className="card stat-card card-hover">
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Enrolled Students</div>
        </div>
        <div className="card stat-card card-hover">
          <div className="stat-value">{schoolAverage} <span className="stat-denominator">/ 100</span></div>
          <div className="stat-label">School-Wide Average</div>
        </div>
        <div className="card stat-card card-hover">
          <div className="stat-value">{overallCompletionRate}%</div>
          <div className="stat-label">Overall Completion Progress</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${overallCompletionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Teacher Rollup Card */}
      <div className="card rollup-card">
        <h3>Classroom Performance Summary</h3>
        <p className="section-description">
          Rollup metrics by teaching class. Click any row to drill down into class student rosters and read student submissions.
        </p>

        <div className="table-responsive">
          <table className="rollup-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Username</th>
                <th>Class Size</th>
                <th>Class Average</th>
                <th>Completion Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teacherRollups.map(rollup => (
                <tr 
                  key={rollup.id} 
                  onClick={() => setDrilldownTeacherId(rollup.id)}
                  className="rollup-row"
                >
                  <td>
                    <strong>{rollup.name}</strong>
                  </td>
                  <td><code>{rollup.username}</code></td>
                  <td>{rollup.classSize} students</td>
                  <td>
                    <span className="average-badge">
                      {rollup.averageScore}
                    </span>
                  </td>
                  <td>
                    <div className="table-progress-cell">
                      <span className="progress-text">{rollup.completionRate}%</span>
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-fill" 
                          style={{ width: `${rollup.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-secondary drilldown-btn">
                      Inspect Class →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .principal-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 3rem;
          text-align: left;
        }

        .principal-drilldown-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 3rem;
          text-align: left;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }

        .breadcrumb-link {
          color: var(--role-color);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .breadcrumb-link:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }

        .breadcrumb-separator {
          color: var(--border-color);
        }

        .breadcrumb-active {
          color: var(--text-secondary);
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

        /* Rollup Card & Table styles */
        .rollup-card {
          padding: 1.5rem;
        }

        .rollup-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }

        .section-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }

        .rollup-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .rollup-table th {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          padding: 0.75rem 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .rollup-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.95rem;
          vertical-align: middle;
        }

        .rollup-row {
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .rollup-row:hover {
          background-color: var(--bg-tertiary);
        }

        .average-badge {
          display: inline-block;
          font-family: var(--font-heading);
          font-weight: 700;
          background-color: var(--role-color-light);
          color: var(--role-color);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .table-progress-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 120px;
          max-width: 200px;
        }

        .progress-text {
          font-size: 0.8rem;
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

        .drilldown-btn {
          padding: 0.35rem 0.85rem;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
