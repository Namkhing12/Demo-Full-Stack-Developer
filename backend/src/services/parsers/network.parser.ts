import { NormalizedLog } from '../../types/log.types';

export default function networkParser(raw: string | any): Partial<NormalizedLog> {
    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    const result: Partial<NormalizedLog> = {
        event_type: 'network_event'
    };

    // Simple key=value parser similar to firewall
    const kvPairs = message.match(/(\w+)=([^ ]+)/g);
    if (kvPairs) {
        kvPairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key === 'user') result.user = value;
            if (key === 'src') result.src_ip = value;
        });
    }

    if (message.includes('down') || message.includes('error')) {
        result.severity = 8;
    } else {
        result.severity = 2;
    }

    return result;
}
