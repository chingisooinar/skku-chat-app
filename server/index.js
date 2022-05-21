const express = require('express');
const app = express();
const http = require('http');
const {
	Server
} = require("socket.io");
const cors = require('cors');

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	}
});
// Record individual user information
const socketUsers = {};
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        socketUsers[socket.client.conn.id] = msg;
	console.log('message: ', msg);
	io.emit(`chatroom_${msg.room}`, msg);
    });
    socket.on('disconnect', () => {
        const userMsg = socketUsers[socket.client.conn.id];
        if (userMsg && userMsg.content && userMsg.room) {
            userMsg.content.message = `I am away~`;
            io.emit('chatroom_'+userMsg.room, userMsg);
        }
    });
});

server.listen(3001, () => {
	console.log('listening on *:3001');
});
