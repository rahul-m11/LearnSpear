// Gemini AI Service for Quiz Generation
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

// Initialize Gemini AI
const initializeGemini = () => {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️ Gemini API key not configured. Please add your API key to .env file.');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Free and fast model
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    return false;
  }
};

/**
 * Generate quiz questions from video transcript using Gemini AI
 * @param {string} transcript - The video transcript text
 * @param {number} numberOfQuestions - Number of questions to generate (default: 5)
 * @returns {Promise<Array>} Array of quiz questions
 */
export const generateQuizFromTranscript = async (transcript, numberOfQuestions = 5) => {
  if (!initializeGemini()) {
    // Return sample questions if API is not configured
    return generateSampleQuestions(numberOfQuestions);
  }

  try {
    const prompt = `
You are an expert educator. Based on the following video transcript, generate ${numberOfQuestions} multiple-choice quiz questions to test comprehension.

TRANSCRIPT:
${transcript}

REQUIREMENTS:
1. Create exactly ${numberOfQuestions} questions
2. Each question should have 4 options (A, B, C, D)
3. Questions should test understanding, not just recall
4. Include the correct answer index (0-3)
5. Questions should be clear and unambiguous

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of correct answer"
  }
]

Do not include any markdown formatting or additional text. Only return the JSON array.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (remove any markdown code blocks if present)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response:', text);
      return generateSampleQuestions(numberOfQuestions);
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    // Add unique IDs to questions
    return questions.map((q, index) => ({
      ...q,
      id: Date.now() + index
    }));
    
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    return generateSampleQuestions(numberOfQuestions);
  }
};

/**
 * Generate quiz questions for skip-unlock feature (shorter, focused on current section)
 * @param {string} transcript - The video transcript text
 * @returns {Promise<Array>} Array of 3 quiz questions
 */
export const generateSkipQuizQuestions = async (transcript) => {
  if (!initializeGemini()) {
    return generateSampleSkipQuestions();
  }

  try {
    const prompt = `
You are an expert educator. Based on this video transcript section, generate 3 quick comprehension questions to verify the learner understood the content.

TRANSCRIPT:
${transcript.substring(0, 1500)} 

REQUIREMENTS:
1. Create exactly 3 questions
2. Each question should have 4 options
3. Questions should test if learner watched and understood this section
4. Keep questions focused and specific to the content
5. Include the correct answer index (0-3)

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Do not include any markdown formatting or additional text. Only return the JSON array.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response:', text);
      return generateSampleSkipQuestions();
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    return questions.map((q, index) => ({
      ...q,
      id: Date.now() + index
    }));
    
  } catch (error) {
    console.error('Error generating skip quiz with Gemini:', error);
    return generateSampleSkipQuestions();
  }
};

/**
 * Fallback: Generate sample questions when API is not available
 */
const generateSampleQuestions = (count = 5) => {
  console.log('📝 Using sample questions (Gemini API not configured)');
  
  const samples = [
    {
      id: Date.now() + 1,
      text: "What is the main topic discussed in this content?",
      options: [
        "Introduction to the subject",
        "Advanced techniques",
        "Practical applications",
        "Historical background"
      ],
      correctAnswer: 0,
      explanation: "The content primarily focuses on introducing the subject matter."
    },
    {
      id: Date.now() + 2,
      text: "Which key concept was explained?",
      options: [
        "Basic principles",
        "Core methodology",
        "Implementation steps",
        "Common mistakes"
      ],
      correctAnswer: 1,
      explanation: "The core methodology was thoroughly explained in the content."
    },
    {
      id: Date.now() + 3,
      text: "What example was provided to illustrate the concept?",
      options: [
        "Real-world case study",
        "Theoretical example",
        "Industry standard",
        "Practical demonstration"
      ],
      correctAnswer: 3,
      explanation: "A practical demonstration was used to illustrate the concept."
    },
    {
      id: Date.now() + 4,
      text: "What is the recommended approach discussed?",
      options: [
        "Trial and error method",
        "Systematic approach",
        "Intuitive method",
        "Random selection"
      ],
      correctAnswer: 1,
      explanation: "A systematic approach was recommended for best results."
    },
    {
      id: Date.now() + 5,
      text: "Which benefit was highlighted?",
      options: [
        "Cost effectiveness",
        "Time efficiency",
        "Better quality outcomes",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "All these benefits were highlighted in the content."
    }
  ];
  
  return samples.slice(0, count);
};

/**
 * Fallback: Generate sample skip questions
 */
const generateSampleSkipQuestions = () => {
  console.log('📝 Using sample skip questions (Gemini API not configured)');
  
  return [
    {
      id: Date.now() + 1,
      text: "Based on the video content, what is the main topic discussed?",
      options: [
        "Introduction to the subject",
        "Advanced techniques",
        "Practical applications",
        "Historical background"
      ],
      correctAnswer: 0
    },
    {
      id: Date.now() + 2,
      text: "What key concept was explained in this section?",
      options: [
        "Basic principles",
        "Core methodology",
        "Implementation steps",
        "Common mistakes"
      ],
      correctAnswer: 1
    },
    {
      id: Date.now() + 3,
      text: "Which example was provided to illustrate the concept?",
      options: [
        "Real-world case study",
        "Theoretical example",
        "Industry standard",
        "Practical demonstration"
      ],
      correctAnswer: 3
    }
  ];
};

export default {
  generateQuizFromTranscript,
  generateSkipQuizQuestions
};
