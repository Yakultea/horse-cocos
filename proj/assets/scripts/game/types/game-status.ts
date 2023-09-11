
// *********** 這隻檔案僅參考 勿使用 ***********

// export const responseStatus = {
// 	SUCCESS: 200,
// 	INSUFFICIENT_FUND_ERROR: 400,
// 	TOKEN_EXPIRED: 401,
// 	CLIENT_ERROR: 403,
// 	SERVER_PROBLEM: 500
// }


export const successResponse = {
	"status": 200,
	"message": "ok"
}

export const notifyType = {
	JACKPOT_UPDATE: "jackpotUpdate", // use jp4 and jp5
	LOBBY_JACKPOT_UPDATE: "lobbyJackpotUpdate", // use jp5
	BIG_WIN: "bigWin",
	MEGA_WIN: "megaWin",
	SUPER_WIN: "superWin",
	GAME_JACKPOT: "gameJackpot",
	LOBBY_JACKPOT: "lobbyJackpot",
	SYSTEM: "system",
	NOTIFY: "notify"
}

export const SlotAction = {
	SPIN: "spin",
	CLOSE_SPIN: "closeSpin",
	// FREE_SPIN: "freeSpin",
	// BONUS: "bonus",
	// CLOSE_BONUS: "closeBonus",
	// CLOSE: "close",
}


export const gameSymbolsID = {
	WILD: "1",
	SYMBOL_1: "2",
	SYMBOL_2: "3",
	SYMBOL_3: "4",
	SYMBOL_4: "5",
	SYMBOL_5: "6",
	SYMBOL_6: "7",
	SYMBOL_7: "8",
	SCATTER: "9",
	JACKPOT: "10",
}

// export const panelKey = {
// 	PAYTABLE: "PAYTABLE",
// 	STAKE: "STAKE",
// 	SETTING: "SETTING",
// 	HOME: "HOME",
// 	AUTO: "AUTO",
// 	ACTIVITY: "ACTIVITY",
// 	RANK: "RANK",
// 	SHOP: "SHOP",
// 	PACK: "BACKPACK",
// 	RECORD: 'RECORD',
// 	AVATAR: 'AVATAR',
// 	SLOT_TABLES: 'SLOT_TABLES'
// }

// export const pokerPanelKey = {
// 	POKER_SETTING: 'POKER_SETTING',
// 	RECORD: 'RECORD',
// 	HELP: 'HELP',
// 	CARD: 'CARD',
// 	REPORT: 'REPORT'
// }

// export const gameCategories = {
// 	SLOT: "slot", // slot
// 	CARD: "poker", // card
// 	SCRATCH: "scratchCard", // scratchCard
// 	ENVELOPE: "envelope", // envelope
// }

// export const gameTypes = {
// 	SLOT_1: "slot1", // slot game: wild reel modifiers
// 	SLOT_2: "slot2", // slot game: sticky wilds
// 	SLOT_3: "slot3", // slot game: pick up the option
// 	SLOT_A: "slotA", // slot game: cricle slot
// 	SLOT_ERASE: "slot-erase-1-spin", // slot game: erase type
// 	OXOX_DEALER: "bankerOxOx", // poker game: oxox dealer
// 	OXOX_CASINO: "casinoOxOx", // poker game: oxox casino
// 	THREE_FACE: "threeFaceCard", // poker game: three face
// 	PAI_GOW: "paiGow",
// 	SCRATCH: "card1", // scratchCard
// 	LITTLE_MARY: "littleMary", // littleMary
// 	RED_ENVELOPE: "redEnvelopeBomb",
// 	RED_ENVELOPE_OXOX: 'redEnvelopeOxOx',
// }



// export const scratchAction = {
// 	CLOSE_CARD: "closeCard",
// }

// export const campaignsStatus = {
// 	READY: "Ready",
// 	IN_PROGRESS: "InProgress",
// 	FINISHED: "Finished"
// }

// export const pokerActionName = {
// 	UPDATE_JOIN: 'updateJoin',
// 	UPDATE_JOIN_END: 'updateJoinEnd',
// 	UPDATE_BET: 'updateBet',
// 	UPDATE_BET_END: 'updateBetEnd',
// 	UPDATE_BANKER: 'updateBanker',
// 	UPDATE_BANKER_END: 'updateBankerEnd',
// 	UPDATE_CHECKOUT: 'updateCheckout',
// 	UPDATE_CHECKOUT_END: 'updateCheckoutEnd'
// }

// export const pokerReqAction = {
// 	JOIN: 'join',
// 	BANKER: 'banker',
// 	BET: 'bet',
// 	CHECKOUT: 'checkout'
// }

// export const gamingClass = {
// 	WJY: 'wjy-casino',
// 	TW: 'tw-gaming',
// 	RGS: 'rgs',
// 	FPG: 'flying-pig',
// 	TK: 'tk'
// }

// export const clientTypes = {
// 	ANDROID: 'android',
// 	IOS: 'ios',
// 	WEB: 'web',
// 	WAP: 'wap',
// 	RN: 'rn',
// 	UNITY_WEBVIEW: 'uniWebView'
// }

// export const socketAction = {
// 	SET_STATUS: "setStatus",
// 	GET_GOODS: "getGoods",
// 	GET_PACK: "getBackPack",
// 	BUY_GOODS: "buyGoods",
// 	DRAW_TASK_REWARD: "drawTaskReward",
// 	GET_SLOT_TABLES:'getSlotTables',
// 	UPDATE_SLOT_TABLE: 'updateSlotTable',
// 	LOCK_SLOT_TABLE: 'lockSlotTable',
// 	UNLOCK_SLOT_TABLE: 'unlockSlotTable'
// }
