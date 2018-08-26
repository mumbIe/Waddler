# Waddler

A rich-featured open source Club Penguin emulator, written in Node.js.

# Features

* The first CP emulator to use custom encryption
* The first CP emulator to use Keccak256 for it's password hashing
* Stable and well written
* Uses the latest, fastest and securest modules
* Uses the latest crumbs
* Everything that is logged is stored in separate text files in a nice format
* Advanced multiplayer handler that allows you to add multiple minigames
* Supports 3 minigames: Find Four, Mancala and Treasurehunt
* Supports functions like: Igloos, Puffles, Postcards and more
* Throttling system

# Setup

## Installation
* [Node.js](https://nodejs.org/en/) [TUTORIAL](https://www.youtube.com/watch?v=epH81xhS6mk)
* [MySQL](https://www.mysql.com) [TUTORIAL](https://www.youtube.com/watch?v=WuBcTJnIuzo)
* [NGINX](https://www.nginx.com) [TUTORIAL](https://www.youtube.com/watch?v=3xTsxEuPzfg)
* An Actionscript 2 mediaserver that is extracted into the htdocs of NGINX [AS2 Mediaserver](https://icer.ink/.repo/legacy/media.zip)
* Waddler that is downloaded and extracted into a separate folder (i.e on your desktop)
* Make sure to `edit` the loader (`boots.swf` if using the media.zip). This has ports and urls that `must be changed to your Waddler config`

## MySQL
* In Waddler, go to `/setup/SQL/` and import the SQL file on something like PHPMYADMIN

## Mediaserver
* In Waddler, go to `/setup/mediaserver/airtower/` and open `airtower.rar`
* Replace the `airtower.swf` in your mediaserver (`/play/v2/client/`) with the one in `airtower.rar`

## Registration
* In Waddler, go to `/register/src/` and open config.json and enter your MySQL details
* Go back to the index folder of the register where `package.json` is located
* Open Command Prompt and enter `npm install`
* In the same folder where `package.json` is located, enter on Command Prompt `node runRegister.js`
* Browse to `yourdomain|yourip:6969` and make sure that MySQL is running

<b>If you're on a VPS, change the `action=` link in `/register/src/public/index.html`</b>

## Waddler
* In Waddler, go to `/src/` and open config.json and enter your MySQL details
* Go back to the index folder of Waddler where `package.json` is located
* Open Command Prompt and enter `npm install`
* In the same folder where `package.json` is located, enter on Command Prompt `node run.js 1 (1 as default ID for login)`
* Open another Command Prompt and browse to the folder where `package.json` is located using CD and enter on Command Prompt: `node run.js 100 (100 as default ID for world)`
* Make sure MySQL, the register and your webserver are running

# Credits

The server layout is a little bit based off Onyx, which I do not take any credit for, but allowed to use.