const express = require('express');
const { createServer } = require('http');
const path = require('path');

/**
 *@since
 * 201217 | osj4532 | created
 */

const app = express();
const server = createServer(app);
const port = 3000;

app.use(express.static(path.join(__dirname, '../views')));

server.listen(port, () => {
    console.log(`video-chat-client listening on http://localhost:${port}`);
});