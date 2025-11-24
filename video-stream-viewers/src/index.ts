import express, { Request, Response } from 'express';
import cors from 'cors';

type Viewer = {
    ip: string,
    name: string,
    ping: Date,
    channel?: string,
    current?: boolean
};

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));


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
    return cleanIp(viewerIp as string);
}
const getRequestViewer = (ip: string) => {
    if (ip) {
        const currentViewer = viewers.find(viewer => viewer.ip === ip) as Viewer;
        return currentViewer;
    }
    return;
}
const listViewers = (isCurrent: boolean) => {
    return JSON.stringify(
        viewers.map(viewer => {
            return {
                name: viewer.name,
                ping: viewer.ping,
                channel: viewer.channel,
                current: isCurrent
            }
        })
    );
}

app.post('/join', (req: Request, res: Response) => {
    try {
        const viewerIp: string | undefined = cleanIp(req.ip as string);
        const isAlreadyViewer = viewers.some(v => v.ip === viewerIp);
        const channelKey: string | undefined = req.body.channel;
        if (viewerIp && !isAlreadyViewer) {
            viewers.push({
                ip: viewerIp,
                name: `User-${randomNumber()}`,
                ping: new Date(),
                channel: channelKey
            });
        }
        res.statusCode = 200;
        res.send(JSON.stringify(viewers));
    } catch (err) {
        res.sendStatus(500);
    }
});



app.post('/watch', async (req: Request, res: Response) => {
    const currentViewer: Viewer = getRequestViewer(
        getRequestIp(req)
    ) as Viewer;
    currentViewer.channel = req.body.channel;
    var userList: String = await listViewers(currentViewer != null)
    res.send(userList);
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
    const currentViewer = getRequestViewer(getRequestIp(req)) as Viewer;
    res.send(listViewers(currentViewer ? true : false));
});
app.get('/ping', (req: Request, res: Response) => {
    const viewerIp: string | undefined = req.ip;
    
    if (viewerIp) {
        const currentViewer = viewers.find(viewer => viewer.ip === cleanIp(viewerIp)) as Viewer;
        if (currentViewer) {
            currentViewer.ping = new Date()
            currentViewer.current = true;
        }
    }
    res.send(JSON.stringify(viewers.map(viewer => {
        return {
            name: viewer.name,
            ping: viewer.ping,
            channel: viewer.channel,
            current: viewer.current
        }
    })));
});
app.get('/viewcount/:channel', (req: Request, res: Response) => {
    res.json({
        count: getViewerCount(req.params.channel)
    });
});
setInterval(pruneViewers, pruneTimer);
app.listen(port, () => {});