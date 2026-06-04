import { Router } from 'express';
import { answerQuestion } from '../services/aiOrchestrator.js';

export const aiRouter = Router();

aiRouter.post('/ask', (req, res) => {
  const question = String(req.body?.question ?? '');
  if (!question.trim()) return res.status(400).json({ error: 'question is required' });
  return res.json(answerQuestion(question));
});
