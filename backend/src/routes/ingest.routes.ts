import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { normalizeAndStore } from '../services/normalizer.service';

const router = Router();

// POST /api/ingest
router.post('/', requireAuth, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { tenant, source, '@timestamp': timestamp, ...rest } = req.body;

        const userTenant = authReq.user!.tenant;
        if (authReq.user!.role !== 'ADMIN' && tenant && tenant !== userTenant) {
            return res.status(403).json({ error: 'Forbidden: Cannot ingest logs for different tenant' });
        }

        const payloadTenant = tenant || userTenant;

        if (!source) {
            return res.status(400).json({ error: 'source is required' });
        }

        const log = await normalizeAndStore(payloadTenant, source, rest, timestamp);
        res.status(201).json({ message: 'Log ingested successfully', id: log.id });
    } catch (error) {
        console.error('Ingest error:', error);
        res.status(500).json({ error: 'Failed to ingest log' });
    }
});

// POST /api/ingest/batch
router.post('/batch', requireAuth, async (req, res) => {
    try {
        const logs = req.body;
        if (!Array.isArray(logs)) {
            return res.status(400).json({ error: 'Body must be an array of logs' });
        }

        const authReq = req as AuthRequest;
        const userTenant = authReq.user!.tenant;
        let count = 0;

        for (const logItem of logs) {
            const { tenant, source, '@timestamp': timestamp, ...rest } = logItem;
            const payloadTenant = tenant || userTenant;

            if (authReq.user!.role !== 'ADMIN' && payloadTenant !== userTenant) continue;
            if (!source) continue;

            await normalizeAndStore(payloadTenant, source, rest, timestamp);
            count++;
        }

        res.status(201).json({ message: 'Batch ingested successfully', count });
    } catch (error) {
        console.error('Batch ingest error:', error);
        res.status(500).json({ error: 'Failed to ingest batch logs' });
    }
});

export default router;
