import React, { useState } from 'react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shiftLetter(letter, key, mode = 'encode') {
  const idx = ALPHABET.indexOf(letter.toUpperCase());
  if (idx === -1) return letter;
  const shift = mode === 'encode' ? key : (26 - (key % 26));
  return ALPHABET[(idx + shift) % 26];
}

function transformWord(word, key, mode = 'encode') {
  return word.toUpperCase().split('').map(ch => ({
    original: ch,
    transformed: ALPHABET.indexOf(ch) >= 0 ? shiftLetter(ch, key, mode) : ch
  }));
}

export default function StudentDashboard({ currentUser, dbData, onAddSubmission, onAwardBadge }) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(dbData.project.milestones[0].id);
  const [responseText, setResponseText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const [activeTab, setActiveTab] = useState('project');
  const [academySubTab, setAcademySubTab] = useState('learn');
  const [activePanelTab, setActivePanelTab] = useState('submit');

  // AI Tutor
  const [chatMessages, setChatMessages] = useState([{
    sender: 'tutor',
    text: `Hello ${currentUser.name}! I am your CT & AI Coach. Ask me anything about Caesar ciphers, encoding, decoding, shift keys, or cracking secret codes to help you complete your project!`,
    time: 'Just now'
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Cipher quick reference (top card on project tab)
  const [cipherRefKey, setCipherRefKey] = useState(3);
  const [cipherRefWord, setCipherRefWord] = useState('HELLO');

  // Cipher Academy — Learn
  const [learnKey, setLearnKey] = useState(3);
  const [learnHighlight, setLearnHighlight] = useState('H');

  // Cipher Academy — Practice
  const [practiceWord, setPracticeWord] = useState('');
  const [practiceKey, setPracticeKey] = useState(3);
  const [practiceMode, setPracticeMode] = useState('encode');

  // Cipher Academy — Test
  const [testKey, setTestKey] = useState(1);

  const studentSubmissions = dbData.submissions.filter(s => s.studentId === currentUser.id);
  const milestones = dbData.project.milestones;

  const totalMaxMarks = milestones.reduce((sum, m) => sum + m.maxMarks, 0);
  const completedMilestones = studentSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const gradedSubmissions = studentSubmissions.filter(s => s.status === 'graded');
  const totalEarnedMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);

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

  // Cipher ref card transforms
  const cipherRefTransformed = transformWord(
    cipherRefWord.replace(/[^A-Za-z]/g, '').slice(0, 10),
    cipherRefKey,
    'encode'
  );

  // Practice transforms
  const practiceTransformed = practiceWord
    ? transformWord(practiceWord.replace(/[^A-Za-z ]/g, '').slice(0, 12), practiceKey, practiceMode)
    : [];

  // Test: decode KHOOR with chosen testKey
  const TEST_ENCODED = 'KHOOR';
  const testDecoded = transformWord(TEST_ENCODED, testKey, 'decode').map(t => t.transformed).join('');
  const testCorrect = testDecoded === 'HELLO';

  const hasExpertBadge = dbData.badges?.some(
    b => b.studentId === currentUser.id && b.badgeName === 'cipher_expert'
  );

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (testCorrect) {
      onAwardBadge(currentUser.id, 'cipher_expert');
    }
  };

  // AI Tutor responses
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
      if (promptText.includes('caesar') || promptText.includes('cipher') || promptText.includes('secret')) {
        tutorReply = "A Caesar cipher shifts every letter by a fixed number of positions. With key 3: A→D, B→E, H→K. It's one of the oldest encryption techniques — Julius Caesar used it for military communications over 2000 years ago!";
      } else if (promptText.includes('encode') || promptText.includes('encrypt')) {
        tutorReply = "To encode a letter: find its position in the alphabet (A=0, B=1, ... Z=25), add your key, then take the result modulo 26. So H(7) with key 3 → 7+3=10 → K. The Cipher Quick Reference card on this tab shows every letter's shift!";
      } else if (promptText.includes('decode') || promptText.includes('decrypt')) {
        tutorReply = "Decoding is the reverse. Instead of adding the key, subtract it (then add 26 if the result goes negative). So K(10) with key 3 → 10−3=7 → H. Switch the Cipher Academy Practice tab to Decode mode to try it!";
      } else if (promptText.includes('crack') || promptText.includes('break') || promptText.includes('brute')) {
        tutorReply = "To crack a cipher without knowing the key, try all 25 possible shift values — this is called brute force. Since there are only 25 non-zero keys in a Caesar cipher, you'll find the answer quickly. The Test Challenge in Cipher Academy lets you do this interactively!";
      } else if (promptText.includes('modulo') || promptText.includes('mod') || promptText.includes('wrap')) {
        tutorReply = "Modulo (%) gives you the remainder after division. We use mod 26 because there are 26 letters. If your shift goes past Z(25), it wraps to A. Example: Z(25) with key 3 → 25+3=28, 28 mod 26 = 2 → C. No letter gets 'lost' — they all wrap around!";
      } else if (promptText.includes('algorithm') || promptText.includes('step')) {
        tutorReply = "A good encode algorithm has 4 steps: (1) Assign numbers A=0…Z=25. (2) For each letter, find its number. (3) Add the key and apply mod 26. (4) Convert the result back to a letter. Make sure you mention what happens at the wrap-around — that's the tricky part teachers look for!";
      } else {
        tutorReply = `Good thinking! Remember, in a Caesar cipher every letter shifts by exactly the same key. With key ${cipherRefKey}, A becomes ${shiftLetter('A', cipherRefKey, 'encode')} and Z becomes ${shiftLetter('Z', cipherRefKey, 'encode')}. Use the Cipher Academy Practice tab to experiment with any word and key!`;
      }

      setChatMessages(prev => [...prev, {
        sender: 'tutor',
        text: tutorReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="student-dashboard animate-fade-in">

      {/* Top nav */}
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
          🔐 Cipher Academy
        </button>
      </div>

      {activeTab === 'project' ? (
        <>
          <div className="header-dual-layout">
            {/* Project intro */}
            <div className="project-intro-card card">
              <div className="project-badge">Class 8 CT &amp; AI Project</div>
              <h2>Project: {dbData.project.title}</h2>
              <p className="subject-line">{dbData.project.subject}</p>
              <div className="driving-question">
                <strong>Driving Question:</strong> &ldquo;{dbData.project.drivingQuestion}&rdquo;
              </div>
            </div>

            {/* Cipher Quick Reference */}
            <div className="card sandbox-card">
              <div className="sandbox-header">
                <h4>Cipher Quick Reference</h4>
                <span className="sandbox-badge">Simulation tool</span>
              </div>
              <div className="sandbox-inputs">
                <div className="sandbox-control">
                  <label>Shift Key: <strong>{cipherRefKey}</strong></label>
                  <input
                    type="range" min="1" max="25"
                    value={cipherRefKey}
                    onChange={e => setCipherRefKey(parseInt(e.target.value))}
                  />
                </div>
                <div className="sandbox-control">
                  <label>Word to encode:</label>
                  <input
                    type="text"
                    value={cipherRefWord}
                    onChange={e => setCipherRefWord(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 10))}
                    placeholder="HELLO"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="cipher-ref-output">
                {cipherRefTransformed.length > 0 && (
                  <>
                    <div className="cipher-mapping-row">
                      {cipherRefTransformed.map((pair, i) => (
                        <div key={i} className="cipher-pair-col">
                          <span className="orig-letter">{pair.original}</span>
                          <span className="arrow-down">↓</span>
                          <span className="enc-letter">{pair.transformed}</span>
                        </div>
                      ))}
                    </div>
                    <div className="cipher-ref-result-text">
                      <span className="orig-label">Original:</span>{' '}
                      <strong>{cipherRefTransformed.map(p => p.original).join('')}</strong>
                      <span className="arrow-right"> → </span>
                      <span className="enc-label">Encoded:</span>{' '}
                      <strong className="encoded-out">{cipherRefTransformed.map(p => p.transformed).join('')}</strong>
                    </div>
                  </>
                )}
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
                        onClick={() => { setSelectedMilestoneId(m.id); setResponseText(''); }}
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
                                  onChange={e => setResponseText(e.target.value)}
                                  placeholder="Type your response here..."
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
                                  <h5>Submitted &amp; Awaiting Grade</h5>
                                  <p>Your work has been sent to your teacher for evaluation.</p>
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
                                  <h5>Evaluated &amp; Graded</h5>
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
                                  <p className="feedback-content">&ldquo;{activeSubmission.feedback || 'No comments provided.'}&rdquo;</p>
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
                          <h5>🤖 CT &amp; AI Coach</h5>
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
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask about ciphers, encoding, decoding, cracking..."
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
        /* ── CIPHER ACADEMY ── */
        <div className="card academy-layout-card animate-fade-in">
          <div className="academy-header">
            <div className="title-block">
              <span className="academy-icon">🔐</span>
              <div>
                <h3>Cipher Academy</h3>
                <p className="subtitle">Learn to encode, decode, and crack secret messages</p>
              </div>
            </div>
            {hasExpertBadge && (
              <span className="earned-badge-indicator">🎖️ Code Breaker Certified</span>
            )}
          </div>

          <div className="academy-tabs-bar">
            <button className={`academy-tab-btn ${academySubTab === 'learn' ? 'active' : ''}`} onClick={() => setAcademySubTab('learn')}>
              💡 1. Learn
            </button>
            <button className={`academy-tab-btn ${academySubTab === 'practice' ? 'active' : ''}`} onClick={() => setAcademySubTab('practice')}>
              🛠️ 2. Practice
            </button>
            <button className={`academy-tab-btn ${academySubTab === 'test' ? 'active' : ''}`} onClick={() => setAcademySubTab('test')}>
              📝 3. Test Challenge
            </button>
          </div>

          <div className="academy-content-pane">

            {/* ── LEARN ── */}
            {academySubTab === 'learn' && (
              <div className="learn-pane animate-fade-in">
                <h4>How Caesar Cipher Works</h4>
                <p className="explain-text">
                  A Caesar cipher shifts every letter forward by a fixed number (the key). With key 3: A→D, B→E, Z wraps back to C.
                  Click any letter below to see exactly how it shifts with your chosen key.
                </p>

                <div className="learn-controls">
                  <label>Shift Key: <strong className="key-highlight">{learnKey}</strong></label>
                  <input
                    type="range" min="1" max="25"
                    value={learnKey}
                    onChange={e => setLearnKey(parseInt(e.target.value))}
                    className="key-slider"
                  />
                </div>

                <div className="alphabet-grid">
                  {ALPHABET.split('').map(letter => (
                    <button
                      key={letter}
                      className={`alpha-btn ${learnHighlight === letter ? 'selected' : ''}`}
                      onClick={() => setLearnHighlight(letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                <div className="shift-demo-card">
                  <div className="shift-demo-row">
                    <div className="shift-box original">
                      <span className="shift-letter">{learnHighlight}</span>
                      <span className="shift-label">Original</span>
                      <span className="shift-pos">Position {ALPHABET.indexOf(learnHighlight)}</span>
                    </div>
                    <div className="shift-arrow-block">
                      <span className="shift-key-label">+ {learnKey}</span>
                      <span className="arrow-symbol">→</span>
                      <span className="shift-math">({ALPHABET.indexOf(learnHighlight)} + {learnKey}) mod 26 = {(ALPHABET.indexOf(learnHighlight) + learnKey) % 26}</span>
                    </div>
                    <div className="shift-box encoded">
                      <span className="shift-letter encoded-color">{shiftLetter(learnHighlight, learnKey, 'encode')}</span>
                      <span className="shift-label">Encoded</span>
                      <span className="shift-pos">Position {(ALPHABET.indexOf(learnHighlight) + learnKey) % 26}</span>
                    </div>
                  </div>
                </div>

                <div className="full-mapping-strip">
                  <div className="mapping-row">
                    <span className="strip-label">Original</span>
                    {ALPHABET.split('').map(l => (
                      <span key={l} className={`strip-cell orig-cell ${learnHighlight === l ? 'hl' : ''}`}>{l}</span>
                    ))}
                  </div>
                  <div className="mapping-row">
                    <span className="strip-label">Encoded</span>
                    {ALPHABET.split('').map(l => (
                      <span key={l} className={`strip-cell enc-cell ${learnHighlight === l ? 'hl' : ''}`}>
                        {shiftLetter(l, learnKey, 'encode')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PRACTICE ── */}
            {academySubTab === 'practice' && (
              <div className="practice-pane animate-fade-in">
                <div className="practice-layout">
                  <div className="practice-sandbox">
                    <h4>Encode / Decode Sandbox</h4>
                    <p className="instruction-mini">Type a word, choose a key, and see every letter transform.</p>

                    <div className="practice-controls">
                      <div className="practice-mode-toggle">
                        <button className={`mode-btn ${practiceMode === 'encode' ? 'active' : ''}`} onClick={() => setPracticeMode('encode')}>
                          🔒 Encode
                        </button>
                        <button className={`mode-btn ${practiceMode === 'decode' ? 'active' : ''}`} onClick={() => setPracticeMode('decode')}>
                          🔓 Decode
                        </button>
                      </div>
                      <div className="sandbox-control">
                        <label>Key: <strong>{practiceKey}</strong></label>
                        <input type="range" min="1" max="25" value={practiceKey}
                          onChange={e => setPracticeKey(parseInt(e.target.value))} />
                      </div>
                      <input
                        className="practice-word-input"
                        type="text"
                        value={practiceWord}
                        onChange={e => setPracticeWord(e.target.value.replace(/[^A-Za-z ]/g, '').toUpperCase().slice(0, 12))}
                        placeholder="Type a word..."
                        maxLength={12}
                      />
                    </div>

                    {practiceTransformed.length > 0 && (
                      <div className="practice-transform-display">
                        {practiceTransformed.map((pair, i) => (
                          <div key={i} className={`transform-col ${pair.original === ' ' ? 'space-col' : ''}`}>
                            <span className="t-orig">{pair.original === ' ' ? '␣' : pair.original}</span>
                            <span className="t-arrow">↓</span>
                            <span className="t-enc">{pair.original === ' ' ? '␣' : pair.transformed}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {practiceTransformed.length > 0 && (
                      <div className="practice-result-card">
                        <span>{practiceMode === 'encode' ? 'Encoded:' : 'Decoded:'}</span>
                        <strong className="result-val">
                          {practiceTransformed.map(p => p.original === ' ' ? ' ' : p.transformed).join('')}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="practice-checklist-card">
                    <h4>Practice Missions</h4>
                    <ul className="checklist-list">
                      <li className={practiceWord === 'HELLO' && practiceMode === 'encode' && practiceKey === 3 ? 'checked' : ''}>
                        <span className="check-box">
                          {practiceWord === 'HELLO' && practiceMode === 'encode' && practiceKey === 3 ? '✅' : '⬜'}
                        </span>
                        <div className="mission-details">
                          <strong>Encode HELLO with key 3</strong>
                          <p>Expected: KHOOR</p>
                        </div>
                      </li>
                      <li className={practiceWord === 'KHOOR' && practiceMode === 'decode' && practiceKey === 3 ? 'checked' : ''}>
                        <span className="check-box">
                          {practiceWord === 'KHOOR' && practiceMode === 'decode' && practiceKey === 3 ? '✅' : '⬜'}
                        </span>
                        <div className="mission-details">
                          <strong>Decode KHOOR with key 3</strong>
                          <p>Expected: HELLO</p>
                        </div>
                      </li>
                      <li className={practiceWord === 'CODE' && practiceMode === 'encode' && practiceKey === 7 ? 'checked' : ''}>
                        <span className="check-box">
                          {practiceWord === 'CODE' && practiceMode === 'encode' && practiceKey === 7 ? '✅' : '⬜'}
                        </span>
                        <div className="mission-details">
                          <strong>Encode CODE with key 7</strong>
                          <p>Hint: C→J, O→V, D→K, E→L</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── TEST ── */}
            {academySubTab === 'test' && (
              <div className="test-pane animate-fade-in">
                {hasExpertBadge ? (
                  <div className="congrats-card">
                    <span className="medal-visual">🎖️</span>
                    <h3>You are a Certified Code Breaker!</h3>
                    <p className="welcome-text">
                      You successfully cracked the cipher using brute force — trying keys until you found real English. This badge is now visible to your teacher and principal.
                    </p>
                    <div className="badge-details-box">
                      <p><strong>Certificate Awarded to:</strong> {currentUser.name}</p>
                      <p><strong>Skill Validated:</strong> Algorithmic Thinking — Brute Force Search</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTestSubmit} className="test-form">
                    <div className="challenge-question-card">
                      <span className="question-icon">🕵️</span>
                      <div>
                        <h4>Crack This Cipher</h4>
                        <p>We intercepted: <strong className="encoded-msg">KHOOR</strong>. Slide through keys until you decode it into a real English word.</p>
                      </div>
                    </div>

                    <div className="test-brute-force-panel">
                      <div className="brute-controls">
                        <label>Try Key: <strong className="key-highlight">{testKey}</strong></label>
                        <input
                          type="range" min="1" max="25"
                          value={testKey}
                          onChange={e => setTestKey(parseInt(e.target.value))}
                          className="key-slider"
                        />
                      </div>

                      <div className="brute-mapping">
                        {TEST_ENCODED.split('').map((ch, i) => {
                          const decoded = shiftLetter(ch, testKey, 'decode');
                          return (
                            <div key={i} className="brute-col">
                              <span className="brute-enc">{ch}</span>
                              <span className="brute-arrow">↓</span>
                              <span className="brute-dec">{decoded}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className={`decoded-output-card ${testCorrect ? 'cracked' : ''}`}>
                        <span>Decoded with key {testKey}:</span>
                        <strong className="decoded-word">{testDecoded}</strong>
                        {testCorrect && <span className="cracked-badge">✅ Real English word found!</span>}
                      </div>
                    </div>

                    <div className="test-submit-row">
                      <div className="active-code-lbl">
                        {testCorrect
                          ? <span className="success-hint">Found it! Key = {testKey} decodes KHOOR → &ldquo;{testDecoded}&rdquo;</span>
                          : <span>Keep sliding — look for a real English word...</span>
                        }
                      </div>
                      <button type="submit" className="btn btn-primary submit-test-btn" disabled={!testCorrect}>
                        {testCorrect ? '🎖️ Claim Code Breaker Badge' : 'Find the Key First'}
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

        /* ── Top Nav ── */
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
        .main-nav-btn:hover { color: var(--text-primary); background-color: var(--bg-tertiary); }
        .main-nav-btn.active {
          color: var(--role-color);
          border-bottom: 4px solid var(--role-color);
          background-color: var(--bg-secondary);
        }

        /* ── Project Tab Layout ── */
        .header-dual-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) { .header-dual-layout { grid-template-columns: 1fr; } }

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
        .project-intro-card h2 { font-size: 1.75rem; margin-bottom: 0.25rem; }
        .subject-line { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem; }
        .driving-question {
          background-color: var(--bg-secondary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        /* ── Cipher Quick Reference Card ── */
        .sandbox-card {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 4px solid #6366f1;
        }
        .sandbox-header { display: flex; justify-content: space-between; align-items: center; }
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
        .sandbox-control { display: flex; flex-direction: column; gap: 0.25rem; }
        .sandbox-control label { font-size: 0.8rem; color: var(--text-secondary); }
        .sandbox-control input[type="range"] { cursor: pointer; }
        .sandbox-control input[type="text"] { padding: 0.4rem 0.75rem; }

        .cipher-ref-output { display: flex; flex-direction: column; gap: 0.75rem; }
        .cipher-mapping-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .cipher-pair-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 28px;
        }
        .orig-letter { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
        .arrow-down { font-size: 0.7rem; color: var(--text-tertiary); }
        .enc-letter { font-weight: 700; font-size: 1rem; color: #6366f1; }
        .cipher-ref-result-text { font-size: 0.9rem; color: var(--text-secondary); }
        .orig-label, .enc-label { font-size: 0.8rem; color: var(--text-tertiary); }
        .arrow-right { color: var(--text-tertiary); }
        .encoded-out { color: #6366f1; font-size: 1.1rem; }

        /* ── Dashboard Grid ── */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
        .grid-left-col { display: flex; flex-direction: column; gap: 1.5rem; }

        /* ── Stats Row ── */
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .stat-card { text-align: left; }
        .stat-value { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--text-primary); line-height: 1.1; }
        .stat-denominator { font-size: 1.1rem; color: var(--text-tertiary); font-weight: 500; }
        .stat-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.25rem; }
        .stat-subtext { font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem; }
        .progress-bar-container { width: 100%; height: 6px; background-color: var(--bg-tertiary); border-radius: var(--radius-full); margin-top: 0.75rem; overflow: hidden; }
        .progress-bar-fill { height: 100%; background-color: var(--role-color); border-radius: var(--radius-full); transition: width var(--transition-slow); }

        /* ── Milestone Timeline ── */
        .milestone-list-card { text-align: left; }
        .milestone-list-card h3 { margin-bottom: 1.25rem; font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
        .milestones-timeline { display: flex; flex-direction: column; gap: 1rem; }
        .timeline-item {
          display: flex; gap: 1rem; padding: 1rem;
          border: 1px solid var(--border-color); border-radius: var(--radius-md);
          cursor: pointer; transition: all var(--transition-fast); position: relative;
        }
        .timeline-item:hover { border-color: var(--role-color); background-color: var(--bg-tertiary); }
        .timeline-item.active { border-color: var(--role-color); box-shadow: 0 0 0 3px var(--role-color-light); background-color: var(--bg-secondary); }
        .timeline-marker {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background-color: var(--bg-tertiary); border: 2px solid var(--border-color);
          flex-shrink: 0; font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem; color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .timeline-item.active .timeline-marker { background-color: var(--role-color); border-color: var(--role-color); color: #fff; }
        .timeline-item.status-graded .timeline-marker { border-color: var(--status-graded); color: var(--status-graded); background-color: var(--status-graded-bg); }
        .timeline-item.status-submitted .timeline-marker { border-color: var(--status-submitted); color: var(--status-submitted); background-color: var(--status-submitted-bg); }
        .timeline-content { flex: 1; }
        .milestone-title-row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .milestone-title-row h4 { font-size: 0.95rem; font-weight: 600; line-height: 1.3; }
        .milestone-meta-row { display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-tertiary); }
        .earned-marks-text { color: var(--status-graded); }

        /* ── Detail Panel ── */
        .details-panel-card { text-align: left; height: 100%; display: flex; flex-direction: column; }
        .panel-tab-bar {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;
          background-color: var(--bg-tertiary); padding: 0.3rem;
          border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem;
        }
        .panel-tab-btn {
          border: none; background: none; padding: 0.6rem;
          font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);
          border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast);
        }
        .panel-tab-btn:hover { color: var(--text-primary); }
        .panel-tab-btn.active { background-color: var(--bg-secondary); box-shadow: var(--shadow-sm); color: var(--role-color); }
        .tab-pane-content { display: flex; flex-direction: column; height: 100%; }
        .panel-header { border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
        .panel-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; }
        .panel-header h3 { font-size: 1.5rem; margin-top: 0.25rem; margin-bottom: 0.5rem; line-height: 1.2; }
        .max-marks-badge {
          display: inline-block; font-size: 0.8rem; font-weight: 600;
          color: var(--text-secondary); background-color: var(--bg-tertiary);
          padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);
        }
        .instructions-section { margin-bottom: 1.5rem; }
        .instructions-section h5 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 700; text-transform: uppercase; }
        .instructions-section p { color: var(--text-primary); font-size: 0.95rem; line-height: 1.6; }
        .submission-form { display: flex; flex-direction: column; gap: 1rem; }
        .submission-form label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.4rem; display: block; }
        .submit-btn { align-self: flex-start; }
        .alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: 1rem; }
        .alert-success { background-color: var(--status-graded-bg); border: 1px solid var(--status-graded-border); color: var(--status-graded); }
        .alert-danger { background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .submission-status-box { border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-color); }
        .status-banner { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-bottom: 1px solid var(--border-color); }
        .submission-status-box.waiting .status-banner { background-color: var(--status-submitted-bg); color: var(--status-submitted); }
        .submission-status-box.graded .status-banner { background-color: var(--status-graded-bg); color: var(--status-graded); }
        .status-banner h5 { font-size: 0.95rem; font-weight: 700; color: inherit; }
        .status-banner p { font-size: 0.8rem; color: var(--text-secondary); }
        .status-icon { font-size: 1.5rem; }
        .submitted-response-viewer { padding: 1.25rem; background-color: var(--bg-primary); }
        .submitted-response-viewer h6 { font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 0.5rem; }
        .response-content { font-size: 0.95rem; color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; }
        .grade-result-card { display: flex; gap: 1.5rem; padding: 1.25rem; background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color); }
        .score-block { display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--status-graded-bg); border: 1px solid var(--status-graded-border); border-radius: var(--radius-md); padding: 1rem; min-width: 100px; flex-shrink: 0; }
        .score-num { font-family: var(--font-heading); font-size: 2.25rem; font-weight: 700; color: var(--status-graded); line-height: 1; }
        .score-lbl { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; }
        .feedback-block { flex: 1; text-align: left; }
        .feedback-block h6 { font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 0.25rem; }
        .feedback-content { font-size: 0.95rem; font-style: italic; color: var(--text-primary); line-height: 1.5; }

        /* ── Chat ── */
        .tutor-chat-pane { display: flex; flex-direction: column; height: 480px; }
        .chat-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem; }
        .chat-status { font-size: 0.7rem; background-color: #10b981; color: #fff; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); font-weight: 600; }
        .chat-messages-container { flex: 1; overflow-y: auto; padding: 0.5rem; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
        .chat-bubble-wrapper { display: flex; width: 100%; }
        .chat-bubble-wrapper.tutor { justify-content: flex-start; }
        .chat-bubble-wrapper.user { justify-content: flex-end; }
        .chat-bubble { padding: 0.75rem 1rem; border-radius: var(--radius-md); max-width: 80%; font-size: 0.875rem; line-height: 1.45; position: relative; }
        .chat-bubble-wrapper.tutor .chat-bubble { background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); border-top-left-radius: 2px; }
        .chat-bubble-wrapper.user .chat-bubble { background-color: var(--role-color-light); color: var(--role-color); border: 1px solid rgba(59,130,246,0.25); border-top-right-radius: 2px; }
        .chat-time { display: block; font-size: 0.65rem; color: var(--text-tertiary); text-align: right; margin-top: 0.35rem; }
        .typing-bubble { display: flex; gap: 4px; padding: 0.6rem 1rem; align-items: center; }
        .typing-dot { width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; display: inline-block; animation: chatTyping 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes chatTyping { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .chat-input-bar { display: flex; gap: 0.5rem; }
        .chat-input-bar input { flex: 1; }
        .send-chat-btn { padding: 0.5rem 1.25rem; }
        .empty-panel-view { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-tertiary); padding: 3rem; text-align: center; }

        /* ── Cipher Academy Layout ── */
        .academy-layout-card { text-align: left; display: flex; flex-direction: column; gap: 1.5rem; }
        .academy-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
        .title-block { display: flex; align-items: center; gap: 1rem; }
        .academy-icon { font-size: 2.25rem; }
        .subtitle { font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.2rem; }
        .earned-badge-indicator { background-color: #fef3c7; border: 1px solid #fde68a; color: #d97706; font-weight: 700; font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: var(--radius-full); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }
        .academy-tabs-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; background-color: var(--bg-tertiary); padding: 0.35rem; border-radius: var(--radius-md); }
        .academy-tab-btn { background: none; border: none; padding: 0.75rem; font-weight: 700; font-size: 0.9rem; color: var(--text-secondary); cursor: pointer; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
        .academy-tab-btn:hover { color: var(--text-primary); }
        .academy-tab-btn.active { background-color: var(--bg-secondary); box-shadow: var(--shadow-sm); color: var(--role-color); }
        .academy-content-pane { background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 2rem; min-height: 400px; }

        /* ── Learn Pane ── */
        .learn-pane { display: flex; flex-direction: column; gap: 1.25rem; }
        .explain-text { font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); }
        .learn-controls { display: flex; align-items: center; gap: 1.5rem; background-color: var(--bg-primary); border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-md); }
        .key-highlight { color: var(--role-color); font-size: 1.1rem; }
        .key-slider { flex: 1; cursor: pointer; }

        .alphabet-grid { display: grid; grid-template-columns: repeat(13, 1fr); gap: 0.35rem; }
        .alpha-btn {
          border: 1px solid var(--border-color); background: var(--bg-primary);
          border-radius: var(--radius-sm); padding: 0.4rem 0;
          font-weight: 700; font-size: 0.85rem; cursor: pointer;
          color: var(--text-primary); transition: all var(--transition-fast);
        }
        .alpha-btn:hover { border-color: var(--role-color); background-color: var(--role-color-light); }
        .alpha-btn.selected { background-color: var(--role-color); color: #fff; border-color: var(--role-color); }

        .shift-demo-card { background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; }
        .shift-demo-row { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; }
        .shift-box { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 1rem 1.5rem; border: 2px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-secondary); min-width: 100px; }
        .shift-box.encoded { border-color: #6366f1; background-color: rgba(99,102,241,0.05); }
        .shift-letter { font-family: var(--font-heading); font-size: 3rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
        .shift-letter.encoded-color { color: #6366f1; }
        .shift-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); }
        .shift-pos { font-size: 0.7rem; color: var(--text-tertiary); }
        .shift-arrow-block { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
        .shift-key-label { font-size: 0.85rem; font-weight: 700; color: var(--role-color); }
        .arrow-symbol { font-size: 2rem; color: var(--text-tertiary); }
        .shift-math { font-size: 0.75rem; color: var(--text-tertiary); text-align: center; max-width: 120px; line-height: 1.4; }

        .full-mapping-strip { display: flex; flex-direction: column; gap: 0.35rem; overflow-x: auto; padding-bottom: 0.25rem; }
        .mapping-row { display: flex; align-items: center; gap: 2px; }
        .strip-label { font-size: 0.7rem; font-weight: 700; color: var(--text-tertiary); min-width: 60px; flex-shrink: 0; }
        .strip-cell { min-width: 24px; text-align: center; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0; border-radius: 3px; }
        .orig-cell { color: var(--text-secondary); background-color: var(--bg-primary); }
        .enc-cell { color: #6366f1; background-color: rgba(99,102,241,0.07); }
        .strip-cell.hl { background-color: var(--role-color) !important; color: #fff !important; }

        /* ── Practice Pane ── */
        .practice-pane { display: flex; flex-direction: column; gap: 1rem; }
        .practice-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 800px) { .practice-layout { grid-template-columns: 1fr; } }
        .practice-sandbox { display: flex; flex-direction: column; gap: 1rem; border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md); background-color: var(--bg-primary); }
        .instruction-mini { font-size: 0.85rem; color: var(--text-secondary); }
        .practice-controls { display: flex; flex-direction: column; gap: 0.75rem; }
        .practice-mode-toggle { display: flex; gap: 0.5rem; }
        .mode-btn { border: 1px solid var(--border-color); background: var(--bg-secondary); padding: 0.45rem 1rem; font-weight: 700; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; color: var(--text-secondary); transition: all var(--transition-fast); }
        .mode-btn.active { background-color: var(--role-color); color: #fff; border-color: var(--role-color); }
        .practice-word-input { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 1rem; font-family: var(--font-heading); font-weight: 700; letter-spacing: 0.05em; width: 100%; background-color: var(--bg-secondary); color: var(--text-primary); }

        .practice-transform-display { display: flex; gap: 0.5rem; flex-wrap: wrap; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; }
        .transform-col { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 30px; }
        .space-col { opacity: 0.4; }
        .t-orig { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
        .t-arrow { font-size: 0.65rem; color: var(--text-tertiary); }
        .t-enc { font-weight: 700; font-size: 1rem; color: #6366f1; }
        .practice-result-card { background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; }
        .result-val { font-family: var(--font-heading); font-size: 1.5rem; color: var(--role-color); letter-spacing: 0.05em; }

        .practice-checklist-card { border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md); background-color: var(--bg-secondary); }
        .checklist-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .checklist-list li { display: flex; gap: 0.75rem; align-items: center; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-primary); transition: all var(--transition-fast); }
        .checklist-list li.checked { border-color: var(--status-graded); background-color: var(--status-graded-bg); }
        .check-box { font-size: 1.25rem; }
        .mission-details { text-align: left; }
        .mission-details p { font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.15rem; }

        /* ── Test Pane ── */
        .test-pane { display: flex; flex-direction: column; gap: 1.5rem; }
        .challenge-question-card { display: flex; gap: 1rem; align-items: center; background-color: var(--role-color-light); border: 1px solid rgba(59,130,246,0.25); padding: 1.5rem; border-radius: var(--radius-md); color: var(--role-color); }
        .question-icon { font-size: 2.25rem; }
        .challenge-question-card h4 { color: inherit; }
        .challenge-question-card p { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }
        .encoded-msg { font-family: var(--font-heading); font-size: 1.15rem; letter-spacing: 0.1em; color: #e11d48; }

        .test-brute-force-panel { background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .brute-controls { display: flex; align-items: center; gap: 1.5rem; }
        .brute-mapping { display: flex; gap: 1.5rem; justify-content: center; padding: 1rem 0; }
        .brute-col { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
        .brute-enc { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: #e11d48; }
        .brute-arrow { font-size: 0.85rem; color: var(--text-tertiary); }
        .brute-dec { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--role-color); }
        .decoded-output-card {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
          background-color: var(--bg-secondary); border: 2px solid var(--border-color);
          border-radius: var(--radius-md); padding: 1rem 1.25rem;
          transition: border-color var(--transition-fast);
        }
        .decoded-output-card.cracked { border-color: var(--status-graded); background-color: var(--status-graded-bg); }
        .decoded-word { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; color: var(--text-primary); letter-spacing: 0.1em; }
        .decoded-output-card.cracked .decoded-word { color: var(--status-graded); }
        .cracked-badge { font-size: 0.85rem; font-weight: 700; color: var(--status-graded); }

        .test-submit-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .active-code-lbl { font-size: 0.95rem; color: var(--text-secondary); }
        .success-hint { color: var(--status-graded); font-weight: 600; }
        .submit-test-btn { padding: 0.65rem 1.5rem; }

        /* ── Congrats Card ── */
        .congrats-card {
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border: 2px solid var(--status-graded); border-radius: var(--radius-lg);
          padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;
          box-shadow: var(--shadow-lg); text-align: center;
        }
        .medal-visual { font-size: 4rem; animation: bounce 1.5s infinite; display: block; filter: drop-shadow(0 4px 10px rgba(217,119,6,0.3)); }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .welcome-text { color: var(--text-secondary); max-width: 480px; line-height: 1.6; }
        .badge-details-box { background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1rem 1.5rem; border-radius: var(--radius-md); font-size: 0.85rem; text-align: left; width: 100%; max-width: 400px; }
        .badge-details-box p { margin-bottom: 0.25rem; color: var(--text-secondary); }
        .badge-details-box p strong { color: var(--text-primary); }
      `}</style>
    </div>
  );
}
