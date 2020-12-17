const express = require('express');
const { createServer } = require('http');
const path = require('path');
const logger = require('./config/winston');

/**
 *@since
 * 201217 | osj4532 | created
 */

const app = express();
const server = createServer(app);
const port = 3000;

app.use(express.static(path.join(__dirname, '../views')));

server.listen(port, () => {
    logger.info(`video-chat-client listening on http://localhost:${port}`);
});