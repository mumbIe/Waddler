"use strict"

const Logger = require("../Logger")
const sp = require("./utils/sp")

const ClubPenguin = require("./ClubPenguin")

class Penguin extends ClubPenguin {
	constructor(socket, server) {
		super()
		this.socket = socket
		this.server = server

		this.ipAddr = socket.remoteAddress.split(":").pop()

		this.database = server.database
		this.roomHandler = server.roomHandler
	}

	setPenguin(penguin) {
		this.id = penguin.ID
		this.username = penguin.username
		this.age = sp.dateToInt() - penguin.registrationDate

		this.coins = penguin.coins

		this.color = penguin.color
		this.head = penguin.head
		this.face = penguin.face
		this.neck = penguin.neck
		this.body = penguin.body
		this.hand = penguin.hand
		this.feet = penguin.feet
		this.pin = penguin.pin
		this.photo = penguin.photo

		this.rank = penguin.rank
		this.moderator = (penguin.moderator >= 1)
		this.muted = false

		this.x = 0
		this.y = 0
		this.frame = 1
		this.gameRoomId = 0
		this.coinDig = 0

		this.loggedIn = true
		this.openIgloos = []
		this.walkingPuffle

		this.buddies = []
		this.ignored = []
		this.requests = []

		this.stamps = []
		this.inventory = []

		this.throttle = {}
	}

	buildPlayerString() {
		if (!this.id || !this.username) return this.disconnect()

		const playerArr = [
			this.id,
			this.username,
			1,
			this.color,
			this.head,
			this.face,
			this.neck,
			this.body,
			this.hand,
			this.feet,
			this.pin,
			this.photo,
			this.x,
			this.y,
			this.frame,
			1,
			this.rank * 146
		]
		return playerArr.join("|")
	}

	sendRaw(data) {
		if (this.socket && this.socket.writable) {
			Logger.outgoing(data)
			this.socket.write(data + "\0")
		}
	}

	sendXt() {
		this.sendRaw(`%xt%${Array.prototype.join.call(arguments, "%")}%`)
	}

	sendError(err, disconnect) {
		this.sendXt("e", -1, err)

		if (disconnect) this.disconnect()
	}

	disconnect() {
		this.server.removePenguin(this)
	}

	updateColumn(column, value, table) {
		this.database.updateColumn(this.id, column, value, table).catch((err) => {
			Logger.error(err)
		})
	}

	updateClothing(type, item) {
		this[type] = item
		this.updateColumn(type, item)
	}

	getColumn(column, table) {
		return this.database.getColumn(this.id, column, table)
	}

	doesIDExist(ID) {
		return this.database.doesIDExist(ID).then((result) => {
			return result[0]["count(*)"] >= 1
		})
	}
}

module.exports = Penguin