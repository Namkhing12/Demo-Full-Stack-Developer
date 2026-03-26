import { NormalizedLog } from '../types/log.types';
import { prisma } from '../utils/prisma';
import firewallParser from './parsers/firewall.parser';
import networkParser from './parsers/network.parser';
import crowdstrikeParser from './parsers/crowdstrike.parser';
import awsParser from './parsers/aws.parser';
import m365Parser from './parsers/m365.parser';
import adParser from './parsers/ad.parser';

export const normalizeAndStore = async (
    tenant: string,
    source: string,
    rawLog: any,
    originalTimestamp?: string
) => {
    let normalized: Partial<NormalizedLog> = {
        tenant,
        source,
        raw: rawLog,
        timestamp: originalTimestamp ? new Date(originalTimestamp) : new Date(),
        severity: 0
    };

    try {
        switch (source) {
            case 'firewall':
                normalized = { ...normalized, ...firewallParser(rawLog) };
                break;
            case 'net':
            case 'network':
                normalized = { ...normalized, ...networkParser(rawLog) };
                break;
            case 'crowdstrike':
                normalized = { ...normalized, ...crowdstrikeParser(rawLog) };
                break;
            case 'aws':
                normalized = { ...normalized, ...awsParser(rawLog) };
                break;
            case 'm365':
                normalized = { ...normalized, ...m365Parser(rawLog) };
                break;
            case 'ad':
                normalized = { ...normalized, ...adParser(rawLog) };
                break;
            case 'api':
            default:
                // Try parsing JSON if it's a string from Syslog but source is API etc
                const parsedBody = typeof rawLog === 'string' ? { message: rawLog } : rawLog;
                normalized = { ...normalized, ...parsedBody };
                break;
        }

        if (!normalized.timestamp) normalized.timestamp = new Date();
        // PostgreSQL schema requires JSON objects for `raw` rather than plain strings in some setups, but Prisma maps it.
        // Ensure raw is an object or array.
        if (typeof normalized.raw !== 'object') {
            normalized.raw = { message: String(normalized.raw) };
        }

        const created = await prisma.log.create({
            data: normalized as any
        });
        return created;
    } catch (err) {
        console.error(`Error normalizing log for source ${source}:`, err);
        normalized.tags = ['_parse_error'];
        if (typeof normalized.raw !== 'object') {
            normalized.raw = { message: String(normalized.raw) };
        }
        return prisma.log.create({
            data: normalized as any
        });
    }
};
