
# minecraftLegionWebServer

This project was part of [minecraftLegion](https://github.com/sefirosweb/minecraftLegion).

This is a backend for manage the bot.

## Install: 
- Install [Node.js](https://nodejs.dev/) version 10+ 
- go to the directory witch you want to install into
- run `npm i minecraftlegion` on command promt


## Usage:

### `npm start`

Runs the app.

it uses [jwt tokens](https://jwt.io/)
it will auto generate one for you but you can generate one with a password run:

    node ./examples/jwt-token.js sign test

edit the `const secretPassword = 'YOUR_PASSWORD'`  in /examples/jwt-token.js to add the password
The webserver(by default) is listening on port 4001 for connecting bots and the frontend


# TODO
- Make a Configuration flexible
- Make a robuts documentation
