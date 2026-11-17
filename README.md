# Webify Game Lab — React Edition

A complete React/Vite front-end for the animated Webify concept.

## What is included

- Futuristic game-lab UI
- Yellow/orange mascot-inspired visual language
- Sticky navigation that does not overlap anchored sections
- Animated grid, particles, light beams and scanline
- Hero video support through `VITE_HERO_VIDEO_URL`
- Local fallback hero image from the uploaded reference
- Mouse-reactive hero parallax
- Animated mission levels
- Business-aware onboarding fields
- Gallery upload UI
- AI generation simulation with XP progress
- Completion/achievement screen
- Interactive generated-site preview modal
- Responsive mobile layout
- Reduced-motion accessibility fallback

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally:

http://localhost:5173

## Production build

```bash
npm run build
npm run preview
```

## Hero video

Create `.env` from `.env.example`:

```env
VITE_HERO_VIDEO_URL=https://your-licensed-video-url/video.mp4
```

The local reference image is used when no video is configured.

## Connecting your AI backend

The current UI uses a local generation simulation so it works immediately without exposing API keys.

For production:
- Keep provider/API keys on a server.
- Add a backend endpoint such as `POST /api/analyze`.
- Add `POST /api/generate`.
- Return the AI-generated form blueprint and site plan.
- Replace the local `startMission()` / `generate()` logic with API calls.

Do not put OpenAI/Groq/Gemini secret keys into `VITE_*` environment variables.

## Commercial asset note

The included `public/assets/hero-reference.jpg` is the user-provided reference image. Replace it with assets you own or have a commercial license to use before publishing a client/commercial product.
