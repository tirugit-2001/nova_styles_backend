import helmet from "helmet";
import cors from "cors";
import express from "express";
import { Request, Response } from "express";
import router from "./routes";
import { specs, swaggerUi } from "./config/swaggerConfig";
import errorHandler from "./middlewares/errormiddleware";
const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/health", (req: Request, res: Response) => {
  res.status(200).send("Health Check Ok");
});
app.use(errorHandler);
app.use("/api/v1", router);

export default app;
