const fs = require('fs');
const readline = require('readline');
const loadServer = require('./load_server')
const crypto = require('crypto')

fs.access('.env', fs.F_OK, (err) => {
  if (err) {
    console.log('File ".env" not found')
    questions(0)
    return
  }

  loadServer()
})

const requests = [
  'Please insert port to listen [4001]\n',
  'Please insert a admin password for frontend [Blank auto generate]\n',
  'Please insert a secretkey [Blank auto generate]\n'
]

function questions(i) {
  process.stdout.write(requests[i])
}

const answer = []
process.stdin.on('data', (data) => {
  answer.push(data.toString().trim())
  if (answer.length < requests.length) {
    questions(answer.length)
  } else {
    writeFile(answer)
  }
})

function writeFile(data) {
  let port = data[0]
  let password = data[1]
  let secret = data[2]

  if (port == '') {
    port = 4001
  }

  if (password == '') {
    password = crypto.randomBytes(8).toString('base64')
  }

  if (secret == '') {
    secret = crypto.randomBytes(32).toString('base64')
  }

  fs.writeFile('.env', `LISTEN_PORT=${port}\nADMIN_PASSWORD=${password}\nAUTH_JWT_SECRET=${secret}`, error => {
    if (error)
      console.log(error);
    else {
      console.log('Completed .env file');
      console.log(`Password admin is: ${password}`)
      loadServer()
    }

  });
}
