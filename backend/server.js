import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Loads backend/.env locally. Railway supplies the same values through its
// environment, and existing environment variables are not overwritten.
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const MAX_MESSAGE_LENGTH = 500;
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const GITHUB_REPO = process.env.GITHUB_REPO || 'vivienne1303/Gallop.sg';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const ALLOWED_ORIGINS = new Set([
  'https://www.gallop.sg',
  'https://gallop.sg',
  'https://vivienne1303.github.io'
]);
const LOCALHOST_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

const knowledgeUrl = new URL('./knowledge.json', import.meta.url);
const knowledge = JSON.parse(await readFile(knowledgeUrl, 'utf8'));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const app = express();

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include health checks and server-to-server calls.
    if (!origin || ALLOWED_ORIGINS.has(origin) || LOCALHOST_ORIGIN.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
app.use(express.json({ limit: '15mb', strict: true }));

const loginAttempts = new Map();

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.GITHUB_TOKEN);
}

function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS,
    nonce: randomBytes(12).toString('hex')
  })).toString('base64url');
  const signature = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  if (!process.env.ADMIN_SESSION_SECRET || typeof token !== 'string') return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(data.exp) && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Your session expired. Please sign in again.' });
  next();
}

function validSiteContent(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && value.about && typeof value.about === 'object'
    && value.contact && typeof value.contact === 'object'
    && Array.isArray(value.faqs) && Array.isArray(value.locations)
    && Array.isArray(value.lesson_prices) && Array.isArray(value.pages)
    && Array.isArray(value.galleries);
}

function githubUrl(path) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodedPath}`;
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`${githubUrl(path)}${options.query || ''}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Gallop-SG-Website-Editor',
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `GitHub returned ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function putGithubFile(path, base64, message) {
  let sha;
  try {
    sha = (await githubRequest(path, { query: `?ref=${encodeURIComponent(GITHUB_BRANCH)}` })).sha;
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  return githubRequest(path, {
    method: 'PUT',
    body: { message, content: base64, branch: GITHUB_BRANCH, ...(sha ? { sha } : {}) }
  });
}

const SYSTEM_PROMPT = `You are Gallop AI, the official website assistant for Gallop Stable Singapore.

Rules:
- Only answer questions related to Gallop Stable, its website, riding lessons, promotions, FAQs, camps, joining the team, and contact information.
- If a question is unrelated, politely say you can only help with Gallop Stable topics.
- Treat the supplied KNOWLEDGE as the only source of factual Gallop Stable information.
- Never invent or infer prices, schedules, availability, promotions, policies, or contact details.
- If the knowledge does not confidently answer the question, politely recommend contacting Gallop Stable.
- Help users navigate by sharing relevant full website links found in the knowledge.
- Be friendly and concise. Keep every answer under 150 words.
- Use simple Markdown when useful.`;

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Gallop AI'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.post('/api/admin/login', (req, res) => {
  if (!adminConfigured()) {
    console.error('Admin login rejected: required admin environment variables are missing.');
    return res.status(503).json({ error: 'The website editor has not been configured yet.' });
  }

  const address = req.ip || 'unknown';
  const attempt = loginAttempts.get(address) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  if (Date.now() > attempt.resetAt) {
    attempt.count = 0;
    attempt.resetAt = Date.now() + 15 * 60 * 1000;
  }
  if (attempt.count >= 8) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Please wait 15 minutes.' });
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!safeEqual(password, process.env.ADMIN_PASSWORD)) {
    attempt.count += 1;
    loginAttempts.set(address, attempt);
    return res.status(401).json({ error: 'The staff password is incorrect.' });
  }

  loginAttempts.delete(address);
  return res.status(200).json({ token: createAdminToken(), expiresIn: ADMIN_SESSION_SECONDS });
});

app.get('/api/admin/session', requireAdmin, (_req, res) => {
  res.status(200).json({ authenticated: true });
});

app.get('/api/admin/content', requireAdmin, async (_req, res) => {
  try {
    const file = await githubRequest('content/site.json', {
      query: `?ref=${encodeURIComponent(GITHUB_BRANCH)}&t=${Date.now()}`
    });
    const content = JSON.parse(Buffer.from(file.content || '', 'base64').toString('utf8'));
    if (!validSiteContent(content)) throw new Error('GitHub returned invalid website content.');
    res.set('Cache-Control', 'no-store');
    return res.status(200).json(content);
  } catch (error) {
    console.error('Admin content load failed:', { status: error.status, message: error.message });
    return res.status(502).json({ error: 'Could not load the latest website content from GitHub.' });
  }
});

app.post('/api/admin/publish', requireAdmin, async (req, res) => {
  const { content, uploads = [], message } = req.body || {};
  if (!validSiteContent(content)) {
    return res.status(400).json({ error: 'The website content is incomplete or invalid.' });
  }
  if (!Array.isArray(uploads) || uploads.length > 30) {
    return res.status(400).json({ error: 'A maximum of 30 pictures can be published at once.' });
  }

  for (const upload of uploads) {
    if (!upload || typeof upload.path !== 'string' || !/^images\/uploads\/[a-zA-Z0-9._-]+$/.test(upload.path)) {
      return res.status(400).json({ error: 'An uploaded picture has an invalid file name.' });
    }
    if (typeof upload.base64 !== 'string' || Buffer.byteLength(upload.base64, 'base64') > MAX_UPLOAD_BYTES) {
      return res.status(400).json({ error: 'Each uploaded picture must be 5 MB or smaller.' });
    }
  }

  const note = typeof message === 'string' && message.trim()
    ? message.trim().slice(0, 80)
    : 'Update website content';

  try {
    for (const upload of uploads) {
      await putGithubFile(upload.path, upload.base64, `${note} - add picture`);
    }
    const contentBase64 = Buffer.from(`${JSON.stringify(content, null, 2)}\n`, 'utf8').toString('base64');
    const result = await putGithubFile('content/site.json', contentBase64, note);
    return res.status(200).json({
      published: true,
      commit: result.commit?.sha,
      pictures: uploads.length
    });
  } catch (error) {
    console.error('Admin publish failed:', { status: error.status, message: error.message });
    return res.status(502).json({ error: 'Publishing failed. Your changes are still in the editor; please try again.' });
  }
});

app.post('/api/chat', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(413).json({
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`
    });
  }

  if (!openai) {
    console.error('Chat request rejected: OPENAI_API_KEY is not configured.');
    return res.status(503).json({
      error: 'Gallop AI is temporarily unavailable. Please try again shortly.'
    });
  }

  try {
    const response = await openai.responses.create({
      model: MODEL,
      instructions: SYSTEM_PROMPT,
      input: `KNOWLEDGE:\n${JSON.stringify(knowledge)}\n\nUSER QUESTION:\n${message}`,
      // GPT-5 reasoning tokens count toward this budget. A larger allowance
      // prevents short questions from ending before visible text is produced.
      reasoning: { effort: 'low' },
      max_output_tokens: 1000
    });

    const reply = response.output_text?.trim();
    if (!reply) {
      console.error('OpenAI returned no visible text:', {
        status: response.status,
        incompleteDetails: response.incomplete_details
      });
      return res.status(502).json({ error: 'The assistant returned an empty response.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenAI request failed:', {
      name: error?.name,
      status: error?.status,
      message: error?.message
    });

    return res.status(502).json({
      error: 'Gallop AI is temporarily unavailable. Please try again shortly.'
    });
  }
});

// Return JSON for malformed bodies, oversized requests, and CORS failures.
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin is not allowed.' });
  }

  console.error('Unhandled request error:', error?.message);
  return res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gallop AI listening on port ${PORT}`);
});
