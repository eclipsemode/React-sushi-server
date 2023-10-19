import express, {Express} from 'express';
import dotenv from "dotenv";
import sequelize from './db.js';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import router from './routes/index.js';
import errorhandler from './middleware/ErrorHandlingMiddleware.js';
import path from "path";
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = process.env.PORT || 5000;
const app: Express = express();

app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);
app.use(errorhandler);

const start = (async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log(e)
  }
})()
