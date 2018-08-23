"use strict"

const Logger = require("../Logger")
const sp = require("./utils/sp")

class Penguin {
	constructor(socket, server) {
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
		this.throttle = {}

		this.getInventory()
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

	buildPlayerString() {
		if (!this.id || !this.username) return this.disconnect()

		const playerArr = [
			this.id,
			this.username,
			45,
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

	addItem(item) {
		if (this.server.pluginLoader.getPlugin("PatchedItems")) {
			if (this.server.pluginLoader.getPlugin("PatchedItems").containsBaitItem(item) && !this.moderator) {
				return this.sendError(410)
			}
		}
		if (this.inventory.includes(item)) return this.sendError(400)

		const items = require("../crumbs/items")

		if (!items[item]) return this.sendError(402)

		const cost = items[item].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.inventory.push(item)
		this.database.insertItem(this.id, item)
		this.sendXt("ai", -1, item, this.coins)
	}
	addFurniture(furnitureID) {
		const furniture = require("../crumbs/furniture")

		if (!furniture[furnitureID]) return this.sendError(402)

		const cost = furniture[furnitureID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.getColumn("furnitureID", "furniture").then((result) => {
			result.length != 0 ? this.database.updateQuantity(this.id) : this.database.insertFurniture(this.id, furnitureID)

			this.sendXt("af", -1, furnitureID, this.coins)
		}).catch((err) => {
			Logger.error(err)
		})
	}
	addIgloo(igloo) {
		const igloos = require("../crumbs/igloos")

		if (!igloos[igloo]) return this.sendError(402)

		const cost = igloos[igloo].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.database.alreadyOwnsIgloo(this.id).then((result) => {
			let igloos = []

			for (const i of result[0].igloos.split("|")) igloos.push(parseInt(i))

			if (igloos.includes(igloo)) return this.sendError(500)

			this.database.addIgloo(this.id, igloo)

			if (this.room.id === (this.id + 1000)) this.sendXt("au", -1, igloo, this.coins)
		}).catch((err) => {
			Logger.error(err)
		})
	}
	addFloor(floor) {
		const floors = require("../crumbs/floors")

		if (!floors[floor]) return this.sendError(402)

		const cost = floors[floor].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.updateColumn("floor", floor, "igloo")
		this.sendXt("ag", -1, floor, this.coins)
	}
	addCoins(coins) {
		if (isNaN(coins)) return

		this.coins += coins
		this.updateColumn("coins", this.coins)
	}
	addStamp(stampID) {
		if (isNaN(stampID)) return
		if (Number(stampID) === 14 && this.age !== 183) return
		if (Number(stampID) === 20 && this.age !== 365) return

		const stamps = require("../crumbs/stamps")

		if (!stamps[stampID]) return

		if (this.stamps.length != 0) {
			this.stamps.forEach(stamp => {
				stamp = stamp.split("|")
				if (Number(stamp[0]) === stampID) return
			})
		}

		this.database.insertStamp(this.id, stampID).then(() => {
			this.sendXt("aabs", -1, stampID)
		})
	}
	getInventory() {
		let inventory = []

		this.getColumn("itemID", "inventory").then((result) => {
			if (result.length <= 0) return this.sendXt("gi", -1, "")

			result.forEach(row => {
				inventory.push(row.itemID)
			})

			this.inventory = inventory
		}).catch((err) => {
			Logger.error(err)
		})
	}
	getFurniture() {
		this.database.getFurnitureAndQuantity(this.id).then((result) => {
			if (result.length <= 0) return this.sendXt("gf", -1, "")

			result.forEach(row => {
				this.sendXt("gf", -1, [row.furnitureID, row.quantity].join("|") + "|")
			})
		}).catch((err) => {
			Logger.error(err)
		})
	}
	getIgloos() {
		let igloos = []

		this.getColumn("igloos").then((result) => {
			let iglooStr = result[0].igloos

			if (iglooStr.length <= 0) return this.sendXt("go", -1, "")

			igloos.push(iglooStr.split("|").join("|"))

			this.igloos = igloos
		}).catch((err) => {
			Logger.error(err)
		})
	}

	removeCoins(coins) {
		if (isNaN(coins)) return

		this.coins -= coins
		this.updateColumn("coins", this.coins)
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
	getColumnByID(ID, column) {
		return this.database.getColumnByID(ID, column, "penguins")
	}
	doesIDExist(ID) {
		return this.database.doesIDExist(ID).then((result) => {
			return result[0]["count(*)"] >= 1
		})
	}
}

module.exports = Penguin