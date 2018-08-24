"use strict"

/*
 * Fully working treasurehunt, ported from Houdini, RBSE and iCPro3.1 by Zaseth.
 */

class TreasureHunt {
	constructor() {
		this.boardMap = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		]

		this.gemLocations = ""
		this.gemAmount = 0
		this.gemsFound = 0
		this.rareGemFound = false

		this.coinAmount = 0
		this.coinsFound = 0
		this.turnAmount = 12
		this.recordNumbers = ""

		this.currentPlayer = 1

		this.tableGames = []
		this.tablePopulation = []
		this.tablePlayers = []

		for (let i = 300; i <= 307; i++) {
			this.tableGames[i] = null
			this.tablePopulation[i] = {}
			this.tablePlayers[i] = []
		}

		this.randomizeMap()
	}

	toString() {
		return this.boardMap.join(",")
	}

	randomizeMap() {
		for (let x = 0; x < 10; x++) {
			for (let y = 0; y < 10; y++) {
				if (this.boardMap[x][y] === 3) continue;

				if (Math.floor(Math.random() * 27) === 13 && x < 9 && y < 9) {
					this.gemLocations += `${x},${y},`
					this.gemAmount++;

					this.boardMap[x][y] = Math.floor(Math.random() * 11) === 1 ? 4 : 2
					this.boardMap[x][y + 1] = this.boardMap[x + 1][y] = this.boardMap[x + 1][y + 1] = 3
				} else if (Math.floor(Math.random() * 3) === 1) {
					this.coinAmount++;
					this.boardMap[x][y] = 1
				} else {
					this.boardMap[x][y] = 0
				}
			}
		}
	}

	makeMove(buttonMC, buttonNum) {
		this.turnAmount -= 1;

		if (this.recordNumbers !== "") this.recordNumbers += ","

		this.recordNumbers += buttonNum.toString()

		const some_pos = this.boardMap[parseInt(this.recordNumbers.substr(-1)) * 10 + buttonNum]

		if (some_pos === 2 || some_pos === 3) {
			this.gemsFound += 0.25;
		} else if (some_pos === 4) {
			this.rareGemFound = true
		} else if (some_pos === 1) {
			this.coinsFound += 1;
		}

		this.currentPlayer === 1 ? this.currentPlayer = 2 : this.currentPlayer = 1

		if (this.turnAmount === 0) {
			let totalAmount = this.coinsFound + (this.gemsFound * 25)

			if (this.rareGemFound) totalAmount += 100

			return ["done", totalAmount]
		} else {
			return ["ongoing"]
		}
	}

	handleGetTable(data, penguin) {
		data.splice(0, 4)

		let tablePopulation = ""

		for (const tableId of data) {
			if (this.tablePopulation[tableId]) {
				const seatId = Object.keys(this.tablePopulation[tableId]).length

				tablePopulation += `${tableId}|${seatId}%`
			}
		}

		penguin.sendXt("gt", -1, tablePopulation.slice(0, -1))
	}

	handleJoinTable(data, penguin) {
		penguin.server.tableGames = this.tableGames
		penguin.server.tablePopulation = this.tablePopulation
		penguin.server.tablePlayers = this.tablePlayers

		const tableId = parseInt(data[4])

		if (isNaN(tableId)) return

		let seatId = Object.keys(this.tablePopulation[tableId]).length

		if (!this.tableGames[tableId]) this.tableGames[tableId] = this

		seatId += 1

		this.tablePopulation[tableId][penguin.username] = penguin
		this.tablePlayers[tableId].push(penguin)

		penguin.sendXt("jt", -1, tableId, seatId)
		penguin.room.sendXt("ut", -1, tableId, seatId)

		penguin.tableId = tableId
	}

	handleLeaveTable(data, penguin) {
		return penguin.server.gameManager.leaveTable(penguin)
	}

	handleGetGame(data, penguin) {
		if (penguin.tableId) {
			const tableId = penguin.tableId
			const players = Object.keys(this.tablePopulation[tableId])
			const [playerOne, playerTwo] = players

			if (this.tablePlayers[tableId].length === 2) return penguin.sendXt("gz", -1, playerOne, "")

			penguin.sendXt("gz", -1, playerOne, playerTwo, `10%10%35%1%12%25%1%1,5%${this.tableGames[tableId].toString()}`)
		}
	}

	handleJoinGame(data, penguin) {
		if (penguin.tableId) {
			const tableId = penguin.tableId
			const players = Object.keys(this.tablePopulation[tableId])
			const seatId = players.length - 1
			const [playerOne, playerTwo] = players

			penguin.sendXt("jz", -1, seatId)

			for (const player of this.tablePlayers[tableId]) {
				player.sendXt("uz", -1, seatId, penguin.username)

				if (this.tablePlayers[tableId].length === 2) player.sendXt("sz", -1, playerOne, playerTwo, `10%10%35%1%12%25%1%1,5%${this.tableGames[tableId].toString()}`)
			}
		}
	}

	handleSendMove(data, penguin) {
		if (penguin.tableId) {
			const tableId = penguin.tableId

			if (this.tablePlayers[tableId].indexOf(penguin) < 2 && this.tablePlayers[tableId].length >= 2) {
				const buttonMC = String(data[4])
				const digDirection = String(data[5])
				const buttonNum = parseInt(data[6])
				const seatId = this.tablePlayers[tableId].indexOf(penguin)

				if (this.tableGames[tableId].currentPlayer === (seatId + 1)) {
					const result = this.tableGames[tableId].makeMove(buttonMC, buttonNum)

					if (result[0] === "done") {
						penguin.addCoins(result[1])
						this.tablePlayers[tableId][(seatId === 0 ? 1 : 0)].addCoins(result[1])
					}

					for (const player of this.tablePlayers[tableId]) {
						player.sendXt("zm", -1, buttonMC, digDirection, buttonNum)

						if (result[0] === "done") player.sendXt("zo", -1, player.coins)
					}
				}
			}
		}
	}
}

module.exports = TreasureHunt