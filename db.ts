import {Sequelize, Dialect} from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const dbName = process.env.DB_NAME as string
const dbUser = process.env.DB_USER as string
const dbHost = process.env.DB_HOST
const dbDriver = process.env.DB_DRIVER as Dialect
const dbPassword = process.env.DB_PASSWORD
const dbPort = Number(process.env.DB_PORT || 5433)

export default new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        dialect: dbDriver,
        host: dbHost,
        port: dbPort,
        timezone: '+00:00',
        define: {
            timestamps: false
        }
    },
);