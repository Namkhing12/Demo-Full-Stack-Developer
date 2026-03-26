import { NormalizedLog } from '../../types/log.types';

export default function m365Parser(raw: any): Partial<NormalizedLog> {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result: Partial<NormalizedLog> = {
        vendor: 'Microsoft',
        product: data.Workload || 'M365',
        event_type: data.Operation || 'unknown',
        user: data.UserId,
        src_ip: data.ClientIP,
        action: data.Operation,
        status_code: data.ResultStatus === 'Failed' ? 401 : 200
    };

    if (data.CreationTime) {
        result.timestamp = new Date(data.CreationTime);
    }

    if (data.ResultStatus === 'Failed') {
        result.severity = 7;
    } else {
        result.severity = 2;
    }

    return result;
}
