import app from "./app";
import config from "./config/config";
import connectionToDb from "./config/db.config";
console.log(
  config.redist_host,
  config.redis_port,
  config.smtp_host,
  config.smtp_pass,
  config.smtp_port,
  config.smtp_user
);
connectionToDb();
app.listen(config.port, () => {
  console.log("Server is running on port", config.port);
});
