"use strict"

const Logger = require("../Logger")
const GameDataEncryptor = require("./utils/GameDataEncryptor")
const xtHandlers = require("./IWorld")

class DataHandler {
	constructor(server) {
		this.server = server
		this.database = server.database
		this.failedLogins = {}
	}

	handleLogin(data, penguin) {
		const username = data.split("[")[2].split("]")[0]
		const password = data.split("[")[4].split("]")[0]

		this.database.getPlayer(username).then((result) => {
			if (result.banned >= 1) return penguin.sendError(603, true)

			if (this.server.type === "login") {
				if (this.failedLogins[penguin.ipAddr] === undefined) this.failedLogins[penguin.ipAddr] = []
				if (this.failedLogins[penguin.ipAddr].length > 7) return penguin.sendError(150, true)

				const hash = GameDataEncryptor.hashPassword(GameDataEncryptor.decryptZaseth(password, penguin.randomKey))
				if (result.password === hash && this.failedLogins[penguin.ipAddr].length < 7) {
					delete this.failedLogins[penguin.ipAddr]

					penguin.loginKey = GameDataEncryptor.generateRandomKey(12)

					this.database.updateColumn(username, "loginKey", penguin.loginKey)

					penguin.sendXt("sd", -1, this.server.getServers())
					penguin.sendXt("l", -1, penguin.id, penguin.loginKey, "", this.server.getServerPopulation())
				} else {
					this.failedLogins[penguin.ipAddr].push(1)

					return penguin.sendError(101, true)
				}
			} else {
				const penguinObj = this.server.isPenguinOnline(result.ID)

				if (penguinObj) return penguinObj.disconnect()

				const hash = GameDataEncryptor.hashPassword(GameDataEncryptor.decryptZaseth(password, result.loginKey))

				if (result.password === hash) {
					penguin.sendXt("l", -1)
					penguin.setPenguin(result)
				} else {
					return penguin.sendError(101, true)
				}
			}
		}).catch(() => {
			return penguin.sendError(100, true)
		})
	}

	handleGame(data, penguin) {
		const packet = data

		data = data.split("%")
		data.shift()

		const xt_packet = {
			xt: data[0],
			type: data[1],
			handler: data[2]
		}

		if (xt_packet.xt !== "xt") return penguin.disconnect()

		const xt_method = xtHandlers[xt_packet.type][xt_packet.handler]

		if (!xt_method) return Logger.unknown(packet)

		const xt_attributes = {
			func: xt_method["func"],
			file: xt_method["file"],
			throttle: xt_method["throttle"]
		}

		if (typeof xt_attributes.file[xt_attributes.func] !== "function") return Logger.error(`No function found for ${xt_attributes.func}`)

		if (!xt_attributes.throttle) return xt_attributes.file[xt_attributes.func](data, penguin)

		const now = new Date()
		const timestamp = (now.getTime() / 1000)

		if (penguin.throttle[xt_packet.handler] === undefined || !penguin.throttle[xt_packet.handler]) {
			penguin.throttle[xt_packet.handler] = [0, timestamp]
		} else {
			penguin.throttle[xt_packet.handler][0]++;

			now.setMinutes(now.getMinutes() - 1)

			if (Math.round(now.getTime() / 1000) < Math.round(penguin.throttle[xt_packet.handler][1])) {
				if (penguin.throttle[xt_packet.handler][0] >= 150) {
					Logger.info("A client has been disconnected for spamming")

					return penguin.sendError(800, true)
				}
			} else {
				delete penguin.throttle[xt_packet.handler]
			}

			if (penguin.throttle[xt_packet.handler] !== undefined) penguin.throttle[xt_packet.handler][1] = timestamp
		}

		xt_attributes.file[xt_attributes.func](data, penguin)
	}

	handleXML(data, penguin) {
		if (data === "<policy-file-request/>") {
			return penguin.sendRaw(`<cross-domain-policy><allow-access-from domain="*" to-ports="*"/></cross-domain-policy>`)
		} else {
			const type = data.split("n='")[1].split("'")[0]

			if (!["verChk", "rndK", "login"].includes(type)) return penguin.disconnect()

			if (type === "verChk") {
				if (Number(data.split("v='")[1].split("'")[0]) !== 153) return penguin.disconnect()
				return penguin.sendRaw(`<msg t="sys"><body action="apiOK" r="0"></body></msg>`)
			}

			if (type === "rndK") {
				penguin.randomKey = GameDataEncryptor.generateRandomKey(12)
				return penguin.sendRaw(`<msg t="sys"><body action="rndK" r="-1"><k>${penguin.randomKey}</k></body></msg>`)
			}

			if (type === "login") {
				if (data.split("z='")[1].split("'")[0] !== "w1") return penguin.disconnect()
				return this.handleLogin(data, penguin)
			}
		}
	}
}

module.exports = DataHandler