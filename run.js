"use strict"

let serverConfiguration = require("./src/config").Server
const serverID = process.argv[2]

serverConfiguration = serverConfiguration[serverID]

if (serverConfiguration) {
	serverConfiguration.id = serverID
	new(require("./src/server/Server"))(serverConfiguration)
} else {
	throw new Error("Couldn't locate server configuration")
	process.exit(1)
}