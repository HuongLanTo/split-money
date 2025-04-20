import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Split Money is running");
})

export default app;
