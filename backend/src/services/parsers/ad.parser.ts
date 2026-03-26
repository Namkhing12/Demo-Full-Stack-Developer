import { NormalizedLog } from '../../types/log.types';

export default function adParser(raw: any): Partial<NormalizedLog> {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result: Partial<NormalizedLog> = {
        vendor: 'Microsoft',
        product: 'Active Directory',
        event_type: `EventCode_${data.EventID}`,
        user: data.SubjectUserName || data.TargetUserName,
        host: data.Computer,
        src_ip: data.IpAddress
    };

    if (data.TimeCreated) {
        result.timestamp = new Date(data.TimeCreated);
    }

    // 4624 = Logon, 4625 = Logon Failed, 4720 = User Created
    if (data.EventID === 4625) {
        result.severity = 7;
        result.action = 'login_failed';
    } else if (data.EventID === 4624) {
        result.severity = 1;
        result.action = 'login_success';
    } else if (data.EventID === 4720) {
        result.severity = 5;
        result.action = 'user_created';
    } else {
        result.severity = 3;
        result.action = 'unknown';
    }

    return result;
}
