import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Loads backend/.env locally. Railway supplies the same values through its
// environment, and existing environment variables are not overwritten.
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const MAX_MESSAGE_LENGTH = 500;
const ALLOWED_ORIGINS = new Set([
  'https://www.gallop.sg',
  'https://gallop.sg',
  'https://vivienne1303.github.io'
]);
const LOCALHOST_ORIGIN = /^https?:\/\/localhost(?::\d+)?$/;

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
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
}));
app.use(express.json({ limit: '2kb', strict: true }));

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
      max_output_tokens: 350
    });

    const reply = response.output_text?.trim();
    if (!reply) {
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
