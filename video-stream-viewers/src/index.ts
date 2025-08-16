import express, { Request, Response } from 'express';

type Viewer = {
    ip: string,
    name: string,
    ping: Date
};

const app = express();
const port = process.env.PORT || 2277;
const viewers: Array<Viewer> = [];
const pruneTimer: number = 10000;

const pruneViewers = () => {
    logEvent('PRUNING VIEWERS')
}
const logEvent = (name: string) => {
    console.log(`--- ${name} ---`);
    viewers.forEach(viewer => {

    });
}

app.use(express.json());
app.post('/join', (req: Request, res: Response) => {
    const viewerIp: string | undefined = req.ip;
    if (viewerIp) {
        viewers.push({
            ip: viewerIp.substring(7),
            name: `User${Math.random()}`,
            ping: new Date()
        });
    }
    res.sendStatus(200);
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

});
setInterval(pruneViewers, pruneTimer);
app.listen(port, () => {});