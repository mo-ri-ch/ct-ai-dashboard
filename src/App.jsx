import React, { useState, useEffect } from 'react';
import { seedData } from './seedData';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import PrincipalDashboard from './components/PrincipalDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbData, setDbData] = useState(null);

  // Initialize DB data from LocalStorage or fallback to seedData
  useEffect(() => {
    const savedData = localStorage.getItem('ct_ai_dashboard_db');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Ensure badges array exists
        if (!parsed.badges) parsed.badges = [];
        setDbData(parsed);
      } catch (e) {
        console.error('Failed to parse saved data from localStorage, resetting...', e);
        initializeData();
      }
    } else {
      initializeData();
    }
  }, []);

  const initializeData = () => {
    const cloneData = JSON.parse(JSON.stringify(seedData));
    cloneData.badges = []; // Initialize empty achievements list
    localStorage.setItem('ct_ai_dashboard_db', JSON.stringify(cloneData));
    setDbData(cloneData);
  };

  // Sync role-specific body class when login status changes
  useEffect(() => {
    document.body.classList.remove('role-student', 'role-teacher', 'role-principal');
    
    if (currentUser) {
      document.body.classList.add(`role-${currentUser.role}`);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // State Mutation: Student adds/updates a milestone submission
  const handleAddSubmission = (studentId, milestoneId, responseText) => {
    setDbData((prevData) => {
      const updatedData = { ...prevData };
      const existingSubIndex = updatedData.submissions.findIndex(
        (s) => s.studentId === studentId && s.milestoneId === milestoneId
      );

      const subObject = {
        studentId,
        milestoneId,
        response: responseText,
        status: 'submitted',
        marks: null,
        feedback: null
      };

      if (existingSubIndex >= 0) {
        updatedData.submissions[existingSubIndex] = subObject;
      } else {
        updatedData.submissions.push(subObject);
      }

      localStorage.setItem('ct_ai_dashboard_db', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // State Mutation: Teacher grades a milestone submission
  const handleSaveGrade = (studentId, milestoneId, marks, feedback) => {
    setDbData((prevData) => {
      const updatedData = { ...prevData };
      const existingSubIndex = updatedData.submissions.findIndex(
        (s) => s.studentId === studentId && s.milestoneId === milestoneId
      );

      if (existingSubIndex >= 0) {
        updatedData.submissions[existingSubIndex] = {
          ...updatedData.submissions[existingSubIndex],
          status: 'graded',
          marks,
          feedback
        };
      } else {
        updatedData.submissions.push({
          studentId,
          milestoneId,
          response: '(No text submission recorded - graded manually by teacher)',
          status: 'graded',
          marks,
          feedback
        });
      }

      localStorage.setItem('ct_ai_dashboard_db', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // State Mutation: Award an Achievement Badge
  const handleAwardBadge = (studentId, badgeName) => {
    setDbData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData.badges) updatedData.badges = [];
      
      const alreadyEarned = updatedData.badges.some(
        (b) => b.studentId === studentId && b.badgeName === badgeName
      );

      if (!alreadyEarned) {
        updatedData.badges.push({
          studentId,
          badgeName,
          awardedAt: new Date().toISOString()
        });
        localStorage.setItem('ct_ai_dashboard_db', JSON.stringify(updatedData));
      }
      return updatedData;
    });
  };

  // State Mutation: Reset demo database
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This will clear any live submissions, grades, and badges.')) {
      initializeData();
      alert('Demo data has been successfully reverted to the initial seeded state.');
    }
  };

  if (!dbData) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
        <p>Loading application database...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-shell animate-fade-in">
      <header className="dashboard-header glass">
        <div className="header-brand">
          <div className="logo-badge">
            <span>CT</span>
            <span className="plus">+</span>
            <span>AI</span>
          </div>
          <span className="divider">/</span>
          <span className="brand-context">Dashboard Demo</span>
        </div>
        
        <div className="header-user-info">
          <span className={`user-badge badge badge-${currentUser.role}`}>
            {currentUser.role}
          </span>
          <span className="user-name">{currentUser.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {currentUser.role === 'student' && (
          <StudentDashboard 
            currentUser={currentUser} 
            dbData={dbData} 
            onAddSubmission={handleAddSubmission}
            onAwardBadge={handleAwardBadge}
          />
        )}
        {currentUser.role === 'teacher' && (
          <TeacherDashboard 
            teacher={currentUser} 
            dbData={dbData} 
            onSaveGrade={handleSaveGrade} 
          />
        )}
        {currentUser.role === 'principal' && (
          <PrincipalDashboard 
            dbData={dbData} 
          />
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© 2026 Computational Thinking & AI Curriculum Tracker (Demo System)</p>
          <button onClick={handleResetData} className="btn btn-secondary reset-db-btn">
            🔄 Reset Demo Data
          </button>
        </div>
      </footer>

      <style>{`
        .app-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--role-color, #6366f1);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dashboard-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-badge {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--role-color, #6366f1);
        }

        .logo-badge .plus {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .header-brand .divider {
          color: var(--border-color);
        }

        .brand-context {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .header-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-badge {
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }

        .badge-student {
          background-color: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.25);
          color: #3b82f6;
        }

        .badge-teacher {
          background-color: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.25);
          color: #a855f7;
        }

        .badge-principal {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .logout-btn {
          padding: 0.4rem 1rem;
          font-size: 0.85rem;
        }

        .dashboard-content {
          flex: 1;
          padding: 2rem;
          width: 100%;
        }

        .dashboard-footer {
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          padding: 1.25rem 2rem;
          font-size: 0.8rem;
          color: var(--text-tertiary);
          text-align: center;
          margin-top: auto;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }

        .reset-db-btn {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}

export default App;
