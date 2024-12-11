const express = require("express");
const http = require("http");
const kafka = require('kafka-node');
const socket = require('socket.io');
const socketHandler = require("./socketHandler");
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    socketHandler(socket);
});

const PORT = process.env.PORT;
const HOST_NAME = process.env.HOST_NAME;
server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = server;