import helmet from "helmet";
import cors from "cors";
import express, { Request, Response } from "express";
import router from "./routes";
import { specs, swaggerUi } from "./config/swaggerConfig";
import errorHandler from "./middlewares/errormiddleware";
import cookieParser from "cookie-parser";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",

  "https://nova-styles-admin.vercel.app",
  "https://nova-styles-frontend.vercel.app",
  "https://www.novastylesinterior.com",
  "https://store.novastylesinterior.com",
  "https://admin.novastylesinterior.com",
];
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(cookieParser());
app.use(
  express.json({
    limit: "20mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/v1", router);
app.use(errorHandler);

export default app;
