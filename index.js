const express = require("express");
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
//172.20.192.227

const ip = "127.0.0.1";
const port = 4000;
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});
// un tableau pour suivre mes utilisateurs actifs
const users = [];
const publicMessages = [];

//............................................................. SERVER-SIDE :
io.on("connection", (socket) => {

    socket.emit("init", { message: "Bienvenue cher client du chat" })

    // ------------------ attente de l'emit sendLog from the client = script.js
    socket.on("sendLog", (data) => {
        //console.log(socket.id);
        // TO ADD HERE LATER: -------- sécurisation par authenticator ...
        data.id = socket.id;
        users.push(data);
        //console.dir(users);

        io.emit("updateUserList", users); // sending users-currently-connected-list from the client = script.js
    });

    // ------------------ publicMessage
    socket.on("publicMessage", (data) => {
        data.id = socket.id;
        publicMessages.push(data);
        //console.dir(publicMessages);
        socket.broadcast.emit("publicMessageGlobal", data);
    });

    // ------------------ remove the disconnected user
    socket.on("disconnect", () => {
        //socket.id
        let indexDisconnect;
        users.forEach((element, index) => {
            if (element.id === socket.id) {
                indexDisconnect = index;
            };
        });
        // splice sert à supprimer une entrée de tableau à partir de son index (indexDisconnect)
        users.splice(indexDisconnect, 1);
        console.dir(users);
    });
});


server.listen(port, ip, () => {
    console.log("Démarrer sur http://" + ip + ":" + port);
});
