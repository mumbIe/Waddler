"use strict"

const sp = require("../utils/sp")

class Player {
	static handleSendPosition(data, penguin) {
		const x = parseInt(data[4]),
			y = parseInt(data[5])

		if (isNaN(x) || isNaN(y)) return penguin.disconnect()

		penguin.x = x
		penguin.y = y

		if (penguin.coinDig !== 0) penguin.coinDig = 0

		penguin.room.sendXt("sp", -1, penguin.id, x, y)
	}

	static handleSendFrame(data, penguin) {
		const frameID = parseInt(data[4])

		if (isNaN(frameID)) return penguin.disconnect()

		penguin.frame = frameID

		penguin.room.sendXt("sf", -1, penguin.id, frameID)
	}

	static handleSendAction(data, penguin) {
		const actionID = parseInt(data[4])

		if (isNaN(actionID)) return penguin.disconnect()

		penguin.frame = 1

		penguin.room.sendXt("sa", -1, penguin.id, actionID)
	}

	static handleSendSnowball(data, penguin) {
		const x = parseInt(data[4]),
			y = parseInt(data[5])

		if (isNaN(x) || isNaN(y)) return penguin.disconnect()

		penguin.room.sendXt("sb", -1, penguin.id, x, y)
	}

	static handleSendEmote(data, penguin) {
		const emoteID = parseInt(data[4])

		if (isNaN(emoteID)) return penguin.disconnect()

		penguin.room.sendXt("se", -1, penguin.id, emoteID)
	}

	static handleSendJoke(data, penguin) {
		const jokeID = parseInt(data[4])

		if (isNaN(jokeID)) return penguin.disconnect()

		penguin.room.sendXt("sj", -1, penguin.id, jokeID)
	}

	static handleSendSafeMessage(data, penguin) {
		const safeMessageID = parseInt(data[4])

		if (isNaN(safeMessageID)) return penguin.disconnect()

		penguin.room.sendXt("ss", -1, penguin.id, safeMessageID)
	}

	static handleSendTourGuide(data, penguin) {
		const tourGuideID = parseInt(data[4])

		if (isNaN(tourGuideID)) return penguin.disconnect()

		penguin.room.sendXt("sg", -1, penguin.id, tourGuideID)
	}

	static handleSendMascotMessage(data, penguin) {
		const mascotMessageID = parseInt(data[4])

		if (isNaN(mascotMessageID)) return penguin.disconnect()

		penguin.room.sendXt("sma", -1, penguin.id, mascotMessageID)
	}

	static handleGetPlayer(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			penguin.database.getPlayer(penguinID).then((result) => {
				const playerInfo = [
					result.ID,
					result.username,
					1,
					result.color,
					result.head,
					result.face,
					result.neck,
					result.body,
					result.hand,
					result.feet,
					result.pin,
					result.photo
				]
				penguin.sendXt("gp", -1, playerInfo.join("|") + "|")
			})
		})
	}

	static handleHeartBeat(data, penguin) {
		penguin.sendXt("h", -1)
	}

	static handleLastRevision(data, penguin) {
		penguin.sendXt("glr", -1, 1337)
	}

	static handleSendLine(data, penguin) {
		const lineID = parseInt(data[4])

		if (isNaN(lineID)) return penguin.disconnect()

		penguin.room.sendXt("sl", -1, penguin.id, lineID)
	}

	static handleSendMessage(data, penguin) {
		let message = String(data[5])

		if (message.length <= 0 || message.length > 48 && !penguin.moderator) return penguin.sendError(5, true)
		if (penguin.muted) return
		if (penguin.moderator) return penguin.room.sendXt("mm", -1, message, penguin.id)

		penguin.room.sendXt("sm", -1, penguin.id, message)
	}

	static handleMineCoins(data, penguin) {
		if (penguin.frame !== 26) return penguin.sendError(5, true)
		if (penguin.coinDig > 5) return

		const amount = sp.getRandomCoins()

		penguin.addCoins(amount)
		penguin.sendXt("cdu", -1, amount, penguin.coins)
		penguin.coinDig++;
	}

	static handleSendQuickMessage(data, penguin) {
		const quickMessageID = parseInt(data[4])

		if (isNaN(quickMessageID)) return penguin.disconnect()

		penguin.room.sendXt("sq", -1, penguin.id, quickMessageID)
	}

	static handleUpdateClothing(data, penguin) {
		const type = String(data[2].substr(2)),
			item = parseInt(data[4])

		const types = {
			"upc": "color",
			"uph": "head",
			"upf": "face",
			"upn": "neck",
			"upb": "body",
			"upa": "hand",
			"upe": "feet",
			"upl": "pin",
			"upp": "photo"
		}

		if (isNaN(item)) return penguin.disconnect()
		if (!types[type]) return penguin.disconnect()

		penguin.room.sendXt(type, -1, penguin.id, item)
		penguin.updateClothing(types[type], item)
	}

	static handleAddItem(data, penguin) {
		const item = parseInt(data[4])

		if (isNaN(item)) return penguin.disconnect()

		penguin.addItem(item)
	}

	static handleGetInventory(data, penguin) {
		let inventory = []

		penguin.database.getColumn(penguin.id, "itemID", "inventory").then((result) => {
			if (result.length <= 0) return penguin.sendXt("gi", -1, "")

			result.forEach(row => {
				inventory.push(row.itemID)
			})

			penguin.inventory = inventory

			penguin.sendXt("gi", -1, inventory.join("%"))
		})
	}

	static handleOpenPlayerBook(data, penguin) {
		if (isNaN(parseInt(data[4])) || isNaN(parseInt(data[5]))) return

		penguin.room.sendXt("at", -1, penguin.id)
	}

	static handleClosePlayerBook(data, penguin) {
		if (isNaN(parseInt(data[4]))) return

		penguin.room.sendXt("rt", -1, penguin.id)
	}
}

module.exports = Player