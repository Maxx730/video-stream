import express, { Request, Response } from 'express';
import { DOMParser } from 'xmldom';
import cors from 'cors';

const origins = [
    "https://video.clam-tube.com",
    "http://video.clam-tube.com",
    "https://dev.clam-tube.com",
    "http://dev.clam-tube.com",
    "https://localhost:3000",
    "http://localhost:3000"
]
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: origins,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

const port = 2276;

const logEvent = (name: string) => {
    console.log(`--- ${name} ---`);
}
const parseLiveKeys = (xmlString: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const streams = Array.from(xmlDoc.getElementsByTagName("stream"));
  return streams.map(stream => {
    const nameNode = stream.getElementsByTagName("name")[0];
    return nameNode?.textContent || "";
  }).filter(Boolean);
}

app.get('/channels', async (req: Request, res: Response) => {
    logEvent('LOADING CHANNELS')
    const statResult = await fetch('http://rtmp:8080/stat');
    const data = await statResult.text();
    const channels = parseLiveKeys(data).map(key => {
        return {
            key,
            path: `/stream/${key}.m3u8`
        }
    });
    res.json(channels);
});
app.listen(port, () => {});
