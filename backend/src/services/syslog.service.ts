import dgram from 'dgram';
import net from 'net';
import { logger } from '../utils/logger';
import { normalizeAndStore } from './normalizer.service';

const UDP_PORT = 514;
const TCP_PORT = 514;

export const startSyslogServer = () => {
    // UDP Server
    const udpServer = dgram.createSocket('udp4');

    udpServer.on('message', async (msg, rinfo) => {
        const message = msg.toString('utf-8');
        logger.debug(`[Syslog UDP] Received from ${rinfo.address}: ${message}`);
        // Defaulting tenant and source for raw syslog listener
        await normalizeAndStore('demoA', 'firewall', message);
    });

    udpServer.on('listening', () => {
        logger.info(`Syslog UDP Server listening on port ${UDP_PORT}`);
    });

    udpServer.bind(UDP_PORT);


    // TCP Server
    const tcpServer = net.createServer((socket) => {
        socket.on('data', async (data) => {
            const message = data.toString('utf-8');
            logger.debug(`[Syslog TCP] Received from ${socket.remoteAddress}: ${message}`);
            await normalizeAndStore('demoA', 'network', message);
        });
    });

    tcpServer.listen(TCP_PORT, () => {
        logger.info(`Syslog TCP Server listening on port ${TCP_PORT}`);
    });
};
