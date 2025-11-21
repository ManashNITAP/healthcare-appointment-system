# How to Get a Free Gemini API Key

## Step-by-Step Guide:

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key" button
   - Select "Create API key in new project" (for free tier)
   - Copy the generated API key

3. **Add to .env file**
   - Open `backend/.env`
   - Add or update: `GEMINI_API_KEY=your_api_key_here`

4. **Restart Server**
   - Stop your backend server (Ctrl+C)
   - Start again: `npm run server`

## Free Tier Limits:
- **60 requests per minute**
- **1,500 requests per day**
- **32,000 tokens per minute**

## Troubleshooting:

### If you get "API key invalid":
- Make sure you copied the full key (starts with `AIza...`)
- Check for extra spaces in `.env` file
- Restart the server after adding the key

### If you get "Model not found":
- The API key might not have access to the model
- Try using `gemini-pro` model (free tier)
- Make sure Generative AI API is enabled

### If you get "Quota exceeded":
- You've hit the free tier limit
- Wait for the quota to reset (daily limit resets at midnight PST)
- Consider upgrading to paid tier if needed

## Test Your Setup:
Run: `node test-gemini.js` to verify your API key works.

