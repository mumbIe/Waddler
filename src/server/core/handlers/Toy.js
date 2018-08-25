"use strict"

class Toy {
	static handleOpenPlayerBook(data, penguin) {
		if (isNaN(parseInt(data[4])) || isNaN(parseInt(data[5]))) return

		penguin.room.sendXt("at", -1, penguin.id)
	}

	static handleClosePlayerBook(data, penguin) {
		if (isNaN(parseInt(data[4]))) return

		penguin.room.sendXt("rt", -1, penguin.id)
	}
}

module.exports = Toy