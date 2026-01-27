import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash' 
});

// Generate interview questions
export async function generateInterviewQuestions(params: {
  role: string;
  interviewType: string;
  difficulty: string;
  currentRole?: string;
  numQuestions: number;
}) {
  const { role, interviewType, difficulty, currentRole, numQuestions } = params;

  const prompt = `You are an expert technical interviewer. Generate ${numQuestions} ${difficulty} difficulty ${interviewType} interview questions for a ${role} position.

${currentRole ? `The candidate's current role is: ${currentRole}` : ''}

Requirements:
1. Questions should be realistic and practical
2. Mix different types (coding, system design, behavioral) based on interview type
3. Each question should be clear and specific
4. Difficulty should be appropriate for ${difficulty} level

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "question text here",
    "type": "technical|behavioral|coding|system_design",
    "expectedAnswer": "brief key points to look for in the answer",
    "followUp": "optional follow-up question"
  }
]

Do not include any markdown formatting, just the raw JSON array.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response (remove markdown if present)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const questions = JSON.parse(cleanedText);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate interview questions');
  }
}

// Evaluate interview performance
export async function evaluateInterview(params: {
  role: string;
  questions: Array<{ question: string; type: string }>;
  answers: Array<{ question: string; answer: string; duration: number }>;
}) {
  const { role, questions, answers } = params;

  const prompt = `You are an expert interviewer evaluating a ${role} interview.

Interview Questions and Answers:
${answers.map((a, i) => `
Q${i + 1}: ${a.question}
A${i + 1}: ${a.answer}
`).join('\n')}

Provide a comprehensive evaluation with:

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": 75,
  "feedback": "detailed overall feedback paragraph",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "questionScores": [
    {
      "question": "question text",
      "score": 80,
      "feedback": "specific feedback for this question"
    }
  ]
}

Score each question out of 100. Be constructive and specific.
Do not include any markdown formatting, just the raw JSON.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const evaluation = JSON.parse(cleanedText);
    return evaluation;
  } catch (error) {
    console.error('Error evaluating interview:', error);
    throw new Error('Failed to evaluate interview');
  }
}
