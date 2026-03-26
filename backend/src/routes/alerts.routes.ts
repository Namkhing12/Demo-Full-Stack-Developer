import { Router } from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const tenant = authReq.user!.tenant;

        // Admins see all tenant alerts if no filter, or can manage them.
        // For simplicity, we just filter by the current requesting user's tenant for now.
        const rules = await prisma.alertRule.findMany({ where: { tenant } });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { name, condition, active = true } = req.body;

        const rule = await prisma.alertRule.create({
            data: {
                name,
                condition,
                active,
                tenant: authReq.user!.tenant
            }
        });
        res.status(201).json(rule);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/triggered', requireAuth, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const tenant = authReq.user!.tenant;

        const triggered = await prisma.triggeredAlert.findMany({
            where: { AlertRule: { tenant } },
            include: { AlertRule: true },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        res.json(triggered);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
