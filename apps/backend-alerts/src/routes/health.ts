import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    service: 'backend-alerts'
  });
});

export const healthRouter = router;

