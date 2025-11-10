import app from "./app";
import config from "./config/config";
import connectionToDb from "./config/db.config";

connectionToDb();
app.listen(config.port, () => {
  console.log("Server is running on port", config.port);
});
