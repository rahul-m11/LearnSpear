// Test script to verify Gemini API key works
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load .env file manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

try {
  const envContent = readFileSync(envPath, 'utf8');
  const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
  const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim().replace(/['"]/g, '') : null;

  console.log('🔍 Testing Gemini API Key...\n');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}` : 'NOT FOUND');
  console.log('');

  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    console.error('❌ ERROR: API key not configured properly in .env file');
    console.log('\n📝 Please add your API key to .env file:');
    console.log('   VITE_GEMINI_API_KEY=your_actual_api_key_here');
    console.log('\n🔗 Get your free key at: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  console.log('⏳ Listing available models...\n');
  
  // Try to list available models
  try {
    const models = await genAI.listModels();
    console.log('📋 Available models:');
    for await (const model of models) {
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`   • ${model.name}`);
      }
    }
    console.log('');
  } catch (e) {
    console.log('   (Could not list models, trying default...)\n');
  }
  
  // Try different model names
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  let model = null;
  let successfulModel = null;
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Trying model: ${modelName}...`);
      model = genAI.getGenerativeModel({ model: modelName });
      
      // Test with a simple prompt
      const testResult = await model.generateContent('Say hello in one word');
      await testResult.response;
      
      successfulModel = modelName;
      console.log(`✅ Success with model: ${modelName}\n`);
      break;
    } catch (e) {
      console.log(`   ❌ ${modelName} failed: ${e.message.split('\n')[0]}`);
    }
  }
  
  if (!successfulModel) {
    throw new Error('No working model found. Please check your API key and internet connection.');
  }

  console.log('⏳ Sending test request to generate quiz questions...\n');

  // Test with a simple prompt
  const prompt = `Generate 2 simple quiz questions about JavaScript basics in JSON format:
[
  {
    "text": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0
  }
]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('✅ SUCCESS! Gemini API is working correctly!\n');
  console.log('📊 Sample Response:');
  console.log('─'.repeat(60));
  console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
  console.log('─'.repeat(60));
  console.log('\n✨ Your API key is valid and ready to use!');
  console.log('🚀 You can now generate AI-powered quizzes in the application.');
  console.log('\n💡 Next steps:');
  console.log('   1. Restart your dev server: npm run dev');
  console.log('   2. Go to My Courses → Create/Edit Course');
  console.log('   3. Click Quiz tab → Generate with AI');
  console.log('   4. Watch the magic happen! ✨');

} catch (error) {
  console.error('\n❌ ERROR: API test failed\n');
  
  if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
    console.error('🔑 Your API key appears to be invalid.');
    console.log('\n📝 Please verify:');
    console.log('   1. Go to https://makersuite.google.com/app/apikey');
    console.log('   2. Create a new API key');
    console.log('   3. Update your .env file with the correct key');
  } else if (error.message.includes('quota') || error.message.includes('429')) {
    console.error('📊 API quota exceeded.');
    console.log('\n⏰ Free tier limits:');
    console.log('   • 60 requests per minute');
    console.log('   • Please wait a minute and try again');
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
    console.error('🌐 Network connection error.');
    console.log('\n📡 Please check:');
    console.log('   • Your internet connection');
    console.log('   • Firewall settings');
    console.log('   • Proxy configuration');
  } else {
    console.error('Error details:', error.message);
  }
  
  console.log('\n🔧 Troubleshooting:');
  console.log('   • Check your .env file format');
  console.log('   • Ensure no extra quotes or spaces');
  console.log('   • Verify API key is active in Google AI Studio');
  
  process.exit(1);
}
