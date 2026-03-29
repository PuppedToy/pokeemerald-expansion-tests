-- First review --

- Beedrill Mega (Uber instead of OU)
- Annihilape (UU instead of OU / Uber)
- Alakazam Mega (Uber instead of OU)
- Steelix Mega (OU instead of UU)
- Kangaskhan Mega (OU instead of Uber)
- Scizor (UU instead of OU)
- Mewtwo (AG instead of Uber)
- Azumarill (NU instead of OU or at least UU)
- Yanmega (OU instead of RU or at least UU)
- Gliscor (UU instead of OU)
- Shuckle (OU instead of ZU / PU)
- Weavile (UU instead of OU)
- Bloodmoon Ursaluna (UU instead of Uber)
- Smeargle (I suppose moody is broken but support smeargles have been valued more throughout history. A weird one)
- Lugia (AG instead of OU)
- Ho-oh (AG instead of OU)
- Sceptile-Mega (Uber instead of RU)
- Aegislash (UU instead of Uber)
- Deoxys Defense (OU instead of Uber)
- Landorus non therian (OU instead of Uber)
- Marshadow (OU instead of Uber)
- Naganadel (UU instead of Uber)
- Shaymin-Sky (OU instead of Uber)
- Koraidon (Uber instead of AG, not the same case as Miraidon)
- A lot of legendaries are being misclasified as AG. AG is truly truly outlier pokemon like Rayquaza Mega, Miraidon, Eternatus Emax or Calyrex Shadow. Even the mewtwo megas should be challenged.
- Raging Bolt (UU instead of OU)

I have brought this many but I'm sure we're missing a lot more.

I think we're not ready. We should check why we are not valuing these correctly and fix them as best as possible with correct reasonings. Maybe we need to tweak the generic algorithm or some thresholds. Reason in big picture and then go case by case.

-- After working on it all day here is my second review --

Ok, our current progress is excelent. I already see waay less inconsistencies. For the next batch let's focus on some:

- Annihilape. It HAS to be at least OU. Is it its signature move Rage Fist or what is pushing it to Uber territory in current meta? Maybe it's Rage Fist + Bulk Up + Drain Punch all together. But something is pushing it.
- Ursaluna Bloodmoon HAS to be at least OU. Same as Annihilape? Strong Blood Moon signature move we're missing with ability?
- Azumraill. You said can't learn belly drum in this game. It's true,
- Kadabra. Yeah it has stats but it would not see play at OU. It has to be beneath the threshold right? Speed tier too low and too frail in general. Alakazam OU makes sense but Kadabra? Kinda weird. Eviolite does nothing on it.
- Magnezone. We're not modeling it right. We're missing something on this one because it's been always OU. Let's read smogon descriptions and sets: "At first glance, there seems to be little reason to use Magnezone in OU. It's slow, has crippling weaknesses to common attacking types, and faces stiff competition from other, better Electric-type options available, such as Thundurus. However, its signature ability, Magnet Pull, gives it the excellent niche of being able to trap and remove many common Steel-types, making it a good partner for certain sweepers, such as Mega Pinsir and Dragonite. It also has a whopping 11 resistances and one immunity, the most of any Pokemon in the game. However, at the end of the day, Magnezone is still a rather niche option, and it can struggle to be very effective outside of its niche, which is shrinking more and more by the generation." 
I see it used to be OU and has UU stats. But are we missing that much to make it RU? Weird.
- Hitmonlee, Hitmontop and Hitmonchan at UU seem to high. I've never seen these in anything UU related. From RU to below. What are we valuing that high from them?
- Starmie has been a wild one. OU in XY, UU in SM and RU in later gens. But I feel like it has typing, stats and coverage to be UU. Maybe I'm biased. Something we're missing from it?
- Scyther OU. Highly overvalued. Eviolite is not so strong on it because of weak typing. It's a worse Scizor in most senses. Not even strong prio move to boost with technician.
- Ditto should be way more valued with imposter. I think it should be special case for UU just because it has imposter. High HP imposters would be probably Uber so scale that with HP.
- Sylveon used to be UU most of my play time. Maybe we are undervaluing Pixilate or its support set? I don't know. Smogon says: "Sylveon is one of the best wallbreakers in the UnderUsed tier thanks to Pixilate Hyper Voice being able to blast past frail resistant Pokemon. Its mono-Fairy typing allows it to switch into strong and powerful Dark-, Dragon-, and Fighting-type moves such as Hydreigon's Draco Meteor and Heracross's Close Combat. Sylveon's 95 / 130 special bulk allows it to check some moderately powerful special attackers even if uninvested. Sylveon also gives Florges competition as a cleric, since it has more physical bulk and a more powerful STAB attack. It does, however, lack one-turn recovery unlike Florges. Unfortunately, Sylveon's physical bulk is decidedly mediocre when uninvested, meaning that most strong neutral attacks, and even some resisted ones, can 2HKO it. Also, most Dragon-types generally carry coverage for Fairy-types, meaning Sylveon has to play carefully around them. Furthermore, Sylveon is also held back by a less than stellar base 60 Speed, meaning it can't do much against faster teams that apply a ton of offensive pressure.". Maybe we're missing hyper voice with pixilate strength.
- Salamence Mega used to be a highly valued Uber. Maybe same case as Sylveon and we're undervaluing Aerilate on this specific pokemon? It can output serius damage. Maybe is the lack of roost like scizor what makes this pokemon not Uber in our game.
- Lopunny mega used to be OU. We have UU. Maybe undervaluing really high attack STAB fake out.
- Gigalith UU? It's been RU at best in its history.
- Mienshao as OU is too much. UU has been its top performing tier.
- Primarina has been UU and OU and highly valued in general. We think it's RU. Too too low. We're underestimating this pokemon.
- Instead, Decidueye has never been over NU and we are considering it UU.
- Vikavolt also at UU and has never been more than NU.
- Lycanroc has never been more than RU and for midday and dusk we say it's OU.
- Tapu Lele, Tapu Bulu & Tapu Fini have always been OU. Why are we considering them UU? Maybe not valuing their surges abilities enough?
- Pheromosa AG is wrong. Must be Uber.
- Zeraora Uber is wrong. Has been max OU.
- Rillaboom is staple OU instead of RU. Surge + grassy glide is powerful.
- Inteleon hasn't been more than NU ever. Why? It has high stats. Weird.
- Corviknight is OU staple. We're putting it at RU.
- Hatterene must be minimum UU. Maybe OU. Smogon description: "With the combination of Magic Bounce, good physical bulk, and utility options such as Pain Split to stick around longer"
- Copperajah is considered NU. We think is UU.
- Dracovish should be uber. "At first glance, Dracovish's mediocre stats are unimpressive at best when compared to other Ubers Pokemon. However, it has one of the strongest moves in the game, Fishious Rend, and an incredible ability in Strong Jaw. These factors combined make it a potentially dangerous wallbreaker. Dracovish preys on common defensive staples such as Necrozma-DM, Blissey, and Ho-Oh with Fishious Rend. However, its weakness to status and lackluster defensive stats make it difficult to switch in and give it mediocre defensive utility, only really being able to check Kyogre and offensive Necrozma-DM in a pinch. This means that while Dracovish can be a scary wallbreaker against slower teams, it offers little utility against faster, more offensive teams. Finally, without any recovery, Dracovish is vulnerable to getting worn down quickly and needs to be played carefully to make use of its capability throughout the game."
- Archaludon is considered Uber.
- Urshifu is considered Uber. Somehow we consider it UU. It has signature moves, both versions of Urshifu + Unseen Fist + Really high attack. Wicked Blow and Surging Strikes are nut moves. Really strong because they always crit.
- Regieleki is Uber too. 
- Skeledirge's torch song is probably being undervalued. It should pump it to UU.
- Pawmot is considered NU. I think last gen tiers are not explained enough in smogon and we should research all last gen mons 1v1 analysis elsewhere. So I won't keep evaluating from here.

Maybe some inconsistencies are explained by not giving enough value to defensive typing combinations and ofensive typing STABs? We should check.

-- Third wave, after tm implementation and with all tms available --

- Alakazam Uber is wrong | Expected OU
- Gengar-mega AG is wrong | Expected Uber
- Sceptile-mega Uber is wrong | Expected OU or even UU
- Blaziken-mega AG is wrong | Expected Uber
- Gardevoir-mega Uber is wrong | Expected OU
- Lopunny-mega UU is wrong | Expected OU
- Abomasnow-mega OU is wrong | Expected NU. I suppose is hindered by bad typing and snow not being that relevant.
- Kingambit UU is wrong | Expected OU. "Kingambit shines as one of the tier's most dangerous sweepers thanks to its solid STAB combination, superb defensive typing, high Attack stat, access to Swords Dance, and incredible ability in Supreme Overlord. Its access to Sucker Punch allows it to compensate for its low Speed and serve as a potent revenge killer, picking off a wide range of faster targets such as Dragapult, Deoxys-S, and Iron Moth."
- Primarina RU is wrong | Expected OU. 
- Tapus still wrong. All should be OU but Bulu and Fini aren't
- Kartana Uber is wrong | Expected OU.
- Urshifu OU is wrong | Expected Uber.
- Great Tusk UU is wrong | Expected OU
- Flutter Mane OU is wrong | Expected Uber.
- Iron Treads is wrong | Expected OU.
- Iron Bundle is wrong | Expected Uber.
- Iron Moth is wrong | Expected OU.
- Gholdengo is wrong | Expected OU.
- Chi Yu is wrong | Expected Uber (probably ability)
- Chien Pao is wrong | Expected Uber
- Roaring Moon is wrong | Expected Uber
- Walking Wake is wrong | Expected OU
- Gouging Fire is wrong | Expected Uber
- Iron Crown is wrong | Expected OU

For all the ones overvalued, we need to understand what are we overvaluing. Same procedure as before, for structural propose, for quick fixes do it.

For all the undervalued, search on the internet other sources than smogon or smogon itself to know why some are considered that tier. What's their strength. That's the key. Once you get a description for each undervalue we can understand how to pump them up.

-- Tis is fixed and closed --
