"use strict"

const NO_ARGUMENT = {
	"ping": "handlePing",
	"date": "handleDate",
	"online": "handleGetOnline",
	"id": "handleGetID"
}

const ONE_ARGUMENT = {
	"ai": "handleAddItem",
	"as": "handleAddStamp",

	"ac": "handleAddCoins",
	"rc": "handleRemoveCoins",

	"ban": "handleBan",
	"kick": "handleKick",
	"mute": "handleMute",
	"unban": "handleUnban",
	"unmute": "handleUnmute",

	"jr": "handleJoinRoom",
	"tp": "handleGotoPlayer",

	"pr": "handlePromote",
	"dm": "handleDemote"
}

const TWO_ARGUMENTS = {
	"gc": "handleGiftCoins"
}

const MULTIPLE_ARGUMENTS = {
	"global": "handleGlobal"
}

class Commands {
	static handleCommand(command, argument, penguin) {
		if (!penguin.server.pluginLoader.getPlugin("Bot")) throw new Error("Bot plugin must be enabled to use commands")

		const Bot = penguin.server.pluginLoader.getPlugin("Bot")

		const splittedCommand = command.split(" ")
		command = splittedCommand[0]

		if (splittedCommand[1] && NO_ARGUMENT[splittedCommand[0]]) return Bot.sendMessage(`${command} doesn't take any argument`, penguin)
		if (splittedCommand[2] && ONE_ARGUMENT[splittedCommand[0]]) return Bot.sendMessage(`${command} needs one argument`, penguin)
		if (!splittedCommand[1] && MULTIPLE_ARGUMENTS[splittedCommand[0]]) return Bot.sendMessage(`${command} needs at least one argument`, penguin)

		const commandCategory = argument.length === 0 && NO_ARGUMENT[command] ? NO_ARGUMENT : argument.length === 1 && ONE_ARGUMENT[command] ? ONE_ARGUMENT : argument.length === 2 && TWO_ARGUMENTS[command] ? TWO_ARGUMENTS : MULTIPLE_ARGUMENTS
		const method = commandCategory[command]

		if (commandCategory === MULTIPLE_ARGUMENTS) argument = argument.join(" ")
		if (commandCategory === ONE_ARGUMENT) argument = argument[0]

		if (!this[method] || typeof this[method] !== "function") return Bot.sendMessage(`${command} is not a valid command`, penguin)

		this[method](argument, penguin, Bot)
	}

	static handlePing(argument, penguin, Bot) {
		return Bot.sendMessage("Pong!", penguin)
	}
	static handleDate(argument, penguin, Bot) {
		return Bot.sendMessage(`The date is: ${require("../../utils/sp").dateToInt()}`, penguin)
	}
	static handleGetOnline(argument, penguin, Bot) {
		let online = penguin.server.penguins.length

		return Bot.sendMessage(online === 1 ? "You're the only one online" : `There are ${online} players online`, penguin)
	}
	static handleGetID(argument, penguin, Bot) {
		return Bot.sendMessage(`Your ID is: ${penguin.id}`, penguin)
	}

	static handleAddItem(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.addItem(parseInt(argument))
	}
	static handleAddStamp(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.addStamp(parseInt(argument))
	}

	static handleAddCoins(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.addCoins(parseInt(argument))
		penguin.sendXt("zo", -1, penguin.coins)
	}
	static handleRemoveCoins(argument, penguin, Bot) {
		if (!penguin.moderator) return
		if (isNaN(argument)) return

		penguin.removeCoins(parseInt(argument))
		penguin.sendXt("zo", -1, penguin.coins)
	}
	static handleGiftCoins(argument, penguin, Bot) {
		if (!penguin.moderator) return
		if (isNaN(argument[0])) return Bot.sendMessage(`/gc <amount> <username>`, penguin)

		const playerObj = penguin.server.getPenguinByUsername(argument[1])

		if (playerObj) {
			playerObj.addCoins(argument[0])
			playerObj.sendXt("zo", -1, playerObj.coins)
		}
	}

	static handleBan(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.database.updateColumn(argument, "banned", 1)

		const playerObj = penguin.server.getPenguinByUsername(argument)

		if (playerObj) {
			playerObj.sendXt("b", -1)
			playerObj.disconnect()

			Bot.sendMessage(`${argument} has been banned`, penguin)
		}
	}
	static handleKick(argument, penguin, Bot) {
		if (!penguin.moderator) return

		const playerObj = penguin.server.getPenguinByUsername(argument)

		if (playerObj) {
			playerObj.sendError(5, true)

			Bot.sendMessage(`${argument} has been kicked`, penguin)
		}
	}
	static handleMute(argument, penguin, Bot) {
		if (!penguin.moderator) return

		const playerObj = penguin.server.getPenguinByUsername(argument)

		if (playerObj) {
			playerObj.muted = !playerObj.muted

			Bot.sendMessage(`${argument} has been muted`, penguin)
			Bot.sendMessage(`You have been muted`, playerObj)
		}
	}

	static handleUnban(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.database.updateColumn(argument, "banned", 0)

		Bot.sendMessage(`${argument} has been unbanned`, penguin)
	}
	static handleUnmute(argument, penguin, Bot) {
		if (!penguin.moderator) return

		const playerObj = penguin.server.getPenguinByUsername(argument)

		if (playerObj) {
			playerObj.muted = false

			Bot.sendMessage(`${argument} has been unmuted`, penguin)
			Bot.sendMessage(`You have been unmuted`, playerObj)
		}
	}

	static handleJoinRoom(argument, penguin, Bot) {
		if (!penguin.moderator) return
		if (isNaN(argument)) return

		require("../../handlers/Navigation").handleJoinRoom({
			4: parseInt(argument),
			5: 100,
			6: 100
		}, penguin)
	}
	static handleGotoPlayer(argument, penguin, Bot) {
		if (!penguin.moderator) return

		const playerObj = penguin.server.getPenguinByUsername(argument)

		if (playerObj) {
			if (playerObj.room.id === penguin.room.id) return Bot.sendMessage(`You're in the same room as ${argument}`, penguin)
			this.handleJoinRoom(playerObj.room.id, penguin, Bot)
			Bot.sendMessage(`${penguin.username} teleported to you`, playerObj)
		}
	}

	static handlePromote(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.database.updateColumn(argument, "moderator", 1)

		Bot.sendMessage(`${argument} has been promoted`, penguin)
	}
	static handleDemote(argument, penguin, Bot) {
		if (!penguin.moderator) return

		penguin.database.updateColumn(argument, "moderator", 0)

		Bot.sendMessage(`${argument} has been demoted`, penguin)
	}

	static handleGlobal(argument, penguin, Bot) {
		if (!penguin.moderator) return

		Bot.sendGlobalMessage(argument, penguin)
	}
}

module.exports = Commands