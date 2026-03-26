import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, role, tenant } = req.body;

        if (!email || !password || !tenant) {
            return res.status(400).json({ error: 'Email, password, and tenant are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const userRole = role === 'ADMIN' ? 'ADMIN' : 'VIEWER';

        const user = await prisma.user.create({
            data: {
                email,
                password_hash,
                role: userRole,
                tenant
            }
        });

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, email: user.email, role: user.role, tenant: user.tenant }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = signToken(
            { userId: user.id, role: user.role, tenant: user.tenant },
            '15m'
        );
        const refreshToken = signToken(
            { userId: user.id, role: user.role, tenant: user.tenant },
            '7d'
        );

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenant: user.tenant
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
