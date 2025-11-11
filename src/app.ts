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
  "https://store.novastylesinterior.com",
  "https://admin.novastylesinterior.com",
  "https://novastylesinterior.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(helmet());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/health", (req: Request, res: Response) => {
  res.status(200).send("Health Check Ok");
});
app.use("/api/v1", router);
app.use(errorHandler);

export default app;
