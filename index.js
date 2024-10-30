const express = require("express");
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const ip = "127.0.0.1";
const port = 4000;
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

const users = [];
const publicMessages = [];

io.on("connection", (socket) => {
    socket.emit("init", { message: "Bienvenue cher client du chat" });

    // Register user
    socket.on("sendLog", (data) => {
        data.id = socket.id;
        users.push(data);
        io.emit("updateUserList", users); // Notify all clients of updated user list
    });

    // Handle public message
    socket.on("publicMessage", (data) => {
        data.id = socket.id;
        publicMessages.push(data);
        socket.broadcast.emit("publicMessageGlobal", data); // Broadcast to all except sender
    });

    // Handle private message
    socket.on("privateMessage", (data) => {
        const recipient = users.find(user => user.pseudo === data.recipient);
        if (recipient) {
            io.to(recipient.id).emit("receivePrivateMessage", data); // Send only to recipient
        }
    });

    // Remove disconnected user
    socket.on("disconnect", () => {
        const index = users.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            users.splice(index, 1);
            io.emit("updateUserList", users); // Notify all clients of updated -1-user list
        }
    });
});

server.listen(port, ip, () => {
    console.log("Démarrer sur http://" + ip + ":" + port);
});
