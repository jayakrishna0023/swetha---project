# AgriSphere

Farm management for growers: plots and crop calendar, expenses with CSV export, live weather with field advice, an AI crop advisor, leaf disease scanner and assistant, plus a community marketplace and discussions.

Built with React, Vite, Tailwind and Motion. Runs as a static site with serverless functions, so there is no server to manage.

## How it fits together

| Part | Where it runs |
|---|---|
| UI, accounts, farm data | In the browser (`src/`). Accounts and records are stored in the browser's localStorage; passwords are stored as salted PBKDF2 hashes. |
| AI (Groq) | Vercel serverless functions in `api/`. The `GROQ_API_KEY` stays on the server side and is never sent to the browser. |
| Weather | Open-Meteo, called from the browser. No key needed. |

## Run locally

Prerequisite: Node.js 20+

```bash
npm install
cp .env.example .env    # then put your Groq key in .env
npm run dev             # http://localhost:3000
```

`npm run dev` also serves the `api/` functions, so AI works locally exactly as it does on Vercel.

## Deploy to Vercel

1. Push the repo to GitHub. `.env` is git-ignored, so the key is not pushed.
2. In Vercel, **Add New → Project** and import the repo (framework: Vite, detected automatically).
3. Under **Settings → Environment Variables**, add `GROQ_API_KEY` with your key.
4. Deploy. The functions in `api/` are picked up automatically.

Without `GROQ_API_KEY` the AI features still work with sample answers, and the header shows **AI demo**.

## Notes

- Accounts and farm data live in each user's browser, so they don't sync between devices, and the marketplace and discussions are visible only in that browser. For shared, multi-device data, connect a hosted database such as Supabase or Firebase.
- Never put the Groq key in `src/` code: anything there is bundled into public JavaScript.
