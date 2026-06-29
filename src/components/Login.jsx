import React, { useState } from 'react';
import { seedData } from '../seedData';

export default function Login({ onLoginSuccess }) {
  const [activeRole, setActiveRole] = useState('student'); // 'student' | 'teacher' | 'principal'
  const [username, setUsername] = useState('student2');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  // Handle Tab changes and pre-fill credentials for easy demo use
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
    
    // Pre-fill corresponding user credentials based on PRD specifications
    if (role === 'student') {
      setUsername('student2'); // Diya - has submitted milestone 1, other milestones not started
    } else if (role === 'teacher') {
      setUsername('teacher1'); // Mr. Iyer - manages students 1-3
    } else if (role === 'principal') {
      setUsername('principal'); // Mrs. Rao - school administrator
    }
    setPassword('demo123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check credentials against our seeded list of users
    const matchedUser = seedData.users.find(
      (u) => 
        u.role === activeRole && 
        u.username.toLowerCase() === username.trim().toLowerCase() && 
        u.password === password
    );

    if (matchedUser) {
      // Trigger login callback
      onLoginSuccess(matchedUser);
    } else {
      setError('Invalid username or password for the selected role.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-visual-decor"></div>
      <div className="login-card glass">
        <div className="login-header">
          <div className="school-logo">
            <span>CT</span>
            <span className="plus">+</span>
            <span>AI</span>
          </div>
          <h1>CT & AI Project Tracker</h1>
          <p className="subtitle">School Learning & Evaluation Dashboard</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-tabs">
          <button 
            type="button"
            className={`role-tab student-tab ${activeRole === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
          <button 
            type="button"
            className={`role-tab teacher-tab ${activeRole === 'teacher' ? 'active' : ''}`}
            onClick={() => handleRoleChange('teacher')}
          >
            Teacher
          </button>
          <button 
            type="button"
            className={`role-tab principal-tab ${activeRole === 'principal' ? 'active' : ''}`}
            onClick={() => handleRoleChange('principal')}
          >
            Principal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠</span>
              <p>{error}</p>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Sign In as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
          </button>
        </form>

        <div className="login-footer">
          <p className="helper-text">
            💡 Prefilled for CBSE Class 8 Demo Tonight
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1.5rem;
          background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 45%);
          overflow: hidden;
        }

        .login-visual-decor {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--role-color, #6366f1) 0%, rgba(168, 85, 247, 0.5) 100%);
          filter: blur(150px);
          opacity: 0.08;
          top: -10%;
          left: -10%;
          z-index: 0;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          z-index: 1;
          border-radius: var(--radius-lg);
          padding: 2.5rem 2rem;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .school-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--role-color-light, rgba(99, 102, 241, 0.1));
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--role-color, #6366f1);
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .school-logo .plus {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 400;
        }

        .login-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.35rem;
          background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header .subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .role-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background-color: var(--bg-tertiary);
          padding: 0.35rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          border: 1px solid var(--border-color);
        }

        .role-tab {
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.6rem 0.25rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .role-tab:hover {
          color: var(--text-primary);
        }

        .role-tab.active {
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
        }

        .role-tab.student-tab.active {
          color: #3b82f6;
        }

        .role-tab.teacher-tab.active {
          color: #a855f7;
        }

        .role-tab.principal-tab.active {
          color: #10b981;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-error {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .login-error p {
          margin: 0;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          text-align: left;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .login-btn {
          margin-top: 0.5rem;
          width: 100%;
          font-size: 1rem;
          padding: 0.85rem;
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
        }

        .login-footer .helper-text {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
