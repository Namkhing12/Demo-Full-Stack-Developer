import { NormalizedLog } from '../../types/log.types';

export default function firewallParser(raw: string | any): Partial<NormalizedLog> {
    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    const result: Partial<NormalizedLog> = {
        event_type: 'firewall_traffic'
    };

    // Example: <134>Mar 17 20:00:00 fw01 action=deny src=10.0.1.10 dst=8.8.8.8 dport=443
    const kvPairs = message.match(/(\w+)=([^ ]+)/g);
    if (kvPairs) {
        kvPairs.forEach(pair => {
            const [key, value] = pair.split('=');
            switch (key.toLowerCase()) {
                case 'action':
                    result.action = value;
                    break;
                case 'src':
                case 'src_ip':
                    result.src_ip = value;
                    break;
                case 'dst':
                case 'dst_ip':
                    result.dst_ip = value;
                    break;
                case 'sport':
                case 'src_port':
                    result.src_port = parseInt(value, 10);
                    break;
                case 'dport':
                case 'dst_port':
                    result.dst_port = parseInt(value, 10);
                    break;
                case 'proto':
                case 'protocol':
                    result.protocol = value;
                    break;
            }
        });
    }

    if (result.action === 'deny' || result.action === 'block') {
        result.severity = 5;
    } else {
        result.severity = 1;
    }

    return result;
}
