import { NormalizedLog } from '../../types/log.types';

export default function crowdstrikeParser(raw: any): Partial<NormalizedLog> {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result: Partial<NormalizedLog> = {
        vendor: 'CrowdStrike',
        product: 'Falcon',
        event_type: data.EventType || 'unknown',
        severity: data.Severity || 5,
        user: data.UserName,
        host: data.ComputerName,
        process: data.FileName || data.ProcessName,
        action: data.Action || null
    };

    if (data.Timestamp) {
        result.timestamp = new Date(data.Timestamp);
    }

    return result;
}
