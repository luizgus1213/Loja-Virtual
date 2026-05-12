import { Sequelize } from "sequelize";
import User from "@/models/User";

const sequelize =
  global.sequelize ||
  new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.sequelize = sequelize;
}

async function syncDatabase() {
  try {
    console.log("Banco de dados sincronizado com sucesso!");
  } catch (error) {
    console.error("Erro ao sincronizar:", error);
  }
}

syncDatabase();

export default sequelize;
