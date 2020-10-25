const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = 4001;
// const index = require("./routes/index_routes"); un used

const app = express();
// app.use(index); un used

const server = http.createServer(app);
const io = socketIo(server);



io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");

        const find = botsConnected.find(botConection => botConection.socketId === socket.id)
        if (find === undefined) { return }

        botsConnected.splice(botsConnected.indexOf(find), 1)

        io.sockets.emit('botsOnline', JSON.stringify(botsConnected))
        sendLogs('<span>Disconnected</span>', find.name)
    })

    // When bot logins
    socket.on('addFriend', (botName) => {
        const find = botsConnected.find(botConection => botConection.name === botName)
        if (find === undefined) {
            botsConnected.push({ socketId: socket.id, name: botName })
        }
        io.sockets.emit('botsOnline', JSON.stringify(botsConnected))
        sendLogs('Login', botName)
    })

    socket.on('getBotsOnline', () => {
        socket.emit('botsOnline', JSON.stringify(botsConnected))
    })

    // Reciving info
    socket.on('command', (data) => {
        sendLogs(data)
    })

    // Reciving logs
    socket.on('logs', (data) => {
        const find = botsConnected.find(botConection => botConection.socketId === socket.id)

        if (find !== undefined) {
            sendLogs(data, find.name)
        } else {
            console.log(find)
        }
    })
});

function sendLogs(data, botName = '') {
    const date = new Date()
    const seconds = date.getSeconds()
    const minutes = date.getMinutes()
    const hour = date.getHours()

    const dataToEmit = `${hour}:${minutes}:${seconds} ${botName} ${data}`
    // console.log(dataToEmit)
    io.sockets.emit('logs', dataToEmit)
}

server.listen(port, () => console.log(`Listening on port ${port}`));

const botsConnected = [];