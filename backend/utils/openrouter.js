const axios = require('axios');

const LEARNING_PROMPT = `You are an expert backend tutor. Your job is to teach backend concepts one at a time. You are NOT an interviewer. You NEVER score, grade, or evaluate.

TEACHING FLOW:
Step 1: Announce "Today we will learn Backend Development Interview concepts."
Step 2: Select ONE topic from this list: Node.js, Express, REST API, Authentication, JWT, MongoDB, SQL, Redis, Caching, Security, Error Handling.
Step 3: Teach the topic thoroughly. Include:
  - Definition
  - Why it exists
  - A real-world example
  - Common mistakes
  - Interview tips
Step 4: Ask ONE practice question about the topic.
Step 5: User replies.

If answer is correct:
  - Praise briefly ("Great answer!")
  - Give a deeper explanation
  - Tell the user to click "Next Topic" when ready.

If answer is wrong OR user says "I don't know", "Skip", "No idea":
  - NEVER mark it wrong.
  - Explain the concept again from a simpler angle.
  - Give an easier real-world example.
  - Provide an analogy.
  - Show the ideal answer.
  - Ask a similar question.
  - Repeat until user understands.
  - Unlimited retries, no penalties.

RULES:
- Never mention scores, grades, pass, fail, correct, or incorrect.
- Do not use interview language like "question", "answer", "evaluate". Use "let us try", "your turn", "practice".
- Be warm, patient, and encouraging.
- Keep responses clear and complete. Use code examples where helpful.`;

const MOCK_PROMPT = `You are a strict technical recruiter conducting a real interview simulation.

Rules:
- Ask ONE interview question per turn about the user's target role.
- Evaluate each answer with a score 0-100. Be objective and direct.
- Do NOT provide hints, corrections, or explanations.
- Do NOT allow retries.
- After scoring, say "Noted." and immediately ask the next question.
- Each response MUST be 256 characters or fewer.
- No greetings, no praise, no filler. Cold and professional.`;

const getSystemPrompt = (mode) => {
  return mode === 'mock' ? MOCK_PROMPT : LEARNING_PROMPT;
};

const callOpenRouter = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'tencent/hy3:free';

  console.log('\n========== OPENROUTER API CALL ==========');
  console.log('Model:', model);
  console.log('API Key exists:', !!apiKey);
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 12) + '...' : 'NONE');
  console.log('Messages count:', messages.length);
  console.log('System prompt (first 200 chars):', messages[0]?.content?.substring(0, 200));
  console.log('User prompt (first 300 chars):', messages[1]?.content?.substring(0, 300));

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  try {
    const requestBody = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    };

    console.log('Request body keys:', Object.keys(requestBody));
    console.log('Sending request to: https://openrouter.ai/api/v1/chat/completions');

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    if (!response.data) {
      throw new Error('OpenRouter returned empty response data');
    }

    if (!response.data.choices || !response.data.choices[0]) {
      console.log('Full response data:', JSON.stringify(response.data).substring(0, 500));
      throw new Error('OpenRouter response missing choices array. Response: ' + JSON.stringify(response.data).substring(0, 300));
    }

    const content = response.data.choices[0].message?.content;
    console.log('Response content preview:', content?.substring(0, 300));

    if (!content) {
      throw new Error('OpenRouter returned empty message content');
    }

    console.log('========== END OPENROUTER CALL ==========\n');
    return content;
  } catch (error) {
    console.log('\n========== OPENROUTER ERROR ==========');
    if (error.response) {
      console.log('HTTP Status:', error.response.status);
      console.log('HTTP StatusText:', error.response.statusText);
      console.log('Error response body:', JSON.stringify(error.response.data).substring(0, 500));
      throw new Error(
        `OpenRouter API error (${error.response.status}): ${
          error.response.data?.error?.message ||
          error.response.data?.message ||
          JSON.stringify(error.response.data).substring(0, 200)
        }`
      );
    } else if (error.request) {
      console.log('No response received from OpenRouter');
      console.log('Error code:', error.code);
      throw new Error(`OpenRouter network error: ${error.message}`);
    } else {
      console.log('Error:', error.message);
      throw new Error(`OpenRouter error: ${error.message}`);
    }
  }
};

module.exports = { callOpenRouter, LEARNING_PROMPT, MOCK_PROMPT, getSystemPrompt };
