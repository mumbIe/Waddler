"use strict"

class Ignore {
	static handleGetIgnored(data, penguin) {
		let ignoreStr = ""

		penguin.database.getIgnored(penguin.id).then((result) => {
			if (result.length <= 0) return penguin.sendXt("gn", -1, "")

			result.forEach(row => {
				penguin.ignored.push(`${row.ignoredID}|${row.ignoredUsername}`)
				ignoreStr += `${row.ignoredID}|${row.ignoredUsername}`
			})

			penguin.sendXt("gn", -1, ignoreStr)
		})
	}

	static handleAddIgnore(data, penguin) {
		const toIgnore = parseInt(data[4])

		if (isNaN(toIgnore)) return penguin.disconnect()

		penguin.doesIDExist(toIgnore).then((exists) => {
			if (!exists) return

			if (penguin.buddies.length !== 0) {
				penguin.buddies.forEach(buddy => {
					buddy = buddy.split("|")
					if (Number(buddy[0]) === toIgnore) return
				})
				penguin.ignored.forEach(ignore => {
					ignore = ignore.split("|")
					if (Number(ignore[0]) === toIgnore) return
				})
			}

			const playerObj = penguin.server.getPenguinById(toIgnore)

			if (playerObj) {
				penguin.database.addIgnore(penguin.id, toIgnore, playerObj.username).then(() => {
					penguin.sendXt("an", -1, toIgnore)

					this.handleGetIgnored("Your mom", penguin)
				})
			} else {
				penguin.database.getColumn(toIgnore, "username").then((result) => {
					const usernameToIgnore = result[0].username

					penguin.database.addIgnore(penguin.id, toIgnore, usernameToIgnore).then(() => {
						penguin.sendXt("an", -1, toIgnore)

						this.handleGetIgnored("Your mom", penguin)
					})
				})
			}
		})
	}

	static handleRemoveIgnore(data, penguin) {
		const toRemove = parseInt(data[4])

		if (isNaN(toRemove)) return penguin.disconnect()

		penguin.doesIDExist(toRemove).then((exists) => {
			if (!exists) return

			if (penguin.ignored.length <= 0) return

			penguin.ignored.forEach(ignore => {
				ignore = ignore.split("|")
				if (Number(ignore[0]) !== toRemove) return
			})

			const playerObj = penguin.server.getPenguinById(toRemove)

			if (playerObj) {
				penguin.database.removeIgnore(penguin.id, toRemove, playerObj.username).then(() => {
					penguin.sendXt("rn", -1, toRemove)
				})
			} else {
				penguin.database.getColumn(toRemove, "username").then((result) => {
					const usernameToRemove = result[0].username

					penguin.database.removeIgnore(penguin.id, toRemove, usernameToRemove).then(() => {
						penguin.sendXt("rn", -1, toRemove)
					})
				})
			}
		})
	}
}

module.exports = Ignore