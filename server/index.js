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
let onlineUsersbyRoom = {};
let todosByRoom = {};
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        socketUsers[socket.client.conn.id] = msg;
		if (msg.content.message === "I am online now~"){
			if(!Object.keys(onlineUsersbyRoom).includes(msg.room)){
				onlineUsersbyRoom[msg.room] = [msg.content.sender];
			}else if (!onlineUsersbyRoom[msg.room].includes(msg.content.sender)){
				onlineUsersbyRoom[msg.room].push(msg.content.sender);
			}
			console.log('room', onlineUsersbyRoom[msg.room]);
		}
		io.emit(`update_users_${msg.room}`, onlineUsersbyRoom[msg.room]);
		io.emit(`chatroom_${msg.room}`, msg);
    });
		socket.on('update todos', (update) => {
			todosByRoom[update.room] = update.todos;
			io.emit(`update_todos_${update.room}`, todosByRoom[update.room]);
			console.log(todosByRoom[update.room])
		});
    socket.on('disconnect', () => {
        const userMsg = socketUsers[socket.client.conn.id];
        if (userMsg && userMsg.content && userMsg.room) {
            userMsg.content.message = `I am away~`;
						onlineUsersbyRoom[userMsg.room] = onlineUsersbyRoom[userMsg.room].filter(function(item) {
				    			return item !== userMsg.content.sender;
							});
						io.emit(`update_users_${userMsg.room}`, onlineUsersbyRoom[userMsg.room]);
            io.emit('chatroom_'+userMsg.room, userMsg);
        }
    });
});

server.listen(3001, () => {
	console.log('listening on *:3001');
});
