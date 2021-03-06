"use strict"

const sp = require("../utils/sp")

const FindFour = new(require("./games/FindFour"))
const Mancala = new(require("./games/Mancala"))
const TreasureHunt = new(require("./games/TreasureHunt"))

const gameHandlers = {
	"s": {
		"a#gt": {
			func: "handleGetTable"
		},
		"a#jt": {
			func: "handleJoinTable"
		},
		"a#lt": {
			func: "handleLeaveTable"
		}
	},
	"z": {
		"gz": {
			func: "handleGetGame"
		},
		"jz": {
			func: "handleJoinGame"
		},
		"zm": {
			func: "handleSendMove"
		}
	}
}

class Multiplayer {
	static handleMovePuck(data, penguin) {
		let puckCoords = [parseInt(data[5]), parseInt(data[6]), parseInt(data[7]), parseInt(data[8])].join("%")

		penguin.sendXt("zm", -1, penguin.id, puckCoords)
	}

	static handleGameOver(data, penguin) {
		const score = parseInt(data[4])

		if (isNaN(score)) return penguin.disconnect()
		if (penguin.gameRoomId > 1000) return

		if (sp.isNonDividableGame(penguin.gameRoomId) || penguin.waddleRoom !== null) {
			penguin.addCoins(score)
		} else if (score < 99999) {
			penguin.addCoins(Math.floor(score / 10))
		}

		penguin.sendXt("zo", -1, penguin.coins, 0, 0, 0, 0)
	}

	static handleMultiplayerData(data, penguin) {
		const type = data[1],
			handler = data[2]

		if (sp.isFindFourTable(parseInt(data[4]))) {
			penguin.server.gameManager.gameType = "F"
		} else if (sp.isMancalaTable(parseInt(data[4]))) {
			penguin.server.gameManager.gameType = "M"
		} else if (sp.isTreasureHuntTable(parseInt(data[4]))) {
			penguin.server.gameManager.gameType = "T"
		}

		if (penguin.room.id === 802) {
			return penguin.sendXt("gz", -1, "0%0%0%0%")
		}

		if (penguin.waddleRoom !== null) {
			let waddlePlayers = ""

			for (const i in penguin.room.penguins) {
				const player = penguin.room.penguins[i]

				waddlePlayers += `${player.username}|${player.color}|${player.hand}|${player.username}%`
			}

			return penguin.sendXt("uz", -1, waddlePlayers.length, waddlePlayers.slice(0, -1))
		}

		const method = gameHandlers[type][handler]
		const func = method["func"]

		if (penguin.server.gameManager.gameType === "F") {
			return FindFour[func](data, penguin)
		} else if (penguin.server.gameManager.gameType === "M") {
			return Mancala[func](data, penguin)
		} else if (penguin.server.gameManager.gameType === "T") {
			return TreasureHunt[func](data, penguin)
		}
	}
}

module.exports = Multiplayer