import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import ingestRoutes from './routes/ingest.routes';
import logsRoutes from './routes/logs.routes';
import alertsRoutes from './routes/alerts.routes';
import { startSyslogServer } from './services/syslog.service';
import { startAlertEngine } from './services/alert.service';
import { startRetentionCron } from './services/retention.service';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/alerts', alertsRoutes);

// Start Server
app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
    startSyslogServer();
    startAlertEngine();
    startRetentionCron();
});
