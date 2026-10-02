import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.config.js";
import { AppError } from "./utils/common/error/AppError.js";

export const app = express();

// app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health-check", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    uptime: process.uptime(),
    timestamp: Date.now(),
    message: "Health is fine",
  });
});



app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// app.use(globalErrorHandler);
