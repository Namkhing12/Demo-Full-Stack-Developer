import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

// GET /api/logs
router.get('/', requireAuth, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { tenantFilter } = req.query as any;
        const tenant = authReq.user!.role === 'ADMIN' && tenantFilter ? tenantFilter : authReq.user!.tenant;

        const { q, source, severity, from, to, page = '1', pageSize = '50' } = req.query;

        const where: any = { tenant };

        if (source) where.source = String(source);
        if (severity) where.severity = { gte: parseInt(String(severity), 10) };
        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp.gte = new Date(String(from));
            if (to) where.timestamp.lte = new Date(String(to));
        }
        if (q) {
            where.OR = [
                { event_type: { contains: String(q), mode: 'insensitive' } },
                { action: { contains: String(q), mode: 'insensitive' } },
            ];
        }

        const skip = (parseInt(String(page), 10) - 1) * parseInt(String(pageSize), 10);
        const take = parseInt(String(pageSize), 10);

        const [logs, total] = await Promise.all([
            prisma.log.findMany({ where, skip, take, orderBy: { timestamp: 'desc' } }),
            prisma.log.count({ where })
        ]);

        res.json({ data: logs, total, page: parseInt(String(page), 10), pageSize: take });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// GET /api/logs/stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { tenantFilter } = req.query as any;
        const tenant = authReq.user!.role === 'ADMIN' && tenantFilter ? tenantFilter : authReq.user!.tenant;

        const { from, to } = req.query;

        const where: any = { tenant };
        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp.gte = new Date(String(from));
            if (to) where.timestamp.lte = new Date(String(to));
        }

        const topIps = await prisma.log.groupBy({
            by: ['src_ip'],
            where: { ...where, src_ip: { not: null } },
            _count: { src_ip: true },
            orderBy: { _count: { src_ip: 'desc' } },
            take: 10
        });

        const topUsers = await prisma.log.groupBy({
            by: ['user'],
            where: { ...where, user: { not: null } },
            _count: { user: true },
            orderBy: { _count: { user: 'desc' } },
            take: 10
        });

        const topEvents = await prisma.log.groupBy({
            by: ['event_type'],
            where: { ...where, event_type: { not: null } },
            _count: { event_type: true },
            orderBy: { _count: { event_type: 'desc' } },
            take: 10
        });

        res.json({ topIps, topUsers, topEvents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
