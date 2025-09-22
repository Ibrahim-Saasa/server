import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";

const app = express();

app.use(cors());
// app.options("/*", cors());  // ❌ not needed, remove this
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "server is running on port " + process.env.PORT });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running", process.env.PORT);
  });
});
