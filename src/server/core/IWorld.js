"use strict"

const Navigation = require("./handlers/Navigation")

const Player = require("./handlers/Player")
const Igloo = require("./handlers/Igloo")

const Moderation = require("./handlers/Moderation")
const Pet = require("./handlers/Pet")

const Ignore = require("./handlers/Ignore")
const Buddy = require("./handlers/Buddy")

const Stamps = require("./handlers/Stamps")
const Mail = require("./handlers/Mail")

const Multiplayer = require("./handlers/Multiplayer")

const xtHandlers = {
	"s": {
		"j#js": {
			func: "handleJoinServer",
			file: Navigation,
			throttle: false
		},
		"j#jr": {
			func: "handleJoinRoom",
			file: Navigation,
			throttle: true
		},
		"j#jp": {
			func: "handleJoinPlayer",
			file: Navigation,
			throttle: true
		},
		"j#grs": {
			func: "handleRefreshRoom",
			file: Navigation,
			throttle: true
		},
		"s#upc": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: true
		},
		"s#uph": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upf": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upn": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upb": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upa": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upe": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upl": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"s#upp": {
			func: "handleUpdateClothing",
			file: Player,
			throttle: false
		},
		"i#ai": {
			func: "handleAddItem",
			file: Player,
			throttle: true
		},
		"i#gi": {
			func: "handleGetInventory",
			file: Player,
			throttle: true
		},
		"u#sp": {
			func: "handleSendPosition",
			file: Player,
			throttle: false
		},
		"u#sf": {
			func: "handleSendFrame",
			file: Player,
			throttle: false
		},
		"u#sa": {
			func: "handleSendAction",
			file: Player,
			throttle: true
		},
		"u#sb": {
			func: "handleSendSnowball",
			file: Player,
			throttle: true
		},
		"u#se": {
			func: "handleSendEmote",
			file: Player,
			throttle: true
		},
		"u#sj": {
			func: "handleSendJoke",
			file: Player,
			throttle: true
		},
		"u#ss": {
			func: "handleSendSafeMessage",
			file: Player,
			throttle: true
		},
		"u#sg": {
			func: "handleSendTourGuide",
			file: Player,
			throttle: true
		},
		"u#sma": {
			func: "handleSendMascotMessage",
			file: Player,
			throttle: false
		},
		"u#gp": {
			func: "handleGetPlayer",
			file: Player,
			throttle: true
		},
		"u#h": {
			func: "handleHeartBeat",
			file: Player,
			throttle: false
		},
		"u#glr": {
			func: "handleLastRevision",
			file: Player,
			throttle: false
		},
		"u#sl": {
			func: "handleSendLine",
			file: Player,
			throttle: true
		},
		"m#sm": {
			func: "handleSendMessage",
			file: Player,
			throttle: true
		},
		"r#cdu": {
			func: "handleMineCoins",
			file: Player,
			throttle: false
		},
		"u#sq": {
			func: "handleSendQuickMessage",
			file: Player,
			throttle: true
		},
		"t#at": {
			func: "handleOpenPlayerBook",
			file: Player,
			throttle: true
		},
		"t#rt": {
			func: "handleClosePlayerBook",
			file: Player,
			throttle: true
		},
		"g#af": {
			func: "handleIglooFurniture",
			file: Igloo,
			throttle: true
		},
		"g#gf": {
			func: "handleGetFurniture",
			file: Igloo,
			throttle: true
		},
		"g#gm": {
			func: "handleGetActiveIgloo",
			file: Igloo,
			throttle: true
		},
		"g#gr": {
			func: "handleLoadPlayerIglooList",
			file: Igloo,
			throttle: true
		},
		"g#go": {
			func: "handleGetIgloos",
			file: Igloo,
			throttle: true
		},
		"g#ur": {
			func: "handleSaveFurniture",
			file: Igloo,
			throttle: true
		},
		"g#um": {
			func: "handleUpdateMusic",
			file: Igloo,
			throttle: false
		},
		"g#or": {
			func: "handleOpenIgloo",
			file: Igloo,
			throttle: false
		},
		"g#cr": {
			func: "handleCloseIgloo",
			file: Igloo,
			throttle: false
		},
		"g#au": {
			func: "handleBuyIgloo",
			file: Igloo,
			throttle: true
		},
		"g#ao": {
			func: "handleUpdateIgloo",
			file: Igloo,
			throttle: true
		},
		"g#ag": {
			func: "handleUpdateIglooFloor",
			file: Igloo,
			throttle: true
		},
		"o#b": {
			func: "handleBan",
			file: Moderation,
			throttle: false
		},
		"o#k": {
			func: "handleKick",
			file: Moderation,
			throttle: false
		},
		"o#m": {
			func: "handleMute",
			file: Moderation,
			throttle: false
		},
		"p#pg": {
			func: "handleGetPufflesByPlayerId",
			file: Pet,
			throttle: true
		},
		"p#pgu": {
			func: "handleGetPuffles",
			file: Pet,
			throttle: true
		},
		"p#pr": {
			func: "handlePuffleRest",
			file: Pet,
			throttle: false
		},
		"p#pp": {
			func: "handlePufflePlay",
			file: Pet,
			throttle: false
		},
		"p#pt": {
			func: "handlePuffleTreat",
			file: Pet,
			throttle: false
		},
		"p#pf": {
			func: "handlePuffleFeed",
			file: Pet,
			throttle: false
		},
		"p#pb": {
			func: "handlePuffleBath",
			file: Pet,
			throttle: false
		},
		"p#ir": {
			func: "handlePuffleInteractionRest",
			file: Pet,
			throttle: false
		},
		"p#ip": {
			func: "handlePuffleInteractionPlay",
			file: Pet,
			throttle: false
		},
		"p#if": {
			func: "handlePuffleInteractionFeed",
			file: Pet,
			throttle: false
		},
		"p#pir": {
			func: "handlePuffleInitInteractionRest",
			file: Pet,
			throttle: false
		},
		"p#pip": {
			func: "handlePuffleInitInteractionPlay",
			file: Pet,
			throttle: false
		},
		"p#pm": {
			func: "handlePuffleMove",
			file: Pet,
			throttle: false
		},
		"p#ps": {
			func: "handlePuffleFrame",
			file: Pet,
			throttle: false
		},
		"p#pw": {
			func: "handlePuffleWalk",
			file: Pet,
			throttle: false
		},
		"p#pn": {
			func: "handleAdoptPuffle",
			file: Pet,
			throttle: true
		},
		"n#gn": {
			func: "handleGetIgnored",
			file: Ignore,
			throttle: true
		},
		"n#an": {
			func: "handleAddIgnore",
			file: Ignore,
			throttle: true
		},
		"n#rn": {
			func: "handleRemoveIgnore",
			file: Ignore,
			throttle: false
		},
		"b#gb": {
			func: "handleGetBuddies",
			file: Buddy,
			throttle: true
		},
		"b#ba": {
			func: "handleBuddyAccept",
			file: Buddy,
			throttle: false
		},
		"b#br": {
			func: "handleBuddyRequest",
			file: Buddy,
			throttle: true
		},
		"b#rb": {
			func: "handleBuddyRemove",
			file: Buddy,
			throttle: false
		},
		"b#bf": {
			func: "handleBuddyFind",
			file: Buddy,
			throttle: true
		},
		"st#gps": {
			func: "handleGetStamps",
			file: Stamps,
			throttle: true
		},
		"i#qpp": {
			func: "handleQueryPlayerPins",
			file: Stamps,
			throttle: true
		},
		"i#qpa": {
			func: "handleQueryPlayerAwards",
			file: Stamps,
			throttle: true
		},
		"st#gsbcd": {
			func: "handleGetStampBookCoverDetails",
			file: Stamps,
			throttle: false
		},
		"st#ssbcd": {
			func: "handleSetStampBookCoverDetails",
			file: Stamps,
			throttle: true
		},
		"st#gmres": {
			func: "handleGetMyRecentlyEarnedStamps",
			file: Stamps,
			throttle: false
		},
		"st#sse": {
			func: "handleAddStamp",
			file: Stamps,
			throttle: true
		},
		"l#mst": {
			func: "handleStartMail",
			file: Mail,
			throttle: true
		},
		"l#mg": {
			func: "handleGetMail",
			file: Mail,
			throttle: true
		},
		"l#mc": {
			func: "handleMailChecked",
			file: Mail,
			throttle: true
		},
		"l#ms": {
			func: "handleSendMail",
			file: Mail,
			throttle: true
		},
		"l#md": {
			func: "handleDeleteMailItem",
			file: Mail,
			throttle: false
		},
		"l#mdp": {
			func: "handleDeleteMailItemFromPlayer",
			file: Mail,
			throttle: false
		},
		"a#gt": {
			func: "handleMultiplayerData",
			file: Multiplayer,
			throttle: false
		},
		"a#jt": {
			func: "handleMultiplayerData",
			file: Multiplayer,
			throttle: false
		},
		"a#lt": {
			func: "handleMultiplayerData",
			file: Multiplayer,
			throttle: false
		}
	},
	"z": {
		"m": {
			func: "handleMovePuck",
			file: Multiplayer,
			throttle: false
		},
		"gz": {
			func: "handleMultiplayerData",
			file: Multiplayer,
			throttle: false
		},
		"zo": {
			func: "handleGameOver",
			file: Multiplayer,
			throttle: true
		},
		"jz": {
			func: "handleMultiplayerData",
			file: Multiplayer,
			throttle: true
		},
		"zm": {
			func: "handleMultiplayerData",
			file: Multiplayer,
			throttle: true
		}
	}
}

module.exports = xtHandlers