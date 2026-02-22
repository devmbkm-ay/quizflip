const dbName = process.env.MONGO_DB || "quizflip";
const appUser = process.env.MONGO_APP_USERNAME || "quizflip_app";
const appPassword = process.env.MONGO_APP_PASSWORD || "quizflip_app_password";

const appDb = db.getSiblingDB(dbName);

appDb.createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: "readWrite", db: dbName }],
});
