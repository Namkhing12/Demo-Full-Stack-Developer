import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export const startAlertEngine = () => {
    cron.schedule('* * * * *', async () => {
        logger.debug('[AlertEngine] Starting rule evaluation');
        try {
            const activeRules = await prisma.alertRule.findMany({ where: { active: true } });
            const now = new Date();

            for (const rule of activeRules) {
                const condition: any = rule.condition;
                if (!condition || !condition.window_minutes) continue;

                const windowStart = new Date(now.getTime() - (condition.window_minutes * 60000));

                const logs = await prisma.log.findMany({
                    where: {
                        tenant: rule.tenant,
                        event_type: condition.event_type || undefined,
                        action: condition.action || undefined,
                        timestamp: { gte: windowStart }
                    }
                });

                if (logs.length === 0) continue;

                const groups: Record<string, typeof logs> = {};
                for (const log of logs) {
                    const key = condition.group_by ? (log as any)[condition.group_by] || 'unknown' : 'all';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(log);
                }

                for (const [key, groupLogs] of Object.entries(groups)) {
                    if (groupLogs.length >= (condition.threshold || 1)) {
                        // Check if we already alerted recently to avoid spamming
                        const recentAlert = await prisma.triggeredAlert.findFirst({
                            where: {
                                alert_id: rule.id,
                                created_at: { gte: windowStart }
                            }
                        });

                        if (!recentAlert) {
                            await prisma.triggeredAlert.create({
                                data: {
                                    alert_id: rule.id,
                                    matched_logs: groupLogs,
                                }
                            });
                            logger.warn(`[AlertEngine] Rule "${rule.name}" triggered for ${condition.group_by}=${key} (${groupLogs.length} events)`);
                        }
                    }
                }
            }
        } catch (err) {
            logger.error('Error in alert engine cron', err);
        }
    });

    logger.info('Alert engine cron job started');
};
