# minecraftLegionWebServer

This project was part of [minecraftLegion](https://github.com/sefirosweb/minecraftLegion).

This is a bridge for manage the bot.

## Install:

- Install [Node.js](https://nodejs.dev/) version 14+
- go to the directory which you want to install into
- run `npm i minecraftLegionWebServer` on command prompt
- make a new file called .env with the fields shown below

```env
LISTEN_PORT=4001
ADMIN_PASSWORD=AdminnPassForManageBot
WEB_CLIENT=http://localhost:4000
```

- Run the app with `npm start`
- WEB_CLIENT => Is minecraftLegionWebClient host:port, is used for accept CORS

## Usage:

Start the app with `npm start`
They start listening with the port you selected in the .env file.
No need for anything else. This app is used for bridge/middleware between bots and the front end.

# TODO

- Make a robuts documentation

# Adding new docker system

## For develop

Need to be create docker network:

```
docker network create minecraftLegionNetwork
```

Start docker container and start watch

```
npm run docker
npm start
```
