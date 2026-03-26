import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export const startRetentionCron = () => {
    cron.schedule('0 2 * * *', async () => {
        logger.info('[Retention] Starting log retention cleanup');
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { count } = await prisma.log.deleteMany({
                where: { timestamp: { lt: sevenDaysAgo } }
            });

            logger.info(`[Retention] Deleted ${count} logs older than 7 days`);
        } catch (err) {
            logger.error('Error in retention cron', err);
        }
    });

    logger.info('Retention cron job started');
};
