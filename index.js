const express = require("express")
const http = require("http")
const socketIo = require("socket.io")

const port = 4001
// const index = require("./routes/index_routes") un used

const app = express()
// app.use(index) un used

const server = http.createServer(app)
const io = socketIo(server)

const botsConnected = []


io.on("connection", (socket) => {
    console.log("New client connected")

    socket.on("disconnect", () => {
        console.log("Client disconnected")

        const find = botsConnected.find(botConection => botConection.socketId === socket.id)
        if (find === undefined) { return }

        botsConnected.splice(botsConnected.indexOf(find), 1)

        io.sockets.emit('botsOnline', botsConnected)
        sendLogs('Disconnected', find.name, socket.id)
    })

    // When bot logins
    socket.on('addFriend', (botName) => {
        const find = botsConnected.find(botConection => botConection.name === botName)
        if (find === undefined) {
            botsConnected.push({
                socketId: socket.id,
                name: botName,
                health: 20,
                food: 20,
                stateMachinePort: null,
                inventoryPort: null,
                viewerPort: null
            })
        }
        io.sockets.emit('botsOnline', botsConnected)
        sendLogs('Login', botName, socket.id)
    })

    socket.on('getBotsOnline', () => {
        socket.emit('botsOnline', botsConnected)
    })

    socket.on('botStatus', (data) => {
        const find = findBotSocket()
        if (find) {
            const message = { ...data, socketId: socket.id }
            io.sockets.emit('botStatus', message)

            const botIndex = botsConnected.findIndex((e) => { return e.socketId === socket.id })
            botsConnected[botIndex][message.type] = message.value
        }
    })

    socket.on('botConnect', (message) => {
        io.sockets.emit('botConnect', message)
    })

    // Reciving logs
    socket.on('logs', (data) => {
        const find = findBotSocket()
        if (find) {
            sendLogs(data, find.name, socket.id)
        }
    })


    // Receiving chatMessage
    socket.on('sendAction', (data) => {
        console.log(data)
        let index

        switch (data.action) { // Action to specific bot
            case 'sendMessage':
                io.to(data.socketId).emit("sendMessage", data.value)
                break
            case 'startStateMachine':
                io.to(data.socketId).emit("startStateMachine", data.value)
                index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                if (index >= 0) {
                    botsConnected[index]['stateMachinePort'] = data.value.port
                    io.sockets.emit('botsOnline', botsConnected)
                }
                break
            case 'startInventory':
                io.to(data.socketId).emit("startInventory", data.value)
                index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                if (index >= 0) {
                    botsConnected[index]['inventoryPort'] = data.value.port
                    io.sockets.emit('botsOnline', botsConnected)
                }
                break
            case 'startViewer':
                io.to(data.socketId).emit("startViewer", data.value)
                index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                if (index >= 0) {
                    botsConnected[index]['viewerPort'] = data.value.port
                    io.sockets.emit('botsOnline', botsConnected)
                }
                break
            case 'sendDisconnect':
                io.to(data.socketId).emit("sendDisconnect", data.value)
                break
            case 'sendStay':
                io.to(data.socketId).emit("sendStay", data.value)
                break
            case 'sendFollow':
                io.to(data.socketId).emit("sendFollow", data.value)
                break
            case 'sendEndCommands':
                io.to(data.socketId).emit("sendEndCommands", data.value)
                break
            case 'sendStartPatrol':
                io.to(data.socketId).emit("sendStartPatrol", data.value)
                break
            case 'sendEndPatrol':
                io.to(data.socketId).emit("sendEndPatrol", data.value)
                break
            case 'sendStartChest':
                io.to(data.socketId).emit("sendStartChest", data.value)
                break
            case 'sendEndChest':
                io.to(data.socketId).emit("sendEndChest", data.value)
                break
        }


    })

    function findBotSocket() {
        const find = botsConnected.find(botConection => botConection.socketId === socket.id)
        if (find === undefined) {
            return false
        } else {
            return find
        }
    }
})



function sendLogs(data, botName = '', socketId = '') {
    const date = new Date()
    const time = ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes() + 1)).slice(-2) + ':' + ('0' + (date.getSeconds() + 1)).slice(-2)

    const message = {
        message: data,
        time,
        socketId,
        botName
    }

    io.sockets.emit('logs', message)
}

server.listen(port, () => console.log(`Listening on port ${port}`))

