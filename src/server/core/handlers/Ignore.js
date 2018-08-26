"use strict"

class Ignore {
	static handleGetIgnored(data, penguin) {
		let ignoreStr = ""

		penguin.knex("ignored").select("ignoredID", "ignoredUsername").where("ID", penguin.id).then((result) => {
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
			let usernameToIgnore

			if (playerObj) {
				usernameToIgnore = playerObj.username
			} else {
				penguin.database.getColumn(toIgnore, "username").then((result) => {
					usernameToIgnore = result[0].username
				})
			}

			penguin.knex("ignored").insert({
				ID: penguin.id,
				ignoredID: toIgnore,
				ignoredUsername: usernameToIgnore
			}).then(() => {
				penguin.sendXt("an", -1, toIgnore)

				this.handleGetIgnored("Your mom", penguin)
			})
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
			let usernameToRemove

			if (playerObj) {
				usernameToRemove = playerObj.username
			} else {
				penguin.database.getColumn(toRemove, "username").then((result) => {
					usernameToRemove = result[0].username
				})
			}

			penguin.knex("ignored").del().where({
				ID: penguin.id,
				ignoredID: toRemove,
				ignoredUsername: usernameToRemove
			}).then(() => {
				penguin.sendXt("rn", -1, toRemove)
			})
		})
	}
}

module.exports = Ignore