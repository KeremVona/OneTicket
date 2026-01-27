import express, { type Express, type Request, type Response } from "express";
import cors from "cors";

const app: Express = express();

const port = 5000;

app.use(express.json());

app.use(cors());

//app.use("/api/authentication", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
