import express, { Request, Response } from 'express';
import cors from 'cors';

const origins = [
    "https://video.clam-tube.com",
    "http://video.clam-tube.com",
    "https://dev.clam-tube.com",
    "http://dev.clam-tube.com",
    "https://localhost:3000",
    "http://localhost:3000"
];
const app = express();
const port = 2280;

let currentMessage: String = "TEST";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: origins,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.get('/message', async (req: Request, res: Response) => {
    res.send(currentMessage);

});
app.listen(port, () => {});