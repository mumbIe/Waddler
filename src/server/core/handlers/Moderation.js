"use strict"

class Moderation {
	static handleBan(data, penguin) {
		if (!penguin.moderator) return

		const toBan = parseInt(data[4])

		if (isNaN(toBan)) return penguin.disconnect()

		penguin.doesIDExist(toBan).then((exists) => {
			if (!exists) return

			penguin.database.updateColumn(toBan, "banned", 1)

			const playerObj = penguin.server.getPenguinById(toBan)

			if (playerObj) {
				playerObj.sendXt("b", -1)
				playerObj.disconnect()
			}
		})
	}

	static handleKick(data, penguin) {
		if (!penguin.moderator) return

		const toKick = parseInt(data[4])

		if (isNaN(toKick)) return penguin.disconnect()

		penguin.doesIDExist(toKick).then((exists) => {
			if (!exists) return

			const playerObj = penguin.server.getPenguinById(toKick)

			if (playerObj) playerObj.sendError(5, true)
		})
	}

	static handleMute(data, penguin) {
		if (!penguin.moderator) return

		const toMute = parseInt(data[4])

		if (isNaN(toMute)) return penguin.disconnect()

		penguin.doesIDExist(toMute).then((exists) => {
			if (!exists) return

			let playerObj = penguin.server.getPenguinById(toMute)

			if (playerObj) playerObj.muted = !playerObj.muted
		})
	}
}

module.exports = Moderation