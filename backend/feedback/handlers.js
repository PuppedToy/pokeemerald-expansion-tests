/**
 * Feedback submit handler (T-048). HTTP-thin and dependency-injected so it unit-tests without a
 * server. Wiring + the auth gate and per-IP rate limit live in routes.js.
 */

import { FEEDBACK_CATEGORIES } from '../db/feedback.js';

const MAX_MESSAGE = 5000; // cap free text so a single submission can't bloat the DB

export function handleSubmitFeedback({ feedback, now = () => Date.now() }) {
  return (req, res) => {
    const { category = 'feature', message } = req.body ?? {};
    if (!FEEDBACK_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'invalid category' });
    }
    const text = typeof message === 'string' ? message.trim() : '';
    if (!text) return res.status(400).json({ error: 'message required' });
    if (text.length > MAX_MESSAGE) return res.status(400).json({ error: 'message too long' });

    feedback.create({ userId: req.userId, category, message: text, now: now() });
    res.status(201).json({ ok: true });
  };
}
