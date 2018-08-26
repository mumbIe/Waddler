"use strict"

class sp {
	static dateToInt() {
		const date = new Date()
		return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
	}
	static getTime() {
		return (Math.floor(new Date() / 1000))
	}

	static range(min, max) {
		const result = []

		for (let i = min; i < max; i += 1) result.push(i)

		return result
	}

	static isNonDividableGame(gameId) {
		return [916, 906, 905, 904, 912].includes(gameId)
	}
	static isFindFourTable(tableId) {
		return this.range(200, 208).includes(tableId)
	}
	static isMancalaTable(tableId) {
		return this.range(100, 104).includes(tableId)
	}
	static isTreasureHuntTable(tableId) {
		return this.range(300, 308).includes(tableId)
	}

	static getRandomCoins() {
		return Math.floor(Math.random() * 100) + 1
	}
	static getRandomRoom() {
		return [100, 110, 300, 400][Math.floor(Math.random() * 4)]
	}
	static getRandomPosition() {
		return Math.floor(Math.random() * 300) + 100
	}
}

module.exports = sp