module.exports = () => {

    const server = require('http').createServer()
    const io = require('socket.io')(server)

    const botsConnected = []
    const masters = []
    const users_loged = []

    const { listenPort, adminPassword } = require('./config')

    io.on('connection', (socket) => {
        console.log(`New client connected => ${socket.id}`)

        socket.on('disconnect', () => {
            console.log('Client disconnected')

            const user_loged_idx = users_loged.indexOf(socket.id)
            if (user_loged_idx >= 0) {
                users_loged.splice(user_loged_idx, 1)
            }

            const botDisconnected = botsConnected.find(botConection => botConection.socketId === socket.id)
            // If connection is not bot o continue
            if (botDisconnected === undefined) { return }
            botsConnected.splice(botsConnected.indexOf(botDisconnected), 1)

            io.to('users_loged').emit('botsOnline', botsConnected)
            sendLogs('Disconnected', botDisconnected.name, socket.id)
        })

        // When bot logins
        socket.on('login', (password) => {
            if (password === adminPassword) {
                console.log(`User loged correctly => ${socket.id}`)
                socket.emit('login', { auth: true })
                socket.join('users_loged');
                users_loged.push(socket.id)

                socket.emit('mastersOnline', masters)
            } else {
                socket.emit('login', { auth: false })
            }
        })

        // When bot logins
        socket.on('addFriend', (botName) => {
            if (!isLoged()) { return }
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
            io.to('users_loged').emit('botsOnline', botsConnected)
            sendLogs('Login', botName, socket.id)
        })

        socket.on('getBotsOnline', () => {
            if (!isLoged()) { return }
            socket.emit('botsOnline', botsConnected)
        })

        socket.on('botStatus', (data) => {
            if (!isLoged()) { return }
            const botIndex = botsConnected.findIndex((e) => { return e.socketId === socket.id })
            if (botIndex >= 0) {
                const message = { type: data.type, value: data.value, socketId: socket.id }
                io.to('users_loged').emit('botStatus', message)
                botsConnected[botIndex][message.type] = message.value
            }
        })

        socket.on('botConnect', (message) => {
            if (!isLoged()) { return }
            io.to('users_loged').emit('botConnect', message)
        })

        // Reciving logs
        socket.on('logs', (data) => {
            if (!isLoged()) { return }
            const find = findBotSocket(socket)
            if (find) {
                sendLogs(data, find.name, socket.id)
            }
        })

        // Receiving chatMessage
        socket.on('sendAction', (data) => {
            if (!isLoged()) { return }
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
                        io.to('users_loged').emit('botsOnline', botsConnected)
                    }
                    break
                case 'startInventory':
                    io.to(data.socketId).emit('startInventory', data.value)
                    index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                    if (index >= 0) {
                        botsConnected[index].inventoryPort = data.value.port
                        io.to('users_loged').emit('botsOnline', botsConnected)
                    }
                    break
                case 'startViewer':
                    io.to(data.socketId).emit('startViewer', data.value)
                    index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
                    if (index >= 0) {
                        botsConnected[index].viewerPort = data.value.port
                        io.to('users_loged').emit('botsOnline', botsConnected)
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
                    io.to(data.socketId).emit('getConfig', socket.id)
                    break
                case 'sendConfig':
                    io.to(data.socketId).emit('sendConfig', data.value)
                    break
                case 'addMaster':
                    if (data.value === undefined) { return }
                    data.value = data.value.trim()

                    masterIndex = masters.findIndex((e) => { return e.name === data.value })
                    if (masterIndex < 0 && data.value !== '') {
                        masters.push({
                            name: data.value
                        })
                    }

                    io.to('users_loged').emit('mastersOnline', masters)
                    break
                case 'removeMaster':
                    if (data.value === undefined) { return }
                    data.value = data.value.trim()

                    masterIndex = masters.findIndex((e) => { return e.name === data.value })
                    if (masterIndex >= 0) {
                        masters.splice(masterIndex, 1)
                    }

                    io.to('users_loged').emit('mastersOnline', masters)
                    break

            }
        })

        function isLoged() {
            return users_loged.find(user_id => user_id === socket.id)
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

        io.to('users_loged').emit('logs', message)
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