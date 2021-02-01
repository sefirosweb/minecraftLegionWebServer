module.exports = () => {

    const server = require('http').createServer()
    const jwt = require('jsonwebtoken')
    const io = require('socket.io')(server)

    const botsConnected = []
    const masters = []

    const { listenPort, adminPassword, authJwtSecret } = require('./config')


    io.on('connection', (socket) => {
        console.log('New client connected')
        socket.emit('mastersOnline', masters)

        socket.on('disconnect', () => {
            console.log('Client disconnected')

            const find = botsConnected.find(botConection => botConection.socketId === socket.id)
            if (find === undefined) { return }

            botsConnected.splice(botsConnected.indexOf(find), 1)

            io.emit('botsOnline', botsConnected)
            sendLogs('Disconnected', find.name, socket.id)
        })

        // When bot logins
        socket.on('login', (password) => {
            if (password === adminPassword) {

                const token = jwt.sign(
                    { socketId: socket.id },
                    authJwtSecret,
                    { expiresIn: '2h' }
                )

                socket.emit('login', { auth: true, token })
            } else {
                socket.emit('login', { auth: false })
            }
        })

        // When bot logins
        socket.on('addFriend', (botName) => {
            const find = botsConnected.find(botConection => botConection.name === botName)
            if (find === undefined) {
                botsConnected.push({ // Default Data
                    socketId: socket.id,
                    name: botName,
                    health: 20,
                    food: 20,
                    combat: false,
                    stateMachinePort: null,
                    inventoryPort: null,
                    viewerPort: null
                })
            }
            io.emit('botsOnline', botsConnected)
            sendLogs('Login', botName, socket.id)
        })

        // Adding master
        socket.on('addMaster', (message) => {
            const masterIndex = masters.findIndex((e) => { return e.name === message.name })
            if (masterIndex < 0) {
                masters.push({
                    name: message.name
                })
            }
            io.emit('mastersOnline', masters)
            console.log(masters)
        })

        socket.on('getBotsOnline', () => {
            socket.emit('botsOnline', botsConnected)
        })

        socket.on('botStatus', (data) => {
            const botIndex = botsConnected.findIndex((e) => { return e.socketId === socket.id })
            if (botIndex >= 0) {
                const message = { type: data.type, value: data.value, socketId: socket.id }
                io.emit('botStatus', message)
                botsConnected[botIndex][message.type] = message.value
            }
        })

        socket.on('botConnect', (message) => {
            io.emit('botConnect', message)
        })

        // Reciving logs
        socket.on('logs', (data) => {
            const find = findBotSocket(socket)
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
                    io.to(data.socketId).emit('sendMessage', data.value)
                    break
                case 'startStateMachine':
                    io.to(data.socketId).emit('startStateMachine', data.value)
                    index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                    if (index >= 0) {
                        botsConnected[index].stateMachinePort = data.value.port
                        io.emit('botsOnline', botsConnected)
                    }
                    break
                case 'startInventory':
                    io.to(data.socketId).emit('startInventory', data.value)
                    index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                    if (index >= 0) {
                        botsConnected[index].inventoryPort = data.value.port
                        io.emit('botsOnline', botsConnected)
                    }
                    break
                case 'startViewer':
                    io.to(data.socketId).emit('startViewer', data.value)
                    index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                    if (index >= 0) {
                        botsConnected[index].viewerPort = data.value.port
                        io.emit('botsOnline', botsConnected)
                    }
                    break
                case 'sendDisconnect':
                    io.to(data.socketId).emit('sendDisconnect', data.value)
                    break
                case 'sendStay':
                    io.to(data.socketId).emit('sendStay', data.value)
                    break
                case 'sendFollow':
                    io.to(data.socketId).emit('sendFollow', data.value)
                    break
                case 'sendEndCommands':
                    io.to(data.socketId).emit('sendEndCommands', data.value)
                    break
                case 'sendStartWay':
                    io.to(data.socketId).emit('sendStartWay', data.value)
                    break
                case 'sendSavePatrol':
                    io.to(data.socketId).emit('sendSavePatrol', data.value)
                    break
                case 'sendSaveChest':
                    io.to(data.socketId).emit('sendSaveChest', data.value)
                    break
                case 'move':
                    io.to(data.socketId).emit('move', data.value)
                    break
                case 'interact':
                    io.to(data.socketId).emit('interact', data.value)
                    break
                case 'drop':
                    io.to(data.socketId).emit('drop', data.value)
                    break
                case 'getConfig':
                    console.log(data.socketId)
                    io.to(data.socketId).emit('getConfig', socket.id)
                    break
                case 'sendConfig':
                    console.log('sendConfig')
                    console.log(data.socketId)
                    io.to(data.socketId).emit('sendConfig', data.value)
                    break
            }
        })
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

        io.emit('logs', message)
    }

    function findBotSocket(socket) {
        const bot = botsConnected.find(botConection => botConection.socketId === socket.id)
        if (bot === undefined) {
            return false
        } else {
            return bot
        }
    }

    server.listen(listenPort, () => console.log(`Listening on port ${listenPort}`))
}