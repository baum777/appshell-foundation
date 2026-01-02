import { Router } from 'express';
import { streamHub } from '../services/streamHub';
import { env } from '../env';

const router = Router();

router.get('/', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).send('Missing userId');
    return;
  }

  // Auth check
  let token = req.headers.authorization?.split(' ')[1];
  if (!token && req.query.token) {
    token = req.query.token as string;
  }
  
  if (token !== env.API_KEY) {
    res.status(401).send('Unauthorized');
    return;
  }

  // SSE Setup
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // Or configure based on env
  });

  // Since we might have global CORS middleware, Access-Control-Allow-Origin might be duplicated if we add it here.
  // But SSE often needs specific handling. 
  // If we rely on standard CORS middleware, we should not send headers here manually if they conflict.
  // However, writeHead sends headers immediately.
  
  res.write('\n'); // flush
  streamHub.add(userId, res);
});

export const streamRouter = router;

