import { NormalizedLog } from '../../types/log.types';

export default function awsParser(raw: any): Partial<NormalizedLog> {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result: Partial<NormalizedLog> = {
        vendor: 'AWS',
        product: 'CloudTrail',
        event_type: data.eventName,
        user: data.userIdentity?.arn || data.userIdentity?.userName,
        src_ip: data.sourceIPAddress,
        action: data.eventName,
        cloud: {
            account_id: data.recipientAccountId,
            region: data.awsRegion,
            service: data.eventSource
        }
    };

    if (data.eventTime) {
        result.timestamp = new Date(data.eventTime);
    }

    // Determine severity based on common events
    if (data.eventName?.includes('Delete') || data.eventName?.includes('Stop')) {
        result.severity = 6;
    } else if (data.errorCode) {
        result.severity = 8;
    } else {
        result.severity = 2;
    }

    return result;
}
