const LearningSession = require('../models/LearningSession');
const { callOpenRouter, LEARNING_PROMPT } = require('../utils/openrouter');

const languagePrompt = (lang) => {
  const l = lang || 'English';
  return `The user has selected ${l} as the interview language. You MUST respond strictly in this language. If the language is Urdu or Hindi, you MUST respond in Roman Urdu/Hindi (using English alphabets). Do not use English for greetings or explanations.\n\n${LEARNING_PROMPT}`;
};

exports.start = async (req, res) => {
  try {
    const { role, company = '', experienceLevel = 'mid' } = req.body;
    if (!role || !role.trim()) return res.status(400).json({ success: false, error: 'Target role is required' });

    const session = await LearningSession.create({
      userId: req.user._id,
      role,
      company,
      experienceLevel,
      chatHistory: [],
    });

    const intro = `Today we will learn Backend Development Interview concepts for ${role}. Let's begin!`;
    session.chatHistory.push({ role: 'assistant', content: intro });
    await session.save();

    res.json({ success: true, sessionId: session._id, firstMessage: intro });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.message = async (req, res) => {
  try {
    const { sessionId, message, language } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });
    if (!message || !message.trim()) return res.status(400).json({ success: false, error: 'Message is required' });

    const session = await LearningSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Learning session not found' });

    session.chatHistory.push({ role: 'user', content: message });

    const raw = await callOpenRouter([
      { role: 'system', content: languagePrompt(language) },
      ...session.chatHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
    ]);

    session.chatHistory.push({ role: 'assistant', content: raw });
    await session.save();

    res.json({ reply: raw });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.nextTopic = async (req, res) => {
  try {
    const { sessionId, language } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });

    const session = await LearningSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Learning session not found' });

    if (session.currentTopic) {
      session.completedTopics.push(session.currentTopic);
    }

    session.chatHistory.push({ role: 'user', content: 'I understand this topic. Let us move to the next topic.' });

    const raw = await callOpenRouter([
      { role: 'system', content: languagePrompt(language) },
      ...session.chatHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
    ]);

    session.chatHistory.push({ role: 'assistant', content: raw });
    await session.save();

    res.json({ reply: raw });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.repeat = async (req, res) => {
  try {
    const { sessionId, language } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });

    const session = await LearningSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Learning session not found' });

    session.chatHistory.push({ role: 'user', content: 'I did not understand. Please explain this topic again from the beginning with simpler words and a different example.' });

    const raw = await callOpenRouter([
      { role: 'system', content: languagePrompt(language) },
      ...session.chatHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
    ]);

    session.chatHistory.push({ role: 'assistant', content: raw });
    await session.save();

    res.json({ reply: raw });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.hint = async (req, res) => {
  try {
    const { sessionId, language } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });

    const session = await LearningSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Learning session not found' });

    session.chatHistory.push({ role: 'user', content: 'Give me a hint or a clue to help me figure out the answer myself.' });

    const raw = await callOpenRouter([
      { role: 'system', content: languagePrompt(language) },
      ...session.chatHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
    ]);

    session.chatHistory.push({ role: 'assistant', content: raw });
    await session.save();

    res.json({ reply: raw });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
