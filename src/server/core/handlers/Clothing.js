"use strict"

class Clothing {
	static handleUpdateClothing(data, penguin) {
		const type = String(data[2].substr(2)),
			item = parseInt(data[4])

		const types = {
			"upc": "color",
			"uph": "head",
			"upf": "face",
			"upn": "neck",
			"upb": "body",
			"upa": "hand",
			"upe": "feet",
			"upl": "pin",
			"upp": "photo"
		}

		if (isNaN(item)) return penguin.disconnect()
		if (!types[type]) return penguin.disconnect()

		penguin.room.sendXt(type, -1, penguin.id, item)
		penguin.updateClothing(types[type], item)
	}

	static handleAddItem(data, penguin) {
		const item = parseInt(data[4])

		if (isNaN(item)) return penguin.disconnect()

		penguin.addItem(item)
	}

	static handleGetInventory(data, penguin) {
		let inventory = []

		penguin.database.getColumn(penguin.id, "itemID", "inventory").then((result) => {
			if (result.length <= 0) return penguin.sendXt("gi", -1, "")

			result.forEach(row => {
				inventory.push(row.itemID)
			})

			penguin.inventory = inventory

			penguin.sendXt("gi", -1, inventory.join("%"))
		}).catch((err) => {
			console.error(err)
		})
	}
}

module.exports = Clothing