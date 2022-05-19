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

io.on('connection', (socket) => {
	socket.on('chat message', (msg) => {
		console.log('message: ', msg);
		io.emit('chatroom_'+msg.room, msg);
	});
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3001, () => {
	console.log('listening on *:3001');
});
