module.exports = () => {
  const server = require('http').createServer()
  const io = require('socket.io')(server)

  const botsConnected = []
  const masters = []
  const usersLoged = []

  const { listenPort, adminPassword } = require('./config')

  io.on('connection', (socket) => {
    console.log(`New client connected => ${socket.id}`)

    socket.on('disconnect', () => {
      console.log('Client disconnected')

      const userLogedIdx = usersLoged.indexOf(socket.id)
      if (userLogedIdx >= 0) {
        usersLoged.splice(userLogedIdx, 1)
      }

      const botDisconnected = botsConnected.find(botConection => botConection.socketId === socket.id)
      // If connection is not bot o continue
      if (botDisconnected === undefined) { return }
      botsConnected.splice(botsConnected.indexOf(botDisconnected), 1)

      io.to('usersLoged').emit('botsOnline', botsConnected)
      sendLogs('Disconnected', botDisconnected.name, socket.id)
    })

    // When bot logins
    socket.on('login', (password) => {
      if (password === adminPassword) {
        console.log(`User loged correctly => ${socket.id}`)
        socket.emit('login', { auth: true })
        socket.join('usersLoged')
        usersLoged.push(socket.id)

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
          viewerPort: null,
          config: {
            job: 'none',
            mode: 'none',
            distance: 10,
            pickUpItems: false,
            help_friends: false,
            itemsToBeReady: [],
            patrol: []
          }
        })
      }
      io.to('usersLoged').emit('botsOnline', botsConnected)
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
        io.to('usersLoged').emit('botStatus', message)
        botsConnected[botIndex][message.type] = message.value
      }
    })

    socket.on('botConnect', (message) => {
      if (!isLoged()) { return }
      io.to('usersLoged').emit('botConnect', message)
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

      switch (data.action) {
        case 'sendMessage':
          io.to(data.socketId).emit('sendMessage', data.value)
          break
        case 'startStateMachine':
          io.to(data.socketId).emit('startStateMachine', data.value)
          index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
          if (index >= 0) {
            botsConnected[index].stateMachinePort = data.value.port
            io.to('usersLoged').emit('botsOnline', botsConnected)
          }
          break
        case 'startInventory':
          io.to(data.socketId).emit('startInventory', data.value)
          index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
          if (index >= 0) {
            botsConnected[index].inventoryPort = data.value.port
            io.to('usersLoged').emit('botsOnline', botsConnected)
          }
          break
        case 'startViewer':
          io.to(data.socketId).emit('startViewer', data.value)
          index = botsConnected.findIndex((e) => { return e.socketId === data.socketId })
          if (index >= 0) {
            botsConnected[index].viewerPort = data.value.port
            io.to('usersLoged').emit('botsOnline', botsConnected)
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
          data.value.socketId = socket.id
          io.to(data.socketId).emit('sendConfig', data.value)
          break
        case 'changeConfig':
          data.value.fromSocketId = socket.id
          io.to(data.socketId).emit('changeConfig', data.value)
          break
        case 'addMaster':
          if (data.value === undefined) { return }
          data.value = data.value.trim()

          const masterToAddIndex = masters.findIndex((e) => { return e.name === data.value })
          if (masterToAddIndex < 0 && data.value !== '') {
            masters.push({
              name: data.value
            })
          }

          io.to('usersLoged').emit('mastersOnline', masters)
          break
        case 'removeMaster':
          if (data.value === undefined) { return }
          data.value = data.value.trim()

          const masterToRemoveIndex = masters.findIndex((e) => { return e.name === data.value })
          if (masterToRemoveIndex >= 0) {
            masters.splice(masterToRemoveIndex, 1)
          }

          io.to('usersLoged').emit('mastersOnline', masters)
          break
      }
    })

    function isLoged() {
      return usersLoged.find(userId => userId === socket.id)
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

    io.to('usersLoged').emit('logs', message)
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
