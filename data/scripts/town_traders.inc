@ T-269 — the 15 town traders share ONE script. Every trader's map script is a static stub that sets
@ VAR_0x8008 = INGAME_TRADE_* (include/constants/trade.h) and jumps here, so adding a trader is a stub
@ plus a flag, not a copy of this flow. Everything that varies per run lives in gIngameTrades[]
@ (src/data/trade.h, rewritten by randomizer/tradeWriter.js): the offered species, its level, the TMs it
@ arrives knowing, its IVs, and the family it asks for. See randomizer/docs/trades.md.
@
@ The "already traded with this one" flag is NOT a literal here — IsTownTradeDone / SetTownTradeDone
@ derive it from the trade id (FLAG_TRADE_COMPLETED_* is contiguous and in INGAME_TRADE_* order).
Common_EventScript_TownTrader::
	lock
	faceplayer
	specialvar VAR_RESULT, IsTownTradeDone
	goto_if_eq VAR_RESULT, TRUE, Common_EventScript_TownTradeDone
	copyvar VAR_0x8004, VAR_0x8008
	special BufferInGameTradeOffer
	msgbox Common_Text_TownTradeOffer, MSGBOX_YESNO
	goto_if_eq VAR_RESULT, NO, Common_EventScript_TownTradeDecline
	special ChoosePartyMon
	waitstate
	copyvar VAR_0x800A, VAR_0x8004
	goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, Common_EventScript_TownTradeDecline
	copyvar VAR_0x8004, VAR_0x8008
	copyvar VAR_0x8005, VAR_0x800A
	specialvar VAR_RESULT, IsRequestedTradeMon
	goto_if_eq VAR_RESULT, FALSE, Common_EventScript_TownTradeWrongMon
	special CreateInGameTradePokemon
	special DoInGameTradeScene
	waitstate
	msgbox Common_Text_TownTradeThanks, MSGBOX_DEFAULT
	special SetTownTradeDone
	release
	end

Common_EventScript_TownTradeDecline::
	msgbox Common_Text_TownTradeDecline, MSGBOX_DEFAULT
	release
	end

Common_EventScript_TownTradeWrongMon::
	@ B-051 — ChoosePartyMon clobbered gStringVar1 (party-menu HP "/<maxHP>"); re-buffer the offer so
	@ {STR_VAR_1} is the requested species name again, not the leftover "/314"-style string.
	special BufferInGameTradeOffer
	msgbox Common_Text_TownTradeWrongMon, MSGBOX_DEFAULT
	release
	end

Common_EventScript_TownTradeDone::
	msgbox Common_Text_TownTradeDone, MSGBOX_DEFAULT
	release
	end

Common_Text_TownTradeOffer:
	.string "Hi! Want to trade?\n"
	.string "I'll give you my {STR_VAR_2}.\p"
	.string "In return I want {STR_VAR_1}.$"

Common_Text_TownTradeThanks:
	.string "Thanks! Take good care of it!$"

Common_Text_TownTradeDecline:
	.string "Aw, okay. Come back if you\n"
	.string "change your mind!$"

Common_Text_TownTradeWrongMon:
	.string "Hmm, that's not what I asked for.\n"
	.string "I want {STR_VAR_1}.$"

Common_Text_TownTradeDone:
	.string "Thanks again for the trade!$"
