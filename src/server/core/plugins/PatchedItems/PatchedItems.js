"use strict"

class PatchedItems {
	static containsBaitItem(itemID) {
		return require("./items").includes(itemID)
	}
}

module.exports = PatchedItems