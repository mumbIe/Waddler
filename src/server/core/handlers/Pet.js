"use strict"

let puffles = {}

class Pet {
	static handleUpdatePuffle(type, value, puffleID, penguin) {
		if (isNaN(puffleID) || isNaN(value)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			penguin.updateColumn(type, value, "puffles")
		})
	}

	static joinPuffleData(puffleData, iglooAppend = false) {
		let puffleArray = []

		for (const i in puffleData) {
			let puffle = puffleData[i]
			let puffleID = puffle["puffleID"]
			let puffleDetails = [puffleID, puffle["puffleName"], puffle["puffleType"], puffle["puffleFood"], puffle["pufflePlay"], puffle["puffleRest"]]

			if (iglooAppend) {
				if (puffles[puffleID] === undefined) {
					puffles[puffleID] = [100, 100, 100, 0, 0, 0, 0]
				}
				puffleDetails = puffleDetails.concat(puffles[puffleID])
			}
			puffleArray.push(puffleDetails.join("|"))
		}
		return puffleArray.join("%")
	}

	static handleGetPufflesByPlayerId(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			penguin.database.getColumn(penguinID, "*", "puffles").then((result) => {
				if (result.length <= 0) return penguin.sendXt("pg", -1)

				penguin.sendXt("pg", -1, this.joinPuffleData(result, true))
			})
		})
	}

	static handleGetPuffles(data, penguin) {
		penguin.database.getColumn(penguin.id, "*", "puffles").then((result) => {
			if (result.length <= 0) return penguin.sendXt("pg", -1)

			penguin.sendXt("pgu", -1, this.joinPuffleData(result, true))
		})
	}

	static handlePuffleActions(data, penguin) {
		const handler = String(data[2])
		const puffleID = parseInt(data[4])

		if (handler === "" || isNaN(puffleID)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			let puffle = this.joinPuffleData(result, true)

			penguin.removeCoins(5)

			if (handler === "p#pr") {
				result[0].puffleRest += 20
				this.handleUpdatePuffle("puffleRest", result[0].puffleRest, puffleID, penguin)
			} else if (handler === "p#pp") {
				result[0].pufflePlay += 20
				this.handleUpdatePuffle("pufflePlay", result[0].pufflePlay, puffleID, penguin)
			} else if (handler === "p#pt") {
				result[0].puffleFood += 10
				this.handleUpdatePuffle("puffleFood", result[0].puffleFood, puffleID, penguin)
			} else if (handler === "p#pf") {
				result[0].puffleFood += 20
				this.handleUpdatePuffle("puffleFood", result[0].puffleFood, puffleID, penguin)
			} else if (handler === "p#pb") {
				result[0].pufflePlay += 20
				this.handleUpdatePuffle("pufflePlay", result[0].pufflePlay, puffleID, penguin)
			}

			puffle = this.joinPuffleData(result, true)

			if (handler === "p#pr") {
				return penguin.room.sendXt("pr", -1, puffle)
			} else if (handler === "p#pp") {
				return penguin.room.sendXt("pp", -1, puffle, 1)
			} else if (handler === "p#pt") {
				return penguin.room.sendXt("pt", -1, penguin.coins, puffle, parseInt(data[5]))
			} else if (handler === "p#pf") {
				return penguin.room.sendXt("pf", -1, penguin.coins, puffle)
			} else if (handler === "p#pb") {
				return penguin.room.sendXt("pb", -1, penguin.coins, puffle)
			}
		})
	}

	static handlePuffleInteractions(data, penguin) {
		const handler = String(data[2])
		const puffleID = parseInt(data[4])

		if (handler === "" || isNaN(puffleID)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			let puffle = this.joinPuffleData(result, true)

			if (handler === "p#ir") {
				return penguin.room.sendXt("ir", -1, puffle)
			} else if (handler === "p#ip") {
				return penguin.room.sendXt("ip", -1, puffle)
			} else if (handler === "p#if") {
				return penguin.room.sendXt("if", -1, puffle)
			}
		})
	}

	static handlePuffleInitInteractions(data, penguin) {
		const handler = String(data[2])
		const puffleID = parseInt(data[4])
		const puffleX = parseInt(data[5])
		const puffleY = parseInt(data[6])

		if (handler === "" || isNaN(puffleID) || isNaN(puffleX) || isNaN(puffleY)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			let puffle = this.joinPuffleData(result, true)

			penguin.removeCoins(5)

			if (handler === "p#pir") {
				result[0].puffleRest += 20
				this.handleUpdatePuffle("puffleRest", result[0].puffleRest, puffleID, penguin)
			} else if (handler === "p#pip") {
				result[0].pufflePlay += 20
				this.handleUpdatePuffle("pufflePlay", result[0].pufflePlay, puffleID, penguin)
			}

			puffle = this.joinPuffleData(result, true)

			if (handler === "p#pir") {
				return penguin.room.sendXt("pir", -1, puffleID, puffleX, puffleY)
			} else if (handler === "p#pip") {
				return penguin.room.sendXt("pip", -1, puffleID, puffleX, puffleY)
			}
		})
	}

	static handlePuffleMove(data, penguin) {
		const puffleID = parseInt(data[4])
		const puffleX = parseInt(data[5])
		const puffleY = parseInt(data[6])

		if (isNaN(puffleID) || isNaN(puffleX) || isNaN(puffleY)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			let puffle = this.joinPuffleData(result, true)

			if (puffles[puffleID] === undefined) return

			puffles[puffleID] = [100, 100, 100, puffleX, puffleY, 0, 0]

			puffle = this.joinPuffleData(result, true)

			penguin.room.sendXt("pm", -1, puffleID, puffleX, puffleY)
		})
	}

	static handlePuffleFrame(data, penguin) {
		const puffleID = parseInt(data[4])
		const puffleFrame = parseInt(data[5])

		if (isNaN(puffleID) || isNaN(puffleFrame)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			penguin.room.sendXt("ps", -1, puffleID, puffleFrame)
		})
	}

	static handlePuffleWalk(data, penguin) {
		const puffleID = parseInt(data[4])

		if (isNaN(puffleID)) return

		penguin.knex("puffles").select("*").where({
			ID: penguin.id,
			puffleID: puffleID
		}).then((result) => {
			if (result.length <= 0) return

			let puffle = this.joinPuffleData(result, true)
			let puffleType = result[0].puffleType
			let handItem = `75${puffleType}`
			let walking

			if (puffles[puffleID] === undefined) return

			if (Number(result[0].puffleWalk) === 0) {
				walking = 1
				penguin.walkingPuffle = puffleID
			} else {
				walking = 0
			}

			puffles[puffleID] = [100, 100, 100, 0, 0, 0, walking]

			this.handleUpdatePuffle("puffleWalk", walking, puffleID, penguin)

			let puffleData = this.joinPuffleData(result, true)

			penguin.room.sendXt("pw", -1, penguin.id, puffleData)
		})
	}

	static handleAdoptPuffle(data, penguin) {
		const puffleType = parseInt(data[4])
		let puffleName = String(data[5])

		if (isNaN(puffleType)) return

		penguin.database.getColumn(penguin.id, "*", "puffles").then((result) => {
			if (result.length >= 20) return penguin.sendError(440)
			if (penguin.coins < 800) return penguin.sendError(401)

			puffleName = String(puffleName).replace(/\W/g, "")

			penguin.knex("puffles").insert({
				ID: penguin.id,
				puffleName: puffleName,
				puffleType: puffleType,
				puffleFood: 100,
				pufflePlay: 100,
				puffleRest: 100,
				puffleWalk: 0
			}).then(() => {
				penguin.removeCoins(800)

				penguin.knex("puffles").select("*").where({
					ID: penguin.id,
					puffleName: puffleName
				}).then((result) => {
					if (result.length <= 0) return

					let puffle = this.joinPuffleData(result)

					penguin.sendXt("pn", -1, penguin.coins, puffle)
				})
			})
		})
	}
}

module.exports = Pet