#!/usr/bin/env node
/**
 * Module dependencies.
 */
import sequelize from '../db.js';
import app from '../app.js';
import debug from 'debug';
import http from 'http';
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.SERVER_PORT || '5000');
app.set('port', port);
/**
 * Create HTTP server.
 */
const server = http.createServer(app);
const debugServer = debug('express-lime:server');
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', async () => {
    console.log('Server was started successfully!');
    await sequelize.authenticate();
    await sequelize.sync();
    onListening();
});
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port;
    debugServer('Listening on ' + bind);
}
//# sourceMappingURL=www.js.map