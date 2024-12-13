
import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();
const port: number = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});