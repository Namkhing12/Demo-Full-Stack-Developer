import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin sees all, Viewer sees only their tenant
    // For queries, we can attach a tenant filter to the request
    req.query.tenantFilter = req.user.role === 'ADMIN' ? undefined : req.user.tenant;

    next();
};
