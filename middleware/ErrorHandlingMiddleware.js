import ApiError from '../error/ApiError.js';
import { createLogger, transports } from 'winston';
const logger = createLogger({
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});
export default function (err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message, errors: err.errors });
    }
    //@ts-ignore
    logger.error(`Error: ${err.message}\nStack: ${err.stack})`);
    return res.status(500).json({ message: 'Непредвиденная ошибка' });
}
//# sourceMappingURL=ErrorHandlingMiddleware.js.map