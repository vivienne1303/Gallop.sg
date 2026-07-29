# Gallop AI backend

## Local setup

1. Use Node.js 20 or newer.
2. In this `backend` directory, run `npm install`.
3. Set `OPENAI_API_KEY` in your shell or in a local `.env` file. Never commit
   the `.env` file.
4. Run `npm start`.
5. Confirm the service at `http://localhost:3000/health`.

The server uses `gpt-5-mini` by default. You can set `OPENAI_MODEL` in Railway
if a different supported lightweight model is required.

## Deploy to Railway

1. Push this repository to GitHub.
2. In Railway, create a new project and choose **Deploy from GitHub repo**.
3. Set the service **Root Directory** to `/backend`.
4. Add the Railway variable `OPENAI_API_KEY` with the real API key.
5. Railway runs `npm start` from `package.json` and supplies `PORT`
   automatically. Do not create a fixed `PORT` variable.
6. In **Settings → Networking**, generate a public Railway domain.
7. Test `https://YOUR_RAILWAY_DOMAIN/health`; it should return
   `{"status":"ok"}`.

## Connect GitHub Pages

GitHub Pages and Railway are different origins, so `/api/chat` cannot resolve
to Railway until the frontend knows Railway's public domain.

Before `js/script.js` runs, set:

```html
<script>
  window.GALLOP_AI_API_BASE_URL = "http://localhost:3000";
</script>
```

Place this immediately before the existing `js/script.js` script tag on the
Gallop AI page. Alternatively, replace the default value at the top of
`frontend/modified chatbot.js` after Railway has assigned the domain.

The backend already permits the production origins:

- `https://www.gallop.sg`
- `https://gallop.sg`
- `https://vivienne1303.github.io`

Update `knowledge.json` whenever stable facts change, then redeploy the Railway
service. Do not add unconfirmed prices, schedules, or promotions.
