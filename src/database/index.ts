import { Sequelize } from "sequelize";

declare global {
  // eslint-disable-next-line no-var
  var sequelize: Sequelize | undefined;
}

const storage =
  process.env.DB_STORAGE ||
  (process.env.NODE_ENV === "production"
    ? "/var/data/database.sqlite"
    : "./database.sqlite");

const sequelize =
  global.sequelize ||
  new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.sequelize = sequelize;
}

console.log("SQLite usando arquivo:", storage);

export default sequelize;
