const fs = require('fs');
const http = require('http');
const path = require('path');
const websocket = require('ws');
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SS' }),
        winston.format.printf(info => `[${info.timestamp}] [${info.level}] - ${info.message}`)
    ),
    transports: [new winston.transports.Console()]
});

// count times
let receivedTimes = 0;

// Preparing frames...
const picDir = process.env.PICDIR || 'pic';
const page = fs.readFileSync('index.html').toString();
const frames = fs.readdirSync(picDir)
    .sort()
    .filter(f => f.endsWith('.txt'))
    .map(f => fs.readFileSync(path.join(picDir, f)).toString());

if (frames.length === 0) {
    logger.erorr('No pictures. Exit.');
    process.exit(1);
}

const getIp = (req) => {
    let ip = req.connection.remoteAddress;

    if (req.headers['x-real-ip']) {
        ip = req.headers['x-real-ip'];
    } else if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(/,/)[0].trim();
    }

    return ip;
};

// +1s...
const collectTime = () => {
    receivedTimes++;
    if (receivedTimes % 3600 === 0) {
        logger.info(`Received 1 hours. Now it's ${receivedTimes} seconds.`);
    }
};

const plus1s = (req, res) => {
    let userAgent = req.headers['user-agent'];
    if (typeof userAgent !== 'string') {
        userAgent = '';
    }

    if (userAgent.includes('curl')) {
        // get ip
        let ip = getIp(req);
        logger.info(`Received 1 second from ${ip}`);

        collectTime();

        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'X-Content-Type-Options': 'nosniff'
        });

        let i = 1;
        let loop = 0;
        const io = setInterval(function () {
            res.write(frames[i]);
            res.write('\033[2J\033[H');

            i++;
            if (i === frames.length) {
                i = 0;
                loop++;
            }
            if (loop === 20) {
                res.end("\nYou've contributed too much time, so you're contributed too.\n");
                logger.warn(`Oops! ${ip}'s life is contributed!`);
                clearInterval(io);
            }
        }, 100);

    } else {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'X-Content-Type-Options': 'nosniff'
        });
        res.end(page);
    }
};

const server = http.createServer((req, res) => {
    if (req.url === '/times') {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
        });
        res.end(`${receivedTimes}`);
    } else if (req.url.indexOf('favicon.ico') > -1) {
        res.end();
    } else {
        plus1s(req, res);
    }
});

const wss = new websocket.Server({
    server: server
});

wss.on('connection', (ws, req) => {
    let ip = getIp(req);
    logger.info(`Received 1 second from ${ip}`);
    collectTime();

    ws.send(JSON.stringify({
        length: frames.length
    }));

    ws.on('message', (message) => {
        if (message === 'plus1s') {
            for (let i = 0; i < frames.length; i++) {
                ws.send(JSON.stringify({
                    i: i,
                    data: frames[i]
                }));
            }
        } else if (message === 'nomoreseconds') {
            const ip = getIp(req);
            logger.warn(`Oops! ${ip}'s life is contributed!`);
        }
    });
});

const port = process.env.PORT || 1926;

server.listen(port, () => {
    logger.info(`http/ws server listening on 0.0.0.0:${port}`);
}).on('error', logger.error);

