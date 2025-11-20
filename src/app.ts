import helmet from "helmet";
import cors from "cors";
import express from "express";
import { Request, Response } from "express";
import router from "./routes";
import { specs, swaggerUi } from "./config/swaggerConfig";
import errorHandler from "./middlewares/errormiddleware";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
// Increase body size limit to 50MB for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(helmet());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/health", (req: Request, res: Response) => {
  res.status(200).send("Health Check Ok");
});
app.use("/api/v1", router);
app.use(errorHandler);

export default app;
