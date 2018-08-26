"use strict"

const Logger = require("./Logger")

const Database = require("./core/system/Database")
const Penguin = require("./core/Penguin")

const DataHandler = require("./core/DataHandler")

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

		this.database = new Database()
		this.dataHandler = new DataHandler(this)

		this.penguins = []

		if (this.type !== "login") {
			this.furniture_crumbs = require("./crumbs/furniture")
			this.igloo_crumbs = require("./crumbs/igloos")
			this.floor_crumbs = require("./crumbs/floors")
			this.stamp_crumbs = require("./crumbs/stamps")
			this.pin_crumbs = require("./crumbs/pins")
			this.award_crumbs = require("./crumbs/awards")
			this.decodeItemCrumbs().then((item_crumbs) => {
				this.item_crumbs = item_crumbs
				Logger.info("Successfully decoded item crumbs!")
			})

			this.roomManager = new(require("./core/managers/roomManager"))()
			this.gameManager = new(require("./core/managers/gameManager"))(this)
		}

		this.startServer()

		process.on("SIGINT", () => this.handleShutdown())
		process.on("SIGTERM", () => this.handleShutdown())
	}

	decodeItemCrumbs() {
		const msgpack = require("msgpuck")

		const Decoder = new msgpack.Decoder()

		return new Promise((resolve, reject) => {
			require("fs").readFile(`${__dirname}/crumbs/items.bin`, (err, data) => {
				if (err) return reject(err)

				return resolve(Decoder.decode(data))
			})
		})
	}

	startServer() {
		require("net").createServer(socket => {
			socket.setEncoding("utf8")
			socket.setNoDelay(true)
			socket.setTimeout(600000, () => {
				socket.end("Disconnected inactive socket")
			})

			const penguin = new Penguin(socket, this)

			if (this.penguins.length >= this.maxPenguins) return penguin.sendError(103, true)

			this.penguins.push(penguin)

			Logger.info("A client has connected")

			socket.on("data", (data) => {
				data = data.toString().split("\0")[0]

				if (!["<", "%"].includes(data.charAt(0))) return penguin.disconnect()

				Logger.incoming(data)

				if (data.charAt(0) === "%") return this.dataHandler.handleGame(data, penguin)
				if (data.charAt(0) === "<") return this.dataHandler.handleXML(data, penguin)
			})

			socket.on("close", () => {
				Logger.info("A client has been disconnected")
				penguin.disconnect()
			})

			socket.on("error", (error) => {
				if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") return
				if (error.code === "EADDRINUSE") return Logger.error(`${this.port} is already in use`)
				Logger.error(error)
			})

		}).listen(this.port, () => {
			Logger.info(`Waddler {${this.type}} listening on port ${this.port} by ID ${this.id}`)
		})
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
						const buddyID = Number(buddy.split("|")[0])

						if (this.isPenguinOnline(buddyID)) this.getPenguinById(buddyID).sendXt("bof", -1, penguin.id)
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
}

module.exports = Server