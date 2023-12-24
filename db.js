import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`) });
const dbName = String(process.env.DB_NAME);
const dbUser = String(process.env.DB_USER);
const dbHost = String(process.env.DB_HOST);
const dbDriver = String(process.env.DB_DRIVER);
const dbPassword = String(process.env.DB_PASSWORD);
const dbPort = Number(process.env.DB_PORT || 5432);
export default new Sequelize(dbName, dbUser, dbPassword, {
    dialect: dbDriver,
    host: dbHost,
    port: dbPort,
    timezone: '+00:00',
    define: {
        timestamps: false
    }
});
//# sourceMappingURL=db.js.map