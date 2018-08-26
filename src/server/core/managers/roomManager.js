"use strict"

const Logger = require("../../Logger")
const Room = require("../system/Room")
const Rooms = require("../../crumbs/rooms")

class roomManager {
	constructor() {
		this.rooms = []

		for (const id of Object.keys(Rooms)) {
			if (id < 900) {
				this.createRoom(id)
			}
		}

		Logger.info(`Loaded ${this.rooms.length} rooms`)
	}

	createRoom(id) {
		if (!this.rooms[id]) {
			return this.rooms[id] = new(require("../system/Room"))(id, this)
		}
	}

	getRoom(id) {
		if (this.rooms[id]) {
			return this.rooms[id]
		} else {
			return false
		}
	}

	checkIgloo(id) {
		if (this.rooms[id]) {
			if (this.rooms[id].open === true) {
				return true
			}
		}
	}

	closeIgloo(id) {
		if (this.rooms[id]) {
			return (this.rooms[id].open = false)
		}
	}

	checkRoomFull(id) {
		if (this.rooms[id]) {
			return this.rooms[id].penguins.length === Rooms[id].MaxUsers
		}
		return false
	}
}

module.exports = roomManager