# AI Quiz Generation Setup Guide

This guide will help you set up Google Gemini AI for automatic quiz generation from video transcripts.

## 🚀 Quick Setup

### Step 1: Get Your Free Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 2: Configure Your Project

1. Open the `.env` file in the project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyC...your-actual-key-here
   ```
3. Save the file

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## 📝 How to Use AI Quiz Generation

### For Instructors:

#### Method 1: Generate Quiz for Entire Course
1. Go to **My Courses** → Select your course
2. Click on **Quiz** tab
3. Click **"Add Quiz"** button
4. Click **"Generate with AI"** button (purple sparkle icon)
5. The system will auto-load transcripts from all video lessons
6. Set number of questions (1-20)
7. Click **"Generate Questions"**
8. Edit generated questions as needed
9. Click **"Save Quiz"**

#### Method 2: Add Video Transcript to Lessons
1. When creating/editing a video lesson
2. Add **Module Number**
3. Upload video or paste URL
4. **Paste the video transcript** in the transcript field
5. This transcript is used for:
   - AI quiz generation
   - Skip-unlock quiz for learners

### For Learners:

#### Skip-Unlock Feature
1. When watching a video lesson
2. The **Forward 10s** button is locked 🔒
3. Click the locked button to take a quiz
4. AI generates 3 questions from the transcript
5. Answer correctly (70% = 2/3 questions)
6. Skip forward unlocked! ✅

## 🎯 Features

### AI Quiz Generation
- ✅ Uses Google Gemini Pro (FREE model)
- ✅ Generates multiple-choice questions
- ✅ 4 options per question
- ✅ Tests comprehension, not just recall
- ✅ Includes explanations for correct answers
- ✅ Edit all questions before saving

### Fallback Mode
If API key is not configured:
- System uses sample questions
- All features still work
- No errors for users
- Console shows warning for instructors

## 🔧 Troubleshooting

### "API key not configured" warning?
- Check your `.env` file
- Make sure the key starts with `AIzaSy`
- Restart the dev server after adding key

### Generation not working?
1. Check browser console for errors
2. Verify API key is valid
3. Check [API quota limits](https://ai.google.dev/pricing)
4. Try with shorter transcript (< 2000 words)

### Quota exceeded?
- Free tier: 60 requests/minute
- If exceeded, system falls back to sample questions
- Wait a minute and try again

## 📚 API Information

**Model Used:** `gemini-pro` (Free)
- Fast response time
- Good quality questions
- Free quota available

**Rate Limits (Free Tier):**
- 60 requests per minute
- Perfect for typical usage

## 🎓 Best Practices

### For Best Quiz Quality:

1. **Provide Clear Transcripts**
   - Include key concepts
   - Use proper punctuation
   - Keep it focused (500-2000 words ideal)

2. **Review Generated Questions**
   - AI is smart but not perfect
   - Edit for clarity if needed
   - Adjust difficulty as needed

3. **Test Your Quizzes**
   - Take them yourself first
   - Ensure questions make sense
   - Verify correct answers are marked

## 🔐 Security

- ✅ API key stored in `.env` (not committed to Git)
- ✅ Key only accessible server-side
- ✅ `.gitignore` includes `.env` file
- ✅ `.env.example` provided for team members

## 📞 Support

**Need Help?**
- Check console logs for detailed errors
- Verify API key format
- Test with shorter transcripts first
- System works without API (fallback mode)

---

**Note:** The `.env` file is already in `.gitignore` and will not be committed to your repository. Share the `.env.example` file with your team instead.
