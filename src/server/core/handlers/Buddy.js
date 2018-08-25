"use strict"

class Buddy {
	static handleGetBuddies(data, penguin) {
		let buddyStr = ""

		penguin.database.getBuddies(penguin.id).then((result) => {
			if (result.length <= 0) return penguin.sendXt("gb", -1, "")

			result.forEach(row => {
				const isBuddyOnline = penguin.server.isPenguinOnline(row.buddyID) ? "1" : "0"

				if (Number(isBuddyOnline) === 1) {
					const onlineBuddy = penguin.server.getPenguinById(row.buddyID)
					onlineBuddy.sendXt("bon", -1, penguin.id)
				}

				penguin.buddies.push(`${row.buddyID}|${row.buddyUsername}`)
				buddyStr += `${row.buddyID}|${row.buddyUsername}|${isBuddyOnline}`
			})

			penguin.sendXt("gb", -1, buddyStr)
		}).catch((err) => {
			console.error(err)
		})
	}

	static handleBuddyAccept(data, penguin) {
		const toAccept = parseInt(data[4])

		if (isNaN(toAccept)) return penguin.disconnect()

		penguin.doesIDExist(toAccept).then((exists) => {
			if (!exists) return

			if (penguin.buddies.length >= 500) return penguin.sendError(901)

			if (penguin.buddies.length !== 0) {
				penguin.buddies.forEach(buddy => {
					buddy = buddy.split("|")
					if (Number(buddy[0]) === toAccept) return
				})
			}

			if (!penguin.requests.includes(toAccept)) return

			const playerObj = penguin.server.getPenguinById(toAccept)

			if (playerObj) {
				penguin.database.addBuddy(penguin.id, toAccept, playerObj.username).then(() => {
					penguin.database.addBuddy(toAccept, penguin.id, penguin.username).then(() => {
						playerObj.sendXt("ba", -1, penguin.id, penguin.username)
						penguin.requests.splice(penguin.requests.indexOf(toAccept), 1)
					})
				})
			} else {
				penguin.database.getColumn(toAccept, "username").then((result) => {
					const usernameToAccept = result[0].username

					penguin.database.addBuddy(penguin.id, toAccept, usernameToAccept).then(() => {
						penguin.database.addBuddy(toAccept, penguin.id, penguin.username).then(() => {
							penguin.sendXt("ba", -1, toAccept, usernameToAccept)
							penguin.requests.splice(penguin.requests.indexOf(toAccept), 1)
						})
					})
				}).catch((err) => {
					console.error(err)
				})
			}
		})
	}

	static handleBuddyRequest(data, penguin) {
		const toRequest = parseInt(data[4])

		if (isNaN(toRequest)) return penguin.disconnect()

		penguin.doesIDExist(toRequest).then((exists) => {
			if (!exists) return

			if (toRequest === penguin.id) return
			if (penguin.buddies.length >= 500) return penguin.sendError(901)

			if (penguin.buddies.length !== 0) {
				penguin.buddies.forEach(buddy => {
					buddy = buddy.split("|")
					if (Number(buddy[0]) === toRequest) return
				})
			}

			const playerObj = penguin.server.getPenguinById(toRequest)

			if (playerObj) {
				if (playerObj.buddies.length >= 500) return playerObj.sendError(901)
				if (playerObj.buddies.length !== 0) {
					playerObj.buddies.forEach(buddy => {
						buddy = buddy.split("|")
						if (Number(buddy[0]) === penguin.id) return
					})
				}

				playerObj.requests.push(penguin.id)
				playerObj.sendXt("br", -1, penguin.id, penguin.username)
			}
		})
	}

	static handleBuddyRemove(data, penguin) {
		const toRemove = parseInt(data[4])

		if (isNaN(toRemove)) return penguin.disconnect()

		penguin.doesIDExist(toRemove).then((exists) => {
			if (!exists) return

			if (penguin.buddies.length === 0) return

			const playerObj = penguin.server.getPenguinById(toRemove)

			if (playerObj) {
				penguin.database.removeBuddy(penguin.id, toRemove, playerObj.username).then(() => {
					penguin.database.removeBuddy(toRemove, penguin.id, penguin.username).then(() => {
						playerObj.sendXt("rb", -1, penguin.id, penguin.username)
					})
				})
			} else {
				penguin.database.getColumn(toRemove, "username").then((result) => {
					const usernameToRemove = result[0].username

					penguin.database.removeBuddy(penguin.id, toRemove, usernameToRemove).then(() => {
						penguin.database.removeBuddy(toRemove, penguin.id, penguin.username).then(() => {
							penguin.sendXt("rb", -1, toRemove, usernameToRemove)
						})
					})
				}).catch((err) => {
					console.error(err)
				})
			}
		})
	}

	static handleBuddyFind(data, penguin) {
		const toFind = parseInt(data[4])

		if (isNaN(toFind)) return penguin.disconnect()

		penguin.doesIDExist(toFind).then((exists) => {
			if (!exists) return

			const playerObj = penguin.server.getPenguinById(toFind)

			if (playerObj) penguin.sendXt("bf", -1, playerObj.room.id)
		})
	}
}

module.exports = Buddy