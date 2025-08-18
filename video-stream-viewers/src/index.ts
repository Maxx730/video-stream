import express, { Request, Response } from 'express';

type Viewer = {
    ip: string,
    name: string,
    ping: Date,
    channel?: string
};

const app = express();
app.use(express.json());

const port = process.env.PORT || 2277;
const viewers: Array<Viewer> = [];
const pruneTimer: number = 10000;
const pruneTimeout: number = 30000;
const randomNumber = (): number => {
  return Math.floor(1000 + Math.random() * 9000);
}
const viewerExists = (ip: string): boolean => {
    return viewers.findIndex(viewer => viewer.ip === ip) > -1;
}
const getViewer = (ip: string): Viewer => {
    return viewers[viewers.findIndex(viewer => viewer.ip === ip)];
}
const getViewerCount = (key: string): number => {
    const viewersWatching = viewers.map(viewer => viewer.channel && viewer.channel === key);
    return viewersWatching.length;
}
const pruneViewers = () => {
    logEvent('PRUNING VIEWERS');
    viewers.forEach(viewer => {
        const timeChange = new Date().getTime() - viewer.ping.getTime();
        if (timeChange >= pruneTimeout) {
            const viewerId = viewers.indexOf(viewer);
            logEvent(`REMOVING VIEWER - ${viewerId}`);
            viewers.splice(viewerId, 1);
        }
    });
}
const logEvent = (name: string) => {
    console.log(`--- ${name} ---`);
}
const cleanIp = (ip: string): string => {
    return ip.substring(7);
}
const getRequestIp = (req: Request) => {
    const viewerIp: string | undefined = req.ip;
    if (viewerIp) {
        return cleanIp(viewerIp);
    }
    return undefined;
}

app.post('/join', (req: Request, res: Response) => {
    const viewerIp: string | undefined = req.ip;
    if (viewerIp) {
        viewers.push({
            ip: cleanIp(viewerIp),
            name: `User-${randomNumber()}`,
            ping: new Date()
        });
    }
    res.sendStatus(200);
});
app.post('/watch', (req: Request, res: Response) => {
    const viewerIp: string | undefined = req.ip;
    if (viewerIp && req.body && req.body.channel) {
        viewers.forEach(viewer => {
            if (viewer.ip === cleanIp(viewerIp)) {
                logEvent(`UPDATED WATCHED CHANNEL`);
                viewer.channel = req.body.channel;
            }
        });
    }
    res.sendStatus(200);
});
app.post('/update', (req: Request, res: Response) => {
    const ip: string | undefined = getRequestIp(req);
    if (ip && req.body && req.body.name) {
        if (viewerExists(ip)) {
            logEvent(`UPDATED USER - ${ip}`)
            const viewer = getViewer(ip);
            viewer.name = req.body.name;
            if (req.body.channel) {
                viewer.channel = req.body.channel;
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    } else{
        res.sendStatus(400);
    }
});
app.get('/viewers', (req: Request, res: Response) => {
    logEvent('LOADING VIEWERS');
    res.send(JSON.stringify(viewers.map(viewer => {
        return {
            name: viewer.name,
            ping: viewer.ping
        }
    })));
});
app.get('/ping', (req: Request, res: Response) => {
    const viewerIp: string | undefined = req.ip;
    viewers.forEach(viewer => {
        if (viewerIp && viewer.ip === cleanIp(viewerIp)) {
            logEvent(`UPDATING REFRESH - ${viewers.indexOf(viewer)}`)
            viewer.ping = new Date();
        }
    });
    res.sendStatus(200);
});
app.get('/viewcount/:channel', (req: Request, res: Response) => {
    res.json({
        count: getViewerCount(req.params.channel)
    });
});
setInterval(pruneViewers, pruneTimer);
app.listen(port, () => {});