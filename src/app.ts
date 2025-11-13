import helmet from "helmet";
import cors from "cors";
import express from "express";
import { Request, Response } from "express";
import router from "./routes";
import { specs, swaggerUi } from "./config/swaggerConfig";
import errorHandler from "./middlewares/errormiddleware";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "http://localhost:5174", // Vite dev
  "https://nova-styles-admin.vercel.app",
  "https://nova-styles-frontend.vercel.app",
  "https://www.novastylesinterior.com", // Production frontend UI
  "https://store.novastylesinterior.com",
  "https://admin.novastylesinterior.com",
];

// CORS configuration - MUST be before other middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log rejected origins for debugging
      console.warn(`CORS blocked origin: ${origin}`);
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

// Cookie parser - before routes
app.use(cookieParser());

// Body parsers - increase size limits to handle base64 images
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

// Webhook endpoint with raw body parser (BEFORE express.json())
// Note: This should be moved BEFORE express.json() if you need raw body
app.use("/api/webhook", express.raw({ type: "application/json" }));

// Helmet security headers - configure to work with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.use("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1", router);

// Error handler - MUST be last
app.use(errorHandler);

export default app;
