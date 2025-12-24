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
const mockChannels: Array<{
  key: string,
  path: string
}> = [];

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
const checkAuthorization = async () => {

}
const extractBearerToken = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
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
    const useMocks = req.query.mocks;
    const isDev = req.query.dev || false;
    const token = await extractBearerToken(req);
    const tokenValid = await fetch('http://auth:2278/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const validData = await tokenValid.json();
    const statResult = await fetch(isDev ? `${origins[1]}:8080/stat` : 'http://rtmp:8080/stat');
    const data = useMocks ? mockChannels.map(channel => channel.key) : parseLiveKeys(await statResult.text());
    const allowedChannels = data.filter(key => {
      if (key.indexOf('private') > -1) {
        return validData.valid;
      }
      return true;
    });
    const channels = allowedChannels.map(key => {
        return {
            key,
            path: `/stream/${key}.m3u8`
        }
    });
    res.json(channels);
});
app.listen(port, () => {});
