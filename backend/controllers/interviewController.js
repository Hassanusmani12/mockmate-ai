const Interview = require('../models/Interview');
const User = require('../models/User');
const { callOpenRouter, getSystemPrompt, LEARNING_PROMPT, MOCK_PROMPT } = require('../utils/openrouter');

exports.generateQuestions = async (req, res) => {
  try {
    console.log('\n========== GENERATE QUESTIONS ==========');
    console.log('Incoming request body:', JSON.stringify(req.body));
    console.log('User ID:', req.user?._id);

    const { role, company = '', experienceLevel = 'mid', difficulty = 'medium', language = 'English' } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, error: 'Target role is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const resumeContent = user.resumeText || (user.resumeUrl ? 'Candidate resume available.' : 'No resume provided.');

    const prompt = `You are a technical interviewer. Based on the following resume and the target role "${role}" at company "${company}" (experience: ${experienceLevel}, difficulty: ${difficulty}), generate exactly 5 interview questions. Return ONLY a JSON array of strings, no other text.
Resume: ${resumeContent}`;

    const raw = await callOpenRouter([
      { role: 'system', content: MOCK_PROMPT },
      { role: 'user', content: prompt },
    ]);

    const clean = raw.replace(/```json|```/g, '').trim();
    let questions;
    try {
      questions = JSON.parse(clean);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'AI returned invalid JSON. Raw response: ' + raw.substring(0, 300),
        stack: parseError.stack,
      });
    }

    if (!Array.isArray(questions)) {
      return res.status(500).json({
        success: false,
        error: 'AI returned non-array response: ' + JSON.stringify(questions).substring(0, 200),
      });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      role,
      company,
      experienceLevel,
      difficulty,
      language,
      mode: 'mock',
      questions: questions.map((q) => ({ question: q })),
    });

    res.json({ interviewId: interview._id, questions: interview.questions });
  } catch (err) {
    console.error('\n========== GENERATE QUESTIONS ERROR ==========');
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ success: false, error: err.message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  }
};

exports.startLearning = async (req, res) => {
  try {
    console.log('\n========== START LEARNING ==========');
    console.log('Request body:', JSON.stringify(req.body));

    const { role, company = '', experienceLevel = 'mid', language = 'English' } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, error: 'Target role is required' });
    }

    const session = await Interview.create({
      userId: req.user._id,
      role,
      company,
      experienceLevel,
      language,
      mode: 'learning',
      questions: [],
    });

    console.log('Learning session created:', session._id);
    console.log('========== END START LEARNING ==========\n');

    res.json({ sessionId: session._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.learn = async (req, res) => {
  try {
    console.log('\n========== LEARN ==========');
    console.log('Request body:', JSON.stringify(req.body));

    const { sessionId, message } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });
    if (!message || !message.trim()) return res.status(400).json({ success: false, error: 'Message is required' });

    const session = await Interview.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Learning session not found' });
    if (session.mode !== 'learning') return res.status(400).json({ success: false, error: 'Session is not in learning mode' });

    const chatHistory = session.chatHistory || [];
    const userMsg = { role: 'user', content: message };
    chatHistory.push(userMsg);

    const raw = await callOpenRouter([
      { role: 'system', content: LEARNING_PROMPT },
      ...chatHistory.slice(-20),
    ]);

    chatHistory.push({ role: 'assistant', content: raw });
    session.chatHistory = chatHistory;
    await session.save();

    console.log('AI reply length:', raw.length);
    console.log('========== END LEARN ==========\n');

    res.json({ reply: raw });
  } catch (err) {
    console.error('\n========== LEARN ERROR ==========');
    console.error('Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    console.log('\n========== SUBMIT ANSWER ==========');
    console.log('Request body:', JSON.stringify(req.body));

    const { interviewId, questionIndex, answer } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, error: 'interviewId is required' });
    }
    if (questionIndex === undefined || questionIndex === null) {
      return res.status(400).json({ success: false, error: 'questionIndex is required' });
    }
    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, error: 'Answer cannot be empty' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }
    if (interview.mode === 'learning') {
      return res.status(400).json({ success: false, error: 'Cannot submit answers in learning mode' });
    }

    const q = interview.questions[questionIndex];
    if (!q) {
      return res.status(400).json({ success: false, error: `Invalid question index: ${questionIndex}` });
    }

    q.answer = answer;

    const modePrompt = `${getSystemPrompt(interview.mode)}

Question: ${q.question}
Answer: ${answer}

Rate the answer from 0-100 and provide brief feedback. Return ONLY valid JSON with keys "score" (number) and "feedback" (string).`;

    console.log('Mode:', interview.mode);
    console.log('Question:', q.question?.substring(0, 100));
    console.log('Answer length:', answer.length);

    const raw = await callOpenRouter([
      { role: 'system', content: modePrompt },
      { role: 'user', content: `Mode: ${interview.mode}. Evaluate this answer for question: ${q.question}\nAnswer: ${answer}` },
    ]);

    console.log('Raw evaluation response:', raw.substring(0, 500));

    const clean = raw.replace(/```json|```/g, '').trim();
    let result;
    try {
      result = JSON.parse(clean);
    } catch (parseError) {
      console.error('JSON PARSE ERROR in evaluation:', parseError.message);
      console.error('Raw:', raw.substring(0, 500));
      return res.status(500).json({
        success: false,
        error: 'AI returned invalid JSON for evaluation: ' + raw.substring(0, 200),
        stack: parseError.stack,
      });
    }

    if (typeof result.score !== 'number') {
      console.error('TYPE ERROR: score is not a number:', result.score);
      return res.status(500).json({
        success: false,
        error: 'AI returned non-numeric score: ' + JSON.stringify(result),
      });
    }

    q.score = result.score;
    q.feedback = result.feedback || '';
    await interview.save();

    console.log('Score:', q.score);
    console.log('Feedback:', q.feedback?.substring(0, 100));
    console.log('========== END SUBMIT ANSWER ==========\n');

    res.json({ score: q.score, feedback: q.feedback });
  } catch (err) {
    console.error('\n========== SUBMIT ANSWER ERROR ==========');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('========== END ERROR ==========\n');

    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }
};

exports.finishInterview = async (req, res) => {
  try {
    console.log('\n========== FINISH INTERVIEW ==========');
    console.log('Request body:', JSON.stringify(req.body));

    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ success: false, error: 'interviewId is required' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }
    if (interview.mode === 'learning') {
      return res.status(400).json({ success: false, error: 'Cannot finish a learning session via this endpoint' });
    }

    const scores = interview.questions.map((q) => q.score).filter((s) => s !== null);
    const overallScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    console.log('Questions count:', interview.questions.length);
    console.log('Scored questions:', scores.length);
    console.log('Average score:', overallScore);

    const qaList = interview.questions
      .map((q) => `Q: ${q.question}\nA: ${q.answer}\nScore: ${q.score}\nFeedback: ${q.feedback}`)
      .join('\n\n');

    const prompt = `Based on this interview for role "${interview.role}", provide a detailed final report.

${qaList}

Return ONLY valid JSON with keys:
- "technicalScore" (number 0-100)
- "communicationScore" (number 0-100)
- "confidenceScore" (number 0-100)
- "problemSolvingScore" (number 0-100)
- "strengths" (array of strings)
- "weaknesses" (array of strings)
- "suggestions" (array of strings)`;

    console.log('Report prompt length:', prompt.length);

    const raw = await callOpenRouter([
      { role: 'system', content: 'You output only valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    console.log('Raw report response:', raw.substring(0, 1000));

    const clean = raw.replace(/```json|```/g, '').trim();
    let report;
    try {
      report = JSON.parse(clean);
    } catch (parseError) {
      console.error('JSON PARSE ERROR in report:', parseError.message);
      console.error('Raw:', raw.substring(0, 500));
      return res.status(500).json({
        success: false,
        error: 'AI returned invalid JSON for report: ' + raw.substring(0, 200),
        stack: parseError.stack,
      });
    }

    interview.overallScore = overallScore;
    interview.strengths = report.strengths || [];
    interview.weaknesses = report.weaknesses || [];
    interview.suggestions = report.suggestions || [];
    interview.technicalScore = report.technicalScore || overallScore;
    interview.communicationScore = report.communicationScore || overallScore;
    interview.confidenceScore = report.confidenceScore || overallScore;
    interview.problemSolvingScore = report.problemSolvingScore || overallScore;
    await interview.save();

    console.log('Report saved. Overall:', overallScore);
    console.log('========== END FINISH INTERVIEW ==========\n');

    res.json({
      overallScore,
      technicalScore: interview.technicalScore,
      communicationScore: interview.communicationScore,
      confidenceScore: interview.confidenceScore,
      problemSolvingScore: interview.problemSolvingScore,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      suggestions: interview.suggestions,
      questions: interview.questions,
    });
  } catch (err) {
    console.error('\n========== FINISH INTERVIEW ERROR ==========');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('========== END ERROR ==========\n');

    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }
};

exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interview deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select('role overallScore mode createdAt')
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { interviewId, message, role, mode = 'learning' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const interview = await Interview.findById(interviewId);
    if (interview && interview.mode === 'learning') {
      return res.status(400).json({ success: false, error: 'Use the /learn endpoint for learning sessions' });
    }

    const context = interview
      ? interview.questions.map((q) => `Q: ${q.question}\nA: ${q.answer || '(unanswered)'}\nScore: ${q.score ?? '-'}`).join('\n\n')
      : `Target role: ${role}`;

    const raw = await callOpenRouter([
      { role: 'system', content: getSystemPrompt(mode) },
      { role: 'user', content: `Context:\n${context}\n\nUser message: ${message}` },
    ]);

    const reply = raw.slice(0, 256);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    if (interview.mode === 'learning') {
      return res.status(400).json({ success: false, error: 'Learning sessions cannot be retrieved via this endpoint' });
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    res.json(interview);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
