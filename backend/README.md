# Optional Webify AI backend

The React app is intentionally safe to run without an AI key. For production AI generation, add a server-side API here.

Recommended endpoints:

POST /api/analyze
- input: { "idea": "..." }
- output: { "businessType": "...", "questions": [...] }

POST /api/generate
- input: { "idea": "...", "answers": {...} }
- output: { "sitePlan": {...} }

Keep all OpenAI/Groq/Gemini keys on the server, never in the React Vite bundle.
