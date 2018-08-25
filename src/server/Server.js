"use strict"

const Logger = require("./Logger")

const Database = require("./core/system/Database")
const Penguin = require("./core/Penguin")

const DataHandler = require("./core/DataHandler")

const roomManager = require("./core/managers/roomManager")
const gameManager = require("./core/managers/gameManager")
const pluginLoader = require("./core/managers/pluginLoader")

class Server {
	constructor(options) {
		if (!options.id || !options.type || !options.port) {
			Logger.error("Couldn't locate server configuration")
			process.exit(1)
		}

		this.id = options.id
		this.type = options.type
		this.port = options.port
		this.maxPenguins = (options.maxPenguins ? options.maxPenguins : 100)

		this.penguins = []

		this.database = new Database()
		this.dataHandler = new DataHandler(this)

		if (this.type !== "login") {
			this.roomManager = new roomManager(this)
			this.gameManager = new gameManager(this)
			this.pluginLoader = new pluginLoader()
		}

		this.startServer()

		process.on("SIGINT", () => this.handleShutdown())
		process.on("SIGTERM", () => this.handleShutdown())
	}

	startServer() {
		require("net").createServer(socket => {
			socket.setEncoding("utf8")
			socket.setTimeout(600000, () => {
				socket.end("Disconnected inactive socket")
			})
			socket.setNoDelay(true)

			const penguin = new Penguin(socket, this)

			if (this.penguins.length >= this.maxPenguins) return penguin.sendError(103, true)

			this.penguins.push(penguin)

			Logger.info(`A client has connected`)

			socket.on("data", (data) => {
				return this.dataHandler.handleData(data.toString().split("\0")[0], penguin)
			})

			socket.on("close", () => {
				Logger.info(`A client has disconnected`)
				return penguin.disconnect()
			})

			socket.on("error", (error) => {
				if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") return
				Logger.error(error)
				return penguin.disconnect()
			})

		}).listen(this.port, () => {
			Logger.info(`Waddler {${this.type}} listening on port ${this.port} by ID ${this.id}`)
		})
	}

	calculateWorldPopulation(capacity) {
		const population = this.penguins.length

		if (population < 10) return 0
		if (population >= capacity) return 7

		const threshold = Math.round((capacity + 100) / 7)

		for (let i = 0; i < 7; i++) {
			if (population <= (threshold * i)) return i
		}

		return 7
	}

	getServers() {
		const servers = require("../config").Server
		let serverArr = []

		for (const id of Object.keys(servers)) {
			if (servers[id].type == "world") {
				const server = [id, servers[id].name, servers[id].host, servers[id].port]
				serverArr.push(server.join("|"))
			}
		}

		return serverArr.join("%")
	}

	getServerPopulation() {
		const servers = require("../config").Server
		let populationArr = []

		for (const id of Object.keys(servers)) {
			if (servers[id].type == "world") {
				populationArr.push([id, this.calculateWorldPopulation(servers[id].maxPenguins)].join(","))
			}
		}

		return populationArr
	}

	decodeCrumb(crumb) {
		const msgpuck = require("msgpuck")
		const Decoder = new msgpuck.Decoder()

		return new Promise((resolve, reject) => {
			require("fs").readFile(`${__dirname}/crumbs/${crumb}.bin`, (err, data) => {
				if (err) return reject(err)

				return resolve(Decoder.decode(data))
			})
		})
	}

	getPenguinById(id) {
		for (const penguin of this.penguins) {
			if (penguin.id === id) {
				return penguin
			}
		}
	}

	getPenguinByUsername(username) {
		for (const penguin of this.penguins) {
			if (penguin.username.toLowerCase() === username.toLowerCase()) {
				return penguin
			}
		}
	}

	isPenguinOnline(id) {
		for (const penguin of this.penguins) {
			if (penguin.id === id) {
				return true
			}
		}
		return false
	}

	getPlugin(plugin) {
		return this.pluginLoader.getPlugin(plugin)
	}

	isPluginEnabled(plugin) {
		return this.getPlugin(plugin) !== undefined
	}

	handleShutdown() {
		if (this.penguins.length > 0) {
			Logger.info("Server shutting down in 3 seconds")
			Logger.info(`Disconnecting ${this.penguins.length} client(s)`)
			setTimeout(() => {
				for (const penguin of this.penguins) {
					penguin.disconnect()
				}
				process.exit(0)
			}, 3000)
		} else {
			Logger.info("No clients connected, shutting down instantly")
			process.exit(0)
		}
	}

	removePenguin(penguin) {
		const index = this.penguins.indexOf(penguin)

		if (index > -1) {
			Logger.info("Removing client")

			if (penguin.room) penguin.room.removePenguin(penguin)
			if (penguin.tableId) this.gameManager.leaveTable(penguin)

			if (this.type === "game" && penguin.id !== undefined) {
				if (penguin.buddies.length !== 0) {
					penguin.buddies.forEach(buddy => {
						buddy = buddy.split("|")
						const buddyID = Number(buddy[0])
						if (this.isPenguinOnline(buddyID)) {
							this.getPenguinById(buddyID).sendXt("bof", -1, penguin.id)
						}
					})
				}
			}

			if (this.roomManager) {
				const igloo = (penguin.id + 1000)

				if (this.roomManager.checkIgloo(igloo)) this.roomManager.closeIgloo(igloo)
			}

			this.penguins.splice(index, 1)

			penguin.socket.end()
			penguin.socket.destroy()
		}
	}
}

module.exports = Server