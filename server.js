const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let rooms = {};

io.on("connection", (socket) => {

    socket.on("joinRoom", (roomId) => {

        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        rooms[roomId].push(socket.id);

        const role =
            rooms[roomId].length === 1
                ? "player1"
                : "player2";

        socket.emit("role", role);

        if (rooms[roomId].length === 2) {
            io.to(roomId).emit("startMatch");
        }
    });

    socket.on("state", (data) => {
        socket.to(data.roomId)
            .emit("enemyState", data.state);
    });

    socket.on("attack", (data) => {
        socket.to(data.roomId)
            .emit("enemyAttack", data);
    });

    socket.on("ultimate", (data) => {
        socket.to(data.roomId)
            .emit("enemyUltimate", data);
    });

    socket.on("teleport", (data) => {
        socket.to(data.roomId)
            .emit("enemyTeleport", data);
    });

    socket.on("dash", (data) => {
        socket.to(data.roomId)
            .emit("enemyDash", data);
    });

    socket.on("domain", (data) => {
        socket.to(data.roomId)
            .emit("enemyDomain");
    });

    socket.on("disconnect", () => {
        for (const room in rooms) {
            rooms[room] =
                rooms[room].filter(id => id !== socket.id);

            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});