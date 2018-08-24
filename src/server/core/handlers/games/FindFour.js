"use strict"

/*
 * Fully working FindFour, ported from Kitsune by Zaseth.
 */

class FindFour {
	constructor() {
		this.currentPlayer = 1
		this.boardMap = [
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0]
		]

		this.tableGames = []
		this.tablePopulation = []
		this.tablePlayers = []

		for (let i = 200; i < 208; i++) {
			this.tableGames[i] = null
			this.tablePopulation[i] = {}
			this.tablePlayers[i] = []
		}
	}

	toString() {
		return this.boardMap.join(",")
	}

	validPlacement(column, row) {
		if (this.boardMap[row][column] !== 0) return false
		return true
	}

	isFull() {
		for (const row of this.boardMap) {
			if (row.includes(0)) return false
		}
		return true
	}

	determineColumnWin(column) {
		let streak = 0
		for (const row of this.boardMap) {
			if (row[column] === this.currentPlayer) {
				streak++;
				if (streak === 4) return 1
			} else {
				streak = 0
			}
		}
		return 3
	}

	determineVerticalWin() {
		for (let column = 0; column < this.boardMap.length; column++) {
			const result = this.determineColumnWin(column)
			if (result === 1) return result
		}
		return 3
	}

	determineHorizontalWin() {
		let streak = 0
		for (let row = 0; row < this.boardMap.length; row++) {
			for (let column = 0; column < this.boardMap[row].length; column++) {
				if (this.boardMap[row][column] === this.currentPlayer) {
					streak++;
					if (streak === 4) return 1
				} else {
					streak = 0
				}
			}
		}
		return 3
	}

	determineDiagonalWin() {
		let streak = 0
		for (let row = 0; row < this.boardMap.length; row++) {
			for (let column = 0; column < this.boardMap[row].length; column++) {
				if (this.boardMap[row][column] === this.currentPlayer) {
					if (this.boardMap[row + 1] && this.boardMap[row + 1][column + 1] === this.currentPlayer &&
						this.boardMap[row + 2] && this.boardMap[row + 2][column + 2] === this.currentPlayer &&
						this.boardMap[row + 3] && this.boardMap[row + 3][column + 3] === this.currentPlayer) {
						return 1
					}
					if (this.boardMap[row - 1] && this.boardMap[row - 1][column - 1] === this.currentPlayer &&
						this.boardMap[row - 2] && this.boardMap[row - 2][column - 2] === this.currentPlayer &&
						this.boardMap[row - 3] && this.boardMap[row - 3][column - 3] === this.currentPlayer) {
						return 1
					}
					if (this.boardMap[row - 1] && this.boardMap[row - 1][column + 1] === this.currentPlayer &&
						this.boardMap[row - 2] && this.boardMap[row - 2][column + 2] === this.currentPlayer &&
						this.boardMap[row - 3] && this.boardMap[row - 3][column + 3] === this.currentPlayer) {
						return 1
					}
				}
			}
		}
		return 3
	}

	processBoard() {
		if (this.isFull()) return 2
		const horizontalWin = this.determineHorizontalWin()
		if (horizontalWin === 1) return horizontalWin
		const verticalWin = this.determineVerticalWin()
		if (verticalWin === 1) return verticalWin
		const diagonalWin = this.determineDiagonalWin()
		if (diagonalWin === 1) return diagonalWin
		return 0
	}

	placeChip(column, row) {
		if (this.validPlacement(column, row)) {
			this.boardMap[row][column] = this.currentPlayer

			const gameStatus = this.processBoard()

			if (gameStatus === 0) this.currentPlayer === 1 ? this.currentPlayer = 2 : this.currentPlayer = 1

			return gameStatus
		} else {
			return -1
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

			penguin.sendXt("gz", -1, playerOne, playerTwo, this.tableGames[tableId].toString())
		}
	}

	handleJoinGame(data, penguin) {
		if (penguin.tableId) {
			const tableId = penguin.tableId
			const seatId = Object.keys(this.tablePopulation[tableId]).length - 1

			penguin.sendXt("jz", -1, seatId)

			for (const player of this.tablePlayers[tableId]) {
				player.sendXt("uz", -1, seatId, penguin.username)

				if (seatId === 1) player.sendXt("sz", -1, 0)
			}
		}
	}

	handleSendMove(data, penguin) {
		if (penguin.tableId) {
			const tableId = penguin.tableId

			if (this.tablePlayers[tableId].indexOf(penguin) < 2 && this.tablePlayers[tableId].length >= 2) {
				const chipColumn = parseInt(data[4])
				const chipRow = parseInt(data[5])

				if (isNaN(chipColumn) || isNaN(chipRow)) return

				const seatId = this.tablePlayers[tableId].indexOf(penguin)

				if (this.tableGames[tableId].currentPlayer === (seatId + 1)) {
					const result = this.tableGames[tableId].placeChip(chipColumn, chipRow)

					if (result === 1) {
						penguin.addCoins(20)
						this.tablePlayers[tableId][(seatId === 0 ? 1 : 0)].addCoins(10)
					}
					if (result === 2) {
						penguin.addCoins(5)
						this.tablePlayers[tableId][(seatId === 0 ? 1 : 0)].addCoins(5)
					}

					for (const player of this.tablePlayers[tableId]) {
						player.sendXt("zm", -1, seatId, chipColumn, chipRow)

						if (result === 1 || result === 2) player.sendXt("zo", -1, player.coins)
					}
				}
			}
		}
	}
}

module.exports = FindFour