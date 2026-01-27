# AI Interview Platform

A full-stack AI-powered interview practice platform built with Next.js, Supabase, Vapi.ai, and Google Gemini.

## Features

- 🎙️ **Voice-Based Interviews** - Practice with realistic AI voice agent
- 🧠 **AI-Powered Questions** - Dynamic question generation based on role and difficulty
- 📊 **Detailed Feedback** - Get comprehensive performance analysis
- 📈 **Progress Tracking** - View interview history and track improvement
- 🔐 **Secure Authentication** - User accounts with Supabase Auth

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Voice Agent**: Vapi.ai
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account
- A Vapi.ai account
- A Google AI Studio account (for Gemini API)

## Quick Start

### 1. Clone and Install

```bash
cd ai-interview-platform
npm install
```

### 2. Set Up Environment Variables

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Then fill in your credentials in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vapi.ai
VAPI_API_KEY=your_vapi_private_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Interviews table
CREATE TABLE interviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Interview Configuration
    role VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    current_role VARCHAR(255),
    num_questions INTEGER NOT NULL,
    
    -- Interview Data
    questions JSONB NOT NULL,
    answers JSONB NOT NULL,
    
    -- Results
    overall_score INTEGER,
    feedback TEXT,
    strengths TEXT[],
    improvements TEXT[],
    
    -- Metadata
    duration_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    vapi_call_id VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_created_at ON interviews(created_at DESC);

-- Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interviews"
    ON interviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews"
    ON interviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
    ON interviews FOR UPDATE
    USING (auth.uid() = user_id);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Detailed Setup Guides

### Setting Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API**
3. Copy your **Project URL** and **anon/public key**
4. Copy your **service_role key** (keep this secret!)
5. Add these to your `.env.local` file

### Setting Up Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Get API Key**
3. Create a new API key
4. Add it to `.env.local` as `GEMINI_API_KEY`

**Note**: Gemini has a free tier with generous limits!

### Setting Up Vapi.ai

See the comprehensive Vapi.ai setup guide in `VAPI_SETUP.md`

## Project Structure

```
ai-interview-platform/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/         # Protected pages
│   │   ├── home/
│   │   └── interview/
│   ├── api/                 # API routes
│   │   ├── vapi/
│   │   └── interviews/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── interview/
│   └── ui/
├── lib/
│   ├── supabase/
│   ├── gemini/
│   └── vapi/
└── types/
```

## Usage

1. **Sign Up**: Create an account
2. **Start Interview**: Click "Start Interview" button
3. **Click Call Button**: Begin voice conversation with AI
4. **Answer Questions**: The AI will ask about:
   - Target role
   - Interview type (technical/behavioral/mixed)
   - Difficulty level
   - Number of questions
5. **Complete Interview**: Answer all questions
6. **View Feedback**: Get detailed performance analysis
7. **Track Progress**: See your interview history on the home page

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables
5. Deploy!

**Important**: Update `NEXT_PUBLIC_APP_URL` to your Vercel URL after deployment.

### Update Vapi Webhook

After deployment, update your Vapi.ai webhook URL:
1. Go to Vapi dashboard
2. Update webhook to: `https://your-domain.vercel.app/api/vapi/webhook`

## Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `VAPI_API_KEY` | Vapi private API key | Vapi Dashboard → API Keys |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Vapi public key | Vapi Dashboard → API Keys |
| `GEMINI_API_KEY` | Google Gemini API key | Google AI Studio |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` (dev) or your Vercel URL |

## Troubleshooting

### "Vapi SDK not loaded"
- Check that your `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set correctly
- Ensure you have internet connection (SDK loads from CDN)

### "Unauthorized" errors
- Check Supabase credentials in `.env.local`
- Verify Row Level Security policies are set up correctly

### Questions not generating
- Verify `GEMINI_API_KEY` is correct
- Check API quota hasn't been exceeded
- Check browser console for errors

### Webhook not working
- Ensure webhook URL is set in Vapi dashboard
- Check that URL is publicly accessible (use ngrok for local dev)
- Verify `NEXT_PUBLIC_APP_URL` is correct

## Cost Estimates

- **Supabase**: Free tier (up to 500MB database)
- **Vapi.ai**: ~$0.10 per minute (100 minutes free trial)
- **Google Gemini**: Free tier (15 requests/minute)
- **Vercel**: Free tier (100GB bandwidth)

**Estimated cost for 100 interviews**: $10-20/month

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the setup guides
3. Open an issue on GitHub

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Vapi.ai](https://vapi.ai)
- AI by [Google Gemini](https://ai.google.dev/)
- Database by [Supabase](https://supabase.com)
