import express, { Request, Response } from 'express';
import cors from 'cors';

interface Channel {
    key: string,
    title: string,
    desc: string,
    viewers: Array<Viewer>
    path: string,
    started: Date
}

interface Viewer {
    ip: string,
    lastPing: Date,
    channel?: number
}

interface ViewerCount {
    viewerCount: number
}

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const port = 2276;
const PRUNE_INTERVAL = 5000;
const pruneTimeoutMinutes = 5.0;

// persisted data
const  viewers: Array<Viewer> = [];
const channels: Array<Channel> = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));

const logEvent = (name: string) => {
    console.log(`--- ${name} ---`);
}
const viewerExists = (ip: string): boolean => {
    const viewerId: number = viewers.findIndex((viewer: Viewer) => viewer.ip === ip);
    return viewerId != -1;
}
const getViewer = (ip: string): Viewer | undefined => {
    return viewers.find((viewer: Viewer) => viewer.ip === ip)
}
const channelExists = (key: string): boolean => {
    return channels.findIndex((channel: Channel) => channel.key === key) > -1;
}
const removeChannelByKey = (key: string) => {
    const channelIndex: number = channels.findIndex((channel: Channel) => channel.key === key)
    if (channelIndex != -1) {
        channels.splice(channelIndex, 1);
    }
}
const getChannelViewers = (key: string): Array<Viewer> => {

    return [];
}
const pruneViewers = () => {
    viewers.forEach((viewer: Viewer) => {

    });
}

app.post('/init', (req: Request, res: Response) => {
    logEvent('REGISTERING CHANNEL');
    console.log(req);
    if (req.body && req.body.key) {
        const newChannel: Channel = {
            key: req.body.key,
            title: req.body.title || `Channel ${channels.length}`,
            desc: req.body.desc || '',
            started: new Date(),
            path: `${req.body.key}.m3u8`,
            viewers: []
        }
        channels.push(newChannel);
        res.sendStatus(200);
    } else {
        logEvent('REGISTRATION FAILED');
        res.sendStatus(403);
    }
});
app.post('/done', (req: Request, res: Response) => {
    if (req.body && req.body.key) {
        logEvent(`REMOVING CHANNEL ${req.body.key}`);
        removeChannelByKey(req.body.key);
    }
    
    res.sendStatus(200);
});
app.get('/channels', (req: Request, res: Response) => {
    logEvent('LOADING CHANNELS')
    res.json(channels);
});
app.get('/channel/:streamKey', (req: Request, res: Response) => {

});
app.post('/view', (req: Request, res: Response) => {
    let ip: string | undefined = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;
    if (req.body && req.body.channel && ip) {
        ip = ip.replace(/^::ffff:/, '');
        const visitingViewer: Viewer | undefined = getViewer(ip);
        if (visitingViewer) {
            const viewerIndex: number = viewers.indexOf(visitingViewer);
            viewers[viewerIndex].channel = req.body.channel;
            viewers[viewerIndex].lastPing = new Date();
        } else {
            viewers.push({
                ip,
                lastPing: new Date(),
                channel: req.body.channel
            });
        }
    }
    res.sendStatus(200);
});
app.get('/viewers', (req: Request<{}, {}, ViewerCount>, res: Response) => {
    const ip: string | undefined = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;
    res.json(viewers);
});

setInterval(pruneViewers, PRUNE_INTERVAL);

app.listen(port, () => {});
