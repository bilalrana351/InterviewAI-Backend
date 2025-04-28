// src/services/judge0.service.ts
import axios from 'axios';

interface EvaluateRequest {
  code: string;
  language: string;
  input: string;
}

export async function evaluateCodeUsingJudge0({ code, language, input }: EvaluateRequest) {
  // Map your language to Judge0 language_id
  const languageId = mapLanguageToJudge0Id(language);

  // Submit code to Judge0
  const submission = await axios.post('https://judge0.p.rapidapi.com/submissions', {
    source_code: code,
    language_id: languageId,
    stdin: input,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'judge0.p.rapidapi.com'
    }
  });

  const token = submission.data.token;

  // Polling the result (simplified)
  let result;
  for (let i = 0; i < 10; i++) { // Retry for 10 times max
    const { data } = await axios.get(`https://judge0.p.rapidapi.com/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'judge0.p.rapidapi.com'
      }
    });

    if (data.status.id <= 2) {
      // In Queue or Processing
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    result = data;
    break;
  }

  return result;
}

// Helper to map your internal language to Judge0
function mapLanguageToJudge0Id(language: string): number {
  const map: Record<string, number> = {
    'javascript': 63,
    'python': 71,
    'cpp': 54,
    'java': 62,
    // Add others if needed
  };

  return map[language] || 63; // default to JS
}
