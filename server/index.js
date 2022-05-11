//Backend
const express = require('express');
const app = express();
const cors = require('cors');
const socket = require("socket.io");
app.use(cors())

app.listen("3001", () => {
    console.log('Server is Running!');
});
 // socket
