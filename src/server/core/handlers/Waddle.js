"use strict"

/*
 * Fully working waddle handler, ported from Kitsune by Zaseth.
 */

const Room = require("../system/Room")

let waddlesById = {}
waddlesById[100] = ["", "", "", ""]
waddlesById[101] = ["", "", ""]
waddlesById[102] = ["", ""]
waddlesById[103] = ["", ""]

let waddleUsers = {}

waddleUsers[100] = {}
waddleUsers[101] = {}
waddleUsers[102] = {}
waddleUsers[103] = {}

let waddleRoomId = null

let waddleRooms = {}

class Waddle {
	static handleGetWaddlesPopulationById(data, penguin) {
		const waddleIds = data.splice(4, 4)

		const waddlePopulation = waddleIds.map((waddleId) => [waddleId, waddlesById[waddleId].join(",")].join("|"))

		penguin.sendXt("gw", -1, waddlePopulation.join("%"))
	}

	static handleSendJoinWaddleById(data, penguin) {
		const waddleId = parseInt(data[4])

		const playerSeat = waddlesById[waddleId].indexOf("")

		waddleUsers[waddleId][playerSeat] = penguin
		waddlesById[waddleId][playerSeat] = penguin.username

		penguin.sendXt("jw", -1, playerSeat)

		if (playerSeat === waddlesById[waddleId].length - 1) this.startWaddle(waddleId)

		penguin.room.sendXt("uw", -1, waddleId, playerSeat, penguin.username)
	}

	static startWaddle(waddleId) {
		for (const seatIndex in waddlesById[waddleId]) {
			waddlesById[waddleId][seatIndex] = ""
		}

		if (waddleRoomId === null) waddleRoomId = 7

		waddleRoomId++;

		const roomId = this.determineRoomId(waddleId)
		let waddleRoom = (waddleRoomId * 42) % 365

		waddleRooms[waddleRoom] = new Room(roomId)

		const userCount = waddleUsers[waddleId].length

		for (const i in waddleUsers[waddleId]) {
			const waddlePenguin = waddleUsers[waddleId][i]

			waddlePenguin.waddleRoom = waddleRoom

			waddlePenguin.sendXt("sw", -1, roomId, waddleRoom, userCount)
		}

		waddleUsers[waddleId] = []
	}

	static determineRoomId(waddleId) {
		if ([100, 101, 102, 103].includes(waddleId)) return 999
	}

	static handleLeaveWaddle(data, penguin) {
		this.leaveWaddle(penguin)
	}

	static leaveWaddle(penguin) {
		for (const index in waddleUsers) {

			for (const _index in waddleUsers[index]) {

				if (penguin === waddleUsers[index][_index]) {
					const waddleId = waddleUsers[index]
					const playerSeat = waddleUsers[_index]

					if (waddlesById[waddleId][playerSeat] !== undefined) waddlesById[waddleId][playerSeat] = ""

					penguin.room.sendXt("uw", -1, waddleId, playerSeat)

					break;
				}
			}
		}

		penguin.waddleRoom = null
	}

	static handleJoinWaddle(data, penguin) {
		penguin.room.removePenguin(penguin)

		const roomId = parseInt(data[4])

		if (penguin.waddleRoom !== null) {
			waddleRooms[penguin.waddleRoom].addPenguin(penguin, [0, 0])
		}
	}
}

module.exports = Waddle