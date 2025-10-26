import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import postcardsRouter from "./routes/postcards.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/postcards", postcardsRouter);

app.listen(5000, () => console.log("Backend running on port 5000"));
