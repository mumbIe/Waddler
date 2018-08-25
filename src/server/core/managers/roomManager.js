"use strict"

const Logger = require("../../Logger")
const Room = require("../system/Room")

class roomManager {
	constructor(server) {
		this.rooms = []
		this.server = server

		this.roomCrumbs = require("../../crumbs/rooms")

		this.server.decodeCrumb("rooms").then((room_crumbs) => {
			for (const id of Object.keys(room_crumbs)) {
				if (id < 900) {
					this.createRoom(id)
				}
			}

			Logger.info(`Loaded ${this.rooms.length} rooms`)
		}).catch((err) => {
			console.log(err)
		})
	}

	createRoom(id) {
		if (!this.rooms[id]) {
			return this.rooms[id] = new Room(id, this)
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
			return this.rooms[id].penguins.length === this.roomCrumbs[id].MaxUsers
		}
		return false
	}
}

module.exports = roomManager