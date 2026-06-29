import React, { useState } from 'react';

export default function StudentDashboard({ currentUser, dbData, onAddSubmission, onAwardBadge }) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(dbData.project.milestones[0].id);
  const [responseText, setResponseText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Top nav: 'project' | 'academy'
  const [activeTab, setActiveTab] = useState('project');

  // Academy subtab: 'learn' | 'practice' | 'test'
  const [academySubTab, setAcademySubTab] = useState('learn');

  // Milestone panel tab
  const [activePanelTab, setActivePanelTab] = useState('submit'); // 'submit' | 'tutor'

  // AI Tutor Chat states
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'tutor',
      text: `Hello ${currentUser.name}! I am your Computational Thinking AI coach. Ask me anything about binary, custom number bases, division algorithms, or project rubrics to help you complete your project!`,
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Interactive base sandbox states
  const [sandboxBase, setSandboxBase] = useState(6);
  const [sandboxDecimal, setSandboxDecimal] = useState(20);

  // Binary Academy interactive states
  const [learnBits, setLearnBits] = useState([0, 0, 0, 0]); // indices 0 to 3 -> representing 8, 4, 2, 1
  const [practiceBits, setPracticeBits] = useState([0, 0, 0, 0]);
  const [testBits, setTestBits] = useState([0, 0, 0, 0]);
  const [testError, setTestError] = useState('');

  const studentSubmissions = dbData.submissions.filter(s => s.studentId === currentUser.id);
  const milestones = dbData.project.milestones;

  // Calculate totals
  const totalMaxMarks = milestones.reduce((sum, m) => sum + m.maxMarks, 0);
  const completedMilestones = studentSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const gradedSubmissions = studentSubmissions.filter(s => s.status === 'graded');
  const totalEarnedMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);

  // Selected Milestone details
  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);
  const activeSubmission = studentSubmissions.find(s => s.milestoneId === selectedMilestoneId);

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

  // Convert decimal to target base representation details
  const getBaseRepresentation = (dec, base) => {
    const dVal = parseInt(dec, 10);
    const bVal = parseInt(base, 10);
    if (isNaN(dVal) || isNaN(bVal) || dVal < 0 || bVal < 2 || bVal > 16) {
      return { str: '0', columns: [] };
    }

    const str = dVal.toString(bVal).toUpperCase();
    const cols = [];
    let remainder = dVal;
    
    for (let power = 3; power >= 0; power--) {
      const placeValue = Math.pow(bVal, power);
      const digitValue = Math.floor(remainder / placeValue);
      remainder = remainder % placeValue;
      
      cols.push({
        power,
        placeValue,
        digitValue,
        digitChar: digitValue.toString(16).toUpperCase()
      });
    }

    return { str, columns: cols };
  };

  const sandboxResult = getBaseRepresentation(sandboxDecimal, sandboxBase);

  // Simulated AI Chat Response logic
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const promptText = chatInput.toLowerCase();
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let tutorReply = '';
      if (promptText.includes('binary') || promptText.includes('base 2')) {
        tutorReply = "Binary is base 2. It uses only two digit symbols, 0 and 1. Each column place value represents a power of 2 (1, 2, 4, 8, 16, etc.). Try setting the interactive sandbox to base 2 and typing a decimal value to see how the groupings change!";
      } else if (promptText.includes('base') || promptText.includes('system') || promptText.includes('digit')) {
        tutorReply = "A number base represents how many unique digits you have (including 0). For example, base 5 uses digits 0, 1, 2, 3, and 4. When you reach 5, it wraps into the next place value column (5^1, worth 5 in decimal). Use the base playground above to experiment with wrapping points!";
      } else if (promptText.includes('algorithm') || promptText.includes('convert') || promptText.includes('math')) {
        tutorReply = "To convert a decimal number to a custom base, divide the decimal number by the target base repeatedly. Write down the remainders in reverse order. For example, to convert 13 to base 5: 13 / 5 = 2 R 3. Then 2 / 5 = 0 R 2. The remainders in reverse give you 23 in base 5!";
      } else if (promptText.includes('rubric') || promptText.includes('mark') || promptText.includes('grade')) {
        tutorReply = "To score full marks, teachers look for three things: completeness, logical correctness (correct digit symbols, valid math conversion), and a clear reasoning explanation. Keep your responses detailed!";
      } else {
        tutorReply = `Interesting question! As your Computational Thinking coach, I encourage you to check how numbers group up. In base ${sandboxBase}, groups of ${sandboxBase} wrap to the next column. Try playing with the base sandbox to see this visually!`;
      }

      setChatMessages(prev => [...prev, {
        sender: 'tutor',
        text: tutorReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  // Binary Academy Calculations
  const toggleLearnBit = (index) => {
    setLearnBits(prev => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  };

  const togglePracticeBit = (index) => {
    setPracticeBits(prev => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  };

  const toggleTestBit = (index) => {
    setTestBits(prev => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  };

  const getBitsDecimalValue = (bits) => {
    // bits array is [B3, B2, B1, B0] representing values [8, 4, 2, 1]
    return (bits[0] * 8) + (bits[1] * 4) + (bits[2] * 2) + (bits[3] * 1);
  };

  const learnVal = getBitsDecimalValue(learnBits);
  const practiceVal = getBitsDecimalValue(practiceBits);
  const testVal = getBitsDecimalValue(testBits);

  const hasExpertBadge = dbData.badges?.some(
    b => b.studentId === currentUser.id && b.badgeName === 'binary_expert'
  );

  const handleTestSubmit = (e) => {
    e.preventDefault();
    setTestError('');
    
    // Target is 11 (binary 1011)
    if (testVal === 11) {
      onAwardBadge(currentUser.id, 'binary_expert');
    } else {
      setTestError('Incorrect code. Hint: 11 is 8 + 2 + 1. Try to set only the correct lightbulbs!');
    }
  };

  return (
    <div className="student-dashboard animate-fade-in">
      
      {/* Academy Top Tab Bar */}
      <div className="academy-main-nav-bar">
        <button 
          className={`main-nav-btn ${activeTab === 'project' ? 'active' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          📋 Project Milestones
        </button>
        <button 
          className={`main-nav-btn ${activeTab === 'academy' ? 'active' : ''}`}
          onClick={() => setActiveTab('academy')}
        >
          🚀 Binary Academy
        </button>
      </div>

      {activeTab === 'project' ? (
        // Standard Milestones Layout
        <>
          <div className="header-dual-layout">
            <div className="project-intro-card card">
              <div className="project-badge">Class 8 CT & AI Project</div>
              <h2>Project: {dbData.project.title}</h2>
              <p className="subject-line">{dbData.project.subject}</p>
              <div className="driving-question">
                <strong>Driving Question:</strong> "{dbData.project.drivingQuestion}"
              </div>
            </div>

            {/* Live Base Simulator Playground */}
            <div className="card sandbox-card">
              <div className="sandbox-header">
                <h4>Numbered Base Simulator Sandbox</h4>
                <span className="sandbox-badge">Simulation tool</span>
              </div>
              <div className="sandbox-inputs">
                <div className="sandbox-control">
                  <label>Select Base: <strong>{sandboxBase}</strong></label>
                  <input 
                    type="range" 
                    min="2" 
                    max="16" 
                    value={sandboxBase} 
                    onChange={(e) => setSandboxBase(parseInt(e.target.value))} 
                  />
                </div>
                <div className="sandbox-control">
                  <label>Decimal Value:</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="256" 
                    value={sandboxDecimal} 
                    onChange={(e) => setSandboxDecimal(Math.max(0, Math.min(256, parseInt(e.target.value) || 0)))} 
                  />
                </div>
              </div>

              <div className="sandbox-output">
                <div className="sandbox-result-text">
                  Decimal <strong>{sandboxDecimal}</strong> in Base <strong>{sandboxBase}</strong> is: 
                  <span className="converted-value"> {sandboxResult.str}</span>
                </div>

                <div className="place-value-container">
                  {sandboxResult.columns.map((col, index) => {
                    const isActive = sandboxDecimal >= col.placeValue || col.power === 0;
                    return (
                      <div key={index} className={`place-value-col ${isActive ? 'active' : 'inactive'}`}>
                        <div className="col-header">
                          <span className="power-lbl">{sandboxBase}<sup>{col.power}</sup></span>
                          <span className="value-lbl">({col.placeValue})</span>
                        </div>
                        <div className="col-bucket">
                          <div className="beads-grid">
                            {Array.from({ length: col.digitValue }).map((_, i) => (
                              <span key={i} className="bead"></span>
                            ))}
                          </div>
                        </div>
                        <div className="col-footer">
                          <span className="digit-char">{col.digitChar}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-left-col">
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

            <div className="grid-right-col">
              <div className="card details-panel-card">
                {selectedMilestone ? (
                  <div className="milestone-details-view">
                    <div className="panel-tab-bar">
                      <button 
                        className={`panel-tab-btn ${activePanelTab === 'submit' ? 'active' : ''}`}
                        onClick={() => setActivePanelTab('submit')}
                      >
                        📝 Submit Response
                      </button>
                      <button 
                        className={`panel-tab-btn ${activePanelTab === 'tutor' ? 'active' : ''}`}
                        onClick={() => setActivePanelTab('tutor')}
                      >
                        🤖 AI Tutor Coach
                      </button>
                    </div>

                    {activePanelTab === 'submit' ? (
                      <div className="tab-pane-content animate-fade-in">
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

                          {!activeSubmission && (
                            <form onSubmit={handleFormSubmit} className="submission-form">
                              <div className="input-group">
                                <label htmlFor="response-text">Your Submission Response</label>
                                <textarea
                                  id="response-text"
                                  rows="6"
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder="Type your response logic..."
                                  required
                                ></textarea>
                              </div>
                              <button type="submit" className="btn btn-primary submit-btn">
                                Submit Milestone Response
                              </button>
                            </form>
                          )}

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
                      <div className="tab-pane-content tutor-chat-pane animate-fade-in">
                        <div className="chat-header">
                          <h5>🤖 CT & AI Coach</h5>
                          <span className="chat-status">online</span>
                        </div>

                        <div className="chat-messages-container">
                          {chatMessages.map((msg, index) => (
                            <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
                              <div className="chat-bubble">
                                <p>{msg.text}</p>
                                <span className="chat-time">{msg.time}</span>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="chat-bubble-wrapper tutor">
                              <div className="chat-bubble typing-bubble">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                              </div>
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-bar">
                          <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isTyping}
                          />
                          <button type="submit" className="btn btn-primary send-chat-btn" disabled={isTyping || !chatInput.trim()}>
                            Send
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-panel-view">
                    <p>Select a milestone to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Interactive Learn-Practice-Test Binary Academy
        <div className="card academy-layout-card animate-fade-in">
          <div className="academy-header">
            <div className="title-block">
              <span className="academy-icon">🚀</span>
              <div>
                <h3>Binary Code Academy</h3>
                <p className="subtitle">Learn how computers communicate with 0s and 1s</p>
              </div>
            </div>
            {hasExpertBadge && (
              <span className="earned-badge-indicator">🎖️ Binary Expert Certified</span>
            )}
          </div>

          {/* Sub Navigation */}
          <div className="academy-tabs-bar">
            <button 
              className={`academy-tab-btn ${academySubTab === 'learn' ? 'active' : ''}`}
              onClick={() => setAcademySubTab('learn')}
            >
              💡 1. Learn Binary
            </button>
            <button 
              className={`academy-tab-btn ${academySubTab === 'practice' ? 'active' : ''}`}
              onClick={() => setAcademySubTab('practice')}
            >
              🛠️ 2. Practice Sandbox
            </button>
            <button 
              className={`academy-tab-btn ${academySubTab === 'test' ? 'active' : ''}`}
              onClick={() => setAcademySubTab('test')}
            >
              📝 3. Test Challenge
            </button>
          </div>

          <div className="academy-content-pane">
            {/* Stage 1: LEARN PAGE */}
            {academySubTab === 'learn' && (
              <div className="learn-pane animate-fade-in">
                <h4>Understanding Place Values (Powers of 2)</h4>
                <p className="explain-text">
                  Just like our standard counting system has places for **Tens, Hundreds, and Thousands**, the binary system uses powers of 2.
                  Each lightbulb represents a column value: **8s, 4s, 2s, and 1s**. 
                </p>

                <div className="interactive-bulb-panel">
                  {learnBits.map((bit, idx) => {
                    const placeVal = Math.pow(2, 3 - idx);
                    return (
                      <div key={idx} className="bulb-column">
                        <div 
                          className={`visual-bulb ${bit === 1 ? 'on' : 'off'}`}
                          onClick={() => toggleLearnBit(idx)}
                        >
                          💡
                        </div>
                        <button 
                          onClick={() => toggleLearnBit(idx)}
                          className={`btn switch-toggle-btn ${bit === 1 ? 'btn-primary' : 'btn-secondary'}`}
                        >
                          {bit === 1 ? 'ON (1)' : 'OFF (0)'}
                        </button>
                        <div className="bulb-place-value">
                          <strong>{placeVal}s</strong> Column
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="learn-math-block">
                  <div className="math-visual">
                    {learnBits.map((bit, idx) => {
                      const placeVal = Math.pow(2, 3 - idx);
                      return `(${bit} × ${placeVal})`;
                    }).join(' + ')} = <span className="decimal-score-bubble">{learnVal}</span>
                  </div>
                  <p className="explanation-comment">
                    💡 Clicking the bulbs above toggles them ON or OFF. Notice how turning on the **8s** and **2s** bulbs makes the decimal sum equivalent to **10** (written in binary as `1010`).
                  </p>
                </div>
              </div>
            )}

            {/* Stage 2: PRACTICE SANDBOX PAGE */}
            {academySubTab === 'practice' && (
              <div className="practice-pane animate-fade-in">
                <div className="practice-layout">
                  <div className="practice-sandbox">
                    <h4>Binary Switchboard Sandbox</h4>
                    <p className="instruction-mini">Toggle the switches to compute decimal numbers and complete the practice checklist.</p>
                    
                    <div className="interactive-switch-panel">
                      {practiceBits.map((bit, idx) => {
                        const val = Math.pow(2, 3 - idx);
                        return (
                          <div key={idx} className="switch-col">
                            <span className="col-val">{val}</span>
                            <div 
                              className={`visual-switch-trigger ${bit === 1 ? 'active' : ''}`}
                              onClick={() => togglePracticeBit(idx)}
                            >
                              <span className="switch-knob"></span>
                            </div>
                            <span className="binary-digit-lbl">{bit}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="practice-result-card">
                      <span>Decimal Output:</span>
                      <strong className="result-val">{practiceVal}</strong>
                    </div>
                  </div>

                  <div className="practice-checklist-card">
                    <h4>Practice Missions</h4>
                    <ul className="checklist-list">
                      <li className={practiceVal === 5 ? 'checked' : ''}>
                        <span className="check-box">{practiceVal === 5 ? '✅' : '⬜'}</span>
                        <div className="mission-details">
                          <strong>Represent the number 5</strong>
                          <p>Hint: Turn on 4 and 1 (binary `0101`)</p>
                        </div>
                      </li>
                      <li className={practiceVal === 12 ? 'checked' : ''}>
                        <span className="check-box">{practiceVal === 12 ? '✅' : '⬜'}</span>
                        <div className="mission-details">
                          <strong>Represent the number 12</strong>
                          <p>Hint: Turn on 8 and 4 (binary `1100`)</p>
                        </div>
                      </li>
                      <li className={practiceVal === 15 ? 'checked' : ''}>
                        <span className="check-box">{practiceVal === 15 ? '✅' : '⬜'}</span>
                        <div className="mission-details">
                          <strong>Represent the maximum: 15</strong>
                          <p>Hint: Turn on all bulbs (binary `1111`)</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 3: TEST CHALLENGE PAGE */}
            {academySubTab === 'test' && (
              <div className="test-pane animate-fade-in">
                {hasExpertBadge ? (
                  // Passed screen
                  <div className="congrats-card text-center">
                    <span className="medal-visual">🎖️</span>
                    <h3>Congratulations! You are a Certified Binary Expert</h3>
                    <p className="welcome-text">
                      You correctly solved the binary challenge. A gold badge has been added to your profile card, which is now visible to Mr. Iyer and Mrs. Rao.
                    </p>
                    <div className="badge-details-box">
                      <p><strong>Certificate Awarded to:</strong> {currentUser.name}</p>
                      <p><strong>Pillar Validation:</strong> Algorithmic Logic & Place Value Representation</p>
                    </div>
                  </div>
                ) : (
                  // Active Challenge test screen
                  <form onSubmit={handleTestSubmit} className="test-form">
                    <div className="challenge-question-card">
                      <span className="question-icon">🎯</span>
                      <div>
                        <h4>Your Challenge: Encode Decimal 11</h4>
                        <p>Toggle the lightbulbs below to write the binary equivalent of 11. Once set, click submit to earn your badge.</p>
                      </div>
                    </div>

                    {testError && (
                      <div className="alert alert-danger animate-fade-in">
                        <span>⚠</span> {testError}
                      </div>
                    )}

                    <div className="test-switchboard">
                      {testBits.map((bit, idx) => {
                        const val = Math.pow(2, 3 - idx);
                        return (
                          <div key={idx} className="test-switch-col">
                            <span className="col-val">{val}</span>
                            <div 
                              className={`test-visual-bulb ${bit === 1 ? 'on' : 'off'}`}
                              onClick={() => toggleTestBit(idx)}
                            >
                              💡
                            </div>
                            <button 
                              type="button" 
                              onClick={() => toggleTestBit(idx)}
                              className={`btn test-toggle-btn ${bit === 1 ? 'btn-primary' : 'btn-secondary'}`}
                            >
                              {bit === 1 ? '1' : '0'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="test-submit-row">
                      <div className="active-code-lbl">
                        Current Code: <strong>{testBits.join('')}</strong> (Decimal: {testVal})
                      </div>
                      <button type="submit" className="btn btn-primary submit-test-btn">
                        Submit Test Answer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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

        /* Top Academy Nav Tab Styles */
        .academy-main-nav-bar {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .main-nav-btn {
          border: none;
          background: none;
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-tertiary);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .main-nav-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-tertiary);
        }

        .main-nav-btn.active {
          color: var(--role-color);
          border-bottom: 4px solid var(--role-color);
          background-color: var(--bg-secondary);
        }

        /* Academy Layout Card */
        .academy-layout-card {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .academy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .title-block {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .academy-icon {
          font-size: 2.25rem;
        }

        .earned-badge-indicator {
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          color: #d97706;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          animation: pulse 2s infinite;
        }

        .academy-tabs-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          background-color: var(--bg-tertiary);
          padding: 0.35rem;
          border-radius: var(--radius-md);
        }

        .academy-tab-btn {
          background: none;
          border: none;
          padding: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .academy-tab-btn:hover {
          color: var(--text-primary);
        }

        .academy-tab-btn.active {
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
          color: var(--role-color);
        }

        /* Stage 1: LEARN styles */
        .learn-pane {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .explain-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .interactive-bulb-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          background-color: var(--bg-primary);
          padding: 2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .bulb-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .visual-bulb {
          font-size: 3rem;
          cursor: pointer;
          transition: transform var(--transition-fast), filter var(--transition-fast);
          filter: grayscale(1) opacity(0.4);
        }

        .visual-bulb:hover {
          transform: scale(1.1);
        }

        .visual-bulb.on {
          filter: grayscale(0) opacity(1) drop-shadow(0 0 15px #fde68a);
          transform: scale(1.05);
        }

        .switch-toggle-btn {
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
        }

        .bulb-place-value {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .learn-math-block {
          background-color: var(--bg-tertiary);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          text-align: center;
        }

        .math-visual {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .decimal-score-bubble {
          color: var(--role-color);
          background-color: var(--bg-secondary);
          padding: 0.15rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
        }

        .explanation-comment {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Stage 2: PRACTICE styles */
        .practice-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 800px) {
          .practice-layout {
            grid-template-columns: 1fr;
          }
        }

        .practice-sandbox {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
        }

        .interactive-switch-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1.5rem 0;
        }

        .switch-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .col-val {
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--text-tertiary);
          font-size: 0.85rem;
        }

        /* Toggle switches */
        .visual-switch-trigger {
          width: 32px;
          height: 60px;
          border-radius: var(--radius-full);
          background-color: var(--border-color);
          position: relative;
          cursor: pointer;
          transition: background-color var(--transition-fast);
          border: 2px solid var(--border-focus);
        }

        .visual-switch-trigger.active {
          background-color: var(--role-color);
          border-color: var(--role-color);
        }

        .switch-knob {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #ffffff;
          box-shadow: var(--shadow-sm);
          left: 2px;
          bottom: 2px;
          transition: transform var(--transition-fast);
        }

        .visual-switch-trigger.active .switch-knob {
          transform: translateY(-28px);
        }

        .binary-digit-lbl {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .practice-result-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
        }

        .result-val {
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--role-color);
        }

        .practice-checklist-card {
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-secondary);
        }

        .checklist-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .checklist-list li {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          transition: all var(--transition-fast);
        }

        .checklist-list li.checked {
          border-color: var(--status-graded);
          background-color: var(--status-graded-bg);
        }

        .check-box {
          font-size: 1.25rem;
        }

        .mission-details {
          text-align: left;
        }

        .mission-details p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Stage 3: TEST CHALLENGE styles */
        .challenge-question-card {
          display: flex;
          gap: 1rem;
          align-items: center;
          background-color: var(--role-color-light);
          border: 1px solid rgba(59, 130, 246, 0.25);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          color: var(--role-color);
        }

        .question-icon {
          font-size: 2.25rem;
        }

        .challenge-question-card h4 {
          color: inherit;
        }

        .challenge-question-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .test-switchboard {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          background-color: var(--bg-primary);
          padding: 2.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .test-switch-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .test-visual-bulb {
          font-size: 2.5rem;
          cursor: pointer;
          filter: grayscale(1) opacity(0.3);
          transition: all var(--transition-fast);
        }

        .test-visual-bulb.on {
          filter: grayscale(0) opacity(1) drop-shadow(0 0 10px #fde68a);
        }

        .test-toggle-btn {
          padding: 0.35rem 0.85rem;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .test-submit-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .active-code-lbl {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .active-code-lbl strong {
          font-family: var(--font-heading);
          color: var(--text-primary);
          font-size: 1.15rem;
        }

        /* Congratulations screen */
        .congrats-card {
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border: 2px solid var(--status-graded);
          border-radius: var(--radius-lg);
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-lg);
        }

        .medal-visual {
          font-size: 4rem;
          animation: bounce 1.5s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .badge-details-box {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          text-align: left;
          width: 100%;
          max-width: 400px;
        }

        .badge-details-box p {
          margin-bottom: 0.25rem;
          color: var(--text-secondary);
        }

        .badge-details-box p strong {
          color: var(--text-primary);
        }

        /* Rest of standard dashboard styles */
        .header-dual-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .header-dual-layout {
            grid-template-columns: 1fr;
          }
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

        .sandbox-card {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 4px solid #6366f1;
        }

        .sandbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sandbox-badge {
          font-size: 0.7rem;
          font-weight: 700;
          background-color: rgba(99,102,241,0.08);
          color: #6366f1;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .sandbox-inputs {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1rem;
          background-color: var(--bg-primary);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .sandbox-control {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sandbox-control label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .sandbox-control input[type="range"] {
          cursor: pointer;
        }

        .sandbox-control input[type="number"] {
          padding: 0.4rem 0.75rem;
        }

        .sandbox-output {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sandbox-result-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .converted-value {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: #6366f1;
          margin-left: 0.35rem;
        }

        .place-value-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .place-value-col {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: var(--bg-primary);
          transition: all var(--transition-fast);
        }

        .place-value-col.active {
          border-color: rgba(99,102,241,0.3);
          background-color: var(--bg-secondary);
        }

        .col-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.7rem;
          color: var(--text-tertiary);
          border-bottom: 1px solid var(--border-color);
          width: 100%;
          padding-bottom: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .power-lbl {
          font-weight: 700;
          color: var(--text-secondary);
        }

        .place-value-col.active .power-lbl {
          color: #6366f1;
        }

        .col-bucket {
          height: 50px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .beads-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          justify-content: center;
          max-width: 45px;
        }

        .bead {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #6366f1;
          box-shadow: 0 1px 2px rgba(99,102,241,0.3);
          display: inline-block;
          animation: beadFall 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes beadFall {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .col-footer {
          border-top: 1px solid var(--border-color);
          width: 100%;
          padding-top: 0.25rem;
          margin-top: 0.5rem;
          text-align: center;
        }

        .digit-char {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .place-value-col.active .digit-char {
          color: #6366f1;
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

        .details-panel-card {
          text-align: left;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-tab-bar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background-color: var(--bg-tertiary);
          padding: 0.3rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .panel-tab-btn {
          border: none;
          background: none;
          padding: 0.6rem;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .panel-tab-btn:hover {
          color: var(--text-primary);
        }

        .panel-tab-btn.active {
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
          color: var(--role-color);
        }

        .tab-pane-content {
          display: flex;
          flex-direction: column;
          height: 100%;
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
        }

        .response-content {
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .grade-result-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
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

        .tutor-chat-pane {
          display: flex;
          flex-direction: column;
          height: 480px;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
          margin-bottom: 1rem;
        }

        .chat-status {
          font-size: 0.7rem;
          background-color: #10b981;
          color: #ffffff;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .chat-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .chat-bubble-wrapper {
          display: flex;
          width: 100%;
        }

        .chat-bubble-wrapper.tutor {
          justify-content: flex-start;
        }

        .chat-bubble-wrapper.user {
          justify-content: flex-end;
        }

        .chat-bubble {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          max-width: 80%;
          font-size: 0.875rem;
          line-height: 1.45;
          position: relative;
        }

        .chat-bubble-wrapper.tutor .chat-bubble {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-top-left-radius: 2px;
        }

        .chat-bubble-wrapper.user .chat-bubble {
          background-color: var(--role-color-light);
          color: var(--role-color);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-top-right-radius: 2px;
        }

        .chat-time {
          display: block;
          font-size: 0.65rem;
          color: var(--text-tertiary);
          text-align: right;
          margin-top: 0.35rem;
        }

        .typing-bubble {
          display: flex;
          gap: 4px;
          padding: 0.6rem 1rem;
          align-items: center;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: var(--text-secondary);
          border-radius: 50%;
          display: inline-block;
          animation: chatTyping 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes chatTyping {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .chat-input-bar {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input-bar input {
          flex: 1;
        }

        .send-chat-btn {
          padding: 0.5rem 1.25rem;
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

        /* Binary Academy Dashboard Tab Layout styling */
        .academy-tab-btn {
          font-weight: 700;
        }

        .academy-content-pane {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 2rem;
          min-height: 400px;
        }

        .explain-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        /* Bulb and Toggle Switchboard designs */
        .visual-switch-trigger {
          border-width: 1px;
        }

        .visual-bulb {
          font-size: 3.5rem;
          user-select: none;
        }

        .interactive-switch-panel {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }

        /* Congrats card badge decorations */
        .medal-visual {
          font-size: 4.5rem;
          display: block;
          filter: drop-shadow(0 4px 10px rgba(217, 119, 6, 0.3));
        }

        /* Challenge Form questions */
        .test-switch-col {
          gap: 0.5rem;
        }

        .test-visual-bulb {
          font-size: 3rem;
          user-select: none;
        }

        .test-toggle-btn {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
