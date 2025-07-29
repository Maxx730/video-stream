import express, { Request, Response } from 'express';
import cors from 'cors';

interface Viewer {
    ip: string,
    lastPing: Date
}

interface ViewerCount {
    viewerCount: number
}

const app = express();
app.use(express.json());
app.use(cors());
const port = 2276;
const pruneInterval = 5000;
const pruneTimeoutMinutes = 5.0;
let connected: Array<Viewer> = [];

app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.get('/viewers', (req: Request<{}, {}, ViewerCount>, res: Response) => {
    const ip: string | undefined = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;
    if (ip) {
        const findVal = (viewer: Viewer) => viewer.ip === ip;
        if (connected.find(findVal)) {
            const found = connected[connected.findIndex(findVal)];
            found.lastPing = new Date();
        } else {
            connected.push({
                ip,
                lastPing: new Date()
            });
        }
    }
    res.json({
        viewerCount: connected.length
    });
});
setInterval(() => {
    connected = connected.filter((viewer: Viewer) => {
        const sinceLast = new Date().getTime() - viewer.lastPing.getTime();
        const seconds = sinceLast / 1000;
        const minutes = seconds / 60;
        return minutes < pruneTimeoutMinutes;
    });
}, pruneInterval);
app.get('/debug', (req: Request, res: Response) => {
    res.json({
        viewers: connected,
        viewCount: connected.length
    });
});
app.listen(port, () => {});
