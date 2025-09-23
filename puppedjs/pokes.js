const pokes = [
  {
    "name": "Bulbasaur",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "CHLOROPHYLL"
    ],
    "id": "SPECIES_BULBASAUR",
    "family": "P_FAMILY_BULBASAUR",
    "baseHP": 45,
    "baseAttack": 49,
    "baseDefense": 49,
    "baseSpeed": 45,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL }",
    "speciesName": "_(\"Bulbasaur\")",
    "natDexNum": "NATIONAL_DEX_BULBASAUR",
    "levelUpLearnset": "sBulbasaurLevelUpLearnset",
    "teachableLearnset": "sBulbasaurTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_IVYSAUR})",
    "baseBST": 318,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ivysaur",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "CHLOROPHYLL"
    ],
    "id": "SPECIES_IVYSAUR",
    "family": "P_FAMILY_BULBASAUR",
    "baseHP": 60,
    "baseAttack": 62,
    "baseDefense": 63,
    "baseSpeed": 60,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL }",
    "speciesName": "_(\"Ivysaur\")",
    "natDexNum": "NATIONAL_DEX_IVYSAUR",
    "levelUpLearnset": "sIvysaurLevelUpLearnset",
    "teachableLearnset": "sIvysaurTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_VENUSAUR})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Venusaur",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "CHLOROPHYLL"
    ],
    "id": "SPECIES_VENUSAUR",
    "family": "P_FAMILY_BULBASAUR",
    "baseHP": 80,
    "baseAttack": 82,
    "baseDefense": 83,
    "baseSpeed": 80,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CHLOROPHYLL }",
    "speciesName": "_(\"Venusaur\")",
    "natDexNum": "NATIONAL_DEX_VENUSAUR",
    "levelUpLearnset": "sVenusaurLevelUpLearnset",
    "teachableLearnset": "sVenusaurTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Venusaur  Mega",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "THICK_FAT",
      "THICK_FAT"
    ],
    "id": "SPECIES_VENUSAUR_MEGA",
    "family": "P_FAMILY_BULBASAUR",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 123,
    "baseSpeed": 80,
    "baseSpAttack": 122,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_THICK_FAT, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Venusaur\")",
    "natDexNum": "NATIONAL_DEX_VENUSAUR",
    "levelUpLearnset": "sVenusaurLevelUpLearnset",
    "teachableLearnset": "sVenusaurTeachableLearnset",
    "baseBST": 625,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charmander",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "SOLAR_POWER"
    ],
    "id": "SPECIES_CHARMANDER",
    "family": "P_FAMILY_CHARMANDER",
    "baseHP": 39,
    "baseAttack": 52,
    "baseDefense": 43,
    "baseSpeed": 65,
    "baseSpAttack": 60,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_SOLAR_POWER }",
    "speciesName": "_(\"Charmander\")",
    "natDexNum": "NATIONAL_DEX_CHARMANDER",
    "levelUpLearnset": "sCharmanderLevelUpLearnset",
    "teachableLearnset": "sCharmanderTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_CHARMELEON})",
    "baseBST": 309,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charmeleon",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "SOLAR_POWER"
    ],
    "id": "SPECIES_CHARMELEON",
    "family": "P_FAMILY_CHARMANDER",
    "baseHP": 58,
    "baseAttack": 64,
    "baseDefense": 58,
    "baseSpeed": 80,
    "baseSpAttack": 80,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_SOLAR_POWER }",
    "speciesName": "_(\"Charmeleon\")",
    "natDexNum": "NATIONAL_DEX_CHARMELEON",
    "levelUpLearnset": "sCharmeleonLevelUpLearnset",
    "teachableLearnset": "sCharmeleonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_CHARIZARD})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charizard",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "SOLAR_POWER"
    ],
    "id": "SPECIES_CHARIZARD",
    "family": "P_FAMILY_CHARMANDER",
    "baseHP": 78,
    "baseAttack": 84,
    "baseDefense": 78,
    "baseSpeed": 100,
    "baseSpAttack": 109,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_SOLAR_POWER }",
    "speciesName": "_(\"Charizard\")",
    "natDexNum": "NATIONAL_DEX_CHARIZARD",
    "levelUpLearnset": "sCharizardLevelUpLearnset",
    "teachableLearnset": "sCharizardTeachableLearnset",
    "baseBST": 534,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charizard  Mega  X",
    "parsedTypes": [
      "FIRE",
      "DRAGON"
    ],
    "parsedAbilities": [
      "TOUGH_CLAWS",
      "TOUGH_CLAWS",
      "TOUGH_CLAWS"
    ],
    "id": "SPECIES_CHARIZARD_MEGA_X",
    "family": "P_FAMILY_CHARMANDER",
    "baseHP": 78,
    "baseAttack": 130,
    "baseDefense": 111,
    "baseSpeed": 100,
    "baseSpAttack": 130,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_DRAGON)",
    "abilities": "{ ABILITY_TOUGH_CLAWS, ABILITY_TOUGH_CLAWS, ABILITY_TOUGH_CLAWS }",
    "speciesName": "_(\"Charizard\")",
    "natDexNum": "NATIONAL_DEX_CHARIZARD",
    "levelUpLearnset": "sCharizardLevelUpLearnset",
    "teachableLearnset": "sCharizardTeachableLearnset",
    "baseBST": 634,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charizard  Mega  Y",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "DROUGHT",
      "DROUGHT",
      "DROUGHT"
    ],
    "id": "SPECIES_CHARIZARD_MEGA_Y",
    "family": "P_FAMILY_CHARMANDER",
    "baseHP": 78,
    "baseAttack": 104,
    "baseDefense": 78,
    "baseSpeed": 100,
    "baseSpAttack": 159,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_DROUGHT, ABILITY_DROUGHT, ABILITY_DROUGHT }",
    "speciesName": "_(\"Charizard\")",
    "natDexNum": "NATIONAL_DEX_CHARIZARD",
    "levelUpLearnset": "sCharizardLevelUpLearnset",
    "teachableLearnset": "sCharizardTeachableLearnset",
    "baseBST": 634,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Squirtle",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_SQUIRTLE",
    "family": "P_FAMILY_SQUIRTLE",
    "baseHP": 44,
    "baseAttack": 48,
    "baseDefense": 65,
    "baseSpeed": 43,
    "baseSpAttack": 50,
    "baseSpDefense": 64,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Squirtle\")",
    "natDexNum": "NATIONAL_DEX_SQUIRTLE",
    "levelUpLearnset": "sSquirtleLevelUpLearnset",
    "teachableLearnset": "sSquirtleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_WARTORTLE})",
    "baseBST": 314,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wartortle",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_WARTORTLE",
    "family": "P_FAMILY_SQUIRTLE",
    "baseHP": 59,
    "baseAttack": 63,
    "baseDefense": 80,
    "baseSpeed": 58,
    "baseSpAttack": 65,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Wartortle\")",
    "natDexNum": "NATIONAL_DEX_WARTORTLE",
    "levelUpLearnset": "sWartortleLevelUpLearnset",
    "teachableLearnset": "sWartortleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_BLASTOISE})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blastoise",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_BLASTOISE",
    "family": "P_FAMILY_SQUIRTLE",
    "baseHP": 79,
    "baseAttack": 83,
    "baseDefense": 100,
    "baseSpeed": 78,
    "baseSpAttack": 85,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Blastoise\")",
    "natDexNum": "NATIONAL_DEX_BLASTOISE",
    "levelUpLearnset": "sBlastoiseLevelUpLearnset",
    "teachableLearnset": "sBlastoiseTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blastoise  Mega",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "MEGA_LAUNCHER",
      "MEGA_LAUNCHER",
      "MEGA_LAUNCHER"
    ],
    "id": "SPECIES_BLASTOISE_MEGA",
    "family": "P_FAMILY_SQUIRTLE",
    "baseHP": 79,
    "baseAttack": 103,
    "baseDefense": 120,
    "baseSpeed": 78,
    "baseSpAttack": 135,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_MEGA_LAUNCHER, ABILITY_MEGA_LAUNCHER, ABILITY_MEGA_LAUNCHER }",
    "speciesName": "_(\"Blastoise\")",
    "natDexNum": "NATIONAL_DEX_BLASTOISE",
    "levelUpLearnset": "sBlastoiseLevelUpLearnset",
    "teachableLearnset": "sBlastoiseTeachableLearnset",
    "baseBST": 630,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Caterpie",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_CATERPIE",
    "family": "P_FAMILY_CATERPIE",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 35,
    "baseSpeed": 45,
    "baseSpAttack": 20,
    "baseSpDefense": 20,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Caterpie\")",
    "natDexNum": "NATIONAL_DEX_CATERPIE",
    "levelUpLearnset": "sCaterpieLevelUpLearnset",
    "teachableLearnset": "sCaterpieTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 7, SPECIES_METAPOD})",
    "baseBST": 195,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Metapod",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_METAPOD",
    "family": "P_FAMILY_CATERPIE",
    "baseHP": 50,
    "baseAttack": 20,
    "baseDefense": 55,
    "baseSpeed": 30,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Metapod\")",
    "natDexNum": "NATIONAL_DEX_METAPOD",
    "levelUpLearnset": "sMetapodLevelUpLearnset",
    "teachableLearnset": "sMetapodTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 10, SPECIES_BUTTERFREE})",
    "baseBST": 205,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Butterfree",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "COMPOUND_EYES",
      "NONE",
      "TINTED_LENS"
    ],
    "id": "SPECIES_BUTTERFREE",
    "family": "P_FAMILY_CATERPIE",
    "baseHP": 60,
    "baseAttack": 45,
    "baseDefense": 50,
    "baseSpeed": 70,
    "baseSpAttack": 90,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_COMPOUND_EYES, ABILITY_NONE, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Butterfree\")",
    "natDexNum": "NATIONAL_DEX_BUTTERFREE",
    "levelUpLearnset": "sButterfreeLevelUpLearnset",
    "teachableLearnset": "sButterfreeTeachableLearnset",
    "baseBST": 395,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Weedle",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_WEEDLE",
    "family": "P_FAMILY_WEEDLE",
    "baseHP": 40,
    "baseAttack": 35,
    "baseDefense": 30,
    "baseSpeed": 50,
    "baseSpAttack": 20,
    "baseSpDefense": 20,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Weedle\")",
    "natDexNum": "NATIONAL_DEX_WEEDLE",
    "levelUpLearnset": "sWeedleLevelUpLearnset",
    "teachableLearnset": "sWeedleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 7, SPECIES_KAKUNA})",
    "baseBST": 195,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kakuna",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KAKUNA",
    "family": "P_FAMILY_WEEDLE",
    "baseHP": 45,
    "baseAttack": 25,
    "baseDefense": 50,
    "baseSpeed": 35,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kakuna\")",
    "natDexNum": "NATIONAL_DEX_KAKUNA",
    "levelUpLearnset": "sKakunaLevelUpLearnset",
    "teachableLearnset": "sKakunaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 10, SPECIES_BEEDRILL})",
    "baseBST": 205,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Beedrill",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "SNIPER"
    ],
    "id": "SPECIES_BEEDRILL",
    "family": "P_FAMILY_WEEDLE",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 40,
    "baseSpeed": 75,
    "baseSpAttack": 45,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_SNIPER }",
    "speciesName": "_(\"Beedrill\")",
    "natDexNum": "NATIONAL_DEX_BEEDRILL",
    "levelUpLearnset": "sBeedrillLevelUpLearnset",
    "teachableLearnset": "sBeedrillTeachableLearnset",
    "baseBST": 395,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Beedrill  Mega",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "ADAPTABILITY",
      "ADAPTABILITY",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_BEEDRILL_MEGA",
    "family": "P_FAMILY_WEEDLE",
    "baseHP": 65,
    "baseAttack": 150,
    "baseDefense": 40,
    "baseSpeed": 145,
    "baseSpAttack": 15,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_ADAPTABILITY, ABILITY_ADAPTABILITY, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Beedrill\")",
    "natDexNum": "NATIONAL_DEX_BEEDRILL",
    "levelUpLearnset": "sBeedrillLevelUpLearnset",
    "teachableLearnset": "sBeedrillTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pidgey",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "BIG_PECKS"
    ],
    "id": "SPECIES_PIDGEY",
    "family": "P_FAMILY_PIDGEY",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 56,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_BIG_PECKS }",
    "speciesName": "_(\"Pidgey\")",
    "natDexNum": "NATIONAL_DEX_PIDGEY",
    "levelUpLearnset": "sPidgeyLevelUpLearnset",
    "teachableLearnset": "sPidgeyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_PIDGEOTTO})",
    "baseBST": 251,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pidgeotto",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "BIG_PECKS"
    ],
    "id": "SPECIES_PIDGEOTTO",
    "family": "P_FAMILY_PIDGEY",
    "baseHP": 63,
    "baseAttack": 60,
    "baseDefense": 55,
    "baseSpeed": 71,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_BIG_PECKS }",
    "speciesName": "_(\"Pidgeotto\")",
    "natDexNum": "NATIONAL_DEX_PIDGEOTTO",
    "levelUpLearnset": "sPidgeottoLevelUpLearnset",
    "teachableLearnset": "sPidgeottoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_PIDGEOT})",
    "baseBST": 349,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pidgeot",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "BIG_PECKS"
    ],
    "id": "SPECIES_PIDGEOT",
    "family": "P_FAMILY_PIDGEY",
    "baseHP": 83,
    "baseAttack": 80,
    "baseDefense": 75,
    "baseSpeed": 101,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_BIG_PECKS }",
    "speciesName": "_(\"Pidgeot\")",
    "natDexNum": "NATIONAL_DEX_PIDGEOT",
    "levelUpLearnset": "sPidgeotLevelUpLearnset",
    "teachableLearnset": "sPidgeotTeachableLearnset",
    "baseBST": 479,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pidgeot  Mega",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "NO_GUARD",
      "NO_GUARD",
      "NO_GUARD"
    ],
    "id": "SPECIES_PIDGEOT_MEGA",
    "family": "P_FAMILY_PIDGEY",
    "baseHP": 83,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 121,
    "baseSpAttack": 135,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_NO_GUARD, ABILITY_NO_GUARD, ABILITY_NO_GUARD }",
    "speciesName": "_(\"Pidgeot\")",
    "natDexNum": "NATIONAL_DEX_PIDGEOT",
    "levelUpLearnset": "sPidgeotLevelUpLearnset",
    "teachableLearnset": "sPidgeotTeachableLearnset",
    "baseBST": 579,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rattata",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "GUTS",
      "HUSTLE"
    ],
    "id": "SPECIES_RATTATA",
    "family": "P_FAMILY_RATTATA",
    "baseHP": 30,
    "baseAttack": 56,
    "baseDefense": 35,
    "baseSpeed": 72,
    "baseSpAttack": 25,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_GUTS, ABILITY_HUSTLE }",
    "speciesName": "_(\"Rattata\")",
    "natDexNum": "NATIONAL_DEX_RATTATA",
    "levelUpLearnset": "sRattataLevelUpLearnset",
    "teachableLearnset": "sRattataTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_RATICATE})",
    "baseBST": 253,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raticate",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "GUTS",
      "HUSTLE"
    ],
    "id": "SPECIES_RATICATE",
    "family": "P_FAMILY_RATTATA",
    "baseHP": 55,
    "baseAttack": 81,
    "baseDefense": 60,
    "baseSpeed": 97,
    "baseSpAttack": 50,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_GUTS, ABILITY_HUSTLE }",
    "speciesName": "_(\"Raticate\")",
    "natDexNum": "NATIONAL_DEX_RATICATE",
    "levelUpLearnset": "sRaticateLevelUpLearnset",
    "teachableLearnset": "sRaticateTeachableLearnset",
    "baseBST": 413,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rattata  Alola",
    "parsedTypes": [
      "DARK",
      "NORMAL"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "HUSTLE",
      "THICK_FAT"
    ],
    "id": "SPECIES_RATTATA_ALOLA",
    "family": "P_FAMILY_RATTATA",
    "baseHP": 30,
    "baseAttack": 56,
    "baseDefense": 35,
    "baseSpeed": 72,
    "baseSpAttack": 25,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_DARK, TYPE_NORMAL)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_HUSTLE, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Rattata\")",
    "natDexNum": "NATIONAL_DEX_RATTATA",
    "levelUpLearnset": "sRattataAlolaLevelUpLearnset",
    "teachableLearnset": "sRattataAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_RATICATE_ALOLA, CONDITIONS({IF_TIME, TIME_NIGHT})}",
    "baseBST": 253,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raticate  Alola",
    "parsedTypes": [
      "DARK",
      "NORMAL"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "HUSTLE",
      "THICK_FAT"
    ],
    "id": "SPECIES_RATICATE_ALOLA",
    "family": "P_FAMILY_RATTATA",
    "baseHP": 75,
    "baseAttack": 71,
    "baseDefense": 70,
    "baseSpeed": 77,
    "baseSpAttack": 40,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_DARK, TYPE_NORMAL)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_HUSTLE, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Raticate\")",
    "natDexNum": "NATIONAL_DEX_RATICATE",
    "levelUpLearnset": "sRaticateAlolaLevelUpLearnset",
    "teachableLearnset": "sRaticateAlolaTeachableLearnset",
    "baseBST": 413,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spearow",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "SNIPER"
    ],
    "id": "SPECIES_SPEAROW",
    "family": "P_FAMILY_SPEAROW",
    "baseHP": 40,
    "baseAttack": 60,
    "baseDefense": 30,
    "baseSpeed": 70,
    "baseSpAttack": 31,
    "baseSpDefense": 31,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_SNIPER }",
    "speciesName": "_(\"Spearow\")",
    "natDexNum": "NATIONAL_DEX_SPEAROW",
    "levelUpLearnset": "sSpearowLevelUpLearnset",
    "teachableLearnset": "sSpearowTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_FEAROW})",
    "baseBST": 262,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fearow",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "SNIPER"
    ],
    "id": "SPECIES_FEAROW",
    "family": "P_FAMILY_SPEAROW",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 65,
    "baseSpeed": 100,
    "baseSpAttack": 61,
    "baseSpDefense": 61,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_SNIPER }",
    "speciesName": "_(\"Fearow\")",
    "natDexNum": "NATIONAL_DEX_FEAROW",
    "levelUpLearnset": "sFearowLevelUpLearnset",
    "teachableLearnset": "sFearowTeachableLearnset",
    "baseBST": 442,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ekans",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "SHED_SKIN",
      "UNNERVE"
    ],
    "id": "SPECIES_EKANS",
    "family": "P_FAMILY_EKANS",
    "baseHP": 35,
    "baseAttack": 60,
    "baseDefense": 44,
    "baseSpeed": 55,
    "baseSpAttack": 40,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_SHED_SKIN, ABILITY_UNNERVE }",
    "speciesName": "_(\"Ekans\")",
    "natDexNum": "NATIONAL_DEX_EKANS",
    "levelUpLearnset": "sEkansLevelUpLearnset",
    "teachableLearnset": "sEkansTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_ARBOK})",
    "baseBST": 288,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arbok",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "SHED_SKIN",
      "UNNERVE"
    ],
    "id": "SPECIES_ARBOK",
    "family": "P_FAMILY_EKANS",
    "baseHP": 60,
    "baseAttack": 95,
    "baseDefense": 69,
    "baseSpeed": 80,
    "baseSpAttack": 65,
    "baseSpDefense": 79,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_SHED_SKIN, ABILITY_UNNERVE }",
    "speciesName": "_(\"Arbok\")",
    "natDexNum": "NATIONAL_DEX_ARBOK",
    "levelUpLearnset": "sArbokLevelUpLearnset",
    "teachableLearnset": "sArbokTeachableLearnset",
    "baseBST": 448,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pichu",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_PICHU",
    "family": "P_FAMILY_PIKACHU",
    "baseHP": 20,
    "baseAttack": 40,
    "baseDefense": 15,
    "baseSpeed": 60,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Pichu\")",
    "natDexNum": "NATIONAL_DEX_PICHU",
    "levelUpLearnset": "sPichuLevelUpLearnset",
    "teachableLearnset": "sPichuTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_PIKACHU, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 205,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pikachu",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_PIKACHU",
    "family": "P_FAMILY_PIKACHU",
    "baseHP": 35,
    "baseAttack": 55,
    "baseDefense": 40,
    "baseSpeed": 90,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Pikachu\")",
    "natDexNum": "NATIONAL_DEX_PIKACHU",
    "levelUpLearnset": "sPikachuLevelUpLearnset",
    "teachableLearnset": "sPikachuTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_THUNDER_STONE, SPECIES_RAICHU}",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raichu",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_RAICHU",
    "family": "P_FAMILY_PIKACHU",
    "baseHP": 60,
    "baseAttack": 90,
    "baseDefense": 55,
    "baseSpeed": 110,
    "baseSpAttack": 90,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Raichu\")",
    "natDexNum": "NATIONAL_DEX_RAICHU",
    "levelUpLearnset": "sRaichuLevelUpLearnset",
    "teachableLearnset": "sRaichuTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raichu  Alola",
    "parsedTypes": [
      "ELECTRIC",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SURGE_SURFER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_RAICHU_ALOLA",
    "family": "P_FAMILY_PIKACHU",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 50,
    "baseSpeed": 110,
    "baseSpAttack": 95,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SURGE_SURFER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Raichu\")",
    "natDexNum": "NATIONAL_DEX_RAICHU",
    "levelUpLearnset": "sRaichuAlolaLevelUpLearnset",
    "teachableLearnset": "sRaichuAlolaTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandshrew",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "SAND_RUSH"
    ],
    "id": "SPECIES_SANDSHREW",
    "family": "P_FAMILY_SANDSHREW",
    "baseHP": 50,
    "baseAttack": 75,
    "baseDefense": 85,
    "baseSpeed": 40,
    "baseSpAttack": 20,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_SAND_RUSH }",
    "speciesName": "_(\"Sandshrew\")",
    "natDexNum": "NATIONAL_DEX_SANDSHREW",
    "levelUpLearnset": "sSandshrewLevelUpLearnset",
    "teachableLearnset": "sSandshrewTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_SANDSLASH})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandslash",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "SAND_RUSH"
    ],
    "id": "SPECIES_SANDSLASH",
    "family": "P_FAMILY_SANDSHREW",
    "baseHP": 75,
    "baseAttack": 100,
    "baseDefense": 110,
    "baseSpeed": 65,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_SAND_RUSH }",
    "speciesName": "_(\"Sandslash\")",
    "natDexNum": "NATIONAL_DEX_SANDSLASH",
    "levelUpLearnset": "sSandslashLevelUpLearnset",
    "teachableLearnset": "sSandslashTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandshrew  Alola",
    "parsedTypes": [
      "ICE",
      "STEEL"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "SLUSH_RUSH"
    ],
    "id": "SPECIES_SANDSHREW_ALOLA",
    "family": "P_FAMILY_SANDSHREW",
    "baseHP": 50,
    "baseAttack": 75,
    "baseDefense": 90,
    "baseSpeed": 40,
    "baseSpAttack": 10,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_ICE, TYPE_STEEL)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_SLUSH_RUSH }",
    "speciesName": "_(\"Sandshrew\")",
    "natDexNum": "NATIONAL_DEX_SANDSHREW",
    "levelUpLearnset": "sSandshrewAlolaLevelUpLearnset",
    "teachableLearnset": "sSandshrewAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_ICE_STONE, SPECIES_SANDSLASH_ALOLA})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandslash  Alola",
    "parsedTypes": [
      "ICE",
      "STEEL"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "SLUSH_RUSH"
    ],
    "id": "SPECIES_SANDSLASH_ALOLA",
    "family": "P_FAMILY_SANDSHREW",
    "baseHP": 75,
    "baseAttack": 100,
    "baseDefense": 120,
    "baseSpeed": 65,
    "baseSpAttack": 25,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ICE, TYPE_STEEL)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_SLUSH_RUSH }",
    "speciesName": "_(\"Sandslash\")",
    "natDexNum": "NATIONAL_DEX_SANDSLASH",
    "levelUpLearnset": "sSandslashAlolaLevelUpLearnset",
    "teachableLearnset": "sSandslashAlolaTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nidoran  F",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "HUSTLE"
    ],
    "id": "SPECIES_NIDORAN_F",
    "family": "P_FAMILY_NIDORAN",
    "baseHP": 55,
    "baseAttack": 47,
    "baseDefense": 52,
    "baseSpeed": 41,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_HUSTLE }",
    "speciesName": "_(\"Nidoran♀\")",
    "natDexNum": "NATIONAL_DEX_NIDORAN_F",
    "levelUpLearnset": "sNidoranFLevelUpLearnset",
    "teachableLearnset": "sNidoranFTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_NIDORINA})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nidorina",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "HUSTLE"
    ],
    "id": "SPECIES_NIDORINA",
    "family": "P_FAMILY_NIDORAN",
    "baseHP": 70,
    "baseAttack": 62,
    "baseDefense": 67,
    "baseSpeed": 56,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_HUSTLE }",
    "speciesName": "_(\"Nidorina\")",
    "natDexNum": "NATIONAL_DEX_NIDORINA",
    "levelUpLearnset": "sNidorinaLevelUpLearnset",
    "teachableLearnset": "sNidorinaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MOON_STONE, SPECIES_NIDOQUEEN})",
    "baseBST": 365,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nidoqueen",
    "parsedTypes": [
      "POISON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_NIDOQUEEN",
    "family": "P_FAMILY_NIDORAN",
    "baseHP": 90,
    "baseAttack": 92,
    "baseDefense": 87,
    "baseSpeed": 76,
    "baseSpAttack": 75,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_POISON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Nidoqueen\")",
    "natDexNum": "NATIONAL_DEX_NIDOQUEEN",
    "levelUpLearnset": "sNidoqueenLevelUpLearnset",
    "teachableLearnset": "sNidoqueenTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nidoran  M",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "HUSTLE"
    ],
    "id": "SPECIES_NIDORAN_M",
    "family": "P_FAMILY_NIDORAN",
    "baseHP": 46,
    "baseAttack": 57,
    "baseDefense": 40,
    "baseSpeed": 50,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_HUSTLE }",
    "speciesName": "_(\"Nidoran♂\")",
    "natDexNum": "NATIONAL_DEX_NIDORAN_M",
    "levelUpLearnset": "sNidoranMLevelUpLearnset",
    "teachableLearnset": "sNidoranMTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_NIDORINO})",
    "baseBST": 273,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nidorino",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "HUSTLE"
    ],
    "id": "SPECIES_NIDORINO",
    "family": "P_FAMILY_NIDORAN",
    "baseHP": 61,
    "baseAttack": 72,
    "baseDefense": 57,
    "baseSpeed": 65,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_HUSTLE }",
    "speciesName": "_(\"Nidorino\")",
    "natDexNum": "NATIONAL_DEX_NIDORINO",
    "levelUpLearnset": "sNidorinoLevelUpLearnset",
    "teachableLearnset": "sNidorinoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MOON_STONE, SPECIES_NIDOKING})",
    "baseBST": 365,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nidoking",
    "parsedTypes": [
      "POISON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_NIDOKING",
    "family": "P_FAMILY_NIDORAN",
    "baseHP": 81,
    "baseAttack": 102,
    "baseDefense": 77,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_POISON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Nidoking\")",
    "natDexNum": "NATIONAL_DEX_NIDOKING",
    "levelUpLearnset": "sNidokingLevelUpLearnset",
    "teachableLearnset": "sNidokingTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cleffa",
    "parsedTypes": [
      "CLEFAIRY_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "FRIEND_GUARD"
    ],
    "id": "SPECIES_CLEFFA",
    "family": "P_FAMILY_CLEFAIRY",
    "baseHP": 50,
    "baseAttack": 25,
    "baseDefense": 28,
    "baseSpeed": 15,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "CLEFAIRY_FAMILY_TYPES",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_FRIEND_GUARD }",
    "speciesName": "_(\"Cleffa\")",
    "natDexNum": "NATIONAL_DEX_CLEFFA",
    "levelUpLearnset": "sCleffaLevelUpLearnset",
    "teachableLearnset": "sCleffaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_CLEFAIRY, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 218,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clefairy",
    "parsedTypes": [
      "CLEFAIRY_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "FRIEND_GUARD"
    ],
    "id": "SPECIES_CLEFAIRY",
    "family": "P_FAMILY_CLEFAIRY",
    "baseHP": 70,
    "baseAttack": 45,
    "baseDefense": 48,
    "baseSpeed": 35,
    "baseSpAttack": 60,
    "baseSpDefense": 65,
    "types": "CLEFAIRY_FAMILY_TYPES",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_FRIEND_GUARD }",
    "speciesName": "_(\"Clefairy\")",
    "natDexNum": "NATIONAL_DEX_CLEFAIRY",
    "levelUpLearnset": "sClefairyLevelUpLearnset",
    "teachableLearnset": "sClefairyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MOON_STONE, SPECIES_CLEFABLE})",
    "baseBST": 323,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clefable",
    "parsedTypes": [
      "CLEFAIRY_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "UNAWARE"
    ],
    "id": "SPECIES_CLEFABLE",
    "family": "P_FAMILY_CLEFAIRY",
    "baseHP": 95,
    "baseAttack": 70,
    "baseDefense": 73,
    "baseSpeed": 60,
    "baseSpAttack": 95,
    "baseSpDefense": 90,
    "types": "CLEFAIRY_FAMILY_TYPES",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_UNAWARE }",
    "speciesName": "_(\"Clefable\")",
    "natDexNum": "NATIONAL_DEX_CLEFABLE",
    "levelUpLearnset": "sClefableLevelUpLearnset",
    "teachableLearnset": "sClefableTeachableLearnset",
    "baseBST": 483,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vulpix",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "NONE",
      "DROUGHT"
    ],
    "id": "SPECIES_VULPIX",
    "family": "P_FAMILY_VULPIX",
    "baseHP": 38,
    "baseAttack": 41,
    "baseDefense": 40,
    "baseSpeed": 65,
    "baseSpAttack": 50,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_NONE, ABILITY_DROUGHT }",
    "speciesName": "_(\"Vulpix\")",
    "natDexNum": "NATIONAL_DEX_VULPIX",
    "levelUpLearnset": "sVulpixLevelUpLearnset",
    "teachableLearnset": "sVulpixTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_FIRE_STONE, SPECIES_NINETALES})",
    "baseBST": 299,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ninetales",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "NONE",
      "DROUGHT"
    ],
    "id": "SPECIES_NINETALES",
    "family": "P_FAMILY_VULPIX",
    "baseHP": 73,
    "baseAttack": 76,
    "baseDefense": 75,
    "baseSpeed": 100,
    "baseSpAttack": 81,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_NONE, ABILITY_DROUGHT }",
    "speciesName": "_(\"Ninetales\")",
    "natDexNum": "NATIONAL_DEX_NINETALES",
    "levelUpLearnset": "sNinetalesLevelUpLearnset",
    "teachableLearnset": "sNinetalesTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vulpix  Alola",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "SNOW_WARNING"
    ],
    "id": "SPECIES_VULPIX_ALOLA",
    "family": "P_FAMILY_VULPIX",
    "baseHP": 38,
    "baseAttack": 41,
    "baseDefense": 40,
    "baseSpeed": 65,
    "baseSpAttack": 50,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_SNOW_WARNING }",
    "speciesName": "_(\"Vulpix\")",
    "natDexNum": "NATIONAL_DEX_VULPIX",
    "levelUpLearnset": "sVulpixAlolaLevelUpLearnset",
    "teachableLearnset": "sVulpixAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_ICE_STONE, SPECIES_NINETALES_ALOLA})",
    "baseBST": 299,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ninetales  Alola",
    "parsedTypes": [
      "ICE",
      "FAIRY"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "SNOW_WARNING"
    ],
    "id": "SPECIES_NINETALES_ALOLA",
    "family": "P_FAMILY_VULPIX",
    "baseHP": 73,
    "baseAttack": 67,
    "baseDefense": 75,
    "baseSpeed": 109,
    "baseSpAttack": 81,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_ICE, TYPE_FAIRY)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_SNOW_WARNING }",
    "speciesName": "_(\"Ninetales\")",
    "natDexNum": "NATIONAL_DEX_NINETALES",
    "levelUpLearnset": "sNinetalesAlolaLevelUpLearnset",
    "teachableLearnset": "sNinetalesAlolaTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Igglybuff",
    "parsedTypes": [
      "JIGGLYPUFF_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "FRIEND_GUARD"
    ],
    "id": "SPECIES_IGGLYBUFF",
    "family": "P_FAMILY_JIGGLYPUFF",
    "baseHP": 90,
    "baseAttack": 30,
    "baseDefense": 15,
    "baseSpeed": 15,
    "baseSpAttack": 40,
    "baseSpDefense": 20,
    "types": "JIGGLYPUFF_FAMILY_TYPES",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_FRIEND_GUARD }",
    "speciesName": "_(\"Igglybuff\")",
    "natDexNum": "NATIONAL_DEX_IGGLYBUFF",
    "levelUpLearnset": "sIgglybuffLevelUpLearnset",
    "teachableLearnset": "sIgglybuffTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_JIGGLYPUFF, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jigglypuff",
    "parsedTypes": [
      "JIGGLYPUFF_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "FRIEND_GUARD"
    ],
    "id": "SPECIES_JIGGLYPUFF",
    "family": "P_FAMILY_JIGGLYPUFF",
    "baseHP": 115,
    "baseAttack": 45,
    "baseDefense": 20,
    "baseSpeed": 20,
    "baseSpAttack": 45,
    "baseSpDefense": 25,
    "types": "JIGGLYPUFF_FAMILY_TYPES",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_FRIEND_GUARD }",
    "speciesName": "_(\"Jigglypuff\")",
    "natDexNum": "NATIONAL_DEX_JIGGLYPUFF",
    "levelUpLearnset": "sJigglypuffLevelUpLearnset",
    "teachableLearnset": "sJigglypuffTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MOON_STONE, SPECIES_WIGGLYTUFF})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wigglytuff",
    "parsedTypes": [
      "JIGGLYPUFF_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "FRISK"
    ],
    "id": "SPECIES_WIGGLYTUFF",
    "family": "P_FAMILY_JIGGLYPUFF",
    "baseHP": 140,
    "baseAttack": 70,
    "baseDefense": 45,
    "baseSpeed": 45,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "JIGGLYPUFF_FAMILY_TYPES",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_FRISK }",
    "speciesName": "_(\"Wigglytuff\")",
    "natDexNum": "NATIONAL_DEX_WIGGLYTUFF",
    "levelUpLearnset": "sWigglytuffLevelUpLearnset",
    "teachableLearnset": "sWigglytuffTeachableLearnset",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zubat",
    "parsedTypes": [
      "POISON",
      "FLYING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_ZUBAT",
    "family": "P_FAMILY_ZUBAT",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 35,
    "baseSpeed": 55,
    "baseSpAttack": 30,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FLYING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Zubat\")",
    "natDexNum": "NATIONAL_DEX_ZUBAT",
    "levelUpLearnset": "sZubatLevelUpLearnset",
    "teachableLearnset": "sZubatTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_GOLBAT})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golbat",
    "parsedTypes": [
      "POISON",
      "FLYING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_GOLBAT",
    "family": "P_FAMILY_ZUBAT",
    "baseHP": 75,
    "baseAttack": 80,
    "baseDefense": 70,
    "baseSpeed": 90,
    "baseSpAttack": 65,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FLYING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Golbat\")",
    "natDexNum": "NATIONAL_DEX_GOLBAT",
    "levelUpLearnset": "sGolbatLevelUpLearnset",
    "teachableLearnset": "sGolbatTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_CROBAT, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Crobat",
    "parsedTypes": [
      "POISON",
      "FLYING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_CROBAT",
    "family": "P_FAMILY_ZUBAT",
    "baseHP": 85,
    "baseAttack": 90,
    "baseDefense": 80,
    "baseSpeed": 130,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FLYING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Crobat\")",
    "natDexNum": "NATIONAL_DEX_CROBAT",
    "levelUpLearnset": "sCrobatLevelUpLearnset",
    "teachableLearnset": "sCrobatTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oddish",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_ODDISH",
    "family": "P_FAMILY_ODDISH",
    "baseHP": 45,
    "baseAttack": 50,
    "baseDefense": 55,
    "baseSpeed": 30,
    "baseSpAttack": 75,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Oddish\")",
    "natDexNum": "NATIONAL_DEX_ODDISH",
    "levelUpLearnset": "sOddishLevelUpLearnset",
    "teachableLearnset": "sOddishTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 21, SPECIES_GLOOM})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gloom",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "STENCH"
    ],
    "id": "SPECIES_GLOOM",
    "family": "P_FAMILY_ODDISH",
    "baseHP": 60,
    "baseAttack": 65,
    "baseDefense": 70,
    "baseSpeed": 40,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_STENCH }",
    "speciesName": "_(\"Gloom\")",
    "natDexNum": "NATIONAL_DEX_GLOOM",
    "levelUpLearnset": "sGloomLevelUpLearnset",
    "teachableLearnset": "sGloomTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_LEAF_STONE, SPECIES_VILEPLUME}",
    "baseBST": 395,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vileplume",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "EFFECT_SPORE"
    ],
    "id": "SPECIES_VILEPLUME",
    "family": "P_FAMILY_ODDISH",
    "baseHP": 75,
    "baseAttack": 80,
    "baseDefense": 85,
    "baseSpeed": 50,
    "baseSpAttack": 110,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_EFFECT_SPORE }",
    "speciesName": "_(\"Vileplume\")",
    "natDexNum": "NATIONAL_DEX_VILEPLUME",
    "levelUpLearnset": "sVileplumeLevelUpLearnset",
    "teachableLearnset": "sVileplumeTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bellossom",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "HEALER"
    ],
    "id": "SPECIES_BELLOSSOM",
    "family": "P_FAMILY_ODDISH",
    "baseHP": 75,
    "baseAttack": 80,
    "baseDefense": 95,
    "baseSpeed": 50,
    "baseSpAttack": 90,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_HEALER }",
    "speciesName": "_(\"Bellossom\")",
    "natDexNum": "NATIONAL_DEX_BELLOSSOM",
    "levelUpLearnset": "sBellossomLevelUpLearnset",
    "teachableLearnset": "sBellossomTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Paras",
    "parsedTypes": [
      "BUG",
      "GRASS"
    ],
    "parsedAbilities": [
      "EFFECT_SPORE",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_PARAS",
    "family": "P_FAMILY_PARAS",
    "baseHP": 35,
    "baseAttack": 70,
    "baseDefense": 55,
    "baseSpeed": 25,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GRASS)",
    "abilities": "{ ABILITY_EFFECT_SPORE, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Paras\")",
    "natDexNum": "NATIONAL_DEX_PARAS",
    "levelUpLearnset": "sParasLevelUpLearnset",
    "teachableLearnset": "sParasTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_PARASECT})",
    "baseBST": 285,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Parasect",
    "parsedTypes": [
      "BUG",
      "GRASS"
    ],
    "parsedAbilities": [
      "EFFECT_SPORE",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_PARASECT",
    "family": "P_FAMILY_PARAS",
    "baseHP": 60,
    "baseAttack": 95,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 60,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GRASS)",
    "abilities": "{ ABILITY_EFFECT_SPORE, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Parasect\")",
    "natDexNum": "NATIONAL_DEX_PARASECT",
    "levelUpLearnset": "sParasectLevelUpLearnset",
    "teachableLearnset": "sParasectTeachableLearnset",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Venonat",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "COMPOUND_EYES",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_VENONAT",
    "family": "P_FAMILY_VENONAT",
    "baseHP": 60,
    "baseAttack": 55,
    "baseDefense": 50,
    "baseSpeed": 45,
    "baseSpAttack": 40,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_COMPOUND_EYES, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Venonat\")",
    "natDexNum": "NATIONAL_DEX_VENONAT",
    "levelUpLearnset": "sVenonatLevelUpLearnset",
    "teachableLearnset": "sVenonatTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 31, SPECIES_VENOMOTH})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Venomoth",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "WONDER_SKIN"
    ],
    "id": "SPECIES_VENOMOTH",
    "family": "P_FAMILY_VENONAT",
    "baseHP": 70,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 90,
    "baseSpAttack": 90,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_WONDER_SKIN }",
    "speciesName": "_(\"Venomoth\")",
    "natDexNum": "NATIONAL_DEX_VENOMOTH",
    "levelUpLearnset": "sVenomothLevelUpLearnset",
    "teachableLearnset": "sVenomothTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Diglett",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "ARENA_TRAP",
      "SAND_FORCE"
    ],
    "id": "SPECIES_DIGLETT",
    "family": "P_FAMILY_DIGLETT",
    "baseHP": 10,
    "baseAttack": 55,
    "baseDefense": 25,
    "baseSpeed": 95,
    "baseSpAttack": 35,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_ARENA_TRAP, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Diglett\")",
    "natDexNum": "NATIONAL_DEX_DIGLETT",
    "levelUpLearnset": "sDiglettLevelUpLearnset",
    "teachableLearnset": "sDiglettTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_DUGTRIO})",
    "baseBST": 265,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dugtrio",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "ARENA_TRAP",
      "SAND_FORCE"
    ],
    "id": "SPECIES_DUGTRIO",
    "family": "P_FAMILY_DIGLETT",
    "baseHP": 35,
    "baseAttack": 100,
    "baseDefense": 50,
    "baseSpeed": 120,
    "baseSpAttack": 50,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_ARENA_TRAP, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Dugtrio\")",
    "natDexNum": "NATIONAL_DEX_DUGTRIO",
    "levelUpLearnset": "sDugtrioLevelUpLearnset",
    "teachableLearnset": "sDugtrioTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Diglett  Alola",
    "parsedTypes": [
      "GROUND",
      "STEEL"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "TANGLING_HAIR",
      "SAND_FORCE"
    ],
    "id": "SPECIES_DIGLETT_ALOLA",
    "family": "P_FAMILY_DIGLETT",
    "baseHP": 10,
    "baseAttack": 55,
    "baseDefense": 30,
    "baseSpeed": 90,
    "baseSpAttack": 35,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_STEEL)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_TANGLING_HAIR, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Diglett\")",
    "natDexNum": "NATIONAL_DEX_DIGLETT",
    "levelUpLearnset": "sDiglettAlolaLevelUpLearnset",
    "teachableLearnset": "sDiglettAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_DUGTRIO_ALOLA})",
    "baseBST": 265,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dugtrio  Alola",
    "parsedTypes": [
      "GROUND",
      "STEEL"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "TANGLING_HAIR",
      "SAND_FORCE"
    ],
    "id": "SPECIES_DUGTRIO_ALOLA",
    "family": "P_FAMILY_DIGLETT",
    "baseHP": 35,
    "baseAttack": 100,
    "baseDefense": 60,
    "baseSpeed": 110,
    "baseSpAttack": 50,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_STEEL)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_TANGLING_HAIR, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Dugtrio\")",
    "natDexNum": "NATIONAL_DEX_DUGTRIO",
    "levelUpLearnset": "sDugtrioAlolaLevelUpLearnset",
    "teachableLearnset": "sDugtrioAlolaTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meowth",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_MEOWTH",
    "family": "P_FAMILY_MEOWTH",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 35,
    "baseSpeed": 90,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Meowth\")",
    "natDexNum": "NATIONAL_DEX_MEOWTH",
    "levelUpLearnset": "sMeowthLevelUpLearnset",
    "teachableLearnset": "sMeowthTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_PERSIAN})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Persian",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "LIMBER",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_PERSIAN",
    "family": "P_FAMILY_MEOWTH",
    "baseHP": 65,
    "baseAttack": 70,
    "baseDefense": 60,
    "baseSpeed": 115,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Persian\")",
    "natDexNum": "NATIONAL_DEX_PERSIAN",
    "levelUpLearnset": "sPersianLevelUpLearnset",
    "teachableLearnset": "sPersianTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meowth  Alola",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "PICKUP",
      "TECHNICIAN",
      "RATTLED"
    ],
    "id": "SPECIES_MEOWTH_ALOLA",
    "family": "P_FAMILY_MEOWTH",
    "baseHP": 40,
    "baseAttack": 35,
    "baseDefense": 35,
    "baseSpeed": 90,
    "baseSpAttack": 50,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_TECHNICIAN, ABILITY_RATTLED }",
    "speciesName": "_(\"Meowth\")",
    "natDexNum": "NATIONAL_DEX_MEOWTH",
    "levelUpLearnset": "sMeowthAlolaLevelUpLearnset",
    "teachableLearnset": "sMeowthAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_PERSIAN_ALOLA, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Persian  Alola",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "FUR_COAT",
      "TECHNICIAN",
      "RATTLED"
    ],
    "id": "SPECIES_PERSIAN_ALOLA",
    "family": "P_FAMILY_MEOWTH",
    "baseHP": 65,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 115,
    "baseSpAttack": 75,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_FUR_COAT, ABILITY_TECHNICIAN, ABILITY_RATTLED }",
    "speciesName": "_(\"Persian\")",
    "natDexNum": "NATIONAL_DEX_PERSIAN",
    "levelUpLearnset": "sPersianAlolaLevelUpLearnset",
    "teachableLearnset": "sPersianAlolaTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meowth  Galar",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "TOUGH_CLAWS",
      "UNNERVE"
    ],
    "id": "SPECIES_MEOWTH_GALAR",
    "family": "P_FAMILY_MEOWTH",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 55,
    "baseSpeed": 40,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_TOUGH_CLAWS, ABILITY_UNNERVE }",
    "speciesName": "_(\"Meowth\")",
    "natDexNum": "NATIONAL_DEX_MEOWTH",
    "levelUpLearnset": "sMeowthGalarLevelUpLearnset",
    "teachableLearnset": "sMeowthGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_PERRSERKER})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Perrserker",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "BATTLE_ARMOR",
      "TOUGH_CLAWS",
      "STEELY_SPIRIT"
    ],
    "id": "SPECIES_PERRSERKER",
    "family": "P_FAMILY_MEOWTH",
    "baseHP": 70,
    "baseAttack": 110,
    "baseDefense": 100,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_BATTLE_ARMOR, ABILITY_TOUGH_CLAWS, ABILITY_STEELY_SPIRIT }",
    "speciesName": "_(\"Perrserker\")",
    "natDexNum": "NATIONAL_DEX_PERRSERKER",
    "levelUpLearnset": "sPerrserkerLevelUpLearnset",
    "teachableLearnset": "sPerrserkerTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Psyduck",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "DAMP",
      "CLOUD_NINE",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_PSYDUCK",
    "family": "P_FAMILY_PSYDUCK",
    "baseHP": 50,
    "baseAttack": 52,
    "baseDefense": 48,
    "baseSpeed": 55,
    "baseSpAttack": 65,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_DAMP, ABILITY_CLOUD_NINE, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Psyduck\")",
    "natDexNum": "NATIONAL_DEX_PSYDUCK",
    "levelUpLearnset": "sPsyduckLevelUpLearnset",
    "teachableLearnset": "sPsyduckTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 33, SPECIES_GOLDUCK})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golduck",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "DAMP",
      "CLOUD_NINE",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_GOLDUCK",
    "family": "P_FAMILY_PSYDUCK",
    "baseHP": 80,
    "baseAttack": 82,
    "baseDefense": 78,
    "baseSpeed": 85,
    "baseSpAttack": 95,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_DAMP, ABILITY_CLOUD_NINE, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Golduck\")",
    "natDexNum": "NATIONAL_DEX_GOLDUCK",
    "levelUpLearnset": "sGolduckLevelUpLearnset",
    "teachableLearnset": "sGolduckTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mankey",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_MANKEY",
    "family": "P_FAMILY_MANKEY",
    "baseHP": 40,
    "baseAttack": 80,
    "baseDefense": 35,
    "baseSpeed": 70,
    "baseSpAttack": 35,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Mankey\")",
    "natDexNum": "NATIONAL_DEX_MANKEY",
    "levelUpLearnset": "sMankeyLevelUpLearnset",
    "teachableLearnset": "sMankeyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_PRIMEAPE})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Primeape",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_PRIMEAPE",
    "family": "P_FAMILY_MANKEY",
    "baseHP": 65,
    "baseAttack": 105,
    "baseDefense": 60,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Primeape\")",
    "natDexNum": "NATIONAL_DEX_PRIMEAPE",
    "levelUpLearnset": "sPrimeapeLevelUpLearnset",
    "teachableLearnset": "sPrimeapeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_ANNIHILAPE, CONDITIONS({IF_USED_MOVE_X_TIMES, MOVE_RAGE_FIST, 20})})",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Annihilape",
    "parsedTypes": [
      "FIGHTING",
      "GHOST"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "INNER_FOCUS",
      "DEFIANT"
    ],
    "id": "SPECIES_ANNIHILAPE",
    "family": "P_FAMILY_MANKEY",
    "baseHP": 110,
    "baseAttack": 115,
    "baseDefense": 80,
    "baseSpeed": 90,
    "baseSpAttack": 50,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_GHOST)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_INNER_FOCUS, ABILITY_DEFIANT }",
    "speciesName": "_(\"Annihilape\")",
    "natDexNum": "NATIONAL_DEX_ANNIHILAPE",
    "levelUpLearnset": "sAnnihilapeLevelUpLearnset",
    "teachableLearnset": "sAnnihilapeTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Growlithe",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "FLASH_FIRE",
      "JUSTIFIED"
    ],
    "id": "SPECIES_GROWLITHE",
    "family": "P_FAMILY_GROWLITHE",
    "baseHP": 55,
    "baseAttack": 70,
    "baseDefense": 45,
    "baseSpeed": 60,
    "baseSpAttack": 70,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_FLASH_FIRE, ABILITY_JUSTIFIED }",
    "speciesName": "_(\"Growlithe\")",
    "natDexNum": "NATIONAL_DEX_GROWLITHE",
    "levelUpLearnset": "sGrowlitheLevelUpLearnset",
    "teachableLearnset": "sGrowlitheTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_FIRE_STONE, SPECIES_ARCANINE})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arcanine",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "FLASH_FIRE",
      "JUSTIFIED"
    ],
    "id": "SPECIES_ARCANINE",
    "family": "P_FAMILY_GROWLITHE",
    "baseHP": 90,
    "baseAttack": 110,
    "baseDefense": 80,
    "baseSpeed": 95,
    "baseSpAttack": 100,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_FLASH_FIRE, ABILITY_JUSTIFIED }",
    "speciesName": "_(\"Arcanine\")",
    "natDexNum": "NATIONAL_DEX_ARCANINE",
    "levelUpLearnset": "sArcanineLevelUpLearnset",
    "teachableLearnset": "sArcanineTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Growlithe  Hisui",
    "parsedTypes": [
      "FIRE",
      "ROCK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "FLASH_FIRE",
      "ROCK_HEAD"
    ],
    "id": "SPECIES_GROWLITHE_HISUI",
    "family": "P_FAMILY_GROWLITHE",
    "baseHP": 60,
    "baseAttack": 75,
    "baseDefense": 45,
    "baseSpeed": 55,
    "baseSpAttack": 65,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_ROCK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_FLASH_FIRE, ABILITY_ROCK_HEAD }",
    "speciesName": "_(\"Growlithe\")",
    "natDexNum": "NATIONAL_DEX_GROWLITHE",
    "levelUpLearnset": "sGrowlitheHisuiLevelUpLearnset",
    "teachableLearnset": "sGrowlitheHisuiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_FIRE_STONE, SPECIES_ARCANINE_HISUI})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arcanine  Hisui",
    "parsedTypes": [
      "FIRE",
      "ROCK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "FLASH_FIRE",
      "ROCK_HEAD"
    ],
    "id": "SPECIES_ARCANINE_HISUI",
    "family": "P_FAMILY_GROWLITHE",
    "baseHP": 95,
    "baseAttack": 115,
    "baseDefense": 80,
    "baseSpeed": 90,
    "baseSpAttack": 95,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_ROCK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_FLASH_FIRE, ABILITY_ROCK_HEAD }",
    "speciesName": "_(\"Arcanine\")",
    "natDexNum": "NATIONAL_DEX_ARCANINE",
    "levelUpLearnset": "sArcanineHisuiLevelUpLearnset",
    "teachableLearnset": "sArcanineHisuiTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poliwag",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "DAMP",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_POLIWAG",
    "family": "P_FAMILY_POLIWAG",
    "baseHP": 40,
    "baseAttack": 50,
    "baseDefense": 40,
    "baseSpeed": 90,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_DAMP, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Poliwag\")",
    "natDexNum": "NATIONAL_DEX_POLIWAG",
    "levelUpLearnset": "sPoliwagLevelUpLearnset",
    "teachableLearnset": "sPoliwagTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_POLIWHIRL})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poliwhirl",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "DAMP",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_POLIWHIRL",
    "family": "P_FAMILY_POLIWAG",
    "baseHP": 65,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 90,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_DAMP, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Poliwhirl\")",
    "natDexNum": "NATIONAL_DEX_POLIWHIRL",
    "levelUpLearnset": "sPoliwhirlLevelUpLearnset",
    "teachableLearnset": "sPoliwhirlTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_WATER_STONE, SPECIES_POLIWRATH}",
    "baseBST": 385,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poliwrath",
    "parsedTypes": [
      "WATER",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "DAMP",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_POLIWRATH",
    "family": "P_FAMILY_POLIWAG",
    "baseHP": 90,
    "baseAttack": 95,
    "baseDefense": 95,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_DAMP, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Poliwrath\")",
    "natDexNum": "NATIONAL_DEX_POLIWRATH",
    "levelUpLearnset": "sPoliwrathLevelUpLearnset",
    "teachableLearnset": "sPoliwrathTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Politoed",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "DAMP",
      "DRIZZLE"
    ],
    "id": "SPECIES_POLITOED",
    "family": "P_FAMILY_POLIWAG",
    "baseHP": 90,
    "baseAttack": 75,
    "baseDefense": 75,
    "baseSpeed": 70,
    "baseSpAttack": 90,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_DAMP, ABILITY_DRIZZLE }",
    "speciesName": "_(\"Politoed\")",
    "natDexNum": "NATIONAL_DEX_POLITOED",
    "levelUpLearnset": "sPolitoedLevelUpLearnset",
    "teachableLearnset": "sPolitoedTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Abra",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "INNER_FOCUS",
      "MAGIC_GUARD"
    ],
    "id": "SPECIES_ABRA",
    "family": "P_FAMILY_ABRA",
    "baseHP": 25,
    "baseAttack": 20,
    "baseDefense": 15,
    "baseSpeed": 90,
    "baseSpAttack": 105,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_INNER_FOCUS, ABILITY_MAGIC_GUARD }",
    "speciesName": "_(\"Abra\")",
    "natDexNum": "NATIONAL_DEX_ABRA",
    "levelUpLearnset": "sAbraLevelUpLearnset",
    "teachableLearnset": "sAbraTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_KADABRA})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kadabra",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "INNER_FOCUS",
      "MAGIC_GUARD"
    ],
    "id": "SPECIES_KADABRA",
    "family": "P_FAMILY_ABRA",
    "baseHP": 40,
    "baseAttack": 35,
    "baseDefense": 30,
    "baseSpeed": 105,
    "baseSpAttack": 120,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_INNER_FOCUS, ABILITY_MAGIC_GUARD }",
    "speciesName": "_(\"Kadabra\")",
    "natDexNum": "NATIONAL_DEX_KADABRA",
    "levelUpLearnset": "sKadabraLevelUpLearnset",
    "teachableLearnset": "sKadabraTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_ALAKAZAM}",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Alakazam",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "INNER_FOCUS",
      "MAGIC_GUARD"
    ],
    "id": "SPECIES_ALAKAZAM",
    "family": "P_FAMILY_ABRA",
    "baseHP": 55,
    "baseAttack": 50,
    "baseDefense": 45,
    "baseSpeed": 120,
    "baseSpAttack": 135,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_INNER_FOCUS, ABILITY_MAGIC_GUARD }",
    "speciesName": "_(\"Alakazam\")",
    "natDexNum": "NATIONAL_DEX_ALAKAZAM",
    "levelUpLearnset": "sAlakazamLevelUpLearnset",
    "teachableLearnset": "sAlakazamTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Alakazam  Mega",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "TRACE",
      "TRACE",
      "TRACE"
    ],
    "id": "SPECIES_ALAKAZAM_MEGA",
    "family": "P_FAMILY_ABRA",
    "baseHP": 55,
    "baseAttack": 50,
    "baseDefense": 65,
    "baseSpeed": 150,
    "baseSpAttack": 175,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_TRACE, ABILITY_TRACE, ABILITY_TRACE }",
    "speciesName": "_(\"Alakazam\")",
    "natDexNum": "NATIONAL_DEX_ALAKAZAM",
    "levelUpLearnset": "sAlakazamLevelUpLearnset",
    "teachableLearnset": "sAlakazamTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Machop",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "STEADFAST"
    ],
    "id": "SPECIES_MACHOP",
    "family": "P_FAMILY_MACHOP",
    "baseHP": 70,
    "baseAttack": 80,
    "baseDefense": 50,
    "baseSpeed": 35,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_STEADFAST }",
    "speciesName": "_(\"Machop\")",
    "natDexNum": "NATIONAL_DEX_MACHOP",
    "levelUpLearnset": "sMachopLevelUpLearnset",
    "teachableLearnset": "sMachopTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_MACHOKE})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Machoke",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "STEADFAST"
    ],
    "id": "SPECIES_MACHOKE",
    "family": "P_FAMILY_MACHOP",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 45,
    "baseSpAttack": 50,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_STEADFAST }",
    "speciesName": "_(\"Machoke\")",
    "natDexNum": "NATIONAL_DEX_MACHOKE",
    "levelUpLearnset": "sMachokeLevelUpLearnset",
    "teachableLearnset": "sMachokeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_MACHAMP}",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Machamp",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "STEADFAST"
    ],
    "id": "SPECIES_MACHAMP",
    "family": "P_FAMILY_MACHOP",
    "baseHP": 90,
    "baseAttack": 130,
    "baseDefense": 80,
    "baseSpeed": 55,
    "baseSpAttack": 65,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_STEADFAST }",
    "speciesName": "_(\"Machamp\")",
    "natDexNum": "NATIONAL_DEX_MACHAMP",
    "levelUpLearnset": "sMachampLevelUpLearnset",
    "teachableLearnset": "sMachampTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bellsprout",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "GLUTTONY"
    ],
    "id": "SPECIES_BELLSPROUT",
    "family": "P_FAMILY_BELLSPROUT",
    "baseHP": 50,
    "baseAttack": 75,
    "baseDefense": 35,
    "baseSpeed": 40,
    "baseSpAttack": 70,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Bellsprout\")",
    "natDexNum": "NATIONAL_DEX_BELLSPROUT",
    "levelUpLearnset": "sBellsproutLevelUpLearnset",
    "teachableLearnset": "sBellsproutTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 21, SPECIES_WEEPINBELL})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Weepinbell",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "GLUTTONY"
    ],
    "id": "SPECIES_WEEPINBELL",
    "family": "P_FAMILY_BELLSPROUT",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 50,
    "baseSpeed": 55,
    "baseSpAttack": 85,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Weepinbell\")",
    "natDexNum": "NATIONAL_DEX_WEEPINBELL",
    "levelUpLearnset": "sWeepinbellLevelUpLearnset",
    "teachableLearnset": "sWeepinbellTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_LEAF_STONE, SPECIES_VICTREEBEL})",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Victreebel",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "GLUTTONY"
    ],
    "id": "SPECIES_VICTREEBEL",
    "family": "P_FAMILY_BELLSPROUT",
    "baseHP": 80,
    "baseAttack": 105,
    "baseDefense": 65,
    "baseSpeed": 70,
    "baseSpAttack": 100,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Victreebel\")",
    "natDexNum": "NATIONAL_DEX_VICTREEBEL",
    "levelUpLearnset": "sVictreebelLevelUpLearnset",
    "teachableLearnset": "sVictreebelTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tentacool",
    "parsedTypes": [
      "WATER",
      "POISON"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "LIQUID_OOZE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_TENTACOOL",
    "family": "P_FAMILY_TENTACOOL",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 35,
    "baseSpeed": 70,
    "baseSpAttack": 50,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_WATER, TYPE_POISON)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_LIQUID_OOZE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Tentacool\")",
    "natDexNum": "NATIONAL_DEX_TENTACOOL",
    "levelUpLearnset": "sTentacoolLevelUpLearnset",
    "teachableLearnset": "sTentacoolTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_TENTACRUEL})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tentacruel",
    "parsedTypes": [
      "WATER",
      "POISON"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "LIQUID_OOZE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_TENTACRUEL",
    "family": "P_FAMILY_TENTACOOL",
    "baseHP": 80,
    "baseAttack": 70,
    "baseDefense": 65,
    "baseSpeed": 100,
    "baseSpAttack": 80,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_WATER, TYPE_POISON)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_LIQUID_OOZE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Tentacruel\")",
    "natDexNum": "NATIONAL_DEX_TENTACRUEL",
    "levelUpLearnset": "sTentacruelLevelUpLearnset",
    "teachableLearnset": "sTentacruelTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Geodude",
    "parsedTypes": [
      "ROCK",
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "STURDY",
      "SAND_VEIL"
    ],
    "id": "SPECIES_GEODUDE",
    "family": "P_FAMILY_GEODUDE",
    "baseHP": 40,
    "baseAttack": 80,
    "baseDefense": 100,
    "baseSpeed": 20,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_STURDY, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Geodude\")",
    "natDexNum": "NATIONAL_DEX_GEODUDE",
    "levelUpLearnset": "sGeodudeLevelUpLearnset",
    "teachableLearnset": "sGeodudeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_GRAVELER})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Graveler",
    "parsedTypes": [
      "ROCK",
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "STURDY",
      "SAND_VEIL"
    ],
    "id": "SPECIES_GRAVELER",
    "family": "P_FAMILY_GEODUDE",
    "baseHP": 55,
    "baseAttack": 95,
    "baseDefense": 115,
    "baseSpeed": 35,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_STURDY, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Graveler\")",
    "natDexNum": "NATIONAL_DEX_GRAVELER",
    "levelUpLearnset": "sGravelerLevelUpLearnset",
    "teachableLearnset": "sGravelerTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GOLEM}",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golem",
    "parsedTypes": [
      "ROCK",
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "STURDY",
      "SAND_VEIL"
    ],
    "id": "SPECIES_GOLEM",
    "family": "P_FAMILY_GEODUDE",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 130,
    "baseSpeed": 45,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_STURDY, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Golem\")",
    "natDexNum": "NATIONAL_DEX_GOLEM",
    "levelUpLearnset": "sGolemLevelUpLearnset",
    "teachableLearnset": "sGolemTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Geodude  Alola",
    "parsedTypes": [
      "ROCK",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "STURDY",
      "GALVANIZE"
    ],
    "id": "SPECIES_GEODUDE_ALOLA",
    "family": "P_FAMILY_GEODUDE",
    "baseHP": 40,
    "baseAttack": 80,
    "baseDefense": 100,
    "baseSpeed": 20,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_STURDY, ABILITY_GALVANIZE }",
    "speciesName": "_(\"Geodude\")",
    "natDexNum": "NATIONAL_DEX_GEODUDE",
    "levelUpLearnset": "sGeodudeAlolaLevelUpLearnset",
    "teachableLearnset": "sGeodudeAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_GRAVELER_ALOLA})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Graveler  Alola",
    "parsedTypes": [
      "ROCK",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "STURDY",
      "GALVANIZE"
    ],
    "id": "SPECIES_GRAVELER_ALOLA",
    "family": "P_FAMILY_GEODUDE",
    "baseHP": 55,
    "baseAttack": 95,
    "baseDefense": 115,
    "baseSpeed": 35,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_STURDY, ABILITY_GALVANIZE }",
    "speciesName": "_(\"Graveler\")",
    "natDexNum": "NATIONAL_DEX_GRAVELER",
    "levelUpLearnset": "sGravelerAlolaLevelUpLearnset",
    "teachableLearnset": "sGravelerAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GOLEM_ALOLA}",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golem  Alola",
    "parsedTypes": [
      "ROCK",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "STURDY",
      "GALVANIZE"
    ],
    "id": "SPECIES_GOLEM_ALOLA",
    "family": "P_FAMILY_GEODUDE",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 130,
    "baseSpeed": 45,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_STURDY, ABILITY_GALVANIZE }",
    "speciesName": "_(\"Golem\")",
    "natDexNum": "NATIONAL_DEX_GOLEM",
    "levelUpLearnset": "sGolemAlolaLevelUpLearnset",
    "teachableLearnset": "sGolemAlolaTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ponyta",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "FLASH_FIRE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_PONYTA",
    "family": "P_FAMILY_PONYTA",
    "baseHP": 50,
    "baseAttack": 85,
    "baseDefense": 55,
    "baseSpeed": 90,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_FLASH_FIRE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Ponyta\")",
    "natDexNum": "NATIONAL_DEX_PONYTA",
    "levelUpLearnset": "sPonytaLevelUpLearnset",
    "teachableLearnset": "sPonytaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_RAPIDASH})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rapidash",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "FLASH_FIRE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_RAPIDASH",
    "family": "P_FAMILY_PONYTA",
    "baseHP": 65,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 105,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_FLASH_FIRE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Rapidash\")",
    "natDexNum": "NATIONAL_DEX_RAPIDASH",
    "levelUpLearnset": "sRapidashLevelUpLearnset",
    "teachableLearnset": "sRapidashTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ponyta  Galar",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "PASTEL_VEIL",
      "ANTICIPATION"
    ],
    "id": "SPECIES_PONYTA_GALAR",
    "family": "P_FAMILY_PONYTA",
    "baseHP": 50,
    "baseAttack": 85,
    "baseDefense": 55,
    "baseSpeed": 90,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_PASTEL_VEIL, ABILITY_ANTICIPATION }",
    "speciesName": "_(\"Ponyta\")",
    "natDexNum": "NATIONAL_DEX_PONYTA",
    "levelUpLearnset": "sPonytaGalarLevelUpLearnset",
    "teachableLearnset": "sPonytaGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_RAPIDASH_GALAR})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rapidash  Galar",
    "parsedTypes": [
      "PSYCHIC",
      "FAIRY"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "PASTEL_VEIL",
      "ANTICIPATION"
    ],
    "id": "SPECIES_RAPIDASH_GALAR",
    "family": "P_FAMILY_PONYTA",
    "baseHP": 65,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 105,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FAIRY)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_PASTEL_VEIL, ABILITY_ANTICIPATION }",
    "speciesName": "_(\"Rapidash\")",
    "natDexNum": "NATIONAL_DEX_RAPIDASH",
    "levelUpLearnset": "sRapidashGalarLevelUpLearnset",
    "teachableLearnset": "sRapidashGalarTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowpoke",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "OWN_TEMPO",
      "REGENERATOR"
    ],
    "id": "SPECIES_SLOWPOKE",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 90,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 15,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_OWN_TEMPO, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Slowpoke\")",
    "natDexNum": "NATIONAL_DEX_SLOWPOKE",
    "levelUpLearnset": "sSlowpokeLevelUpLearnset",
    "teachableLearnset": "sSlowpokeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_SLOWBRO}",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowbro",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "OWN_TEMPO",
      "REGENERATOR"
    ],
    "id": "SPECIES_SLOWBRO",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 95,
    "baseAttack": 75,
    "baseDefense": 110,
    "baseSpeed": 30,
    "baseSpAttack": 100,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_OWN_TEMPO, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Slowbro\")",
    "natDexNum": "NATIONAL_DEX_SLOWBRO",
    "levelUpLearnset": "sSlowbroLevelUpLearnset",
    "teachableLearnset": "sSlowbroTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowking",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "OWN_TEMPO",
      "REGENERATOR"
    ],
    "id": "SPECIES_SLOWKING",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 95,
    "baseAttack": 75,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 100,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_OWN_TEMPO, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Slowking\")",
    "natDexNum": "NATIONAL_DEX_SLOWKING",
    "levelUpLearnset": "sSlowkingLevelUpLearnset",
    "teachableLearnset": "sSlowkingTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowbro  Mega",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SHELL_ARMOR",
      "SHELL_ARMOR",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_SLOWBRO_MEGA",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 95,
    "baseAttack": 75,
    "baseDefense": 180,
    "baseSpeed": 30,
    "baseSpAttack": 130,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SHELL_ARMOR, ABILITY_SHELL_ARMOR, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Slowbro\")",
    "natDexNum": "NATIONAL_DEX_SLOWBRO",
    "levelUpLearnset": "sSlowbroLevelUpLearnset",
    "teachableLearnset": "sSlowbroTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowpoke  Galar",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "OWN_TEMPO",
      "REGENERATOR"
    ],
    "id": "SPECIES_SLOWPOKE_GALAR",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 90,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 15,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_OWN_TEMPO, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Slowpoke\")",
    "natDexNum": "NATIONAL_DEX_SLOWPOKE",
    "levelUpLearnset": "sSlowpokeGalarLevelUpLearnset",
    "teachableLearnset": "sSlowpokeGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_GALARICA_CUFF, SPECIES_SLOWBRO_GALAR}",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowbro  Galar",
    "parsedTypes": [
      "POISON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "QUICK_DRAW",
      "OWN_TEMPO",
      "REGENERATOR"
    ],
    "id": "SPECIES_SLOWBRO_GALAR",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 95,
    "baseAttack": 100,
    "baseDefense": 95,
    "baseSpeed": 30,
    "baseSpAttack": 100,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_POISON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_QUICK_DRAW, ABILITY_OWN_TEMPO, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Slowbro\")",
    "natDexNum": "NATIONAL_DEX_SLOWBRO",
    "levelUpLearnset": "sSlowbroGalarLevelUpLearnset",
    "teachableLearnset": "sSlowbroGalarTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slowking  Galar",
    "parsedTypes": [
      "POISON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CURIOUS_MEDICINE",
      "OWN_TEMPO",
      "REGENERATOR"
    ],
    "id": "SPECIES_SLOWKING_GALAR",
    "family": "P_FAMILY_SLOWPOKE",
    "baseHP": 95,
    "baseAttack": 65,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 110,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_POISON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CURIOUS_MEDICINE, ABILITY_OWN_TEMPO, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Slowking\")",
    "natDexNum": "NATIONAL_DEX_SLOWKING",
    "levelUpLearnset": "sSlowkingGalarLevelUpLearnset",
    "teachableLearnset": "sSlowkingGalarTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magnemite",
    "parsedTypes": [
      "ELECTRIC",
      "STEEL"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "STURDY",
      "ANALYTIC"
    ],
    "id": "SPECIES_MAGNEMITE",
    "family": "P_FAMILY_MAGNEMITE",
    "baseHP": 25,
    "baseAttack": 35,
    "baseDefense": 70,
    "baseSpeed": 45,
    "baseSpAttack": 95,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_STEEL)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_STURDY, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Magnemite\")",
    "natDexNum": "NATIONAL_DEX_MAGNEMITE",
    "levelUpLearnset": "sMagnemiteLevelUpLearnset",
    "teachableLearnset": "sMagnemiteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_MAGNETON})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magneton",
    "parsedTypes": [
      "ELECTRIC",
      "STEEL"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "STURDY",
      "ANALYTIC"
    ],
    "id": "SPECIES_MAGNETON",
    "family": "P_FAMILY_MAGNEMITE",
    "baseHP": 50,
    "baseAttack": 60,
    "baseDefense": 95,
    "baseSpeed": 70,
    "baseSpAttack": 120,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_STEEL)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_STURDY, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Magneton\")",
    "natDexNum": "NATIONAL_DEX_MAGNETON",
    "levelUpLearnset": "sMagnetonLevelUpLearnset",
    "teachableLearnset": "sMagnetonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_MAGNEZONE, CONDITIONS({IF_IN_MAPSEC, MAPSEC_NEW_MAUVILLE})}",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magnezone",
    "parsedTypes": [
      "ELECTRIC",
      "STEEL"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "STURDY",
      "ANALYTIC"
    ],
    "id": "SPECIES_MAGNEZONE",
    "family": "P_FAMILY_MAGNEMITE",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 115,
    "baseSpeed": 60,
    "baseSpAttack": 130,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_STEEL)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_STURDY, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Magnezone\")",
    "natDexNum": "NATIONAL_DEX_MAGNEZONE",
    "levelUpLearnset": "sMagnezoneLevelUpLearnset",
    "teachableLearnset": "sMagnezoneTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Farfetchd",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "INNER_FOCUS",
      "DEFIANT"
    ],
    "id": "SPECIES_FARFETCHD",
    "family": "P_FAMILY_FARFETCHD",
    "baseHP": 52,
    "baseAttack": 90,
    "baseDefense": 55,
    "baseSpeed": 60,
    "baseSpAttack": 58,
    "baseSpDefense": 62,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_INNER_FOCUS, ABILITY_DEFIANT }",
    "speciesName": "_(\"Farfetch'd\")",
    "natDexNum": "NATIONAL_DEX_FARFETCHD",
    "levelUpLearnset": "sFarfetchdLevelUpLearnset",
    "teachableLearnset": "sFarfetchdTeachableLearnset",
    "baseBST": 377,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Farfetchd  Galar",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "STEADFAST",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_FARFETCHD_GALAR",
    "family": "P_FAMILY_FARFETCHD",
    "baseHP": 52,
    "baseAttack": 95,
    "baseDefense": 55,
    "baseSpeed": 55,
    "baseSpAttack": 58,
    "baseSpDefense": 62,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_STEADFAST, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Farfetch'd\")",
    "natDexNum": "NATIONAL_DEX_FARFETCHD",
    "levelUpLearnset": "sFarfetchdGalarLevelUpLearnset",
    "teachableLearnset": "sFarfetchdGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_BATTLE_END, 0, SPECIES_SIRFETCHD, CONDITIONS({IF_CRITICAL_HITS_GE, 3})})",
    "baseBST": 377,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sirfetchd",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "STEADFAST",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_SIRFETCHD",
    "family": "P_FAMILY_FARFETCHD",
    "baseHP": 62,
    "baseAttack": 135,
    "baseDefense": 95,
    "baseSpeed": 65,
    "baseSpAttack": 68,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_STEADFAST, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Sirfetch'd\")",
    "natDexNum": "NATIONAL_DEX_SIRFETCHD",
    "levelUpLearnset": "sSirfetchdLevelUpLearnset",
    "teachableLearnset": "sSirfetchdTeachableLearnset",
    "baseBST": 507,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Doduo",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "EARLY_BIRD",
      "TANGLED_FEET"
    ],
    "id": "SPECIES_DODUO",
    "family": "P_FAMILY_DODUO",
    "baseHP": 35,
    "baseAttack": 85,
    "baseDefense": 45,
    "baseSpeed": 75,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_EARLY_BIRD, ABILITY_TANGLED_FEET }",
    "speciesName": "_(\"Doduo\")",
    "natDexNum": "NATIONAL_DEX_DODUO",
    "levelUpLearnset": "sDoduoLevelUpLearnset",
    "teachableLearnset": "sDoduoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 31, SPECIES_DODRIO})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dodrio",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "EARLY_BIRD",
      "TANGLED_FEET"
    ],
    "id": "SPECIES_DODRIO",
    "family": "P_FAMILY_DODUO",
    "baseHP": 60,
    "baseAttack": 110,
    "baseDefense": 70,
    "baseSpeed": 110,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_EARLY_BIRD, ABILITY_TANGLED_FEET }",
    "speciesName": "_(\"Dodrio\")",
    "natDexNum": "NATIONAL_DEX_DODRIO",
    "levelUpLearnset": "sDodrioLevelUpLearnset",
    "teachableLearnset": "sDodrioTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Seel",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "NONE",
      "ICE_BODY"
    ],
    "id": "SPECIES_SEEL",
    "family": "P_FAMILY_SEEL",
    "baseHP": 65,
    "baseAttack": 45,
    "baseDefense": 55,
    "baseSpeed": 45,
    "baseSpAttack": 45,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_NONE, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Seel\")",
    "natDexNum": "NATIONAL_DEX_SEEL",
    "levelUpLearnset": "sSeelLevelUpLearnset",
    "teachableLearnset": "sSeelTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_DEWGONG})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dewgong",
    "parsedTypes": [
      "WATER",
      "ICE"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "NONE",
      "ICE_BODY"
    ],
    "id": "SPECIES_DEWGONG",
    "family": "P_FAMILY_SEEL",
    "baseHP": 90,
    "baseAttack": 70,
    "baseDefense": 80,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ICE)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_NONE, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Dewgong\")",
    "natDexNum": "NATIONAL_DEX_DEWGONG",
    "levelUpLearnset": "sDewgongLevelUpLearnset",
    "teachableLearnset": "sDewgongTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grimer",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "STENCH",
      "STICKY_HOLD",
      "POISON_TOUCH"
    ],
    "id": "SPECIES_GRIMER",
    "family": "P_FAMILY_GRIMER",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 50,
    "baseSpeed": 25,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_STENCH, ABILITY_STICKY_HOLD, ABILITY_POISON_TOUCH }",
    "speciesName": "_(\"Grimer\")",
    "natDexNum": "NATIONAL_DEX_GRIMER",
    "levelUpLearnset": "sGrimerLevelUpLearnset",
    "teachableLearnset": "sGrimerTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_MUK})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Muk",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "STENCH",
      "STICKY_HOLD",
      "POISON_TOUCH"
    ],
    "id": "SPECIES_MUK",
    "family": "P_FAMILY_GRIMER",
    "baseHP": 105,
    "baseAttack": 105,
    "baseDefense": 75,
    "baseSpeed": 50,
    "baseSpAttack": 65,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_STENCH, ABILITY_STICKY_HOLD, ABILITY_POISON_TOUCH }",
    "speciesName": "_(\"Muk\")",
    "natDexNum": "NATIONAL_DEX_MUK",
    "levelUpLearnset": "sMukLevelUpLearnset",
    "teachableLearnset": "sMukTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grimer  Alola",
    "parsedTypes": [
      "POISON",
      "DARK"
    ],
    "parsedAbilities": [
      "POISON_TOUCH",
      "GLUTTONY",
      "POWER_OF_ALCHEMY"
    ],
    "id": "SPECIES_GRIMER_ALOLA",
    "family": "P_FAMILY_GRIMER",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 50,
    "baseSpeed": 25,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DARK)",
    "abilities": "{ ABILITY_POISON_TOUCH, ABILITY_GLUTTONY, ABILITY_POWER_OF_ALCHEMY }",
    "speciesName": "_(\"Grimer\")",
    "natDexNum": "NATIONAL_DEX_GRIMER",
    "levelUpLearnset": "sGrimerAlolaLevelUpLearnset",
    "teachableLearnset": "sGrimerAlolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_MUK_ALOLA})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Muk  Alola",
    "parsedTypes": [
      "POISON",
      "DARK"
    ],
    "parsedAbilities": [
      "POISON_TOUCH",
      "GLUTTONY",
      "POWER_OF_ALCHEMY"
    ],
    "id": "SPECIES_MUK_ALOLA",
    "family": "P_FAMILY_GRIMER",
    "baseHP": 105,
    "baseAttack": 105,
    "baseDefense": 75,
    "baseSpeed": 50,
    "baseSpAttack": 65,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DARK)",
    "abilities": "{ ABILITY_POISON_TOUCH, ABILITY_GLUTTONY, ABILITY_POWER_OF_ALCHEMY }",
    "speciesName": "_(\"Muk\")",
    "natDexNum": "NATIONAL_DEX_MUK",
    "levelUpLearnset": "sMukAlolaLevelUpLearnset",
    "teachableLearnset": "sMukAlolaTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shellder",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SHELL_ARMOR",
      "NONE",
      "OVERCOAT"
    ],
    "id": "SPECIES_SHELLDER",
    "family": "P_FAMILY_SHELLDER",
    "baseHP": 30,
    "baseAttack": 65,
    "baseDefense": 100,
    "baseSpeed": 40,
    "baseSpAttack": 45,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SHELL_ARMOR, ABILITY_NONE, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Shellder\")",
    "natDexNum": "NATIONAL_DEX_SHELLDER",
    "levelUpLearnset": "sShellderLevelUpLearnset",
    "teachableLearnset": "sShellderTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_WATER_STONE, SPECIES_CLOYSTER})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cloyster",
    "parsedTypes": [
      "WATER",
      "ICE"
    ],
    "parsedAbilities": [
      "SHELL_ARMOR",
      "NONE",
      "OVERCOAT"
    ],
    "id": "SPECIES_CLOYSTER",
    "family": "P_FAMILY_SHELLDER",
    "baseHP": 50,
    "baseAttack": 95,
    "baseDefense": 180,
    "baseSpeed": 70,
    "baseSpAttack": 85,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ICE)",
    "abilities": "{ ABILITY_SHELL_ARMOR, ABILITY_NONE, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Cloyster\")",
    "natDexNum": "NATIONAL_DEX_CLOYSTER",
    "levelUpLearnset": "sCloysterLevelUpLearnset",
    "teachableLearnset": "sCloysterTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gastly",
    "parsedTypes": [
      "GHOST",
      "POISON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GASTLY",
    "family": "P_FAMILY_GASTLY",
    "baseHP": 30,
    "baseAttack": 35,
    "baseDefense": 30,
    "baseSpeed": 80,
    "baseSpAttack": 100,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_POISON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Gastly\")",
    "natDexNum": "NATIONAL_DEX_GASTLY",
    "levelUpLearnset": "sGastlyLevelUpLearnset",
    "teachableLearnset": "sGastlyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_HAUNTER})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Haunter",
    "parsedTypes": [
      "GHOST",
      "POISON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_HAUNTER",
    "family": "P_FAMILY_GASTLY",
    "baseHP": 45,
    "baseAttack": 50,
    "baseDefense": 45,
    "baseSpeed": 95,
    "baseSpAttack": 115,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_POISON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Haunter\")",
    "natDexNum": "NATIONAL_DEX_HAUNTER",
    "levelUpLearnset": "sHaunterLevelUpLearnset",
    "teachableLearnset": "sHaunterTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GENGAR}",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gengar",
    "parsedTypes": [
      "GHOST",
      "POISON"
    ],
    "parsedAbilities": [
      "GENGAR_ABILITIES"
    ],
    "id": "SPECIES_GENGAR",
    "family": "P_FAMILY_GASTLY",
    "baseHP": 60,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 110,
    "baseSpAttack": 130,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_POISON)",
    "abilities": "GENGAR_ABILITIES",
    "speciesName": "_(\"Gengar\")",
    "natDexNum": "NATIONAL_DEX_GENGAR",
    "levelUpLearnset": "sGengarLevelUpLearnset",
    "teachableLearnset": "sGengarTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gengar  Mega",
    "parsedTypes": [
      "GHOST",
      "POISON"
    ],
    "parsedAbilities": [
      "SHADOW_TAG",
      "SHADOW_TAG",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_GENGAR_MEGA",
    "family": "P_FAMILY_GASTLY",
    "baseHP": 60,
    "baseAttack": 65,
    "baseDefense": 80,
    "baseSpeed": 130,
    "baseSpAttack": 170,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_POISON)",
    "abilities": "{ ABILITY_SHADOW_TAG, ABILITY_SHADOW_TAG, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Gengar\")",
    "natDexNum": "NATIONAL_DEX_GENGAR",
    "levelUpLearnset": "sGengarLevelUpLearnset",
    "teachableLearnset": "sGengarTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Onix",
    "parsedTypes": [
      "ROCK",
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "STURDY",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_ONIX",
    "family": "P_FAMILY_ONIX",
    "baseHP": 35,
    "baseAttack": 45,
    "baseDefense": 160,
    "baseSpeed": 70,
    "baseSpAttack": 30,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_STURDY, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Onix\")",
    "natDexNum": "NATIONAL_DEX_ONIX",
    "levelUpLearnset": "sOnixLevelUpLearnset",
    "teachableLearnset": "sOnixTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_STEELIX, CONDITIONS({IF_HOLD_ITEM, ITEM_METAL_COAT})}",
    "baseBST": 385,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Steelix",
    "parsedTypes": [
      "STEEL",
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "STURDY",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_STEELIX",
    "family": "P_FAMILY_ONIX",
    "baseHP": 75,
    "baseAttack": 85,
    "baseDefense": 200,
    "baseSpeed": 30,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_STURDY, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Steelix\")",
    "natDexNum": "NATIONAL_DEX_STEELIX",
    "levelUpLearnset": "sSteelixLevelUpLearnset",
    "teachableLearnset": "sSteelixTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Steelix  Mega",
    "parsedTypes": [
      "STEEL",
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_FORCE",
      "SAND_FORCE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_STEELIX_MEGA",
    "family": "P_FAMILY_ONIX",
    "baseHP": 75,
    "baseAttack": 125,
    "baseDefense": 230,
    "baseSpeed": 30,
    "baseSpAttack": 55,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_FORCE, ABILITY_SAND_FORCE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Steelix\")",
    "natDexNum": "NATIONAL_DEX_STEELIX",
    "levelUpLearnset": "sSteelixLevelUpLearnset",
    "teachableLearnset": "sSteelixTeachableLearnset",
    "baseBST": 610,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drowzee",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_DROWZEE",
    "family": "P_FAMILY_DROWZEE",
    "baseHP": 60,
    "baseAttack": 48,
    "baseDefense": 45,
    "baseSpeed": 42,
    "baseSpAttack": 43,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Drowzee\")",
    "natDexNum": "NATIONAL_DEX_DROWZEE",
    "levelUpLearnset": "sDrowzeeLevelUpLearnset",
    "teachableLearnset": "sDrowzeeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_HYPNO})",
    "baseBST": 328,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hypno",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_HYPNO",
    "family": "P_FAMILY_DROWZEE",
    "baseHP": 85,
    "baseAttack": 73,
    "baseDefense": 70,
    "baseSpeed": 67,
    "baseSpAttack": 73,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Hypno\")",
    "natDexNum": "NATIONAL_DEX_HYPNO",
    "levelUpLearnset": "sHypnoLevelUpLearnset",
    "teachableLearnset": "sHypnoTeachableLearnset",
    "baseBST": 483,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Krabby",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "SHELL_ARMOR",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_KRABBY",
    "family": "P_FAMILY_KRABBY",
    "baseHP": 30,
    "baseAttack": 105,
    "baseDefense": 90,
    "baseSpeed": 50,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_SHELL_ARMOR, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Krabby\")",
    "natDexNum": "NATIONAL_DEX_KRABBY",
    "levelUpLearnset": "sKrabbyLevelUpLearnset",
    "teachableLearnset": "sKrabbyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_KINGLER})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kingler",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "SHELL_ARMOR",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_KINGLER",
    "family": "P_FAMILY_KRABBY",
    "baseHP": 55,
    "baseAttack": 130,
    "baseDefense": 115,
    "baseSpeed": 75,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_SHELL_ARMOR, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Kingler\")",
    "natDexNum": "NATIONAL_DEX_KINGLER",
    "levelUpLearnset": "sKinglerLevelUpLearnset",
    "teachableLearnset": "sKinglerTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Voltorb",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "STATIC",
      "AFTERMATH"
    ],
    "id": "SPECIES_VOLTORB",
    "family": "P_FAMILY_VOLTORB",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 50,
    "baseSpeed": 100,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_STATIC, ABILITY_AFTERMATH }",
    "speciesName": "_(\"Voltorb\")",
    "natDexNum": "NATIONAL_DEX_VOLTORB",
    "levelUpLearnset": "sVoltorbLevelUpLearnset",
    "teachableLearnset": "sVoltorbTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_ELECTRODE})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Electrode",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "STATIC",
      "AFTERMATH"
    ],
    "id": "SPECIES_ELECTRODE",
    "family": "P_FAMILY_VOLTORB",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 70,
    "baseSpeed": 150,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_STATIC, ABILITY_AFTERMATH }",
    "speciesName": "_(\"Electrode\")",
    "natDexNum": "NATIONAL_DEX_ELECTRODE",
    "levelUpLearnset": "sElectrodeLevelUpLearnset",
    "teachableLearnset": "sElectrodeTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Voltorb  Hisui",
    "parsedTypes": [
      "ELECTRIC",
      "GRASS"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "STATIC",
      "AFTERMATH"
    ],
    "id": "SPECIES_VOLTORB_HISUI",
    "family": "P_FAMILY_VOLTORB",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 50,
    "baseSpeed": 100,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_GRASS)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_STATIC, ABILITY_AFTERMATH }",
    "speciesName": "_(\"Voltorb\")",
    "natDexNum": "NATIONAL_DEX_VOLTORB",
    "levelUpLearnset": "sVoltorbHisuiLevelUpLearnset",
    "teachableLearnset": "sVoltorbHisuiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_LEAF_STONE, SPECIES_ELECTRODE_HISUI})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Electrode  Hisui",
    "parsedTypes": [
      "ELECTRIC",
      "GRASS"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "STATIC",
      "AFTERMATH"
    ],
    "id": "SPECIES_ELECTRODE_HISUI",
    "family": "P_FAMILY_VOLTORB",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 70,
    "baseSpeed": 150,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_GRASS)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_STATIC, ABILITY_AFTERMATH }",
    "speciesName": "_(\"Electrode\")",
    "natDexNum": "NATIONAL_DEX_ELECTRODE",
    "levelUpLearnset": "sElectrodeHisuiLevelUpLearnset",
    "teachableLearnset": "sElectrodeHisuiTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Exeggcute",
    "parsedTypes": [
      "GRASS",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_EXEGGCUTE",
    "family": "P_FAMILY_EXEGGCUTE",
    "baseHP": 60,
    "baseAttack": 40,
    "baseDefense": 80,
    "baseSpeed": 40,
    "baseSpAttack": 60,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Exeggcute\")",
    "natDexNum": "NATIONAL_DEX_EXEGGCUTE",
    "levelUpLearnset": "sExeggcuteLevelUpLearnset",
    "teachableLearnset": "sExeggcuteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_LEAF_STONE, SPECIES_EXEGGUTOR}",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Exeggutor",
    "parsedTypes": [
      "GRASS",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_EXEGGUTOR",
    "family": "P_FAMILY_EXEGGCUTE",
    "baseHP": 95,
    "baseAttack": 95,
    "baseDefense": 85,
    "baseSpeed": 55,
    "baseSpAttack": 125,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Exeggutor\")",
    "natDexNum": "NATIONAL_DEX_EXEGGUTOR",
    "levelUpLearnset": "sExeggutorLevelUpLearnset",
    "teachableLearnset": "sExeggutorTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Exeggutor  Alola",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "FRISK",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_EXEGGUTOR_ALOLA",
    "family": "P_FAMILY_EXEGGCUTE",
    "baseHP": 95,
    "baseAttack": 105,
    "baseDefense": 85,
    "baseSpeed": 45,
    "baseSpAttack": 125,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_FRISK, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Exeggutor\")",
    "natDexNum": "NATIONAL_DEX_EXEGGUTOR",
    "levelUpLearnset": "sExeggutorAlolaLevelUpLearnset",
    "teachableLearnset": "sExeggutorAlolaTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cubone",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "LIGHTNING_ROD",
      "BATTLE_ARMOR"
    ],
    "id": "SPECIES_CUBONE",
    "family": "P_FAMILY_CUBONE",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 95,
    "baseSpeed": 35,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_LIGHTNING_ROD, ABILITY_BATTLE_ARMOR }",
    "speciesName": "_(\"Cubone\")",
    "natDexNum": "NATIONAL_DEX_CUBONE",
    "levelUpLearnset": "sCuboneLevelUpLearnset",
    "teachableLearnset": "sCuboneTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_MAROWAK}",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Marowak",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "LIGHTNING_ROD",
      "BATTLE_ARMOR"
    ],
    "id": "SPECIES_MAROWAK",
    "family": "P_FAMILY_CUBONE",
    "baseHP": 60,
    "baseAttack": 80,
    "baseDefense": 110,
    "baseSpeed": 45,
    "baseSpAttack": 50,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_LIGHTNING_ROD, ABILITY_BATTLE_ARMOR }",
    "speciesName": "_(\"Marowak\")",
    "natDexNum": "NATIONAL_DEX_MAROWAK",
    "levelUpLearnset": "sMarowakLevelUpLearnset",
    "teachableLearnset": "sMarowakTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Marowak  Alola",
    "parsedTypes": [
      "FIRE",
      "GHOST"
    ],
    "parsedAbilities": [
      "CURSED_BODY",
      "LIGHTNING_ROD",
      "ROCK_HEAD"
    ],
    "id": "SPECIES_MAROWAK_ALOLA",
    "family": "P_FAMILY_CUBONE",
    "baseHP": 60,
    "baseAttack": 80,
    "baseDefense": 110,
    "baseSpeed": 45,
    "baseSpAttack": 50,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GHOST)",
    "abilities": "{ ABILITY_CURSED_BODY, ABILITY_LIGHTNING_ROD, ABILITY_ROCK_HEAD }",
    "speciesName": "_(\"Marowak\")",
    "natDexNum": "NATIONAL_DEX_MAROWAK",
    "levelUpLearnset": "sMarowakAlolaLevelUpLearnset",
    "teachableLearnset": "sMarowakAlolaTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tyrogue",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_TYROGUE",
    "family": "P_FAMILY_HITMONS",
    "baseHP": 35,
    "baseAttack": 35,
    "baseDefense": 35,
    "baseSpeed": 35,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Tyrogue\")",
    "natDexNum": "NATIONAL_DEX_TYROGUE",
    "levelUpLearnset": "sTyrogueLevelUpLearnset",
    "teachableLearnset": "sTyrogueTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_HITMONCHAN, CONDITIONS({IF_ATK_LT_DEF})}",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hitmonlee",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "LIMBER",
      "NONE",
      "UNBURDEN"
    ],
    "id": "SPECIES_HITMONLEE",
    "family": "P_FAMILY_HITMONS",
    "baseHP": 50,
    "baseAttack": 120,
    "baseDefense": 53,
    "baseSpeed": 87,
    "baseSpAttack": 35,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_NONE, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Hitmonlee\")",
    "natDexNum": "NATIONAL_DEX_HITMONLEE",
    "levelUpLearnset": "sHitmonleeLevelUpLearnset",
    "teachableLearnset": "sHitmonleeTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hitmonchan",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_HITMONCHAN",
    "family": "P_FAMILY_HITMONS",
    "baseHP": 50,
    "baseAttack": 105,
    "baseDefense": 79,
    "baseSpeed": 76,
    "baseSpAttack": 35,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Hitmonchan\")",
    "natDexNum": "NATIONAL_DEX_HITMONCHAN",
    "levelUpLearnset": "sHitmonchanLevelUpLearnset",
    "teachableLearnset": "sHitmonchanTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hitmontop",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "STEADFAST"
    ],
    "id": "SPECIES_HITMONTOP",
    "family": "P_FAMILY_HITMONS",
    "baseHP": 50,
    "baseAttack": 95,
    "baseDefense": 95,
    "baseSpeed": 70,
    "baseSpAttack": 35,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_STEADFAST }",
    "speciesName": "_(\"Hitmontop\")",
    "natDexNum": "NATIONAL_DEX_HITMONTOP",
    "levelUpLearnset": "sHitmontopLevelUpLearnset",
    "teachableLearnset": "sHitmontopTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lickitung",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "OBLIVIOUS",
      "CLOUD_NINE"
    ],
    "id": "SPECIES_LICKITUNG",
    "family": "P_FAMILY_LICKITUNG",
    "baseHP": 90,
    "baseAttack": 55,
    "baseDefense": 75,
    "baseSpeed": 30,
    "baseSpAttack": 60,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_OBLIVIOUS, ABILITY_CLOUD_NINE }",
    "speciesName": "_(\"Lickitung\")",
    "natDexNum": "NATIONAL_DEX_LICKITUNG",
    "levelUpLearnset": "sLickitungLevelUpLearnset",
    "teachableLearnset": "sLickitungTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_LICKILICKY, CONDITIONS({IF_KNOWS_MOVE, MOVE_ROLLOUT})})",
    "baseBST": 385,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lickilicky",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "OBLIVIOUS",
      "CLOUD_NINE"
    ],
    "id": "SPECIES_LICKILICKY",
    "family": "P_FAMILY_LICKITUNG",
    "baseHP": 110,
    "baseAttack": 85,
    "baseDefense": 95,
    "baseSpeed": 50,
    "baseSpAttack": 80,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_OBLIVIOUS, ABILITY_CLOUD_NINE }",
    "speciesName": "_(\"Lickilicky\")",
    "natDexNum": "NATIONAL_DEX_LICKILICKY",
    "levelUpLearnset": "sLickilickyLevelUpLearnset",
    "teachableLearnset": "sLickilickyTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Koffing",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KOFFING",
    "family": "P_FAMILY_KOFFING",
    "baseHP": 40,
    "baseAttack": 65,
    "baseDefense": 95,
    "baseSpeed": 35,
    "baseSpAttack": 60,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Koffing\")",
    "natDexNum": "NATIONAL_DEX_KOFFING",
    "levelUpLearnset": "sKoffingLevelUpLearnset",
    "teachableLearnset": "sKoffingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_WEEZING}",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Weezing",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_WEEZING",
    "family": "P_FAMILY_KOFFING",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 120,
    "baseSpeed": 60,
    "baseSpAttack": 85,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Weezing\")",
    "natDexNum": "NATIONAL_DEX_WEEZING",
    "levelUpLearnset": "sWeezingLevelUpLearnset",
    "teachableLearnset": "sWeezingTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Weezing  Galar",
    "parsedTypes": [
      "POISON",
      "FAIRY"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NEUTRALIZING_GAS",
      "MISTY_SURGE"
    ],
    "id": "SPECIES_WEEZING_GALAR",
    "family": "P_FAMILY_KOFFING",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 120,
    "baseSpeed": 60,
    "baseSpAttack": 85,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FAIRY)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NEUTRALIZING_GAS, ABILITY_MISTY_SURGE }",
    "speciesName": "_(\"Weezing\")",
    "natDexNum": "NATIONAL_DEX_WEEZING",
    "levelUpLearnset": "sWeezingGalarLevelUpLearnset",
    "teachableLearnset": "sWeezingGalarTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rhyhorn",
    "parsedTypes": [
      "GROUND",
      "ROCK"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "ROCK_HEAD",
      "RECKLESS"
    ],
    "id": "SPECIES_RHYHORN",
    "family": "P_FAMILY_RHYHORN",
    "baseHP": 80,
    "baseAttack": 85,
    "baseDefense": 95,
    "baseSpeed": 25,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_ROCK)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_ROCK_HEAD, ABILITY_RECKLESS }",
    "speciesName": "_(\"Rhyhorn\")",
    "natDexNum": "NATIONAL_DEX_RHYHORN",
    "levelUpLearnset": "sRhyhornLevelUpLearnset",
    "teachableLearnset": "sRhyhornTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_RHYDON})",
    "baseBST": 345,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rhydon",
    "parsedTypes": [
      "GROUND",
      "ROCK"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "ROCK_HEAD",
      "RECKLESS"
    ],
    "id": "SPECIES_RHYDON",
    "family": "P_FAMILY_RHYHORN",
    "baseHP": 105,
    "baseAttack": 130,
    "baseDefense": 120,
    "baseSpeed": 40,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_ROCK)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_ROCK_HEAD, ABILITY_RECKLESS }",
    "speciesName": "_(\"Rhydon\")",
    "natDexNum": "NATIONAL_DEX_RHYDON",
    "levelUpLearnset": "sRhydonLevelUpLearnset",
    "teachableLearnset": "sRhydonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_RHYPERIOR, CONDITIONS({IF_HOLD_ITEM, ITEM_PROTECTOR})}",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rhyperior",
    "parsedTypes": [
      "GROUND",
      "ROCK"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "SOLID_ROCK",
      "RECKLESS"
    ],
    "id": "SPECIES_RHYPERIOR",
    "family": "P_FAMILY_RHYHORN",
    "baseHP": 115,
    "baseAttack": 140,
    "baseDefense": 130,
    "baseSpeed": 40,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_ROCK)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_SOLID_ROCK, ABILITY_RECKLESS }",
    "speciesName": "_(\"Rhyperior\")",
    "natDexNum": "NATIONAL_DEX_RHYPERIOR",
    "levelUpLearnset": "sRhyperiorLevelUpLearnset",
    "teachableLearnset": "sRhyperiorTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Happiny",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "SERENE_GRACE",
      "FRIEND_GUARD"
    ],
    "id": "SPECIES_HAPPINY",
    "family": "P_FAMILY_CHANSEY",
    "baseHP": 100,
    "baseAttack": 5,
    "baseDefense": 5,
    "baseSpeed": 30,
    "baseSpAttack": 15,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_SERENE_GRACE, ABILITY_FRIEND_GUARD }",
    "speciesName": "_(\"Happiny\")",
    "natDexNum": "NATIONAL_DEX_HAPPINY",
    "levelUpLearnset": "sHappinyLevelUpLearnset",
    "teachableLearnset": "sHappinyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_CHANSEY, CONDITIONS({IF_NOT_TIME, TIME_NIGHT},{IF_HOLD_ITEM, ITEM_OVAL_STONE})}",
    "baseBST": 220,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chansey",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "SERENE_GRACE",
      "HEALER"
    ],
    "id": "SPECIES_CHANSEY",
    "family": "P_FAMILY_CHANSEY",
    "baseHP": 250,
    "baseAttack": 5,
    "baseDefense": 5,
    "baseSpeed": 50,
    "baseSpAttack": 35,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_SERENE_GRACE, ABILITY_HEALER }",
    "speciesName": "_(\"Chansey\")",
    "natDexNum": "NATIONAL_DEX_CHANSEY",
    "levelUpLearnset": "sChanseyLevelUpLearnset",
    "teachableLearnset": "sChanseyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_BLISSEY, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blissey",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "SERENE_GRACE",
      "HEALER"
    ],
    "id": "SPECIES_BLISSEY",
    "family": "P_FAMILY_CHANSEY",
    "baseHP": 255,
    "baseAttack": 10,
    "baseDefense": 10,
    "baseSpeed": 55,
    "baseSpAttack": 75,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_SERENE_GRACE, ABILITY_HEALER }",
    "speciesName": "_(\"Blissey\")",
    "natDexNum": "NATIONAL_DEX_BLISSEY",
    "levelUpLearnset": "sBlisseyLevelUpLearnset",
    "teachableLearnset": "sBlisseyTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tangela",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "REGENERATOR"
    ],
    "id": "SPECIES_TANGELA",
    "family": "P_FAMILY_TANGELA",
    "baseHP": 65,
    "baseAttack": 55,
    "baseDefense": 115,
    "baseSpeed": 60,
    "baseSpAttack": 100,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Tangela\")",
    "natDexNum": "NATIONAL_DEX_TANGELA",
    "levelUpLearnset": "sTangelaLevelUpLearnset",
    "teachableLearnset": "sTangelaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_TANGROWTH, CONDITIONS({IF_KNOWS_MOVE, MOVE_ANCIENT_POWER})})",
    "baseBST": 435,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tangrowth",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "LEAF_GUARD",
      "REGENERATOR"
    ],
    "id": "SPECIES_TANGROWTH",
    "family": "P_FAMILY_TANGELA",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 125,
    "baseSpeed": 50,
    "baseSpAttack": 110,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_LEAF_GUARD, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Tangrowth\")",
    "natDexNum": "NATIONAL_DEX_TANGROWTH",
    "levelUpLearnset": "sTangrowthLevelUpLearnset",
    "teachableLearnset": "sTangrowthTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kangaskhan",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "EARLY_BIRD",
      "SCRAPPY",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_KANGASKHAN",
    "family": "P_FAMILY_KANGASKHAN",
    "baseHP": 105,
    "baseAttack": 95,
    "baseDefense": 80,
    "baseSpeed": 90,
    "baseSpAttack": 40,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_EARLY_BIRD, ABILITY_SCRAPPY, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Kangaskhan\")",
    "natDexNum": "NATIONAL_DEX_KANGASKHAN",
    "levelUpLearnset": "sKangaskhanLevelUpLearnset",
    "teachableLearnset": "sKangaskhanTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kangaskhan  Mega",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PARENTAL_BOND",
      "PARENTAL_BOND",
      "PARENTAL_BOND"
    ],
    "id": "SPECIES_KANGASKHAN_MEGA",
    "family": "P_FAMILY_KANGASKHAN",
    "baseHP": 105,
    "baseAttack": 125,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 60,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PARENTAL_BOND, ABILITY_PARENTAL_BOND, ABILITY_PARENTAL_BOND }",
    "speciesName": "_(\"Kangaskhan\")",
    "natDexNum": "NATIONAL_DEX_KANGASKHAN",
    "levelUpLearnset": "sKangaskhanLevelUpLearnset",
    "teachableLearnset": "sKangaskhanTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Horsea",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_HORSEA",
    "family": "P_FAMILY_HORSEA",
    "baseHP": 30,
    "baseAttack": 40,
    "baseDefense": 70,
    "baseSpeed": 60,
    "baseSpAttack": 70,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Horsea\")",
    "natDexNum": "NATIONAL_DEX_HORSEA",
    "levelUpLearnset": "sHorseaLevelUpLearnset",
    "teachableLearnset": "sHorseaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_SEADRA})",
    "baseBST": 295,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Seadra",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_SEADRA",
    "family": "P_FAMILY_HORSEA",
    "baseHP": 55,
    "baseAttack": 65,
    "baseDefense": 95,
    "baseSpeed": 85,
    "baseSpAttack": 95,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Seadra\")",
    "natDexNum": "NATIONAL_DEX_SEADRA",
    "levelUpLearnset": "sSeadraLevelUpLearnset",
    "teachableLearnset": "sSeadraTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_KINGDRA, CONDITIONS({IF_HOLD_ITEM, ITEM_DRAGON_SCALE})}",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kingdra",
    "parsedTypes": [
      "WATER",
      "DRAGON"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_KINGDRA",
    "family": "P_FAMILY_HORSEA",
    "baseHP": 75,
    "baseAttack": 95,
    "baseDefense": 95,
    "baseSpeed": 85,
    "baseSpAttack": 95,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DRAGON)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Kingdra\")",
    "natDexNum": "NATIONAL_DEX_KINGDRA",
    "levelUpLearnset": "sKingdraLevelUpLearnset",
    "teachableLearnset": "sKingdraTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Goldeen",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "WATER_VEIL",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_GOLDEEN",
    "family": "P_FAMILY_GOLDEEN",
    "baseHP": 45,
    "baseAttack": 67,
    "baseDefense": 60,
    "baseSpeed": 63,
    "baseSpAttack": 35,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_WATER_VEIL, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Goldeen\")",
    "natDexNum": "NATIONAL_DEX_GOLDEEN",
    "levelUpLearnset": "sGoldeenLevelUpLearnset",
    "teachableLearnset": "sGoldeenTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 33, SPECIES_SEAKING})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Seaking",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "WATER_VEIL",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_SEAKING",
    "family": "P_FAMILY_GOLDEEN",
    "baseHP": 80,
    "baseAttack": 92,
    "baseDefense": 65,
    "baseSpeed": 68,
    "baseSpAttack": 65,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_WATER_VEIL, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Seaking\")",
    "natDexNum": "NATIONAL_DEX_SEAKING",
    "levelUpLearnset": "sSeakingLevelUpLearnset",
    "teachableLearnset": "sSeakingTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Staryu",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "ILLUMINATE",
      "NATURAL_CURE",
      "ANALYTIC"
    ],
    "id": "SPECIES_STARYU",
    "family": "P_FAMILY_STARYU",
    "baseHP": 30,
    "baseAttack": 45,
    "baseDefense": 55,
    "baseSpeed": 85,
    "baseSpAttack": 70,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_ILLUMINATE, ABILITY_NATURAL_CURE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Staryu\")",
    "natDexNum": "NATIONAL_DEX_STARYU",
    "levelUpLearnset": "sStaryuLevelUpLearnset",
    "teachableLearnset": "sStaryuTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_WATER_STONE, SPECIES_STARMIE})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Starmie",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "ILLUMINATE",
      "NATURAL_CURE",
      "ANALYTIC"
    ],
    "id": "SPECIES_STARMIE",
    "family": "P_FAMILY_STARYU",
    "baseHP": 60,
    "baseAttack": 75,
    "baseDefense": 85,
    "baseSpeed": 115,
    "baseSpAttack": 100,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_ILLUMINATE, ABILITY_NATURAL_CURE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Starmie\")",
    "natDexNum": "NATIONAL_DEX_STARMIE",
    "levelUpLearnset": "sStarmieLevelUpLearnset",
    "teachableLearnset": "sStarmieTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mime  Jr",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "NONE",
      "TECHNICIAN"
    ],
    "id": "SPECIES_MIME_JR",
    "family": "P_FAMILY_MR_MIME",
    "baseHP": 20,
    "baseAttack": 25,
    "baseDefense": 45,
    "baseSpeed": 60,
    "baseSpAttack": 70,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_NONE, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Mime Jr.\")",
    "natDexNum": "NATIONAL_DEX_MIME_JR",
    "levelUpLearnset": "sMimeJrLevelUpLearnset",
    "teachableLearnset": "sMimeJrTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_MR_MIME, CONDITIONS({IF_KNOWS_MOVE, MOVE_MIMIC})}",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mr  Mime",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "FILTER",
      "TECHNICIAN"
    ],
    "id": "SPECIES_MR_MIME",
    "family": "P_FAMILY_MR_MIME",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 65,
    "baseSpeed": 90,
    "baseSpAttack": 100,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_FILTER, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Mr. Mime\")",
    "natDexNum": "NATIONAL_DEX_MR_MIME",
    "levelUpLearnset": "sMrMimeLevelUpLearnset",
    "teachableLearnset": "sMrMimeTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mr  Mime  Galar",
    "parsedTypes": [
      "ICE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "SCREEN_CLEANER",
      "ICE_BODY"
    ],
    "id": "SPECIES_MR_MIME_GALAR",
    "family": "P_FAMILY_MR_MIME",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 100,
    "baseSpAttack": 90,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ICE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_SCREEN_CLEANER, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Mr. Mime\")",
    "natDexNum": "NATIONAL_DEX_MR_MIME",
    "levelUpLearnset": "sMrMimeGalarLevelUpLearnset",
    "teachableLearnset": "sMrMimeGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_MR_RIME})",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mr  Rime",
    "parsedTypes": [
      "ICE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "TANGLED_FEET",
      "SCREEN_CLEANER",
      "ICE_BODY"
    ],
    "id": "SPECIES_MR_RIME",
    "family": "P_FAMILY_MR_MIME",
    "baseHP": 80,
    "baseAttack": 85,
    "baseDefense": 75,
    "baseSpeed": 70,
    "baseSpAttack": 110,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_ICE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_TANGLED_FEET, ABILITY_SCREEN_CLEANER, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Mr. Rime\")",
    "natDexNum": "NATIONAL_DEX_MR_RIME",
    "levelUpLearnset": "sMrRimeLevelUpLearnset",
    "teachableLearnset": "sMrRimeTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scyther",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "STEADFAST"
    ],
    "id": "SPECIES_SCYTHER",
    "family": "P_FAMILY_SCYTHER",
    "baseHP": 70,
    "baseAttack": 110,
    "baseDefense": 80,
    "baseSpeed": 105,
    "baseSpAttack": 55,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_STEADFAST }",
    "speciesName": "_(\"Scyther\")",
    "natDexNum": "NATIONAL_DEX_SCYTHER",
    "levelUpLearnset": "sScytherLevelUpLearnset",
    "teachableLearnset": "sScytherTeachableLearnset",
    "evolutions": "EVOLUTION(",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scizor",
    "parsedTypes": [
      "BUG",
      "STEEL"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "LIGHT_METAL"
    ],
    "id": "SPECIES_SCIZOR",
    "family": "P_FAMILY_SCYTHER",
    "baseHP": 70,
    "baseAttack": 130,
    "baseDefense": 100,
    "baseSpeed": 65,
    "baseSpAttack": 55,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_STEEL)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_LIGHT_METAL }",
    "speciesName": "_(\"Scizor\")",
    "natDexNum": "NATIONAL_DEX_SCIZOR",
    "levelUpLearnset": "sScizorLevelUpLearnset",
    "teachableLearnset": "sScizorTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scizor  Mega",
    "parsedTypes": [
      "BUG",
      "STEEL"
    ],
    "parsedAbilities": [
      "TECHNICIAN",
      "TECHNICIAN",
      "TECHNICIAN"
    ],
    "id": "SPECIES_SCIZOR_MEGA",
    "family": "P_FAMILY_SCYTHER",
    "baseHP": 70,
    "baseAttack": 150,
    "baseDefense": 140,
    "baseSpeed": 75,
    "baseSpAttack": 65,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_BUG, TYPE_STEEL)",
    "abilities": "{ ABILITY_TECHNICIAN, ABILITY_TECHNICIAN, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Scizor\")",
    "natDexNum": "NATIONAL_DEX_SCIZOR",
    "levelUpLearnset": "sScizorLevelUpLearnset",
    "teachableLearnset": "sScizorTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kleavor",
    "parsedTypes": [
      "BUG",
      "ROCK"
    ],
    "parsedAbilities": [
      "SWARM",
      "SHEER_FORCE",
      "SHARPNESS"
    ],
    "id": "SPECIES_KLEAVOR",
    "family": "P_FAMILY_SCYTHER",
    "baseHP": 70,
    "baseAttack": 135,
    "baseDefense": 95,
    "baseSpeed": 85,
    "baseSpAttack": 45,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ROCK)",
    "abilities": "{ ABILITY_SWARM, ABILITY_SHEER_FORCE, ABILITY_SHARPNESS }",
    "speciesName": "_(\"Kleavor\")",
    "natDexNum": "NATIONAL_DEX_KLEAVOR",
    "levelUpLearnset": "sKleavorLevelUpLearnset",
    "teachableLearnset": "sKleavorTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Smoochum",
    "parsedTypes": [
      "ICE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "HYDRATION"
    ],
    "id": "SPECIES_SMOOCHUM",
    "family": "P_FAMILY_JYNX",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 15,
    "baseSpeed": 65,
    "baseSpAttack": 85,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ICE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_HYDRATION }",
    "speciesName": "_(\"Smoochum\")",
    "natDexNum": "NATIONAL_DEX_SMOOCHUM",
    "levelUpLearnset": "sSmoochumLevelUpLearnset",
    "teachableLearnset": "sSmoochumTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_JYNX})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jynx",
    "parsedTypes": [
      "ICE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "DRY_SKIN"
    ],
    "id": "SPECIES_JYNX",
    "family": "P_FAMILY_JYNX",
    "baseHP": 65,
    "baseAttack": 50,
    "baseDefense": 35,
    "baseSpeed": 95,
    "baseSpAttack": 115,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_ICE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_DRY_SKIN }",
    "speciesName": "_(\"Jynx\")",
    "natDexNum": "NATIONAL_DEX_JYNX",
    "levelUpLearnset": "sJynxLevelUpLearnset",
    "teachableLearnset": "sJynxTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Elekid",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_ELEKID",
    "family": "P_FAMILY_ELECTABUZZ",
    "baseHP": 45,
    "baseAttack": 63,
    "baseDefense": 37,
    "baseSpeed": 95,
    "baseSpAttack": 65,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Elekid\")",
    "natDexNum": "NATIONAL_DEX_ELEKID",
    "levelUpLearnset": "sElekidLevelUpLearnset",
    "teachableLearnset": "sElekidTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_ELECTABUZZ})",
    "baseBST": 360,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Electabuzz",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_ELECTABUZZ",
    "family": "P_FAMILY_ELECTABUZZ",
    "baseHP": 65,
    "baseAttack": 83,
    "baseDefense": 57,
    "baseSpeed": 105,
    "baseSpAttack": 95,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Electabuzz\")",
    "natDexNum": "NATIONAL_DEX_ELECTABUZZ",
    "levelUpLearnset": "sElectabuzzLevelUpLearnset",
    "teachableLearnset": "sElectabuzzTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_ELECTIVIRE, CONDITIONS({IF_HOLD_ITEM, ITEM_ELECTIRIZER})}",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Electivire",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "MOTOR_DRIVE",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_ELECTIVIRE",
    "family": "P_FAMILY_ELECTABUZZ",
    "baseHP": 75,
    "baseAttack": 123,
    "baseDefense": 67,
    "baseSpeed": 95,
    "baseSpAttack": 95,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_MOTOR_DRIVE, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Electivire\")",
    "natDexNum": "NATIONAL_DEX_ELECTIVIRE",
    "levelUpLearnset": "sElectivireLevelUpLearnset",
    "teachableLearnset": "sElectivireTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magby",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_MAGBY",
    "family": "P_FAMILY_MAGMAR",
    "baseHP": 45,
    "baseAttack": 75,
    "baseDefense": 37,
    "baseSpeed": 83,
    "baseSpAttack": 70,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Magby\")",
    "natDexNum": "NATIONAL_DEX_MAGBY",
    "levelUpLearnset": "sMagbyLevelUpLearnset",
    "teachableLearnset": "sMagbyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_MAGMAR})",
    "baseBST": 365,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magmar",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_MAGMAR",
    "family": "P_FAMILY_MAGMAR",
    "baseHP": 65,
    "baseAttack": 95,
    "baseDefense": 57,
    "baseSpeed": 93,
    "baseSpAttack": 100,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Magmar\")",
    "natDexNum": "NATIONAL_DEX_MAGMAR",
    "levelUpLearnset": "sMagmarLevelUpLearnset",
    "teachableLearnset": "sMagmarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_MAGMORTAR, CONDITIONS({IF_HOLD_ITEM, ITEM_MAGMARIZER})}",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magmortar",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "VITAL_SPIRIT"
    ],
    "id": "SPECIES_MAGMORTAR",
    "family": "P_FAMILY_MAGMAR",
    "baseHP": 75,
    "baseAttack": 95,
    "baseDefense": 67,
    "baseSpeed": 83,
    "baseSpAttack": 125,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_VITAL_SPIRIT }",
    "speciesName": "_(\"Magmortar\")",
    "natDexNum": "NATIONAL_DEX_MAGMORTAR",
    "levelUpLearnset": "sMagmortarLevelUpLearnset",
    "teachableLearnset": "sMagmortarTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pinsir",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_PINSIR",
    "family": "P_FAMILY_PINSIR",
    "baseHP": 65,
    "baseAttack": 125,
    "baseDefense": 100,
    "baseSpeed": 85,
    "baseSpAttack": 55,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Pinsir\")",
    "natDexNum": "NATIONAL_DEX_PINSIR",
    "levelUpLearnset": "sPinsirLevelUpLearnset",
    "teachableLearnset": "sPinsirTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pinsir  Mega",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "AERILATE",
      "AERILATE",
      "AERILATE"
    ],
    "id": "SPECIES_PINSIR_MEGA",
    "family": "P_FAMILY_PINSIR",
    "baseHP": 65,
    "baseAttack": 155,
    "baseDefense": 120,
    "baseSpeed": 105,
    "baseSpAttack": 65,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_AERILATE, ABILITY_AERILATE, ABILITY_AERILATE }",
    "speciesName": "_(\"Pinsir\")",
    "natDexNum": "NATIONAL_DEX_PINSIR",
    "levelUpLearnset": "sPinsirLevelUpLearnset",
    "teachableLearnset": "sPinsirTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tauros",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_TAUROS",
    "family": "P_FAMILY_TAUROS",
    "baseHP": 75,
    "baseAttack": 100,
    "baseDefense": 95,
    "baseSpeed": 110,
    "baseSpAttack": 40,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Tauros\")",
    "natDexNum": "NATIONAL_DEX_TAUROS",
    "levelUpLearnset": "sTaurosLevelUpLearnset",
    "teachableLearnset": "sTaurosTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tauros  Paldea  Combat",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "ANGER_POINT",
      "CUD_CHEW"
    ],
    "id": "SPECIES_TAUROS_PALDEA_COMBAT",
    "family": "P_FAMILY_TAUROS",
    "baseHP": 75,
    "baseAttack": 110,
    "baseDefense": 105,
    "baseSpeed": 100,
    "baseSpAttack": 30,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_ANGER_POINT, ABILITY_CUD_CHEW }",
    "speciesName": "_(\"Tauros\")",
    "natDexNum": "NATIONAL_DEX_TAUROS",
    "levelUpLearnset": "sTaurosPaldeaCombatLevelUpLearnset",
    "teachableLearnset": "sTaurosPaldeaCombatTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tauros  Paldea  Blaze",
    "parsedTypes": [
      "FIGHTING",
      "FIRE"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "ANGER_POINT",
      "CUD_CHEW"
    ],
    "id": "SPECIES_TAUROS_PALDEA_BLAZE",
    "family": "P_FAMILY_TAUROS",
    "baseHP": 75,
    "baseAttack": 110,
    "baseDefense": 105,
    "baseSpeed": 100,
    "baseSpAttack": 30,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_FIRE)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_ANGER_POINT, ABILITY_CUD_CHEW }",
    "speciesName": "_(\"Tauros\")",
    "natDexNum": "NATIONAL_DEX_TAUROS",
    "levelUpLearnset": "sTaurosPaldeaBlazeLevelUpLearnset",
    "teachableLearnset": "sTaurosPaldeaBlazeTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tauros  Paldea  Aqua",
    "parsedTypes": [
      "FIGHTING",
      "WATER"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "ANGER_POINT",
      "CUD_CHEW"
    ],
    "id": "SPECIES_TAUROS_PALDEA_AQUA",
    "family": "P_FAMILY_TAUROS",
    "baseHP": 75,
    "baseAttack": 110,
    "baseDefense": 105,
    "baseSpeed": 100,
    "baseSpAttack": 30,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_WATER)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_ANGER_POINT, ABILITY_CUD_CHEW }",
    "speciesName": "_(\"Tauros\")",
    "natDexNum": "NATIONAL_DEX_TAUROS",
    "levelUpLearnset": "sTaurosPaldeaAquaLevelUpLearnset",
    "teachableLearnset": "sTaurosPaldeaAquaTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magikarp",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_MAGIKARP",
    "family": "P_FAMILY_MAGIKARP",
    "baseHP": 20,
    "baseAttack": 10,
    "baseDefense": 55,
    "baseSpeed": 80,
    "baseSpAttack": 15,
    "baseSpDefense": 20,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Magikarp\")",
    "natDexNum": "NATIONAL_DEX_MAGIKARP",
    "levelUpLearnset": "sMagikarpLevelUpLearnset",
    "teachableLearnset": "sMagikarpTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_GYARADOS})",
    "baseBST": 200,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gyarados",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_GYARADOS",
    "family": "P_FAMILY_MAGIKARP",
    "baseHP": 95,
    "baseAttack": 125,
    "baseDefense": 79,
    "baseSpeed": 81,
    "baseSpAttack": 60,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Gyarados\")",
    "natDexNum": "NATIONAL_DEX_GYARADOS",
    "levelUpLearnset": "sGyaradosLevelUpLearnset",
    "teachableLearnset": "sGyaradosTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gyarados  Mega",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "MOLD_BREAKER",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_GYARADOS_MEGA",
    "family": "P_FAMILY_MAGIKARP",
    "baseHP": 95,
    "baseAttack": 155,
    "baseDefense": 109,
    "baseSpeed": 81,
    "baseSpAttack": 70,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_MOLD_BREAKER, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Gyarados\")",
    "natDexNum": "NATIONAL_DEX_GYARADOS",
    "levelUpLearnset": "sGyaradosLevelUpLearnset",
    "teachableLearnset": "sGyaradosTeachableLearnset",
    "baseBST": 640,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lapras",
    "parsedTypes": [
      "WATER",
      "ICE"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "SHELL_ARMOR",
      "HYDRATION"
    ],
    "id": "SPECIES_LAPRAS",
    "family": "P_FAMILY_LAPRAS",
    "baseHP": 130,
    "baseAttack": 85,
    "baseDefense": 80,
    "baseSpeed": 60,
    "baseSpAttack": 85,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ICE)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_SHELL_ARMOR, ABILITY_HYDRATION }",
    "speciesName": "_(\"Lapras\")",
    "natDexNum": "NATIONAL_DEX_LAPRAS",
    "levelUpLearnset": "sLaprasLevelUpLearnset",
    "teachableLearnset": "sLaprasTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ditto",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "LIMBER",
      "NONE",
      "IMPOSTER"
    ],
    "id": "SPECIES_DITTO",
    "family": "P_FAMILY_DITTO",
    "baseHP": 48,
    "baseAttack": 48,
    "baseDefense": 48,
    "baseSpeed": 48,
    "baseSpAttack": 48,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_NONE, ABILITY_IMPOSTER }",
    "speciesName": "_(\"Ditto\")",
    "natDexNum": "NATIONAL_DEX_DITTO",
    "levelUpLearnset": "sDittoLevelUpLearnset",
    "teachableLearnset": "sDittoTeachableLearnset",
    "baseBST": 288,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eevee",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "NONE",
      "ANTICIPATION"
    ],
    "id": "SPECIES_EEVEE",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 55,
    "baseAttack": 55,
    "baseDefense": 50,
    "baseSpeed": 55,
    "baseSpAttack": 45,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_NONE, ABILITY_ANTICIPATION }",
    "speciesName": "_(\"Eevee\")",
    "natDexNum": "NATIONAL_DEX_EEVEE",
    "levelUpLearnset": "sEeveeLevelUpLearnset",
    "teachableLearnset": "sEeveeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_THUNDER_STONE, SPECIES_JOLTEON}",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vaporeon",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "WATER_ABSORB",
      "HYDRATION"
    ],
    "id": "SPECIES_VAPOREON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 130,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 65,
    "baseSpAttack": 110,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_WATER_ABSORB, ABILITY_HYDRATION }",
    "speciesName": "_(\"Vaporeon\")",
    "natDexNum": "NATIONAL_DEX_VAPOREON",
    "levelUpLearnset": "sVaporeonLevelUpLearnset",
    "teachableLearnset": "sVaporeonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jolteon",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "VOLT_ABSORB",
      "QUICK_FEET"
    ],
    "id": "SPECIES_JOLTEON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 65,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 130,
    "baseSpAttack": 110,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_VOLT_ABSORB, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Jolteon\")",
    "natDexNum": "NATIONAL_DEX_JOLTEON",
    "levelUpLearnset": "sJolteonLevelUpLearnset",
    "teachableLearnset": "sJolteonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flareon",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "FLASH_FIRE",
      "GUTS"
    ],
    "id": "SPECIES_FLAREON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 65,
    "baseAttack": 130,
    "baseDefense": 60,
    "baseSpeed": 65,
    "baseSpAttack": 95,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_FLASH_FIRE, ABILITY_GUTS }",
    "speciesName": "_(\"Flareon\")",
    "natDexNum": "NATIONAL_DEX_FLAREON",
    "levelUpLearnset": "sFlareonLevelUpLearnset",
    "teachableLearnset": "sFlareonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Espeon",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "SYNCHRONIZE",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_ESPEON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 65,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 110,
    "baseSpAttack": 130,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_SYNCHRONIZE, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Espeon\")",
    "natDexNum": "NATIONAL_DEX_ESPEON",
    "levelUpLearnset": "sEspeonLevelUpLearnset",
    "teachableLearnset": "sEspeonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Umbreon",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "SYNCHRONIZE",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_UMBREON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 95,
    "baseAttack": 65,
    "baseDefense": 110,
    "baseSpeed": 65,
    "baseSpAttack": 60,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_SYNCHRONIZE, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Umbreon\")",
    "natDexNum": "NATIONAL_DEX_UMBREON",
    "levelUpLearnset": "sUmbreonLevelUpLearnset",
    "teachableLearnset": "sUmbreonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Leafeon",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "LEAF_GUARD",
      "CHLOROPHYLL"
    ],
    "id": "SPECIES_LEAFEON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 65,
    "baseAttack": 110,
    "baseDefense": 130,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_LEAF_GUARD, ABILITY_CHLOROPHYLL }",
    "speciesName": "_(\"Leafeon\")",
    "natDexNum": "NATIONAL_DEX_LEAFEON",
    "levelUpLearnset": "sLeafeonLevelUpLearnset",
    "teachableLearnset": "sLeafeonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glaceon",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "SNOW_CLOAK",
      "ICE_BODY"
    ],
    "id": "SPECIES_GLACEON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 65,
    "baseAttack": 60,
    "baseDefense": 110,
    "baseSpeed": 65,
    "baseSpAttack": 130,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_SNOW_CLOAK, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Glaceon\")",
    "natDexNum": "NATIONAL_DEX_GLACEON",
    "levelUpLearnset": "sGlaceonLevelUpLearnset",
    "teachableLearnset": "sGlaceonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sylveon",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "CUTE_CHARM",
      "PIXILATE"
    ],
    "id": "SPECIES_SYLVEON",
    "family": "P_FAMILY_EEVEE",
    "baseHP": 95,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 60,
    "baseSpAttack": 110,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_CUTE_CHARM, ABILITY_PIXILATE }",
    "speciesName": "_(\"Sylveon\")",
    "natDexNum": "NATIONAL_DEX_SYLVEON",
    "levelUpLearnset": "sSylveonLevelUpLearnset",
    "teachableLearnset": "sSylveonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Porygon",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TRACE",
      "NONE",
      "ANALYTIC"
    ],
    "id": "SPECIES_PORYGON",
    "family": "P_FAMILY_PORYGON",
    "baseHP": 65,
    "baseAttack": 60,
    "baseDefense": 70,
    "baseSpeed": 40,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TRACE, ABILITY_NONE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Porygon\")",
    "natDexNum": "NATIONAL_DEX_PORYGON",
    "levelUpLearnset": "sPorygonLevelUpLearnset",
    "teachableLearnset": "sPorygonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_PORYGON2, CONDITIONS({IF_HOLD_ITEM, ITEM_UPGRADE})}",
    "baseBST": 395,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Porygon2",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TRACE",
      "NONE",
      "ANALYTIC"
    ],
    "id": "SPECIES_PORYGON2",
    "family": "P_FAMILY_PORYGON",
    "baseHP": 85,
    "baseAttack": 80,
    "baseDefense": 90,
    "baseSpeed": 60,
    "baseSpAttack": 105,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TRACE, ABILITY_NONE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Porygon2\")",
    "natDexNum": "NATIONAL_DEX_PORYGON2",
    "levelUpLearnset": "sPorygon2LevelUpLearnset",
    "teachableLearnset": "sPorygon2TeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_PORYGON_Z, CONDITIONS({IF_HOLD_ITEM, ITEM_DUBIOUS_DISC})}",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Porygon  Z",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "ADAPTABILITY",
      "DOWNLOAD",
      "ANALYTIC"
    ],
    "id": "SPECIES_PORYGON_Z",
    "family": "P_FAMILY_PORYGON",
    "baseHP": 85,
    "baseAttack": 80,
    "baseDefense": 70,
    "baseSpeed": 90,
    "baseSpAttack": 135,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_ADAPTABILITY, ABILITY_DOWNLOAD, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Porygon-Z\")",
    "natDexNum": "NATIONAL_DEX_PORYGON_Z",
    "levelUpLearnset": "sPorygonZLevelUpLearnset",
    "teachableLearnset": "sPorygonZTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Omanyte",
    "parsedTypes": [
      "ROCK",
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "SHELL_ARMOR",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_OMANYTE",
    "family": "P_FAMILY_OMANYTE",
    "baseHP": 35,
    "baseAttack": 40,
    "baseDefense": 100,
    "baseSpeed": 35,
    "baseSpAttack": 90,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_SHELL_ARMOR, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Omanyte\")",
    "natDexNum": "NATIONAL_DEX_OMANYTE",
    "levelUpLearnset": "sOmanyteLevelUpLearnset",
    "teachableLearnset": "sOmanyteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_OMASTAR})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Omastar",
    "parsedTypes": [
      "ROCK",
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "SHELL_ARMOR",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_OMASTAR",
    "family": "P_FAMILY_OMANYTE",
    "baseHP": 70,
    "baseAttack": 60,
    "baseDefense": 125,
    "baseSpeed": 55,
    "baseSpAttack": 115,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_SHELL_ARMOR, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Omastar\")",
    "natDexNum": "NATIONAL_DEX_OMASTAR",
    "levelUpLearnset": "sOmastarLevelUpLearnset",
    "teachableLearnset": "sOmastarTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kabuto",
    "parsedTypes": [
      "ROCK",
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "BATTLE_ARMOR",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_KABUTO",
    "family": "P_FAMILY_KABUTO",
    "baseHP": 30,
    "baseAttack": 80,
    "baseDefense": 90,
    "baseSpeed": 55,
    "baseSpAttack": 55,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_BATTLE_ARMOR, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Kabuto\")",
    "natDexNum": "NATIONAL_DEX_KABUTO",
    "levelUpLearnset": "sKabutoLevelUpLearnset",
    "teachableLearnset": "sKabutoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_KABUTOPS})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kabutops",
    "parsedTypes": [
      "ROCK",
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "BATTLE_ARMOR",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_KABUTOPS",
    "family": "P_FAMILY_KABUTO",
    "baseHP": 60,
    "baseAttack": 115,
    "baseDefense": 105,
    "baseSpeed": 80,
    "baseSpAttack": 65,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_BATTLE_ARMOR, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Kabutops\")",
    "natDexNum": "NATIONAL_DEX_KABUTOPS",
    "levelUpLearnset": "sKabutopsLevelUpLearnset",
    "teachableLearnset": "sKabutopsTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aerodactyl",
    "parsedTypes": [
      "ROCK",
      "FLYING"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "PRESSURE",
      "UNNERVE"
    ],
    "id": "SPECIES_AERODACTYL",
    "family": "P_FAMILY_AERODACTYL",
    "baseHP": 80,
    "baseAttack": 105,
    "baseDefense": 65,
    "baseSpeed": 130,
    "baseSpAttack": 60,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FLYING)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_PRESSURE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Aerodactyl\")",
    "natDexNum": "NATIONAL_DEX_AERODACTYL",
    "levelUpLearnset": "sAerodactylLevelUpLearnset",
    "teachableLearnset": "sAerodactylTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aerodactyl  Mega",
    "parsedTypes": [
      "ROCK",
      "FLYING"
    ],
    "parsedAbilities": [
      "TOUGH_CLAWS",
      "TOUGH_CLAWS",
      "TOUGH_CLAWS"
    ],
    "id": "SPECIES_AERODACTYL_MEGA",
    "family": "P_FAMILY_AERODACTYL",
    "baseHP": 80,
    "baseAttack": 135,
    "baseDefense": 85,
    "baseSpeed": 150,
    "baseSpAttack": 70,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FLYING)",
    "abilities": "{ ABILITY_TOUGH_CLAWS, ABILITY_TOUGH_CLAWS, ABILITY_TOUGH_CLAWS }",
    "speciesName": "_(\"Aerodactyl\")",
    "natDexNum": "NATIONAL_DEX_AERODACTYL",
    "levelUpLearnset": "sAerodactylLevelUpLearnset",
    "teachableLearnset": "sAerodactylTeachableLearnset",
    "baseBST": 615,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Munchlax",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "THICK_FAT",
      "GLUTTONY"
    ],
    "id": "SPECIES_MUNCHLAX",
    "family": "P_FAMILY_SNORLAX",
    "baseHP": 135,
    "baseAttack": 85,
    "baseDefense": 40,
    "baseSpeed": 5,
    "baseSpAttack": 40,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_THICK_FAT, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Munchlax\")",
    "natDexNum": "NATIONAL_DEX_MUNCHLAX",
    "levelUpLearnset": "sMunchlaxLevelUpLearnset",
    "teachableLearnset": "sMunchlaxTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_SNORLAX, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Snorlax",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "IMMUNITY",
      "THICK_FAT",
      "GLUTTONY"
    ],
    "id": "SPECIES_SNORLAX",
    "family": "P_FAMILY_SNORLAX",
    "baseHP": 160,
    "baseAttack": 110,
    "baseDefense": 65,
    "baseSpeed": 30,
    "baseSpAttack": 65,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_IMMUNITY, ABILITY_THICK_FAT, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Snorlax\")",
    "natDexNum": "NATIONAL_DEX_SNORLAX",
    "levelUpLearnset": "sSnorlaxLevelUpLearnset",
    "teachableLearnset": "sSnorlaxTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Articuno",
    "parsedTypes": [
      "ICE",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "SNOW_CLOAK"
    ],
    "id": "SPECIES_ARTICUNO",
    "family": "P_FAMILY_ARTICUNO",
    "baseHP": 90,
    "baseAttack": 85,
    "baseDefense": 100,
    "baseSpeed": 85,
    "baseSpAttack": 95,
    "baseSpDefense": 125,
    "types": "MON_TYPES(TYPE_ICE, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_SNOW_CLOAK }",
    "speciesName": "_(\"Articuno\")",
    "natDexNum": "NATIONAL_DEX_ARTICUNO",
    "levelUpLearnset": "sArticunoLevelUpLearnset",
    "teachableLearnset": "sArticunoTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Articuno  Galar",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "COMPETITIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ARTICUNO_GALAR",
    "family": "P_FAMILY_ARTICUNO",
    "baseHP": 90,
    "baseAttack": 85,
    "baseDefense": 85,
    "baseSpeed": 95,
    "baseSpAttack": 125,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_COMPETITIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Articuno\")",
    "natDexNum": "NATIONAL_DEX_ARTICUNO",
    "levelUpLearnset": "sArticunoGalarLevelUpLearnset",
    "teachableLearnset": "sArticunoGalarTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zapdos",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_ZAPDOS",
    "family": "P_FAMILY_ZAPDOS",
    "baseHP": 90,
    "baseAttack": 90,
    "baseDefense": 85,
    "baseSpeed": 100,
    "baseSpAttack": 125,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Zapdos\")",
    "natDexNum": "NATIONAL_DEX_ZAPDOS",
    "levelUpLearnset": "sZapdosLevelUpLearnset",
    "teachableLearnset": "sZapdosTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zapdos  Galar",
    "parsedTypes": [
      "FIGHTING",
      "FLYING"
    ],
    "parsedAbilities": [
      "DEFIANT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZAPDOS_GALAR",
    "family": "P_FAMILY_ZAPDOS",
    "baseHP": 90,
    "baseAttack": 125,
    "baseDefense": 90,
    "baseSpeed": 100,
    "baseSpAttack": 85,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_FLYING)",
    "abilities": "{ ABILITY_DEFIANT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zapdos\")",
    "natDexNum": "NATIONAL_DEX_ZAPDOS",
    "levelUpLearnset": "sZapdosGalarLevelUpLearnset",
    "teachableLearnset": "sZapdosGalarTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Moltres",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_MOLTRES",
    "family": "P_FAMILY_MOLTRES",
    "baseHP": 90,
    "baseAttack": 100,
    "baseDefense": 90,
    "baseSpeed": 90,
    "baseSpAttack": 125,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Moltres\")",
    "natDexNum": "NATIONAL_DEX_MOLTRES",
    "levelUpLearnset": "sMoltresLevelUpLearnset",
    "teachableLearnset": "sMoltresTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Moltres  Galar",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "BERSERK",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MOLTRES_GALAR",
    "family": "P_FAMILY_MOLTRES",
    "baseHP": 90,
    "baseAttack": 85,
    "baseDefense": 90,
    "baseSpeed": 90,
    "baseSpAttack": 100,
    "baseSpDefense": 125,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_BERSERK, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Moltres\")",
    "natDexNum": "NATIONAL_DEX_MOLTRES",
    "levelUpLearnset": "sMoltresGalarLevelUpLearnset",
    "teachableLearnset": "sMoltresGalarTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dratini",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "MARVEL_SCALE"
    ],
    "id": "SPECIES_DRATINI",
    "family": "P_FAMILY_DRATINI",
    "baseHP": 41,
    "baseAttack": 64,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_MARVEL_SCALE }",
    "speciesName": "_(\"Dratini\")",
    "natDexNum": "NATIONAL_DEX_DRATINI",
    "levelUpLearnset": "sDratiniLevelUpLearnset",
    "teachableLearnset": "sDratiniTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_DRAGONAIR})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dragonair",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "MARVEL_SCALE"
    ],
    "id": "SPECIES_DRAGONAIR",
    "family": "P_FAMILY_DRATINI",
    "baseHP": 61,
    "baseAttack": 84,
    "baseDefense": 65,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_MARVEL_SCALE }",
    "speciesName": "_(\"Dragonair\")",
    "natDexNum": "NATIONAL_DEX_DRAGONAIR",
    "levelUpLearnset": "sDragonairLevelUpLearnset",
    "teachableLearnset": "sDragonairTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 55, SPECIES_DRAGONITE})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dragonite",
    "parsedTypes": [
      "DRAGON",
      "FLYING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "MULTISCALE"
    ],
    "id": "SPECIES_DRAGONITE",
    "family": "P_FAMILY_DRATINI",
    "baseHP": 91,
    "baseAttack": 134,
    "baseDefense": 95,
    "baseSpeed": 80,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FLYING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_MULTISCALE }",
    "speciesName": "_(\"Dragonite\")",
    "natDexNum": "NATIONAL_DEX_DRAGONITE",
    "levelUpLearnset": "sDragoniteLevelUpLearnset",
    "teachableLearnset": "sDragoniteTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mewtwo",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_MEWTWO",
    "family": "P_FAMILY_MEWTWO",
    "baseHP": 106,
    "baseAttack": 110,
    "baseDefense": 90,
    "baseSpeed": 130,
    "baseSpAttack": 154,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Mewtwo\")",
    "natDexNum": "NATIONAL_DEX_MEWTWO",
    "levelUpLearnset": "sMewtwoLevelUpLearnset",
    "teachableLearnset": "sMewtwoTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mewtwo  Mega  X",
    "parsedTypes": [
      "PSYCHIC",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "STEADFAST",
      "STEADFAST",
      "STEADFAST"
    ],
    "id": "SPECIES_MEWTWO_MEGA_X",
    "family": "P_FAMILY_MEWTWO",
    "baseHP": 106,
    "baseAttack": 190,
    "baseDefense": 100,
    "baseSpeed": 130,
    "baseSpAttack": 154,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_STEADFAST, ABILITY_STEADFAST, ABILITY_STEADFAST }",
    "speciesName": "_(\"Mewtwo\")",
    "natDexNum": "NATIONAL_DEX_MEWTWO",
    "levelUpLearnset": "sMewtwoLevelUpLearnset",
    "teachableLearnset": "sMewtwoTeachableLearnset",
    "baseBST": 780,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mewtwo  Mega  Y",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "INSOMNIA",
      "INSOMNIA"
    ],
    "id": "SPECIES_MEWTWO_MEGA_Y",
    "family": "P_FAMILY_MEWTWO",
    "baseHP": 106,
    "baseAttack": 150,
    "baseDefense": 70,
    "baseSpeed": 140,
    "baseSpAttack": 194,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_INSOMNIA, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Mewtwo\")",
    "natDexNum": "NATIONAL_DEX_MEWTWO",
    "levelUpLearnset": "sMewtwoLevelUpLearnset",
    "teachableLearnset": "sMewtwoTeachableLearnset",
    "baseBST": 780,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mew",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MEW",
    "family": "P_FAMILY_MEW",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Mew\")",
    "natDexNum": "NATIONAL_DEX_MEW",
    "levelUpLearnset": "sMewLevelUpLearnset",
    "teachableLearnset": "sMewTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chikorita",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_CHIKORITA",
    "family": "P_FAMILY_CHIKORITA",
    "baseHP": 45,
    "baseAttack": 49,
    "baseDefense": 65,
    "baseSpeed": 45,
    "baseSpAttack": 49,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Chikorita\")",
    "natDexNum": "NATIONAL_DEX_CHIKORITA",
    "levelUpLearnset": "sChikoritaLevelUpLearnset",
    "teachableLearnset": "sChikoritaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_BAYLEEF})",
    "baseBST": 318,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bayleef",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_BAYLEEF",
    "family": "P_FAMILY_CHIKORITA",
    "baseHP": 60,
    "baseAttack": 62,
    "baseDefense": 80,
    "baseSpeed": 60,
    "baseSpAttack": 63,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Bayleef\")",
    "natDexNum": "NATIONAL_DEX_BAYLEEF",
    "levelUpLearnset": "sBayleefLevelUpLearnset",
    "teachableLearnset": "sBayleefTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_MEGANIUM})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meganium",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_MEGANIUM",
    "family": "P_FAMILY_CHIKORITA",
    "baseHP": 80,
    "baseAttack": 82,
    "baseDefense": 100,
    "baseSpeed": 80,
    "baseSpAttack": 83,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Meganium\")",
    "natDexNum": "NATIONAL_DEX_MEGANIUM",
    "levelUpLearnset": "sMeganiumLevelUpLearnset",
    "teachableLearnset": "sMeganiumTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cyndaquil",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_CYNDAQUIL",
    "family": "P_FAMILY_CYNDAQUIL",
    "baseHP": 39,
    "baseAttack": 52,
    "baseDefense": 43,
    "baseSpeed": 65,
    "baseSpAttack": 60,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Cyndaquil\")",
    "natDexNum": "NATIONAL_DEX_CYNDAQUIL",
    "levelUpLearnset": "sCyndaquilLevelUpLearnset",
    "teachableLearnset": "sCyndaquilTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 14, SPECIES_QUILAVA})",
    "baseBST": 309,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Quilava",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_QUILAVA",
    "family": "P_FAMILY_CYNDAQUIL",
    "baseHP": 58,
    "baseAttack": 64,
    "baseDefense": 58,
    "baseSpeed": 80,
    "baseSpAttack": 80,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Quilava\")",
    "natDexNum": "NATIONAL_DEX_QUILAVA",
    "levelUpLearnset": "sQuilavaLevelUpLearnset",
    "teachableLearnset": "sQuilavaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_TYPHLOSION}",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Typhlosion",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_TYPHLOSION",
    "family": "P_FAMILY_CYNDAQUIL",
    "baseHP": 78,
    "baseAttack": 84,
    "baseDefense": 78,
    "baseSpeed": 100,
    "baseSpAttack": 109,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Typhlosion\")",
    "natDexNum": "NATIONAL_DEX_TYPHLOSION",
    "levelUpLearnset": "sTyphlosionLevelUpLearnset",
    "teachableLearnset": "sTyphlosionTeachableLearnset",
    "baseBST": 534,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Typhlosion  Hisui",
    "parsedTypes": [
      "FIRE",
      "GHOST"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "FRISK"
    ],
    "id": "SPECIES_TYPHLOSION_HISUI",
    "family": "P_FAMILY_CYNDAQUIL",
    "baseHP": 73,
    "baseAttack": 84,
    "baseDefense": 78,
    "baseSpeed": 95,
    "baseSpAttack": 119,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GHOST)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_FRISK }",
    "speciesName": "_(\"Typhlosion\")",
    "natDexNum": "NATIONAL_DEX_TYPHLOSION",
    "levelUpLearnset": "sTyphlosionHisuiLevelUpLearnset",
    "teachableLearnset": "sTyphlosionHisuiTeachableLearnset",
    "baseBST": 534,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Totodile",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_TOTODILE",
    "family": "P_FAMILY_TOTODILE",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 64,
    "baseSpeed": 43,
    "baseSpAttack": 44,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Totodile\")",
    "natDexNum": "NATIONAL_DEX_TOTODILE",
    "levelUpLearnset": "sTotodileLevelUpLearnset",
    "teachableLearnset": "sTotodileTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_CROCONAW})",
    "baseBST": 314,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Croconaw",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_CROCONAW",
    "family": "P_FAMILY_TOTODILE",
    "baseHP": 65,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 58,
    "baseSpAttack": 59,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Croconaw\")",
    "natDexNum": "NATIONAL_DEX_CROCONAW",
    "levelUpLearnset": "sCroconawLevelUpLearnset",
    "teachableLearnset": "sCroconawTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_FERALIGATR})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Feraligatr",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_FERALIGATR",
    "family": "P_FAMILY_TOTODILE",
    "baseHP": 85,
    "baseAttack": 105,
    "baseDefense": 100,
    "baseSpeed": 78,
    "baseSpAttack": 79,
    "baseSpDefense": 83,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Feraligatr\")",
    "natDexNum": "NATIONAL_DEX_FERALIGATR",
    "levelUpLearnset": "sFeraligatrLevelUpLearnset",
    "teachableLearnset": "sFeraligatrTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sentret",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "KEEN_EYE",
      "FRISK"
    ],
    "id": "SPECIES_SENTRET",
    "family": "P_FAMILY_SENTRET",
    "baseHP": 35,
    "baseAttack": 46,
    "baseDefense": 34,
    "baseSpeed": 20,
    "baseSpAttack": 35,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_KEEN_EYE, ABILITY_FRISK }",
    "speciesName": "_(\"Sentret\")",
    "natDexNum": "NATIONAL_DEX_SENTRET",
    "levelUpLearnset": "sSentretLevelUpLearnset",
    "teachableLearnset": "sSentretTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 15, SPECIES_FURRET})",
    "baseBST": 215,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Furret",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "KEEN_EYE",
      "FRISK"
    ],
    "id": "SPECIES_FURRET",
    "family": "P_FAMILY_SENTRET",
    "baseHP": 85,
    "baseAttack": 76,
    "baseDefense": 64,
    "baseSpeed": 90,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_KEEN_EYE, ABILITY_FRISK }",
    "speciesName": "_(\"Furret\")",
    "natDexNum": "NATIONAL_DEX_FURRET",
    "levelUpLearnset": "sFurretLevelUpLearnset",
    "teachableLearnset": "sFurretTeachableLearnset",
    "baseBST": 415,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hoothoot",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "KEEN_EYE",
      "TINTED_LENS"
    ],
    "id": "SPECIES_HOOTHOOT",
    "family": "P_FAMILY_HOOTHOOT",
    "baseHP": 60,
    "baseAttack": 30,
    "baseDefense": 30,
    "baseSpeed": 50,
    "baseSpAttack": 36,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_KEEN_EYE, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Hoothoot\")",
    "natDexNum": "NATIONAL_DEX_HOOTHOOT",
    "levelUpLearnset": "sHoothootLevelUpLearnset",
    "teachableLearnset": "sHoothootTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_NOCTOWL})",
    "baseBST": 262,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Noctowl",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "KEEN_EYE",
      "TINTED_LENS"
    ],
    "id": "SPECIES_NOCTOWL",
    "family": "P_FAMILY_HOOTHOOT",
    "baseHP": 100,
    "baseAttack": 50,
    "baseDefense": 50,
    "baseSpeed": 70,
    "baseSpAttack": 86,
    "baseSpDefense": 96,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_KEEN_EYE, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Noctowl\")",
    "natDexNum": "NATIONAL_DEX_NOCTOWL",
    "levelUpLearnset": "sNoctowlLevelUpLearnset",
    "teachableLearnset": "sNoctowlTeachableLearnset",
    "baseBST": 452,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ledyba",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SWARM",
      "EARLY_BIRD",
      "RATTLED"
    ],
    "id": "SPECIES_LEDYBA",
    "family": "P_FAMILY_LEDYBA",
    "baseHP": 40,
    "baseAttack": 20,
    "baseDefense": 30,
    "baseSpeed": 55,
    "baseSpAttack": 40,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SWARM, ABILITY_EARLY_BIRD, ABILITY_RATTLED }",
    "speciesName": "_(\"Ledyba\")",
    "natDexNum": "NATIONAL_DEX_LEDYBA",
    "levelUpLearnset": "sLedybaLevelUpLearnset",
    "teachableLearnset": "sLedybaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_LEDIAN})",
    "baseBST": 265,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ledian",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SWARM",
      "EARLY_BIRD",
      "IRON_FIST"
    ],
    "id": "SPECIES_LEDIAN",
    "family": "P_FAMILY_LEDYBA",
    "baseHP": 55,
    "baseAttack": 35,
    "baseDefense": 50,
    "baseSpeed": 85,
    "baseSpAttack": 55,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SWARM, ABILITY_EARLY_BIRD, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Ledian\")",
    "natDexNum": "NATIONAL_DEX_LEDIAN",
    "levelUpLearnset": "sLedianLevelUpLearnset",
    "teachableLearnset": "sLedianTeachableLearnset",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spinarak",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SWARM",
      "INSOMNIA",
      "SNIPER"
    ],
    "id": "SPECIES_SPINARAK",
    "family": "P_FAMILY_SPINARAK",
    "baseHP": 40,
    "baseAttack": 60,
    "baseDefense": 40,
    "baseSpeed": 30,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SWARM, ABILITY_INSOMNIA, ABILITY_SNIPER }",
    "speciesName": "_(\"Spinarak\")",
    "natDexNum": "NATIONAL_DEX_SPINARAK",
    "levelUpLearnset": "sSpinarakLevelUpLearnset",
    "teachableLearnset": "sSpinarakTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_ARIADOS})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ariados",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SWARM",
      "INSOMNIA",
      "SNIPER"
    ],
    "id": "SPECIES_ARIADOS",
    "family": "P_FAMILY_SPINARAK",
    "baseHP": 70,
    "baseAttack": 90,
    "baseDefense": 70,
    "baseSpeed": 40,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SWARM, ABILITY_INSOMNIA, ABILITY_SNIPER }",
    "speciesName": "_(\"Ariados\")",
    "natDexNum": "NATIONAL_DEX_ARIADOS",
    "levelUpLearnset": "sAriadosLevelUpLearnset",
    "teachableLearnset": "sAriadosTeachableLearnset",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chinchou",
    "parsedTypes": [
      "WATER",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "ILLUMINATE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_CHINCHOU",
    "family": "P_FAMILY_CHINCHOU",
    "baseHP": 75,
    "baseAttack": 38,
    "baseDefense": 38,
    "baseSpeed": 67,
    "baseSpAttack": 56,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_ILLUMINATE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Chinchou\")",
    "natDexNum": "NATIONAL_DEX_CHINCHOU",
    "levelUpLearnset": "sChinchouLevelUpLearnset",
    "teachableLearnset": "sChinchouTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 27, SPECIES_LANTURN})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lanturn",
    "parsedTypes": [
      "WATER",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "ILLUMINATE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_LANTURN",
    "family": "P_FAMILY_CHINCHOU",
    "baseHP": 125,
    "baseAttack": 58,
    "baseDefense": 58,
    "baseSpeed": 67,
    "baseSpAttack": 76,
    "baseSpDefense": 76,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_ILLUMINATE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Lanturn\")",
    "natDexNum": "NATIONAL_DEX_LANTURN",
    "levelUpLearnset": "sLanturnLevelUpLearnset",
    "teachableLearnset": "sLanturnTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Togepi",
    "parsedTypes": [
      "TOGEPI_FAMILY_TYPE"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "SERENE_GRACE",
      "SUPER_LUCK"
    ],
    "id": "SPECIES_TOGEPI",
    "family": "P_FAMILY_TOGEPI",
    "baseHP": 35,
    "baseAttack": 20,
    "baseDefense": 65,
    "baseSpeed": 20,
    "baseSpAttack": 40,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TOGEPI_FAMILY_TYPE)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_SERENE_GRACE, ABILITY_SUPER_LUCK }",
    "speciesName": "_(\"Togepi\")",
    "natDexNum": "NATIONAL_DEX_TOGEPI",
    "levelUpLearnset": "sTogepiLevelUpLearnset",
    "teachableLearnset": "sTogepiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_TOGETIC, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Togetic",
    "parsedTypes": [
      "TOGEPI_FAMILY_TYPE",
      "FLYING"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "SERENE_GRACE",
      "SUPER_LUCK"
    ],
    "id": "SPECIES_TOGETIC",
    "family": "P_FAMILY_TOGEPI",
    "baseHP": 55,
    "baseAttack": 40,
    "baseDefense": 85,
    "baseSpeed": 40,
    "baseSpAttack": 80,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TOGEPI_FAMILY_TYPE, TYPE_FLYING)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_SERENE_GRACE, ABILITY_SUPER_LUCK }",
    "speciesName": "_(\"Togetic\")",
    "natDexNum": "NATIONAL_DEX_TOGETIC",
    "levelUpLearnset": "sTogeticLevelUpLearnset",
    "teachableLearnset": "sTogeticTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SHINY_STONE, SPECIES_TOGEKISS})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Togekiss",
    "parsedTypes": [
      "TOGEPI_FAMILY_TYPE",
      "FLYING"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "SERENE_GRACE",
      "SUPER_LUCK"
    ],
    "id": "SPECIES_TOGEKISS",
    "family": "P_FAMILY_TOGEPI",
    "baseHP": 85,
    "baseAttack": 50,
    "baseDefense": 95,
    "baseSpeed": 80,
    "baseSpAttack": 120,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TOGEPI_FAMILY_TYPE, TYPE_FLYING)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_SERENE_GRACE, ABILITY_SUPER_LUCK }",
    "speciesName": "_(\"Togekiss\")",
    "natDexNum": "NATIONAL_DEX_TOGEKISS",
    "levelUpLearnset": "sTogekissLevelUpLearnset",
    "teachableLearnset": "sTogekissTeachableLearnset",
    "baseBST": 545,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Natu",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "EARLY_BIRD",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_NATU",
    "family": "P_FAMILY_NATU",
    "baseHP": 40,
    "baseAttack": 50,
    "baseDefense": 45,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_EARLY_BIRD, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Natu\")",
    "natDexNum": "NATIONAL_DEX_NATU",
    "levelUpLearnset": "sNatuLevelUpLearnset",
    "teachableLearnset": "sNatuTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_XATU})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Xatu",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "EARLY_BIRD",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_XATU",
    "family": "P_FAMILY_NATU",
    "baseHP": 65,
    "baseAttack": 75,
    "baseDefense": 70,
    "baseSpeed": 95,
    "baseSpAttack": 95,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_EARLY_BIRD, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Xatu\")",
    "natDexNum": "NATIONAL_DEX_XATU",
    "levelUpLearnset": "sXatuLevelUpLearnset",
    "teachableLearnset": "sXatuTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mareep",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "PLUS"
    ],
    "id": "SPECIES_MAREEP",
    "family": "P_FAMILY_MAREEP",
    "baseHP": 55,
    "baseAttack": 40,
    "baseDefense": 40,
    "baseSpeed": 35,
    "baseSpAttack": 65,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_PLUS }",
    "speciesName": "_(\"Mareep\")",
    "natDexNum": "NATIONAL_DEX_MAREEP",
    "levelUpLearnset": "sMareepLevelUpLearnset",
    "teachableLearnset": "sMareepTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 15, SPECIES_FLAAFFY})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flaaffy",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "PLUS"
    ],
    "id": "SPECIES_FLAAFFY",
    "family": "P_FAMILY_MAREEP",
    "baseHP": 70,
    "baseAttack": 55,
    "baseDefense": 55,
    "baseSpeed": 45,
    "baseSpAttack": 80,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_PLUS }",
    "speciesName": "_(\"Flaaffy\")",
    "natDexNum": "NATIONAL_DEX_FLAAFFY",
    "levelUpLearnset": "sFlaaffyLevelUpLearnset",
    "teachableLearnset": "sFlaaffyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_AMPHAROS})",
    "baseBST": 365,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ampharos",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "PLUS"
    ],
    "id": "SPECIES_AMPHAROS",
    "family": "P_FAMILY_MAREEP",
    "baseHP": 90,
    "baseAttack": 75,
    "baseDefense": 85,
    "baseSpeed": 55,
    "baseSpAttack": 115,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_PLUS }",
    "speciesName": "_(\"Ampharos\")",
    "natDexNum": "NATIONAL_DEX_AMPHAROS",
    "levelUpLearnset": "sAmpharosLevelUpLearnset",
    "teachableLearnset": "sAmpharosTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ampharos  Mega",
    "parsedTypes": [
      "ELECTRIC",
      "DRAGON"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "MOLD_BREAKER",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_AMPHAROS_MEGA",
    "family": "P_FAMILY_MAREEP",
    "baseHP": 90,
    "baseAttack": 95,
    "baseDefense": 105,
    "baseSpeed": 45,
    "baseSpAttack": 165,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_DRAGON)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_MOLD_BREAKER, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Ampharos\")",
    "natDexNum": "NATIONAL_DEX_AMPHAROS",
    "levelUpLearnset": "sAmpharosLevelUpLearnset",
    "teachableLearnset": "sAmpharosTeachableLearnset",
    "baseBST": 610,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Azurill",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "HUGE_POWER",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_AZURILL",
    "family": "P_FAMILY_MARILL",
    "baseHP": 50,
    "baseAttack": 20,
    "baseDefense": 40,
    "baseSpeed": 20,
    "baseSpAttack": 20,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_HUGE_POWER, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Azurill\")",
    "natDexNum": "NATIONAL_DEX_AZURILL",
    "levelUpLearnset": "sAzurillLevelUpLearnset",
    "teachableLearnset": "sAzurillTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_MARILL, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 190,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Marill",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "HUGE_POWER",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_MARILL",
    "family": "P_FAMILY_MARILL",
    "baseHP": 70,
    "baseAttack": 20,
    "baseDefense": 50,
    "baseSpeed": 40,
    "baseSpAttack": 20,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_HUGE_POWER, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Marill\")",
    "natDexNum": "NATIONAL_DEX_MARILL",
    "levelUpLearnset": "sMarillLevelUpLearnset",
    "teachableLearnset": "sMarillTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_AZUMARILL})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Azumarill",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "HUGE_POWER",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_AZUMARILL",
    "family": "P_FAMILY_MARILL",
    "baseHP": 100,
    "baseAttack": 50,
    "baseDefense": 80,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_HUGE_POWER, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Azumarill\")",
    "natDexNum": "NATIONAL_DEX_AZUMARILL",
    "levelUpLearnset": "sAzumarillLevelUpLearnset",
    "teachableLearnset": "sAzumarillTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bonsly",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "ROCK_HEAD",
      "RATTLED"
    ],
    "id": "SPECIES_BONSLY",
    "family": "P_FAMILY_SUDOWOODO",
    "baseHP": 50,
    "baseAttack": 80,
    "baseDefense": 95,
    "baseSpeed": 10,
    "baseSpAttack": 10,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_ROCK_HEAD, ABILITY_RATTLED }",
    "speciesName": "_(\"Bonsly\")",
    "natDexNum": "NATIONAL_DEX_BONSLY",
    "levelUpLearnset": "sBonslyLevelUpLearnset",
    "teachableLearnset": "sBonslyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_SUDOWOODO, CONDITIONS({IF_KNOWS_MOVE, MOVE_MIMIC})})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sudowoodo",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "ROCK_HEAD",
      "RATTLED"
    ],
    "id": "SPECIES_SUDOWOODO",
    "family": "P_FAMILY_SUDOWOODO",
    "baseHP": 70,
    "baseAttack": 100,
    "baseDefense": 115,
    "baseSpeed": 30,
    "baseSpAttack": 30,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_ROCK_HEAD, ABILITY_RATTLED }",
    "speciesName": "_(\"Sudowoodo\")",
    "natDexNum": "NATIONAL_DEX_SUDOWOODO",
    "levelUpLearnset": "sSudowoodoLevelUpLearnset",
    "teachableLearnset": "sSudowoodoTeachableLearnset",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hoppip",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_HOPPIP",
    "family": "P_FAMILY_HOPPIP",
    "baseHP": 35,
    "baseAttack": 35,
    "baseDefense": 40,
    "baseSpeed": 50,
    "baseSpAttack": 35,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Hoppip\")",
    "natDexNum": "NATIONAL_DEX_HOPPIP",
    "levelUpLearnset": "sHoppipLevelUpLearnset",
    "teachableLearnset": "sHoppipTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_SKIPLOOM})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skiploom",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_SKIPLOOM",
    "family": "P_FAMILY_HOPPIP",
    "baseHP": 55,
    "baseAttack": 45,
    "baseDefense": 50,
    "baseSpeed": 80,
    "baseSpAttack": 45,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Skiploom\")",
    "natDexNum": "NATIONAL_DEX_SKIPLOOM",
    "levelUpLearnset": "sSkiploomLevelUpLearnset",
    "teachableLearnset": "sSkiploomTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 27, SPECIES_JUMPLUFF})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jumpluff",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_JUMPLUFF",
    "family": "P_FAMILY_HOPPIP",
    "baseHP": 75,
    "baseAttack": 55,
    "baseDefense": 70,
    "baseSpeed": 110,
    "baseSpAttack": 55,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Jumpluff\")",
    "natDexNum": "NATIONAL_DEX_JUMPLUFF",
    "levelUpLearnset": "sJumpluffLevelUpLearnset",
    "teachableLearnset": "sJumpluffTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aipom",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "PICKUP",
      "SKILL_LINK"
    ],
    "id": "SPECIES_AIPOM",
    "family": "P_FAMILY_AIPOM",
    "baseHP": 55,
    "baseAttack": 70,
    "baseDefense": 55,
    "baseSpeed": 85,
    "baseSpAttack": 40,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_PICKUP, ABILITY_SKILL_LINK }",
    "speciesName": "_(\"Aipom\")",
    "natDexNum": "NATIONAL_DEX_AIPOM",
    "levelUpLearnset": "sAipomLevelUpLearnset",
    "teachableLearnset": "sAipomTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_AMBIPOM, CONDITIONS({IF_KNOWS_MOVE, MOVE_DOUBLE_HIT})})",
    "baseBST": 360,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ambipom",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TECHNICIAN",
      "PICKUP",
      "SKILL_LINK"
    ],
    "id": "SPECIES_AMBIPOM",
    "family": "P_FAMILY_AIPOM",
    "baseHP": 75,
    "baseAttack": 100,
    "baseDefense": 66,
    "baseSpeed": 115,
    "baseSpAttack": 60,
    "baseSpDefense": 66,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TECHNICIAN, ABILITY_PICKUP, ABILITY_SKILL_LINK }",
    "speciesName": "_(\"Ambipom\")",
    "natDexNum": "NATIONAL_DEX_AMBIPOM",
    "levelUpLearnset": "sAmbipomLevelUpLearnset",
    "teachableLearnset": "sAmbipomTeachableLearnset",
    "baseBST": 482,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sunkern",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "EARLY_BIRD"
    ],
    "id": "SPECIES_SUNKERN",
    "family": "P_FAMILY_SUNKERN",
    "baseHP": 30,
    "baseAttack": 30,
    "baseDefense": 30,
    "baseSpeed": 30,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_EARLY_BIRD }",
    "speciesName": "_(\"Sunkern\")",
    "natDexNum": "NATIONAL_DEX_SUNKERN",
    "levelUpLearnset": "sSunkernLevelUpLearnset",
    "teachableLearnset": "sSunkernTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SUN_STONE, SPECIES_SUNFLORA})",
    "baseBST": 180,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sunflora",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "EARLY_BIRD"
    ],
    "id": "SPECIES_SUNFLORA",
    "family": "P_FAMILY_SUNKERN",
    "baseHP": 75,
    "baseAttack": 75,
    "baseDefense": 55,
    "baseSpeed": 30,
    "baseSpAttack": 105,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_EARLY_BIRD }",
    "speciesName": "_(\"Sunflora\")",
    "natDexNum": "NATIONAL_DEX_SUNFLORA",
    "levelUpLearnset": "sSunfloraLevelUpLearnset",
    "teachableLearnset": "sSunfloraTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yanma",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SPEED_BOOST",
      "COMPOUND_EYES",
      "FRISK"
    ],
    "id": "SPECIES_YANMA",
    "family": "P_FAMILY_YANMA",
    "baseHP": 65,
    "baseAttack": 65,
    "baseDefense": 45,
    "baseSpeed": 95,
    "baseSpAttack": 75,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SPEED_BOOST, ABILITY_COMPOUND_EYES, ABILITY_FRISK }",
    "speciesName": "_(\"Yanma\")",
    "natDexNum": "NATIONAL_DEX_YANMA",
    "levelUpLearnset": "sYanmaLevelUpLearnset",
    "teachableLearnset": "sYanmaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_YANMEGA, CONDITIONS({IF_KNOWS_MOVE, MOVE_ANCIENT_POWER})})",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yanmega",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SPEED_BOOST",
      "TINTED_LENS",
      "FRISK"
    ],
    "id": "SPECIES_YANMEGA",
    "family": "P_FAMILY_YANMA",
    "baseHP": 86,
    "baseAttack": 76,
    "baseDefense": 86,
    "baseSpeed": 95,
    "baseSpAttack": 116,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SPEED_BOOST, ABILITY_TINTED_LENS, ABILITY_FRISK }",
    "speciesName": "_(\"Yanmega\")",
    "natDexNum": "NATIONAL_DEX_YANMEGA",
    "levelUpLearnset": "sYanmegaLevelUpLearnset",
    "teachableLearnset": "sYanmegaTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wooper",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "DAMP",
      "WATER_ABSORB",
      "UNAWARE"
    ],
    "id": "SPECIES_WOOPER",
    "family": "P_FAMILY_WOOPER",
    "baseHP": 55,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 15,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_DAMP, ABILITY_WATER_ABSORB, ABILITY_UNAWARE }",
    "speciesName": "_(\"Wooper\")",
    "natDexNum": "NATIONAL_DEX_WOOPER",
    "levelUpLearnset": "sWooperLevelUpLearnset",
    "teachableLearnset": "sWooperTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_QUAGSIRE})",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Quagsire",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "DAMP",
      "WATER_ABSORB",
      "UNAWARE"
    ],
    "id": "SPECIES_QUAGSIRE",
    "family": "P_FAMILY_WOOPER",
    "baseHP": 95,
    "baseAttack": 85,
    "baseDefense": 85,
    "baseSpeed": 35,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_DAMP, ABILITY_WATER_ABSORB, ABILITY_UNAWARE }",
    "speciesName": "_(\"Quagsire\")",
    "natDexNum": "NATIONAL_DEX_QUAGSIRE",
    "levelUpLearnset": "sQuagsireLevelUpLearnset",
    "teachableLearnset": "sQuagsireTeachableLearnset",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wooper  Paldea",
    "parsedTypes": [
      "POISON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "WATER_ABSORB",
      "UNAWARE"
    ],
    "id": "SPECIES_WOOPER_PALDEA",
    "family": "P_FAMILY_WOOPER",
    "baseHP": 55,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 15,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_POISON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_WATER_ABSORB, ABILITY_UNAWARE }",
    "speciesName": "_(\"Wooper\")",
    "natDexNum": "NATIONAL_DEX_WOOPER",
    "levelUpLearnset": "sWooperPaldeaLevelUpLearnset",
    "teachableLearnset": "sWooperPaldeaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_CLODSIRE})",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clodsire",
    "parsedTypes": [
      "POISON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "WATER_ABSORB",
      "UNAWARE"
    ],
    "id": "SPECIES_CLODSIRE",
    "family": "P_FAMILY_WOOPER",
    "baseHP": 130,
    "baseAttack": 75,
    "baseDefense": 60,
    "baseSpeed": 20,
    "baseSpAttack": 45,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_POISON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_WATER_ABSORB, ABILITY_UNAWARE }",
    "speciesName": "_(\"Clodsire\")",
    "natDexNum": "NATIONAL_DEX_CLODSIRE",
    "levelUpLearnset": "sClodsireLevelUpLearnset",
    "teachableLearnset": "sClodsireTeachableLearnset",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Murkrow",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "PRANKSTER"
    ],
    "id": "SPECIES_MURKROW",
    "family": "P_FAMILY_MURKROW",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 42,
    "baseSpeed": 91,
    "baseSpAttack": 85,
    "baseSpDefense": 42,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Murkrow\")",
    "natDexNum": "NATIONAL_DEX_MURKROW",
    "levelUpLearnset": "sMurkrowLevelUpLearnset",
    "teachableLearnset": "sMurkrowTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_DUSK_STONE, SPECIES_HONCHKROW})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Honchkrow",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "SUPER_LUCK",
      "MOXIE"
    ],
    "id": "SPECIES_HONCHKROW",
    "family": "P_FAMILY_MURKROW",
    "baseHP": 100,
    "baseAttack": 125,
    "baseDefense": 52,
    "baseSpeed": 71,
    "baseSpAttack": 105,
    "baseSpDefense": 52,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_SUPER_LUCK, ABILITY_MOXIE }",
    "speciesName": "_(\"Honchkrow\")",
    "natDexNum": "NATIONAL_DEX_HONCHKROW",
    "levelUpLearnset": "sHonchkrowLevelUpLearnset",
    "teachableLearnset": "sHonchkrowTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Misdreavus",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MISDREAVUS",
    "family": "P_FAMILY_MISDREAVUS",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Misdreavus\")",
    "natDexNum": "NATIONAL_DEX_MISDREAVUS",
    "levelUpLearnset": "sMisdreavusLevelUpLearnset",
    "teachableLearnset": "sMisdreavusTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_DUSK_STONE, SPECIES_MISMAGIUS})",
    "baseBST": 435,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mismagius",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MISMAGIUS",
    "family": "P_FAMILY_MISDREAVUS",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 105,
    "baseSpAttack": 105,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Mismagius\")",
    "natDexNum": "NATIONAL_DEX_MISMAGIUS",
    "levelUpLearnset": "sMismagiusLevelUpLearnset",
    "teachableLearnset": "sMismagiusTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wynaut",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SHADOW_TAG",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_WYNAUT",
    "family": "P_FAMILY_WOBBUFFET",
    "baseHP": 95,
    "baseAttack": 23,
    "baseDefense": 48,
    "baseSpeed": 23,
    "baseSpAttack": 23,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SHADOW_TAG, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Wynaut\")",
    "natDexNum": "NATIONAL_DEX_WYNAUT",
    "levelUpLearnset": "sWynautLevelUpLearnset",
    "teachableLearnset": "sWynautTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 15, SPECIES_WOBBUFFET})",
    "baseBST": 260,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wobbuffet",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SHADOW_TAG",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_WOBBUFFET",
    "family": "P_FAMILY_WOBBUFFET",
    "baseHP": 190,
    "baseAttack": 33,
    "baseDefense": 58,
    "baseSpeed": 33,
    "baseSpAttack": 33,
    "baseSpDefense": 58,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SHADOW_TAG, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Wobbuffet\")",
    "natDexNum": "NATIONAL_DEX_WOBBUFFET",
    "levelUpLearnset": "sWobbuffetLevelUpLearnset",
    "teachableLearnset": "sWobbuffetTeachableLearnset",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Girafarig",
    "parsedTypes": [
      "NORMAL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "EARLY_BIRD",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_GIRAFARIG",
    "family": "P_FAMILY_GIRAFARIG",
    "baseHP": 70,
    "baseAttack": 80,
    "baseDefense": 65,
    "baseSpeed": 85,
    "baseSpAttack": 90,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_EARLY_BIRD, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Girafarig\")",
    "natDexNum": "NATIONAL_DEX_GIRAFARIG",
    "levelUpLearnset": "sGirafarigLevelUpLearnset",
    "teachableLearnset": "sGirafarigTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_FARIGIRAF, CONDITIONS({IF_KNOWS_MOVE, MOVE_TWIN_BEAM})})",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Farigiraf",
    "parsedTypes": [
      "NORMAL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CUD_CHEW",
      "ARMOR_TAIL",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_FARIGIRAF",
    "family": "P_FAMILY_GIRAFARIG",
    "baseHP": 120,
    "baseAttack": 90,
    "baseDefense": 70,
    "baseSpeed": 60,
    "baseSpAttack": 110,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CUD_CHEW, ABILITY_ARMOR_TAIL, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Farigiraf\")",
    "natDexNum": "NATIONAL_DEX_FARIGIRAF",
    "levelUpLearnset": "sFarigirafLevelUpLearnset",
    "teachableLearnset": "sFarigirafTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pineco",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "OVERCOAT"
    ],
    "id": "SPECIES_PINECO",
    "family": "P_FAMILY_PINECO",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 90,
    "baseSpeed": 15,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Pineco\")",
    "natDexNum": "NATIONAL_DEX_PINECO",
    "levelUpLearnset": "sPinecoLevelUpLearnset",
    "teachableLearnset": "sPinecoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 31, SPECIES_FORRETRESS})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Forretress",
    "parsedTypes": [
      "BUG",
      "STEEL"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "OVERCOAT"
    ],
    "id": "SPECIES_FORRETRESS",
    "family": "P_FAMILY_PINECO",
    "baseHP": 75,
    "baseAttack": 90,
    "baseDefense": 140,
    "baseSpeed": 40,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_BUG, TYPE_STEEL)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Forretress\")",
    "natDexNum": "NATIONAL_DEX_FORRETRESS",
    "levelUpLearnset": "sForretressLevelUpLearnset",
    "teachableLearnset": "sForretressTeachableLearnset",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dunsparce",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "RUN_AWAY",
      "RATTLED"
    ],
    "id": "SPECIES_DUNSPARCE",
    "family": "P_FAMILY_DUNSPARCE",
    "baseHP": 100,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 45,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_RUN_AWAY, ABILITY_RATTLED }",
    "speciesName": "_(\"Dunsparce\")",
    "natDexNum": "NATIONAL_DEX_DUNSPARCE",
    "levelUpLearnset": "sDunsparceLevelUpLearnset",
    "teachableLearnset": "sDunsparceTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_DUDUNSPARCE_TWO_SEGMENT, CONDITIONS({IF_KNOWS_MOVE, MOVE_HYPER_DRILL}, {IF_PID_MODULO_100_GT, 0})}",
    "baseBST": 415,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dudunsparce  Two  Segment",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "RUN_AWAY",
      "RATTLED"
    ],
    "id": "SPECIES_DUDUNSPARCE_TWO_SEGMENT",
    "family": "P_FAMILY_DUNSPARCE",
    "baseHP": 125,
    "baseAttack": 100,
    "baseDefense": 80,
    "baseSpeed": 55,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_RUN_AWAY, ABILITY_RATTLED }",
    "speciesName": "_(\"Dudunsparce\")",
    "natDexNum": "NATIONAL_DEX_DUDUNSPARCE",
    "levelUpLearnset": "sDudunsparceLevelUpLearnset",
    "teachableLearnset": "sDudunsparceTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dudunsparce  Three  Segment",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "RUN_AWAY",
      "RATTLED"
    ],
    "id": "SPECIES_DUDUNSPARCE_THREE_SEGMENT",
    "family": "P_FAMILY_DUNSPARCE",
    "baseHP": 125,
    "baseAttack": 100,
    "baseDefense": 80,
    "baseSpeed": 55,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_RUN_AWAY, ABILITY_RATTLED }",
    "speciesName": "_(\"Dudunsparce\")",
    "natDexNum": "NATIONAL_DEX_DUDUNSPARCE",
    "levelUpLearnset": "sDudunsparceLevelUpLearnset",
    "teachableLearnset": "sDudunsparceTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gligar",
    "parsedTypes": [
      "GROUND",
      "FLYING"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "SAND_VEIL",
      "IMMUNITY"
    ],
    "id": "SPECIES_GLIGAR",
    "family": "P_FAMILY_GLIGAR",
    "baseHP": 65,
    "baseAttack": 75,
    "baseDefense": 105,
    "baseSpeed": 85,
    "baseSpAttack": 35,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_FLYING)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_SAND_VEIL, ABILITY_IMMUNITY }",
    "speciesName": "_(\"Gligar\")",
    "natDexNum": "NATIONAL_DEX_GLIGAR",
    "levelUpLearnset": "sGligarLevelUpLearnset",
    "teachableLearnset": "sGligarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_GLISCOR, CONDITIONS({IF_TIME, TIME_NIGHT}, {IF_HOLD_ITEM, ITEM_RAZOR_FANG})}",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gliscor",
    "parsedTypes": [
      "GROUND",
      "FLYING"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "SAND_VEIL",
      "POISON_HEAL"
    ],
    "id": "SPECIES_GLISCOR",
    "family": "P_FAMILY_GLIGAR",
    "baseHP": 75,
    "baseAttack": 95,
    "baseDefense": 125,
    "baseSpeed": 95,
    "baseSpAttack": 45,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_FLYING)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_SAND_VEIL, ABILITY_POISON_HEAL }",
    "speciesName": "_(\"Gliscor\")",
    "natDexNum": "NATIONAL_DEX_GLISCOR",
    "levelUpLearnset": "sGliscorLevelUpLearnset",
    "teachableLearnset": "sGliscorTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Snubbull",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "RUN_AWAY",
      "RATTLED"
    ],
    "id": "SPECIES_SNUBBULL",
    "family": "P_FAMILY_SNUBBULL",
    "baseHP": 60,
    "baseAttack": 80,
    "baseDefense": 50,
    "baseSpeed": 30,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_RUN_AWAY, ABILITY_RATTLED }",
    "speciesName": "_(\"Snubbull\")",
    "natDexNum": "NATIONAL_DEX_SNUBBULL",
    "levelUpLearnset": "sSnubbullLevelUpLearnset",
    "teachableLearnset": "sSnubbullTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 23, SPECIES_GRANBULL})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Granbull",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_GRANBULL",
    "family": "P_FAMILY_SNUBBULL",
    "baseHP": 90,
    "baseAttack": 120,
    "baseDefense": 75,
    "baseSpeed": 45,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Granbull\")",
    "natDexNum": "NATIONAL_DEX_GRANBULL",
    "levelUpLearnset": "sGranbullLevelUpLearnset",
    "teachableLearnset": "sGranbullTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Qwilfish",
    "parsedTypes": [
      "WATER",
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "SWIFT_SWIM",
      "INTIMIDATE"
    ],
    "id": "SPECIES_QWILFISH",
    "family": "P_FAMILY_QWILFISH",
    "baseHP": 65,
    "baseAttack": 95,
    "baseDefense": 85,
    "baseSpeed": 85,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER, TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_SWIFT_SWIM, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Qwilfish\")",
    "natDexNum": "NATIONAL_DEX_QWILFISH",
    "levelUpLearnset": "sQwilfishLevelUpLearnset",
    "teachableLearnset": "sQwilfishTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Qwilfish  Hisui",
    "parsedTypes": [
      "DARK",
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "SWIFT_SWIM",
      "INTIMIDATE"
    ],
    "id": "SPECIES_QWILFISH_HISUI",
    "family": "P_FAMILY_QWILFISH",
    "baseHP": 65,
    "baseAttack": 95,
    "baseDefense": 85,
    "baseSpeed": 85,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_DARK, TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_SWIFT_SWIM, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Qwilfish\")",
    "natDexNum": "NATIONAL_DEX_QWILFISH",
    "levelUpLearnset": "sQwilfishHisuiLevelUpLearnset",
    "teachableLearnset": "sQwilfishHisuiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_OVERQWIL, CONDITIONS({IF_KNOWS_MOVE, MOVE_BARB_BARRAGE})})",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Overqwil",
    "parsedTypes": [
      "DARK",
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "SWIFT_SWIM",
      "INTIMIDATE"
    ],
    "id": "SPECIES_OVERQWIL",
    "family": "P_FAMILY_QWILFISH",
    "baseHP": 85,
    "baseAttack": 115,
    "baseDefense": 95,
    "baseSpeed": 85,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DARK, TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_SWIFT_SWIM, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Overqwil\")",
    "natDexNum": "NATIONAL_DEX_OVERQWIL",
    "levelUpLearnset": "sOverqwilLevelUpLearnset",
    "teachableLearnset": "sOverqwilTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shuckle",
    "parsedTypes": [
      "BUG",
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_SHUCKLE",
    "family": "P_FAMILY_SHUCKLE",
    "baseHP": 20,
    "baseAttack": 10,
    "baseDefense": 230,
    "baseSpeed": 5,
    "baseSpAttack": 10,
    "baseSpDefense": 230,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Shuckle\")",
    "natDexNum": "NATIONAL_DEX_SHUCKLE",
    "levelUpLearnset": "sShuckleLevelUpLearnset",
    "teachableLearnset": "sShuckleTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Heracross",
    "parsedTypes": [
      "BUG",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SWARM",
      "GUTS",
      "MOXIE"
    ],
    "id": "SPECIES_HERACROSS",
    "family": "P_FAMILY_HERACROSS",
    "baseHP": 80,
    "baseAttack": 125,
    "baseDefense": 75,
    "baseSpeed": 85,
    "baseSpAttack": 40,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SWARM, ABILITY_GUTS, ABILITY_MOXIE }",
    "speciesName": "_(\"Heracross\")",
    "natDexNum": "NATIONAL_DEX_HERACROSS",
    "levelUpLearnset": "sHeracrossLevelUpLearnset",
    "teachableLearnset": "sHeracrossTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Heracross  Mega",
    "parsedTypes": [
      "BUG",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SKILL_LINK",
      "SKILL_LINK",
      "SKILL_LINK"
    ],
    "id": "SPECIES_HERACROSS_MEGA",
    "family": "P_FAMILY_HERACROSS",
    "baseHP": 80,
    "baseAttack": 185,
    "baseDefense": 115,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SKILL_LINK, ABILITY_SKILL_LINK, ABILITY_SKILL_LINK }",
    "speciesName": "_(\"Heracross\")",
    "natDexNum": "NATIONAL_DEX_HERACROSS",
    "levelUpLearnset": "sHeracrossLevelUpLearnset",
    "teachableLearnset": "sHeracrossTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sneasel",
    "parsedTypes": [
      "DARK",
      "ICE"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "KEEN_EYE",
      "PICKPOCKET"
    ],
    "id": "SPECIES_SNEASEL",
    "family": "P_FAMILY_SNEASEL",
    "baseHP": 55,
    "baseAttack": 95,
    "baseDefense": 55,
    "baseSpeed": 115,
    "baseSpAttack": 35,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_DARK, TYPE_ICE)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_KEEN_EYE, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Sneasel\")",
    "natDexNum": "NATIONAL_DEX_SNEASEL",
    "levelUpLearnset": "sSneaselLevelUpLearnset",
    "teachableLearnset": "sSneaselTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_WEAVILE, CONDITIONS({IF_TIME, TIME_NIGHT}, {IF_HOLD_ITEM, ITEM_RAZOR_CLAW})}",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Weavile",
    "parsedTypes": [
      "DARK",
      "ICE"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "PICKPOCKET"
    ],
    "id": "SPECIES_WEAVILE",
    "family": "P_FAMILY_SNEASEL",
    "baseHP": 70,
    "baseAttack": 120,
    "baseDefense": 65,
    "baseSpeed": 125,
    "baseSpAttack": 45,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_DARK, TYPE_ICE)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Weavile\")",
    "natDexNum": "NATIONAL_DEX_WEAVILE",
    "levelUpLearnset": "sWeavileLevelUpLearnset",
    "teachableLearnset": "sWeavileTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sneasel  Hisui",
    "parsedTypes": [
      "FIGHTING",
      "POISON"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "KEEN_EYE",
      "PICKPOCKET"
    ],
    "id": "SPECIES_SNEASEL_HISUI",
    "family": "P_FAMILY_SNEASEL",
    "baseHP": 55,
    "baseAttack": 95,
    "baseDefense": 55,
    "baseSpeed": 115,
    "baseSpAttack": 35,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_POISON)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_KEEN_EYE, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Sneasel\")",
    "natDexNum": "NATIONAL_DEX_SNEASEL",
    "levelUpLearnset": "sSneaselHisuiLevelUpLearnset",
    "teachableLearnset": "sSneaselHisuiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_SNEASLER, CONDITIONS({IF_NOT_TIME, TIME_NIGHT}, {IF_HOLD_ITEM, ITEM_RAZOR_CLAW})}",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sneasler",
    "parsedTypes": [
      "FIGHTING",
      "POISON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "UNBURDEN",
      "POISON_TOUCH"
    ],
    "id": "SPECIES_SNEASLER",
    "family": "P_FAMILY_SNEASEL",
    "baseHP": 80,
    "baseAttack": 130,
    "baseDefense": 60,
    "baseSpeed": 120,
    "baseSpAttack": 40,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_POISON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_UNBURDEN, ABILITY_POISON_TOUCH }",
    "speciesName": "_(\"Sneasler\")",
    "natDexNum": "NATIONAL_DEX_SNEASLER",
    "levelUpLearnset": "sSneaslerLevelUpLearnset",
    "teachableLearnset": "sSneaslerTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Teddiursa",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "NONE",
      "HONEY_GATHER"
    ],
    "id": "SPECIES_TEDDIURSA",
    "family": "P_FAMILY_TEDDIURSA",
    "baseHP": 60,
    "baseAttack": 80,
    "baseDefense": 50,
    "baseSpeed": 40,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_NONE, ABILITY_HONEY_GATHER }",
    "speciesName": "_(\"Teddiursa\")",
    "natDexNum": "NATIONAL_DEX_TEDDIURSA",
    "levelUpLearnset": "sTeddiursaLevelUpLearnset",
    "teachableLearnset": "sTeddiursaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_URSARING})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ursaring",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_URSARING",
    "family": "P_FAMILY_TEDDIURSA",
    "baseHP": 90,
    "baseAttack": 130,
    "baseDefense": 75,
    "baseSpeed": 55,
    "baseSpAttack": 75,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Ursaring\")",
    "natDexNum": "NATIONAL_DEX_URSARING",
    "levelUpLearnset": "sUrsaringLevelUpLearnset",
    "teachableLearnset": "sUrsaringTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_PEAT_BLOCK, SPECIES_URSALUNA, CONDITIONS({IF_TIME, TIME_NIGHT})}",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ursaluna",
    "parsedTypes": [
      "GROUND",
      "NORMAL"
    ],
    "parsedAbilities": [
      "GUTS",
      "BULLETPROOF",
      "UNNERVE"
    ],
    "id": "SPECIES_URSALUNA",
    "family": "P_FAMILY_TEDDIURSA",
    "baseHP": 130,
    "baseAttack": 140,
    "baseDefense": 105,
    "baseSpeed": 50,
    "baseSpAttack": 45,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_NORMAL)",
    "abilities": "{ ABILITY_GUTS, ABILITY_BULLETPROOF, ABILITY_UNNERVE }",
    "speciesName": "_(\"Ursaluna\")",
    "natDexNum": "NATIONAL_DEX_URSALUNA",
    "levelUpLearnset": "sUrsalunaLevelUpLearnset",
    "teachableLearnset": "sUrsalunaTeachableLearnset",
    "baseBST": 550,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ursaluna  Bloodmoon",
    "parsedTypes": [
      "GROUND",
      "NORMAL"
    ],
    "parsedAbilities": [
      "MINDS_EYE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_URSALUNA_BLOODMOON",
    "family": "P_FAMILY_TEDDIURSA",
    "baseHP": 113,
    "baseAttack": 70,
    "baseDefense": 120,
    "baseSpeed": 52,
    "baseSpAttack": 135,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_NORMAL)",
    "abilities": "{ ABILITY_MINDS_EYE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Ursaluna\")",
    "natDexNum": "NATIONAL_DEX_URSALUNA",
    "levelUpLearnset": "sUrsalunaBloodmoonLevelUpLearnset",
    "teachableLearnset": "sUrsalunaBloodmoonTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slugma",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "MAGMA_ARMOR",
      "FLAME_BODY",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_SLUGMA",
    "family": "P_FAMILY_SLUGMA",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 40,
    "baseSpeed": 20,
    "baseSpAttack": 70,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_MAGMA_ARMOR, ABILITY_FLAME_BODY, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Slugma\")",
    "natDexNum": "NATIONAL_DEX_SLUGMA",
    "levelUpLearnset": "sSlugmaLevelUpLearnset",
    "teachableLearnset": "sSlugmaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_MAGCARGO})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magcargo",
    "parsedTypes": [
      "FIRE",
      "ROCK"
    ],
    "parsedAbilities": [
      "MAGMA_ARMOR",
      "FLAME_BODY",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_MAGCARGO",
    "family": "P_FAMILY_SLUGMA",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 120,
    "baseSpeed": 30,
    "baseSpAttack": 90,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_ROCK)",
    "abilities": "{ ABILITY_MAGMA_ARMOR, ABILITY_FLAME_BODY, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Magcargo\")",
    "natDexNum": "NATIONAL_DEX_MAGCARGO",
    "levelUpLearnset": "sMagcargoLevelUpLearnset",
    "teachableLearnset": "sMagcargoTeachableLearnset",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swinub",
    "parsedTypes": [
      "ICE",
      "GROUND"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "THICK_FAT"
    ],
    "id": "SPECIES_SWINUB",
    "family": "P_FAMILY_SWINUB",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 40,
    "baseSpeed": 50,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_ICE, TYPE_GROUND)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Swinub\")",
    "natDexNum": "NATIONAL_DEX_SWINUB",
    "levelUpLearnset": "sSwinubLevelUpLearnset",
    "teachableLearnset": "sSwinubTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 33, SPECIES_PILOSWINE})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Piloswine",
    "parsedTypes": [
      "ICE",
      "GROUND"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "THICK_FAT"
    ],
    "id": "SPECIES_PILOSWINE",
    "family": "P_FAMILY_SWINUB",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 80,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ICE, TYPE_GROUND)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Piloswine\")",
    "natDexNum": "NATIONAL_DEX_PILOSWINE",
    "levelUpLearnset": "sPiloswineLevelUpLearnset",
    "teachableLearnset": "sPiloswineTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_MAMOSWINE, CONDITIONS({IF_KNOWS_MOVE, MOVE_ANCIENT_POWER})})",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mamoswine",
    "parsedTypes": [
      "ICE",
      "GROUND"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "SNOW_CLOAK",
      "THICK_FAT"
    ],
    "id": "SPECIES_MAMOSWINE",
    "family": "P_FAMILY_SWINUB",
    "baseHP": 110,
    "baseAttack": 130,
    "baseDefense": 80,
    "baseSpeed": 80,
    "baseSpAttack": 70,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ICE, TYPE_GROUND)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_SNOW_CLOAK, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Mamoswine\")",
    "natDexNum": "NATIONAL_DEX_MAMOSWINE",
    "levelUpLearnset": "sMamoswineLevelUpLearnset",
    "teachableLearnset": "sMamoswineTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Corsola",
    "parsedTypes": [
      "WATER",
      "ROCK"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "NATURAL_CURE",
      "REGENERATOR"
    ],
    "id": "SPECIES_CORSOLA",
    "family": "P_FAMILY_CORSOLA",
    "baseHP": 65,
    "baseAttack": 55,
    "baseDefense": 95,
    "baseSpeed": 35,
    "baseSpAttack": 65,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ROCK)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_NATURAL_CURE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Corsola\")",
    "natDexNum": "NATIONAL_DEX_CORSOLA",
    "levelUpLearnset": "sCorsolaLevelUpLearnset",
    "teachableLearnset": "sCorsolaTeachableLearnset",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Corsola  Galar",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "WEAK_ARMOR",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_CORSOLA_GALAR",
    "family": "P_FAMILY_CORSOLA",
    "baseHP": 60,
    "baseAttack": 55,
    "baseDefense": 100,
    "baseSpeed": 30,
    "baseSpAttack": 65,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_WEAK_ARMOR, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Corsola\")",
    "natDexNum": "NATIONAL_DEX_CORSOLA",
    "levelUpLearnset": "sCorsolaGalarLevelUpLearnset",
    "teachableLearnset": "sCorsolaGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_CURSOLA})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cursola",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "WEAK_ARMOR",
      "NONE",
      "PERISH_BODY"
    ],
    "id": "SPECIES_CURSOLA",
    "family": "P_FAMILY_CORSOLA",
    "baseHP": 60,
    "baseAttack": 95,
    "baseDefense": 50,
    "baseSpeed": 30,
    "baseSpAttack": 145,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_WEAK_ARMOR, ABILITY_NONE, ABILITY_PERISH_BODY }",
    "speciesName": "_(\"Cursola\")",
    "natDexNum": "NATIONAL_DEX_CURSOLA",
    "levelUpLearnset": "sCursolaLevelUpLearnset",
    "teachableLearnset": "sCursolaTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Remoraid",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "NONE",
      "MOODY"
    ],
    "id": "SPECIES_REMORAID",
    "family": "P_FAMILY_REMORAID",
    "baseHP": 35,
    "baseAttack": 65,
    "baseDefense": 35,
    "baseSpeed": 65,
    "baseSpAttack": 65,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_NONE, ABILITY_MOODY }",
    "speciesName": "_(\"Remoraid\")",
    "natDexNum": "NATIONAL_DEX_REMORAID",
    "levelUpLearnset": "sRemoraidLevelUpLearnset",
    "teachableLearnset": "sRemoraidTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_OCTILLERY})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Octillery",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SUCTION_CUPS",
      "NONE",
      "MOODY"
    ],
    "id": "SPECIES_OCTILLERY",
    "family": "P_FAMILY_REMORAID",
    "baseHP": 75,
    "baseAttack": 105,
    "baseDefense": 75,
    "baseSpeed": 45,
    "baseSpAttack": 105,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SUCTION_CUPS, ABILITY_NONE, ABILITY_MOODY }",
    "speciesName": "_(\"Octillery\")",
    "natDexNum": "NATIONAL_DEX_OCTILLERY",
    "levelUpLearnset": "sOctilleryLevelUpLearnset",
    "teachableLearnset": "sOctilleryTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Delibird",
    "parsedTypes": [
      "ICE",
      "FLYING"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "HUSTLE",
      "INSOMNIA"
    ],
    "id": "SPECIES_DELIBIRD",
    "family": "P_FAMILY_DELIBIRD",
    "baseHP": 45,
    "baseAttack": 55,
    "baseDefense": 45,
    "baseSpeed": 75,
    "baseSpAttack": 65,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ICE, TYPE_FLYING)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_HUSTLE, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Delibird\")",
    "natDexNum": "NATIONAL_DEX_DELIBIRD",
    "levelUpLearnset": "sDelibirdLevelUpLearnset",
    "teachableLearnset": "sDelibirdTeachableLearnset",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mantyke",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "WATER_ABSORB",
      "WATER_VEIL"
    ],
    "id": "SPECIES_MANTYKE",
    "family": "P_FAMILY_MANTINE",
    "baseHP": 45,
    "baseAttack": 20,
    "baseDefense": 50,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_WATER_ABSORB, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Mantyke\")",
    "natDexNum": "NATIONAL_DEX_MANTYKE",
    "levelUpLearnset": "sMantykeLevelUpLearnset",
    "teachableLearnset": "sMantykeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_MANTINE, CONDITIONS({IF_SPECIES_IN_PARTY, SPECIES_REMORAID})})",
    "baseBST": 345,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mantine",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "WATER_ABSORB",
      "WATER_VEIL"
    ],
    "id": "SPECIES_MANTINE",
    "family": "P_FAMILY_MANTINE",
    "baseHP": 85,
    "baseAttack": 40,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 80,
    "baseSpDefense": 140,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_WATER_ABSORB, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Mantine\")",
    "natDexNum": "NATIONAL_DEX_MANTINE",
    "levelUpLearnset": "sMantineLevelUpLearnset",
    "teachableLearnset": "sMantineTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skarmory",
    "parsedTypes": [
      "STEEL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "STURDY",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_SKARMORY",
    "family": "P_FAMILY_SKARMORY",
    "baseHP": 65,
    "baseAttack": 80,
    "baseDefense": 140,
    "baseSpeed": 70,
    "baseSpAttack": 40,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_STURDY, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Skarmory\")",
    "natDexNum": "NATIONAL_DEX_SKARMORY",
    "levelUpLearnset": "sSkarmoryLevelUpLearnset",
    "teachableLearnset": "sSkarmoryTeachableLearnset",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Houndour",
    "parsedTypes": [
      "DARK",
      "FIRE"
    ],
    "parsedAbilities": [
      "EARLY_BIRD",
      "FLASH_FIRE",
      "UNNERVE"
    ],
    "id": "SPECIES_HOUNDOUR",
    "family": "P_FAMILY_HOUNDOUR",
    "baseHP": 45,
    "baseAttack": 60,
    "baseDefense": 30,
    "baseSpeed": 65,
    "baseSpAttack": 80,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FIRE)",
    "abilities": "{ ABILITY_EARLY_BIRD, ABILITY_FLASH_FIRE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Houndour\")",
    "natDexNum": "NATIONAL_DEX_HOUNDOUR",
    "levelUpLearnset": "sHoundourLevelUpLearnset",
    "teachableLearnset": "sHoundourTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_HOUNDOOM})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Houndoom",
    "parsedTypes": [
      "DARK",
      "FIRE"
    ],
    "parsedAbilities": [
      "EARLY_BIRD",
      "FLASH_FIRE",
      "UNNERVE"
    ],
    "id": "SPECIES_HOUNDOOM",
    "family": "P_FAMILY_HOUNDOUR",
    "baseHP": 75,
    "baseAttack": 90,
    "baseDefense": 50,
    "baseSpeed": 95,
    "baseSpAttack": 110,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FIRE)",
    "abilities": "{ ABILITY_EARLY_BIRD, ABILITY_FLASH_FIRE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Houndoom\")",
    "natDexNum": "NATIONAL_DEX_HOUNDOOM",
    "levelUpLearnset": "sHoundoomLevelUpLearnset",
    "teachableLearnset": "sHoundoomTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Houndoom  Mega",
    "parsedTypes": [
      "DARK",
      "FIRE"
    ],
    "parsedAbilities": [
      "SOLAR_POWER",
      "SOLAR_POWER",
      "SOLAR_POWER"
    ],
    "id": "SPECIES_HOUNDOOM_MEGA",
    "family": "P_FAMILY_HOUNDOUR",
    "baseHP": 75,
    "baseAttack": 90,
    "baseDefense": 90,
    "baseSpeed": 115,
    "baseSpAttack": 140,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FIRE)",
    "abilities": "{ ABILITY_SOLAR_POWER, ABILITY_SOLAR_POWER, ABILITY_SOLAR_POWER }",
    "speciesName": "_(\"Houndoom\")",
    "natDexNum": "NATIONAL_DEX_HOUNDOOM",
    "levelUpLearnset": "sHoundoomLevelUpLearnset",
    "teachableLearnset": "sHoundoomTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Phanpy",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "PICKUP",
      "NONE",
      "SAND_VEIL"
    ],
    "id": "SPECIES_PHANPY",
    "family": "P_FAMILY_PHANPY",
    "baseHP": 90,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 40,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_NONE, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Phanpy\")",
    "natDexNum": "NATIONAL_DEX_PHANPY",
    "levelUpLearnset": "sPhanpyLevelUpLearnset",
    "teachableLearnset": "sPhanpyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_DONPHAN})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Donphan",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "SAND_VEIL"
    ],
    "id": "SPECIES_DONPHAN",
    "family": "P_FAMILY_PHANPY",
    "baseHP": 90,
    "baseAttack": 120,
    "baseDefense": 120,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Donphan\")",
    "natDexNum": "NATIONAL_DEX_DONPHAN",
    "levelUpLearnset": "sDonphanLevelUpLearnset",
    "teachableLearnset": "sDonphanTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stantler",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_STANTLER",
    "family": "P_FAMILY_STANTLER",
    "baseHP": 73,
    "baseAttack": 95,
    "baseDefense": 62,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Stantler\")",
    "natDexNum": "NATIONAL_DEX_STANTLER",
    "levelUpLearnset": "sStantlerLevelUpLearnset",
    "teachableLearnset": "sStantlerTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_WYRDEER, CONDITIONS({IF_USED_MOVE_X_TIMES, MOVE_PSYSHIELD_BASH, 20})})",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wyrdeer",
    "parsedTypes": [
      "NORMAL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "FRISK",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_WYRDEER",
    "family": "P_FAMILY_STANTLER",
    "baseHP": 103,
    "baseAttack": 105,
    "baseDefense": 72,
    "baseSpeed": 65,
    "baseSpAttack": 105,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_FRISK, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Wyrdeer\")",
    "natDexNum": "NATIONAL_DEX_WYRDEER",
    "levelUpLearnset": "sWyrdeerLevelUpLearnset",
    "teachableLearnset": "sWyrdeerTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Smeargle",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "NONE",
      "MOODY"
    ],
    "id": "SPECIES_SMEARGLE",
    "family": "P_FAMILY_SMEARGLE",
    "baseHP": 55,
    "baseAttack": 20,
    "baseDefense": 35,
    "baseSpeed": 75,
    "baseSpAttack": 20,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_NONE, ABILITY_MOODY }",
    "speciesName": "_(\"Smeargle\")",
    "natDexNum": "NATIONAL_DEX_SMEARGLE",
    "levelUpLearnset": "sSmeargleLevelUpLearnset",
    "teachableLearnset": "sSmeargleTeachableLearnset",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Miltank",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "NONE",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_MILTANK",
    "family": "P_FAMILY_MILTANK",
    "baseHP": 95,
    "baseAttack": 80,
    "baseDefense": 105,
    "baseSpeed": 100,
    "baseSpAttack": 40,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_NONE, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Miltank\")",
    "natDexNum": "NATIONAL_DEX_MILTANK",
    "levelUpLearnset": "sMiltankLevelUpLearnset",
    "teachableLearnset": "sMiltankTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raikou",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "VOLT_ABSORB"
    ],
    "id": "SPECIES_RAIKOU",
    "family": "P_FAMILY_RAIKOU",
    "baseHP": 90,
    "baseAttack": 85,
    "baseDefense": 75,
    "baseSpeed": 115,
    "baseSpAttack": 115,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_VOLT_ABSORB }",
    "speciesName": "_(\"Raikou\")",
    "natDexNum": "NATIONAL_DEX_RAIKOU",
    "levelUpLearnset": "sRaikouLevelUpLearnset",
    "teachableLearnset": "sRaikouTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Entei",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_ENTEI",
    "family": "P_FAMILY_ENTEI",
    "baseHP": 115,
    "baseAttack": 115,
    "baseDefense": 85,
    "baseSpeed": 100,
    "baseSpAttack": 90,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Entei\")",
    "natDexNum": "NATIONAL_DEX_ENTEI",
    "levelUpLearnset": "sEnteiLevelUpLearnset",
    "teachableLearnset": "sEnteiTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Suicune",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_SUICUNE",
    "family": "P_FAMILY_SUICUNE",
    "baseHP": 100,
    "baseAttack": 75,
    "baseDefense": 115,
    "baseSpeed": 85,
    "baseSpAttack": 90,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Suicune\")",
    "natDexNum": "NATIONAL_DEX_SUICUNE",
    "levelUpLearnset": "sSuicuneLevelUpLearnset",
    "teachableLearnset": "sSuicuneTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Larvitar",
    "parsedTypes": [
      "ROCK",
      "GROUND"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "SAND_VEIL"
    ],
    "id": "SPECIES_LARVITAR",
    "family": "P_FAMILY_LARVITAR",
    "baseHP": 50,
    "baseAttack": 64,
    "baseDefense": 50,
    "baseSpeed": 41,
    "baseSpAttack": 45,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GROUND)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Larvitar\")",
    "natDexNum": "NATIONAL_DEX_LARVITAR",
    "levelUpLearnset": "sLarvitarLevelUpLearnset",
    "teachableLearnset": "sLarvitarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_PUPITAR})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pupitar",
    "parsedTypes": [
      "ROCK",
      "GROUND"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PUPITAR",
    "family": "P_FAMILY_LARVITAR",
    "baseHP": 70,
    "baseAttack": 84,
    "baseDefense": 70,
    "baseSpeed": 51,
    "baseSpAttack": 65,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GROUND)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Pupitar\")",
    "natDexNum": "NATIONAL_DEX_PUPITAR",
    "levelUpLearnset": "sPupitarLevelUpLearnset",
    "teachableLearnset": "sPupitarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 55, SPECIES_TYRANITAR})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tyranitar",
    "parsedTypes": [
      "ROCK",
      "DARK"
    ],
    "parsedAbilities": [
      "SAND_STREAM",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_TYRANITAR",
    "family": "P_FAMILY_LARVITAR",
    "baseHP": 100,
    "baseAttack": 134,
    "baseDefense": 110,
    "baseSpeed": 61,
    "baseSpAttack": 95,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_DARK)",
    "abilities": "{ ABILITY_SAND_STREAM, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Tyranitar\")",
    "natDexNum": "NATIONAL_DEX_TYRANITAR",
    "levelUpLearnset": "sTyranitarLevelUpLearnset",
    "teachableLearnset": "sTyranitarTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tyranitar  Mega",
    "parsedTypes": [
      "ROCK",
      "DARK"
    ],
    "parsedAbilities": [
      "SAND_STREAM",
      "SAND_STREAM",
      "SAND_STREAM"
    ],
    "id": "SPECIES_TYRANITAR_MEGA",
    "family": "P_FAMILY_LARVITAR",
    "baseHP": 100,
    "baseAttack": 164,
    "baseDefense": 150,
    "baseSpeed": 71,
    "baseSpAttack": 95,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_DARK)",
    "abilities": "{ ABILITY_SAND_STREAM, ABILITY_SAND_STREAM, ABILITY_SAND_STREAM }",
    "speciesName": "_(\"Tyranitar\")",
    "natDexNum": "NATIONAL_DEX_TYRANITAR",
    "levelUpLearnset": "sTyranitarLevelUpLearnset",
    "teachableLearnset": "sTyranitarTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lugia",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "MULTISCALE"
    ],
    "id": "SPECIES_LUGIA",
    "family": "P_FAMILY_LUGIA",
    "baseHP": 106,
    "baseAttack": 90,
    "baseDefense": 130,
    "baseSpeed": 110,
    "baseSpAttack": 90,
    "baseSpDefense": 154,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_MULTISCALE }",
    "speciesName": "_(\"Lugia\")",
    "natDexNum": "NATIONAL_DEX_LUGIA",
    "levelUpLearnset": "sLugiaLevelUpLearnset",
    "teachableLearnset": "sLugiaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ho  Oh",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "REGENERATOR"
    ],
    "id": "SPECIES_HO_OH",
    "family": "P_FAMILY_HO_OH",
    "baseHP": 106,
    "baseAttack": 130,
    "baseDefense": 90,
    "baseSpeed": 90,
    "baseSpAttack": 110,
    "baseSpDefense": 154,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Ho-Oh\")",
    "natDexNum": "NATIONAL_DEX_HO_OH",
    "levelUpLearnset": "sHoOhLevelUpLearnset",
    "teachableLearnset": "sHoOhTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Celebi",
    "parsedTypes": [
      "PSYCHIC",
      "GRASS"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CELEBI",
    "family": "P_FAMILY_CELEBI",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_GRASS)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Celebi\")",
    "natDexNum": "NATIONAL_DEX_CELEBI",
    "levelUpLearnset": "sCelebiLevelUpLearnset",
    "teachableLearnset": "sCelebiTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Treecko",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "UNBURDEN"
    ],
    "id": "SPECIES_TREECKO",
    "family": "P_FAMILY_TREECKO",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 35,
    "baseSpeed": 70,
    "baseSpAttack": 65,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Treecko\")",
    "natDexNum": "NATIONAL_DEX_TREECKO",
    "levelUpLearnset": "sTreeckoLevelUpLearnset",
    "teachableLearnset": "sTreeckoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_GROVYLE})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grovyle",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "UNBURDEN"
    ],
    "id": "SPECIES_GROVYLE",
    "family": "P_FAMILY_TREECKO",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 45,
    "baseSpeed": 95,
    "baseSpAttack": 85,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Grovyle\")",
    "natDexNum": "NATIONAL_DEX_GROVYLE",
    "levelUpLearnset": "sGrovyleLevelUpLearnset",
    "teachableLearnset": "sGrovyleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SCEPTILE})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sceptile",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "UNBURDEN"
    ],
    "id": "SPECIES_SCEPTILE",
    "family": "P_FAMILY_TREECKO",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 65,
    "baseSpeed": 120,
    "baseSpAttack": 105,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Sceptile\")",
    "natDexNum": "NATIONAL_DEX_SCEPTILE",
    "levelUpLearnset": "sSceptileLevelUpLearnset",
    "teachableLearnset": "sSceptileTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sceptile  Mega",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "LIGHTNING_ROD",
      "LIGHTNING_ROD"
    ],
    "id": "SPECIES_SCEPTILE_MEGA",
    "family": "P_FAMILY_TREECKO",
    "baseHP": 70,
    "baseAttack": 110,
    "baseDefense": 75,
    "baseSpeed": 145,
    "baseSpAttack": 145,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_LIGHTNING_ROD, ABILITY_LIGHTNING_ROD }",
    "speciesName": "_(\"Sceptile\")",
    "natDexNum": "NATIONAL_DEX_SCEPTILE",
    "levelUpLearnset": "sSceptileLevelUpLearnset",
    "teachableLearnset": "sSceptileTeachableLearnset",
    "baseBST": 630,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Torchic",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_TORCHIC",
    "family": "P_FAMILY_TORCHIC",
    "baseHP": 45,
    "baseAttack": 60,
    "baseDefense": 40,
    "baseSpeed": 45,
    "baseSpAttack": 70,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Torchic\")",
    "natDexNum": "NATIONAL_DEX_TORCHIC",
    "levelUpLearnset": "sTorchicLevelUpLearnset",
    "teachableLearnset": "sTorchicTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_COMBUSKEN})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Combusken",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_COMBUSKEN",
    "family": "P_FAMILY_TORCHIC",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 60,
    "baseSpeed": 55,
    "baseSpAttack": 85,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Combusken\")",
    "natDexNum": "NATIONAL_DEX_COMBUSKEN",
    "levelUpLearnset": "sCombuskenLevelUpLearnset",
    "teachableLearnset": "sCombuskenTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_BLAZIKEN})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blaziken",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_BLAZIKEN",
    "family": "P_FAMILY_TORCHIC",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 70,
    "baseSpeed": 80,
    "baseSpAttack": 110,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Blaziken\")",
    "natDexNum": "NATIONAL_DEX_BLAZIKEN",
    "levelUpLearnset": "sBlazikenLevelUpLearnset",
    "teachableLearnset": "sBlazikenTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blaziken  Mega",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SPEED_BOOST",
      "SPEED_BOOST",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_BLAZIKEN_MEGA",
    "family": "P_FAMILY_TORCHIC",
    "baseHP": 80,
    "baseAttack": 160,
    "baseDefense": 80,
    "baseSpeed": 100,
    "baseSpAttack": 130,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SPEED_BOOST, ABILITY_SPEED_BOOST, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Blaziken\")",
    "natDexNum": "NATIONAL_DEX_BLAZIKEN",
    "levelUpLearnset": "sBlazikenLevelUpLearnset",
    "teachableLearnset": "sBlazikenTeachableLearnset",
    "baseBST": 630,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mudkip",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_MUDKIP",
    "family": "P_FAMILY_MUDKIP",
    "baseHP": 50,
    "baseAttack": 70,
    "baseDefense": 50,
    "baseSpeed": 40,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Mudkip\")",
    "natDexNum": "NATIONAL_DEX_MUDKIP",
    "levelUpLearnset": "sMudkipLevelUpLearnset",
    "teachableLearnset": "sMudkipTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_MARSHTOMP})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Marshtomp",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_MARSHTOMP",
    "family": "P_FAMILY_MUDKIP",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 70,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Marshtomp\")",
    "natDexNum": "NATIONAL_DEX_MARSHTOMP",
    "levelUpLearnset": "sMarshtompLevelUpLearnset",
    "teachableLearnset": "sMarshtompTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SWAMPERT})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swampert",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "DAMP"
    ],
    "id": "SPECIES_SWAMPERT",
    "family": "P_FAMILY_MUDKIP",
    "baseHP": 100,
    "baseAttack": 110,
    "baseDefense": 90,
    "baseSpeed": 60,
    "baseSpAttack": 85,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_DAMP }",
    "speciesName": "_(\"Swampert\")",
    "natDexNum": "NATIONAL_DEX_SWAMPERT",
    "levelUpLearnset": "sSwampertLevelUpLearnset",
    "teachableLearnset": "sSwampertTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swampert  Mega",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "SWIFT_SWIM",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_SWAMPERT_MEGA",
    "family": "P_FAMILY_MUDKIP",
    "baseHP": 100,
    "baseAttack": 150,
    "baseDefense": 110,
    "baseSpeed": 70,
    "baseSpAttack": 95,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_SWIFT_SWIM, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Swampert\")",
    "natDexNum": "NATIONAL_DEX_SWAMPERT",
    "levelUpLearnset": "sSwampertLevelUpLearnset",
    "teachableLearnset": "sSwampertTeachableLearnset",
    "baseBST": 635,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poochyena",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_POOCHYENA",
    "family": "P_FAMILY_POOCHYENA",
    "baseHP": 35,
    "baseAttack": 55,
    "baseDefense": 35,
    "baseSpeed": 35,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Poochyena\")",
    "natDexNum": "NATIONAL_DEX_POOCHYENA",
    "levelUpLearnset": "sPoochyenaLevelUpLearnset",
    "teachableLearnset": "sPoochyenaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_MIGHTYENA})",
    "baseBST": 220,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mightyena",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_MIGHTYENA",
    "family": "P_FAMILY_POOCHYENA",
    "baseHP": 70,
    "baseAttack": 90,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Mightyena\")",
    "natDexNum": "NATIONAL_DEX_MIGHTYENA",
    "levelUpLearnset": "sMightyenaLevelUpLearnset",
    "teachableLearnset": "sMightyenaTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zigzagoon",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "NONE",
      "QUICK_FEET"
    ],
    "id": "SPECIES_ZIGZAGOON",
    "family": "P_FAMILY_ZIGZAGOON",
    "baseHP": 38,
    "baseAttack": 30,
    "baseDefense": 41,
    "baseSpeed": 60,
    "baseSpAttack": 30,
    "baseSpDefense": 41,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_NONE, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Zigzagoon\")",
    "natDexNum": "NATIONAL_DEX_ZIGZAGOON",
    "levelUpLearnset": "sZigzagoonLevelUpLearnset",
    "teachableLearnset": "sZigzagoonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_LINOONE})",
    "baseBST": 240,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Linoone",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "NONE",
      "QUICK_FEET"
    ],
    "id": "SPECIES_LINOONE",
    "family": "P_FAMILY_ZIGZAGOON",
    "baseHP": 78,
    "baseAttack": 70,
    "baseDefense": 61,
    "baseSpeed": 100,
    "baseSpAttack": 50,
    "baseSpDefense": 61,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_NONE, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Linoone\")",
    "natDexNum": "NATIONAL_DEX_LINOONE",
    "levelUpLearnset": "sLinooneLevelUpLearnset",
    "teachableLearnset": "sLinooneTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zigzagoon  Galar",
    "parsedTypes": [
      "DARK",
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "GLUTTONY",
      "QUICK_FEET"
    ],
    "id": "SPECIES_ZIGZAGOON_GALAR",
    "family": "P_FAMILY_ZIGZAGOON",
    "baseHP": 38,
    "baseAttack": 30,
    "baseDefense": 41,
    "baseSpeed": 60,
    "baseSpAttack": 30,
    "baseSpDefense": 41,
    "types": "MON_TYPES(TYPE_DARK, TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_GLUTTONY, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Zigzagoon\")",
    "natDexNum": "NATIONAL_DEX_ZIGZAGOON",
    "levelUpLearnset": "sZigzagoonGalarLevelUpLearnset",
    "teachableLearnset": "sZigzagoonGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_LINOONE_GALAR})",
    "baseBST": 240,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Linoone  Galar",
    "parsedTypes": [
      "DARK",
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "GLUTTONY",
      "QUICK_FEET"
    ],
    "id": "SPECIES_LINOONE_GALAR",
    "family": "P_FAMILY_ZIGZAGOON",
    "baseHP": 78,
    "baseAttack": 70,
    "baseDefense": 61,
    "baseSpeed": 100,
    "baseSpAttack": 50,
    "baseSpDefense": 61,
    "types": "MON_TYPES(TYPE_DARK, TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_GLUTTONY, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Linoone\")",
    "natDexNum": "NATIONAL_DEX_LINOONE",
    "levelUpLearnset": "sLinooneGalarLevelUpLearnset",
    "teachableLearnset": "sLinooneGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_OBSTAGOON, CONDITIONS({IF_TIME, TIME_NIGHT})})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Obstagoon",
    "parsedTypes": [
      "DARK",
      "NORMAL"
    ],
    "parsedAbilities": [
      "RECKLESS",
      "GUTS",
      "DEFIANT"
    ],
    "id": "SPECIES_OBSTAGOON",
    "family": "P_FAMILY_ZIGZAGOON",
    "baseHP": 93,
    "baseAttack": 90,
    "baseDefense": 101,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 81,
    "types": "MON_TYPES(TYPE_DARK, TYPE_NORMAL)",
    "abilities": "{ ABILITY_RECKLESS, ABILITY_GUTS, ABILITY_DEFIANT }",
    "speciesName": "_(\"Obstagoon\")",
    "natDexNum": "NATIONAL_DEX_OBSTAGOON",
    "levelUpLearnset": "sObstagoonLevelUpLearnset",
    "teachableLearnset": "sObstagoonTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wurmple",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_WURMPLE",
    "family": "P_FAMILY_WURMPLE",
    "baseHP": 45,
    "baseAttack": 45,
    "baseDefense": 35,
    "baseSpeed": 20,
    "baseSpAttack": 20,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Wurmple\")",
    "natDexNum": "NATIONAL_DEX_WURMPLE",
    "levelUpLearnset": "sWurmpleLevelUpLearnset",
    "teachableLearnset": "sWurmpleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 7, SPECIES_SILCOON, CONDITIONS({IF_PID_UPPER_MODULO_10_GT, 4})}",
    "baseBST": 195,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Silcoon",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SILCOON",
    "family": "P_FAMILY_WURMPLE",
    "baseHP": 50,
    "baseAttack": 35,
    "baseDefense": 55,
    "baseSpeed": 15,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Silcoon\")",
    "natDexNum": "NATIONAL_DEX_SILCOON",
    "levelUpLearnset": "sSilcoonLevelUpLearnset",
    "teachableLearnset": "sSilcoonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 10, SPECIES_BEAUTIFLY})",
    "baseBST": 205,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Beautifly",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "RIVALRY"
    ],
    "id": "SPECIES_BEAUTIFLY",
    "family": "P_FAMILY_WURMPLE",
    "baseHP": 60,
    "baseAttack": 70,
    "baseDefense": 50,
    "baseSpeed": 65,
    "baseSpAttack": 100,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_RIVALRY }",
    "speciesName": "_(\"Beautifly\")",
    "natDexNum": "NATIONAL_DEX_BEAUTIFLY",
    "levelUpLearnset": "sBeautiflyLevelUpLearnset",
    "teachableLearnset": "sBeautiflyTeachableLearnset",
    "baseBST": 395,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cascoon",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CASCOON",
    "family": "P_FAMILY_WURMPLE",
    "baseHP": 50,
    "baseAttack": 35,
    "baseDefense": 55,
    "baseSpeed": 15,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cascoon\")",
    "natDexNum": "NATIONAL_DEX_CASCOON",
    "levelUpLearnset": "sCascoonLevelUpLearnset",
    "teachableLearnset": "sCascoonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 10, SPECIES_DUSTOX})",
    "baseBST": 205,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dustox",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "COMPOUND_EYES"
    ],
    "id": "SPECIES_DUSTOX",
    "family": "P_FAMILY_WURMPLE",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 70,
    "baseSpeed": 65,
    "baseSpAttack": 50,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_COMPOUND_EYES }",
    "speciesName": "_(\"Dustox\")",
    "natDexNum": "NATIONAL_DEX_DUSTOX",
    "levelUpLearnset": "sDustoxLevelUpLearnset",
    "teachableLearnset": "sDustoxTeachableLearnset",
    "baseBST": 385,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lotad",
    "parsedTypes": [
      "WATER",
      "GRASS"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "RAIN_DISH",
      "OWN_TEMPO"
    ],
    "id": "SPECIES_LOTAD",
    "family": "P_FAMILY_LOTAD",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 30,
    "baseSpeed": 30,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GRASS)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_RAIN_DISH, ABILITY_OWN_TEMPO }",
    "speciesName": "_(\"Lotad\")",
    "natDexNum": "NATIONAL_DEX_LOTAD",
    "levelUpLearnset": "sLotadLevelUpLearnset",
    "teachableLearnset": "sLotadTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 14, SPECIES_LOMBRE})",
    "baseBST": 220,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lombre",
    "parsedTypes": [
      "WATER",
      "GRASS"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "RAIN_DISH",
      "OWN_TEMPO"
    ],
    "id": "SPECIES_LOMBRE",
    "family": "P_FAMILY_LOTAD",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 50,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GRASS)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_RAIN_DISH, ABILITY_OWN_TEMPO }",
    "speciesName": "_(\"Lombre\")",
    "natDexNum": "NATIONAL_DEX_LOMBRE",
    "levelUpLearnset": "sLombreLevelUpLearnset",
    "teachableLearnset": "sLombreTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_WATER_STONE, SPECIES_LUDICOLO})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ludicolo",
    "parsedTypes": [
      "WATER",
      "GRASS"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "RAIN_DISH",
      "OWN_TEMPO"
    ],
    "id": "SPECIES_LUDICOLO",
    "family": "P_FAMILY_LOTAD",
    "baseHP": 80,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 90,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GRASS)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_RAIN_DISH, ABILITY_OWN_TEMPO }",
    "speciesName": "_(\"Ludicolo\")",
    "natDexNum": "NATIONAL_DEX_LUDICOLO",
    "levelUpLearnset": "sLudicoloLevelUpLearnset",
    "teachableLearnset": "sLudicoloTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Seedot",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "EARLY_BIRD",
      "PICKPOCKET"
    ],
    "id": "SPECIES_SEEDOT",
    "family": "P_FAMILY_SEEDOT",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 50,
    "baseSpeed": 30,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_EARLY_BIRD, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Seedot\")",
    "natDexNum": "NATIONAL_DEX_SEEDOT",
    "levelUpLearnset": "sSeedotLevelUpLearnset",
    "teachableLearnset": "sSeedotTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 14, SPECIES_NUZLEAF})",
    "baseBST": 220,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nuzleaf",
    "parsedTypes": [
      "GRASS",
      "DARK"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "EARLY_BIRD",
      "PICKPOCKET"
    ],
    "id": "SPECIES_NUZLEAF",
    "family": "P_FAMILY_SEEDOT",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 40,
    "baseSpeed": 60,
    "baseSpAttack": 60,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DARK)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_EARLY_BIRD, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Nuzleaf\")",
    "natDexNum": "NATIONAL_DEX_NUZLEAF",
    "levelUpLearnset": "sNuzleafLevelUpLearnset",
    "teachableLearnset": "sNuzleafTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_LEAF_STONE, SPECIES_SHIFTRY})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shiftry",
    "parsedTypes": [
      "GRASS",
      "DARK"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "EARLY_BIRD",
      "PICKPOCKET"
    ],
    "id": "SPECIES_SHIFTRY",
    "family": "P_FAMILY_SEEDOT",
    "baseHP": 90,
    "baseAttack": 100,
    "baseDefense": 60,
    "baseSpeed": 80,
    "baseSpAttack": 90,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DARK)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_EARLY_BIRD, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Shiftry\")",
    "natDexNum": "NATIONAL_DEX_SHIFTRY",
    "levelUpLearnset": "sShiftryLevelUpLearnset",
    "teachableLearnset": "sShiftryTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Taillow",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_TAILLOW",
    "family": "P_FAMILY_TAILLOW",
    "baseHP": 40,
    "baseAttack": 55,
    "baseDefense": 30,
    "baseSpeed": 85,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Taillow\")",
    "natDexNum": "NATIONAL_DEX_TAILLOW",
    "levelUpLearnset": "sTaillowLevelUpLearnset",
    "teachableLearnset": "sTaillowTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_SWELLOW})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swellow",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "GUTS",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_SWELLOW",
    "family": "P_FAMILY_TAILLOW",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 60,
    "baseSpeed": 125,
    "baseSpAttack": 75,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Swellow\")",
    "natDexNum": "NATIONAL_DEX_SWELLOW",
    "levelUpLearnset": "sSwellowLevelUpLearnset",
    "teachableLearnset": "sSwellowTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wingull",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_WINGULL",
    "family": "P_FAMILY_WINGULL",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 30,
    "baseSpeed": 85,
    "baseSpAttack": 55,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Wingull\")",
    "natDexNum": "NATIONAL_DEX_WINGULL",
    "levelUpLearnset": "sWingullLevelUpLearnset",
    "teachableLearnset": "sWingullTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_PELIPPER})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pelipper",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_PELIPPER",
    "family": "P_FAMILY_WINGULL",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 100,
    "baseSpeed": 65,
    "baseSpAttack": 95,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Pelipper\")",
    "natDexNum": "NATIONAL_DEX_PELIPPER",
    "levelUpLearnset": "sPelipperLevelUpLearnset",
    "teachableLearnset": "sPelipperTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ralts",
    "parsedTypes": [
      "PSYCHIC",
      "RALTS_FAMILY_TYPE2"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "TRACE",
      "TELEPATHY"
    ],
    "id": "SPECIES_RALTS",
    "family": "P_FAMILY_RALTS",
    "baseHP": 28,
    "baseAttack": 25,
    "baseDefense": 25,
    "baseSpeed": 40,
    "baseSpAttack": 45,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_TRACE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Ralts\")",
    "natDexNum": "NATIONAL_DEX_RALTS",
    "levelUpLearnset": "sRaltsLevelUpLearnset",
    "teachableLearnset": "sRaltsTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_KIRLIA})",
    "baseBST": 198,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kirlia",
    "parsedTypes": [
      "PSYCHIC",
      "RALTS_FAMILY_TYPE2"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "TRACE",
      "TELEPATHY"
    ],
    "id": "SPECIES_KIRLIA",
    "family": "P_FAMILY_RALTS",
    "baseHP": 38,
    "baseAttack": 35,
    "baseDefense": 35,
    "baseSpeed": 50,
    "baseSpAttack": 65,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_TRACE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Kirlia\")",
    "natDexNum": "NATIONAL_DEX_KIRLIA",
    "levelUpLearnset": "sKirliaLevelUpLearnset",
    "teachableLearnset": "sKirliaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_GARDEVOIR}",
    "baseBST": 278,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gardevoir",
    "parsedTypes": [
      "PSYCHIC",
      "RALTS_FAMILY_TYPE2"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "TRACE",
      "TELEPATHY"
    ],
    "id": "SPECIES_GARDEVOIR",
    "family": "P_FAMILY_RALTS",
    "baseHP": 68,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 80,
    "baseSpAttack": 125,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_TRACE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Gardevoir\")",
    "natDexNum": "NATIONAL_DEX_GARDEVOIR",
    "levelUpLearnset": "sGardevoirLevelUpLearnset",
    "teachableLearnset": "sGardevoirTeachableLearnset",
    "baseBST": 518,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gardevoir  Mega",
    "parsedTypes": [
      "PSYCHIC",
      "RALTS_FAMILY_TYPE2"
    ],
    "parsedAbilities": [
      "PIXILATE",
      "PIXILATE",
      "PIXILATE"
    ],
    "id": "SPECIES_GARDEVOIR_MEGA",
    "family": "P_FAMILY_RALTS",
    "baseHP": 68,
    "baseAttack": 85,
    "baseDefense": 65,
    "baseSpeed": 100,
    "baseSpAttack": 165,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2)",
    "abilities": "{ ABILITY_PIXILATE, ABILITY_PIXILATE, ABILITY_PIXILATE }",
    "speciesName": "_(\"Gardevoir\")",
    "natDexNum": "NATIONAL_DEX_GARDEVOIR",
    "levelUpLearnset": "sGardevoirLevelUpLearnset",
    "teachableLearnset": "sGardevoirTeachableLearnset",
    "baseBST": 618,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gallade",
    "parsedTypes": [
      "PSYCHIC",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "STEADFAST",
      "NONE",
      "JUSTIFIED"
    ],
    "id": "SPECIES_GALLADE",
    "family": "P_FAMILY_RALTS",
    "baseHP": 68,
    "baseAttack": 125,
    "baseDefense": 65,
    "baseSpeed": 80,
    "baseSpAttack": 65,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_STEADFAST, ABILITY_NONE, ABILITY_JUSTIFIED }",
    "speciesName": "_(\"Gallade\")",
    "natDexNum": "NATIONAL_DEX_GALLADE",
    "levelUpLearnset": "sGalladeLevelUpLearnset",
    "teachableLearnset": "sGalladeTeachableLearnset",
    "baseBST": 518,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gallade  Mega",
    "parsedTypes": [
      "PSYCHIC",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "INNER_FOCUS",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_GALLADE_MEGA",
    "family": "P_FAMILY_RALTS",
    "baseHP": 68,
    "baseAttack": 165,
    "baseDefense": 95,
    "baseSpeed": 110,
    "baseSpAttack": 65,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_INNER_FOCUS, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Gallade\")",
    "natDexNum": "NATIONAL_DEX_GALLADE",
    "levelUpLearnset": "sGalladeLevelUpLearnset",
    "teachableLearnset": "sGalladeTeachableLearnset",
    "baseBST": 618,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Surskit",
    "parsedTypes": [
      "BUG",
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_SURSKIT",
    "family": "P_FAMILY_SURSKIT",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 32,
    "baseSpeed": 65,
    "baseSpAttack": 50,
    "baseSpDefense": 52,
    "types": "MON_TYPES(TYPE_BUG, TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Surskit\")",
    "natDexNum": "NATIONAL_DEX_SURSKIT",
    "levelUpLearnset": "sSurskitLevelUpLearnset",
    "teachableLearnset": "sSurskitTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_MASQUERAIN})",
    "baseBST": 269,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Masquerain",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_MASQUERAIN",
    "family": "P_FAMILY_SURSKIT",
    "baseHP": 70,
    "baseAttack": 60,
    "baseDefense": 62,
    "baseSpeed": 80,
    "baseSpAttack": 100,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Masquerain\")",
    "natDexNum": "NATIONAL_DEX_MASQUERAIN",
    "levelUpLearnset": "sMasquerainLevelUpLearnset",
    "teachableLearnset": "sMasquerainTeachableLearnset",
    "baseBST": 454,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shroomish",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "EFFECT_SPORE",
      "NONE",
      "QUICK_FEET"
    ],
    "id": "SPECIES_SHROOMISH",
    "family": "P_FAMILY_SHROOMISH",
    "baseHP": 60,
    "baseAttack": 40,
    "baseDefense": 60,
    "baseSpeed": 35,
    "baseSpAttack": 40,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_EFFECT_SPORE, ABILITY_NONE, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Shroomish\")",
    "natDexNum": "NATIONAL_DEX_SHROOMISH",
    "levelUpLearnset": "sShroomishLevelUpLearnset",
    "teachableLearnset": "sShroomishTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 23, SPECIES_BRELOOM})",
    "baseBST": 295,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Breloom",
    "parsedTypes": [
      "GRASS",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "EFFECT_SPORE",
      "NONE",
      "TECHNICIAN"
    ],
    "id": "SPECIES_BRELOOM",
    "family": "P_FAMILY_SHROOMISH",
    "baseHP": 60,
    "baseAttack": 130,
    "baseDefense": 80,
    "baseSpeed": 70,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_EFFECT_SPORE, ABILITY_NONE, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Breloom\")",
    "natDexNum": "NATIONAL_DEX_BRELOOM",
    "levelUpLearnset": "sBreloomLevelUpLearnset",
    "teachableLearnset": "sBreloomTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slakoth",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TRUANT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SLAKOTH",
    "family": "P_FAMILY_SLAKOTH",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 30,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TRUANT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Slakoth\")",
    "natDexNum": "NATIONAL_DEX_SLAKOTH",
    "levelUpLearnset": "sSlakothLevelUpLearnset",
    "teachableLearnset": "sSlakothTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_VIGOROTH})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vigoroth",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_VIGOROTH",
    "family": "P_FAMILY_SLAKOTH",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 90,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Vigoroth\")",
    "natDexNum": "NATIONAL_DEX_VIGOROTH",
    "levelUpLearnset": "sVigorothLevelUpLearnset",
    "teachableLearnset": "sVigorothTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SLAKING})",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slaking",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TRUANT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SLAKING",
    "family": "P_FAMILY_SLAKOTH",
    "baseHP": 150,
    "baseAttack": 160,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 95,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TRUANT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Slaking\")",
    "natDexNum": "NATIONAL_DEX_SLAKING",
    "levelUpLearnset": "sSlakingLevelUpLearnset",
    "teachableLearnset": "sSlakingTeachableLearnset",
    "baseBST": 670,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nincada",
    "parsedTypes": [
      "BUG",
      "GROUND"
    ],
    "parsedAbilities": [
      "COMPOUND_EYES",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_NINCADA",
    "family": "P_FAMILY_NINCADA",
    "baseHP": 31,
    "baseAttack": 45,
    "baseDefense": 90,
    "baseSpeed": 40,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GROUND)",
    "abilities": "{ ABILITY_COMPOUND_EYES, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Nincada\")",
    "natDexNum": "NATIONAL_DEX_NINCADA",
    "levelUpLearnset": "sNincadaLevelUpLearnset",
    "teachableLearnset": "sNincadaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_NINJASK}",
    "baseBST": 266,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ninjask",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "SPEED_BOOST",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_NINJASK",
    "family": "P_FAMILY_NINCADA",
    "baseHP": 61,
    "baseAttack": 90,
    "baseDefense": 45,
    "baseSpeed": 160,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_SPEED_BOOST, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Ninjask\")",
    "natDexNum": "NATIONAL_DEX_NINJASK",
    "levelUpLearnset": "sNinjaskLevelUpLearnset",
    "teachableLearnset": "sNinjaskTeachableLearnset",
    "baseBST": 456,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shedinja",
    "parsedTypes": [
      "BUG",
      "GHOST"
    ],
    "parsedAbilities": [
      "WONDER_GUARD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SHEDINJA",
    "family": "P_FAMILY_NINCADA",
    "baseHP": 1,
    "baseAttack": 90,
    "baseDefense": 45,
    "baseSpeed": 40,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GHOST)",
    "abilities": "{ ABILITY_WONDER_GUARD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Shedinja\")",
    "natDexNum": "NATIONAL_DEX_SHEDINJA",
    "levelUpLearnset": "sShedinjaLevelUpLearnset",
    "teachableLearnset": "sShedinjaTeachableLearnset",
    "baseBST": 236,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Whismur",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_WHISMUR",
    "family": "P_FAMILY_WHISMUR",
    "baseHP": 64,
    "baseAttack": 51,
    "baseDefense": 23,
    "baseSpeed": 28,
    "baseSpAttack": 51,
    "baseSpDefense": 23,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Whismur\")",
    "natDexNum": "NATIONAL_DEX_WHISMUR",
    "levelUpLearnset": "sWhismurLevelUpLearnset",
    "teachableLearnset": "sWhismurTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_LOUDRED})",
    "baseBST": 240,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Loudred",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_LOUDRED",
    "family": "P_FAMILY_WHISMUR",
    "baseHP": 84,
    "baseAttack": 71,
    "baseDefense": 43,
    "baseSpeed": 48,
    "baseSpAttack": 71,
    "baseSpDefense": 43,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Loudred\")",
    "natDexNum": "NATIONAL_DEX_LOUDRED",
    "levelUpLearnset": "sLoudredLevelUpLearnset",
    "teachableLearnset": "sLoudredTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_EXPLOUD})",
    "baseBST": 360,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Exploud",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SOUNDPROOF",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_EXPLOUD",
    "family": "P_FAMILY_WHISMUR",
    "baseHP": 104,
    "baseAttack": 91,
    "baseDefense": 63,
    "baseSpeed": 68,
    "baseSpAttack": 91,
    "baseSpDefense": 73,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SOUNDPROOF, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Exploud\")",
    "natDexNum": "NATIONAL_DEX_EXPLOUD",
    "levelUpLearnset": "sExploudLevelUpLearnset",
    "teachableLearnset": "sExploudTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Makuhita",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "GUTS",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_MAKUHITA",
    "family": "P_FAMILY_MAKUHITA",
    "baseHP": 72,
    "baseAttack": 60,
    "baseDefense": 30,
    "baseSpeed": 25,
    "baseSpAttack": 20,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_GUTS, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Makuhita\")",
    "natDexNum": "NATIONAL_DEX_MAKUHITA",
    "levelUpLearnset": "sMakuhitaLevelUpLearnset",
    "teachableLearnset": "sMakuhitaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_HARIYAMA})",
    "baseBST": 237,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hariyama",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "GUTS",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_HARIYAMA",
    "family": "P_FAMILY_MAKUHITA",
    "baseHP": 144,
    "baseAttack": 120,
    "baseDefense": 60,
    "baseSpeed": 50,
    "baseSpAttack": 40,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_GUTS, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Hariyama\")",
    "natDexNum": "NATIONAL_DEX_HARIYAMA",
    "levelUpLearnset": "sHariyamaLevelUpLearnset",
    "teachableLearnset": "sHariyamaTeachableLearnset",
    "baseBST": 474,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nosepass",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "MAGNET_PULL",
      "SAND_FORCE"
    ],
    "id": "SPECIES_NOSEPASS",
    "family": "P_FAMILY_NOSEPASS",
    "baseHP": 30,
    "baseAttack": 45,
    "baseDefense": 135,
    "baseSpeed": 30,
    "baseSpAttack": 45,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_MAGNET_PULL, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Nosepass\")",
    "natDexNum": "NATIONAL_DEX_NOSEPASS",
    "levelUpLearnset": "sNosepassLevelUpLearnset",
    "teachableLearnset": "sNosepassTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_PROBOPASS, CONDITIONS({IF_IN_MAPSEC, MAPSEC_NEW_MAUVILLE})}",
    "baseBST": 375,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Probopass",
    "parsedTypes": [
      "ROCK",
      "STEEL"
    ],
    "parsedAbilities": [
      "STURDY",
      "MAGNET_PULL",
      "SAND_FORCE"
    ],
    "id": "SPECIES_PROBOPASS",
    "family": "P_FAMILY_NOSEPASS",
    "baseHP": 60,
    "baseAttack": 55,
    "baseDefense": 145,
    "baseSpeed": 40,
    "baseSpAttack": 75,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_STEEL)",
    "abilities": "{ ABILITY_STURDY, ABILITY_MAGNET_PULL, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Probopass\")",
    "natDexNum": "NATIONAL_DEX_PROBOPASS",
    "levelUpLearnset": "sProbopassLevelUpLearnset",
    "teachableLearnset": "sProbopassTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skitty",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "WONDER_SKIN"
    ],
    "id": "SPECIES_SKITTY",
    "family": "P_FAMILY_SKITTY",
    "baseHP": 50,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_WONDER_SKIN }",
    "speciesName": "_(\"Skitty\")",
    "natDexNum": "NATIONAL_DEX_SKITTY",
    "levelUpLearnset": "sSkittyLevelUpLearnset",
    "teachableLearnset": "sSkittyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MOON_STONE, SPECIES_DELCATTY})",
    "baseBST": 260,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Delcatty",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "WONDER_SKIN"
    ],
    "id": "SPECIES_DELCATTY",
    "family": "P_FAMILY_SKITTY",
    "baseHP": 70,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 90,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_WONDER_SKIN }",
    "speciesName": "_(\"Delcatty\")",
    "natDexNum": "NATIONAL_DEX_DELCATTY",
    "levelUpLearnset": "sDelcattyLevelUpLearnset",
    "teachableLearnset": "sDelcattyTeachableLearnset",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sableye",
    "parsedTypes": [
      "DARK",
      "GHOST"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "PRANKSTER"
    ],
    "id": "SPECIES_SABLEYE",
    "family": "P_FAMILY_SABLEYE",
    "baseHP": 50,
    "baseAttack": 75,
    "baseDefense": 75,
    "baseSpeed": 50,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DARK, TYPE_GHOST)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Sableye\")",
    "natDexNum": "NATIONAL_DEX_SABLEYE",
    "levelUpLearnset": "sSableyeLevelUpLearnset",
    "teachableLearnset": "sSableyeTeachableLearnset",
    "baseBST": 380,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sableye  Mega",
    "parsedTypes": [
      "DARK",
      "GHOST"
    ],
    "parsedAbilities": [
      "MAGIC_BOUNCE",
      "MAGIC_BOUNCE",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_SABLEYE_MEGA",
    "family": "P_FAMILY_SABLEYE",
    "baseHP": 50,
    "baseAttack": 85,
    "baseDefense": 125,
    "baseSpeed": 20,
    "baseSpAttack": 85,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_DARK, TYPE_GHOST)",
    "abilities": "{ ABILITY_MAGIC_BOUNCE, ABILITY_MAGIC_BOUNCE, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Sableye\")",
    "natDexNum": "NATIONAL_DEX_SABLEYE",
    "levelUpLearnset": "sSableyeLevelUpLearnset",
    "teachableLearnset": "sSableyeTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mawile",
    "parsedTypes": [
      "MAWILE_TYPES"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "INTIMIDATE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_MAWILE",
    "family": "P_FAMILY_MAWILE",
    "baseHP": 50,
    "baseAttack": 85,
    "baseDefense": 85,
    "baseSpeed": 50,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MAWILE_TYPES",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_INTIMIDATE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Mawile\")",
    "natDexNum": "NATIONAL_DEX_MAWILE",
    "levelUpLearnset": "sMawileLevelUpLearnset",
    "teachableLearnset": "sMawileTeachableLearnset",
    "baseBST": 380,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mawile  Mega",
    "parsedTypes": [
      "MAWILE_TYPES"
    ],
    "parsedAbilities": [
      "HUGE_POWER",
      "HUGE_POWER",
      "HUGE_POWER"
    ],
    "id": "SPECIES_MAWILE_MEGA",
    "family": "P_FAMILY_MAWILE",
    "baseHP": 50,
    "baseAttack": 105,
    "baseDefense": 125,
    "baseSpeed": 50,
    "baseSpAttack": 55,
    "baseSpDefense": 95,
    "types": "MAWILE_TYPES",
    "abilities": "{ ABILITY_HUGE_POWER, ABILITY_HUGE_POWER, ABILITY_HUGE_POWER }",
    "speciesName": "_(\"Mawile\")",
    "natDexNum": "NATIONAL_DEX_MAWILE",
    "levelUpLearnset": "sMawileLevelUpLearnset",
    "teachableLearnset": "sMawileTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aron",
    "parsedTypes": [
      "STEEL",
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "ROCK_HEAD",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_ARON",
    "family": "P_FAMILY_ARON",
    "baseHP": 50,
    "baseAttack": 70,
    "baseDefense": 100,
    "baseSpeed": 30,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_ROCK_HEAD, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Aron\")",
    "natDexNum": "NATIONAL_DEX_ARON",
    "levelUpLearnset": "sAronLevelUpLearnset",
    "teachableLearnset": "sAronTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_LAIRON})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lairon",
    "parsedTypes": [
      "STEEL",
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "ROCK_HEAD",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_LAIRON",
    "family": "P_FAMILY_ARON",
    "baseHP": 60,
    "baseAttack": 90,
    "baseDefense": 140,
    "baseSpeed": 40,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_ROCK_HEAD, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Lairon\")",
    "natDexNum": "NATIONAL_DEX_LAIRON",
    "levelUpLearnset": "sLaironLevelUpLearnset",
    "teachableLearnset": "sLaironTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_AGGRON})",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aggron",
    "parsedTypes": [
      "STEEL",
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "ROCK_HEAD",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_AGGRON",
    "family": "P_FAMILY_ARON",
    "baseHP": 70,
    "baseAttack": 110,
    "baseDefense": 180,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_ROCK_HEAD, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Aggron\")",
    "natDexNum": "NATIONAL_DEX_AGGRON",
    "levelUpLearnset": "sAggronLevelUpLearnset",
    "teachableLearnset": "sAggronTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aggron  Mega",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "FILTER",
      "FILTER",
      "FILTER"
    ],
    "id": "SPECIES_AGGRON_MEGA",
    "family": "P_FAMILY_ARON",
    "baseHP": 70,
    "baseAttack": 140,
    "baseDefense": 230,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_FILTER, ABILITY_FILTER, ABILITY_FILTER }",
    "speciesName": "_(\"Aggron\")",
    "natDexNum": "NATIONAL_DEX_AGGRON",
    "levelUpLearnset": "sAggronLevelUpLearnset",
    "teachableLearnset": "sAggronTeachableLearnset",
    "baseBST": 630,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meditite",
    "parsedTypes": [
      "FIGHTING",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PURE_POWER",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_MEDITITE",
    "family": "P_FAMILY_MEDITITE",
    "baseHP": 30,
    "baseAttack": 40,
    "baseDefense": 55,
    "baseSpeed": 60,
    "baseSpAttack": 40,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PURE_POWER, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Meditite\")",
    "natDexNum": "NATIONAL_DEX_MEDITITE",
    "levelUpLearnset": "sMedititeLevelUpLearnset",
    "teachableLearnset": "sMedititeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_MEDICHAM})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Medicham",
    "parsedTypes": [
      "FIGHTING",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PURE_POWER",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_MEDICHAM",
    "family": "P_FAMILY_MEDITITE",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 75,
    "baseSpeed": 80,
    "baseSpAttack": 60,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PURE_POWER, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Medicham\")",
    "natDexNum": "NATIONAL_DEX_MEDICHAM",
    "levelUpLearnset": "sMedichamLevelUpLearnset",
    "teachableLearnset": "sMedichamTeachableLearnset",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Medicham  Mega",
    "parsedTypes": [
      "FIGHTING",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PURE_POWER",
      "PURE_POWER",
      "PURE_POWER"
    ],
    "id": "SPECIES_MEDICHAM_MEGA",
    "family": "P_FAMILY_MEDITITE",
    "baseHP": 60,
    "baseAttack": 100,
    "baseDefense": 85,
    "baseSpeed": 100,
    "baseSpAttack": 80,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PURE_POWER, ABILITY_PURE_POWER, ABILITY_PURE_POWER }",
    "speciesName": "_(\"Medicham\")",
    "natDexNum": "NATIONAL_DEX_MEDICHAM",
    "levelUpLearnset": "sMedichamLevelUpLearnset",
    "teachableLearnset": "sMedichamTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Electrike",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "LIGHTNING_ROD",
      "MINUS"
    ],
    "id": "SPECIES_ELECTRIKE",
    "family": "P_FAMILY_ELECTRIKE",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 65,
    "baseSpAttack": 65,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_LIGHTNING_ROD, ABILITY_MINUS }",
    "speciesName": "_(\"Electrike\")",
    "natDexNum": "NATIONAL_DEX_ELECTRIKE",
    "levelUpLearnset": "sElectrikeLevelUpLearnset",
    "teachableLearnset": "sElectrikeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_MANECTRIC})",
    "baseBST": 295,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Manectric",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "LIGHTNING_ROD",
      "MINUS"
    ],
    "id": "SPECIES_MANECTRIC",
    "family": "P_FAMILY_ELECTRIKE",
    "baseHP": 70,
    "baseAttack": 75,
    "baseDefense": 60,
    "baseSpeed": 105,
    "baseSpAttack": 105,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_LIGHTNING_ROD, ABILITY_MINUS }",
    "speciesName": "_(\"Manectric\")",
    "natDexNum": "NATIONAL_DEX_MANECTRIC",
    "levelUpLearnset": "sManectricLevelUpLearnset",
    "teachableLearnset": "sManectricTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Manectric  Mega",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "INTIMIDATE",
      "INTIMIDATE"
    ],
    "id": "SPECIES_MANECTRIC_MEGA",
    "family": "P_FAMILY_ELECTRIKE",
    "baseHP": 70,
    "baseAttack": 75,
    "baseDefense": 80,
    "baseSpeed": 135,
    "baseSpAttack": 135,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_INTIMIDATE, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Manectric\")",
    "natDexNum": "NATIONAL_DEX_MANECTRIC",
    "levelUpLearnset": "sManectricLevelUpLearnset",
    "teachableLearnset": "sManectricTeachableLearnset",
    "baseBST": 575,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Plusle",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "PLUS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PLUSLE",
    "family": "P_FAMILY_PLUSLE",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 40,
    "baseSpeed": 95,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_PLUS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Plusle\")",
    "natDexNum": "NATIONAL_DEX_PLUSLE",
    "levelUpLearnset": "sPlusleLevelUpLearnset",
    "teachableLearnset": "sPlusleTeachableLearnset",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Minun",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "MINUS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MINUN",
    "family": "P_FAMILY_MINUN",
    "baseHP": 60,
    "baseAttack": 40,
    "baseDefense": 50,
    "baseSpeed": 95,
    "baseSpAttack": 75,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_MINUS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Minun\")",
    "natDexNum": "NATIONAL_DEX_MINUN",
    "levelUpLearnset": "sMinunLevelUpLearnset",
    "teachableLearnset": "sMinunTeachableLearnset",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Volbeat",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "ILLUMINATE",
      "SWARM",
      "PRANKSTER"
    ],
    "id": "SPECIES_VOLBEAT",
    "family": "P_FAMILY_VOLBEAT_ILLUMISE",
    "baseHP": 65,
    "baseAttack": 73,
    "baseDefense": 75,
    "baseSpeed": 85,
    "baseSpAttack": 47,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_ILLUMINATE, ABILITY_SWARM, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Volbeat\")",
    "natDexNum": "NATIONAL_DEX_VOLBEAT",
    "levelUpLearnset": "sVolbeatLevelUpLearnset",
    "teachableLearnset": "sVolbeatTeachableLearnset",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Illumise",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "PRANKSTER"
    ],
    "id": "SPECIES_ILLUMISE",
    "family": "P_FAMILY_VOLBEAT_ILLUMISE",
    "baseHP": 65,
    "baseAttack": 47,
    "baseDefense": 75,
    "baseSpeed": 85,
    "baseSpAttack": 73,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Illumise\")",
    "natDexNum": "NATIONAL_DEX_ILLUMISE",
    "levelUpLearnset": "sIllumiseLevelUpLearnset",
    "teachableLearnset": "sIllumiseTeachableLearnset",
    "baseBST": 430,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Budew",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "POISON_POINT",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_BUDEW",
    "family": "P_FAMILY_ROSELIA",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 35,
    "baseSpeed": 55,
    "baseSpAttack": 50,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_POISON_POINT, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Budew\")",
    "natDexNum": "NATIONAL_DEX_BUDEW",
    "levelUpLearnset": "sBudewLevelUpLearnset",
    "teachableLearnset": "sBudewTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_ROSELIA, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD},{IF_NOT_TIME, TIME_NIGHT})})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Roselia",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "POISON_POINT",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_ROSELIA",
    "family": "P_FAMILY_ROSELIA",
    "baseHP": 50,
    "baseAttack": 60,
    "baseDefense": 45,
    "baseSpeed": 65,
    "baseSpAttack": 100,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_POISON_POINT, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Roselia\")",
    "natDexNum": "NATIONAL_DEX_ROSELIA",
    "levelUpLearnset": "sRoseliaLevelUpLearnset",
    "teachableLearnset": "sRoseliaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SHINY_STONE, SPECIES_ROSERADE})",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Roserade",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "POISON_POINT",
      "TECHNICIAN"
    ],
    "id": "SPECIES_ROSERADE",
    "family": "P_FAMILY_ROSELIA",
    "baseHP": 60,
    "baseAttack": 70,
    "baseDefense": 65,
    "baseSpeed": 90,
    "baseSpAttack": 125,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_POISON_POINT, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Roserade\")",
    "natDexNum": "NATIONAL_DEX_ROSERADE",
    "levelUpLearnset": "sRoseradeLevelUpLearnset",
    "teachableLearnset": "sRoseradeTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gulpin",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "LIQUID_OOZE",
      "STICKY_HOLD",
      "GLUTTONY"
    ],
    "id": "SPECIES_GULPIN",
    "family": "P_FAMILY_GULPIN",
    "baseHP": 70,
    "baseAttack": 43,
    "baseDefense": 53,
    "baseSpeed": 40,
    "baseSpAttack": 43,
    "baseSpDefense": 53,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_LIQUID_OOZE, ABILITY_STICKY_HOLD, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Gulpin\")",
    "natDexNum": "NATIONAL_DEX_GULPIN",
    "levelUpLearnset": "sGulpinLevelUpLearnset",
    "teachableLearnset": "sGulpinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_SWALOT})",
    "baseBST": 302,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swalot",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "LIQUID_OOZE",
      "STICKY_HOLD",
      "GLUTTONY"
    ],
    "id": "SPECIES_SWALOT",
    "family": "P_FAMILY_GULPIN",
    "baseHP": 100,
    "baseAttack": 73,
    "baseDefense": 83,
    "baseSpeed": 55,
    "baseSpAttack": 73,
    "baseSpDefense": 83,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_LIQUID_OOZE, ABILITY_STICKY_HOLD, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Swalot\")",
    "natDexNum": "NATIONAL_DEX_SWALOT",
    "levelUpLearnset": "sSwalotLevelUpLearnset",
    "teachableLearnset": "sSwalotTeachableLearnset",
    "baseBST": 467,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Carvanha",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "ROUGH_SKIN",
      "NONE",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_CARVANHA",
    "family": "P_FAMILY_CARVANHA",
    "baseHP": 45,
    "baseAttack": 90,
    "baseDefense": 20,
    "baseSpeed": 65,
    "baseSpAttack": 65,
    "baseSpDefense": 20,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_ROUGH_SKIN, ABILITY_NONE, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Carvanha\")",
    "natDexNum": "NATIONAL_DEX_CARVANHA",
    "levelUpLearnset": "sCarvanhaLevelUpLearnset",
    "teachableLearnset": "sCarvanhaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_SHARPEDO})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sharpedo",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "ROUGH_SKIN",
      "NONE",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_SHARPEDO",
    "family": "P_FAMILY_CARVANHA",
    "baseHP": 70,
    "baseAttack": 120,
    "baseDefense": 40,
    "baseSpeed": 95,
    "baseSpAttack": 95,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_ROUGH_SKIN, ABILITY_NONE, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Sharpedo\")",
    "natDexNum": "NATIONAL_DEX_SHARPEDO",
    "levelUpLearnset": "sSharpedoLevelUpLearnset",
    "teachableLearnset": "sSharpedoTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sharpedo  Mega",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "STRONG_JAW",
      "STRONG_JAW"
    ],
    "id": "SPECIES_SHARPEDO_MEGA",
    "family": "P_FAMILY_CARVANHA",
    "baseHP": 70,
    "baseAttack": 140,
    "baseDefense": 70,
    "baseSpeed": 105,
    "baseSpAttack": 110,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_STRONG_JAW, ABILITY_STRONG_JAW }",
    "speciesName": "_(\"Sharpedo\")",
    "natDexNum": "NATIONAL_DEX_SHARPEDO",
    "levelUpLearnset": "sSharpedoLevelUpLearnset",
    "teachableLearnset": "sSharpedoTeachableLearnset",
    "baseBST": 560,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wailmer",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_VEIL",
      "OBLIVIOUS",
      "PRESSURE"
    ],
    "id": "SPECIES_WAILMER",
    "family": "P_FAMILY_WAILMER",
    "baseHP": 130,
    "baseAttack": 70,
    "baseDefense": 35,
    "baseSpeed": 60,
    "baseSpAttack": 70,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_VEIL, ABILITY_OBLIVIOUS, ABILITY_PRESSURE }",
    "speciesName": "_(\"Wailmer\")",
    "natDexNum": "NATIONAL_DEX_WAILMER",
    "levelUpLearnset": "sWailmerLevelUpLearnset",
    "teachableLearnset": "sWailmerTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_WAILORD})",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wailord",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_VEIL",
      "OBLIVIOUS",
      "PRESSURE"
    ],
    "id": "SPECIES_WAILORD",
    "family": "P_FAMILY_WAILMER",
    "baseHP": 170,
    "baseAttack": 90,
    "baseDefense": 45,
    "baseSpeed": 60,
    "baseSpAttack": 90,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_VEIL, ABILITY_OBLIVIOUS, ABILITY_PRESSURE }",
    "speciesName": "_(\"Wailord\")",
    "natDexNum": "NATIONAL_DEX_WAILORD",
    "levelUpLearnset": "sWailordLevelUpLearnset",
    "teachableLearnset": "sWailordTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Numel",
    "parsedTypes": [
      "FIRE",
      "GROUND"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "OWN_TEMPO"
    ],
    "id": "SPECIES_NUMEL",
    "family": "P_FAMILY_NUMEL",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 40,
    "baseSpeed": 35,
    "baseSpAttack": 65,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GROUND)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_OWN_TEMPO }",
    "speciesName": "_(\"Numel\")",
    "natDexNum": "NATIONAL_DEX_NUMEL",
    "levelUpLearnset": "sNumelLevelUpLearnset",
    "teachableLearnset": "sNumelTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 33, SPECIES_CAMERUPT})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Camerupt",
    "parsedTypes": [
      "FIRE",
      "GROUND"
    ],
    "parsedAbilities": [
      "MAGMA_ARMOR",
      "NONE",
      "ANGER_POINT"
    ],
    "id": "SPECIES_CAMERUPT",
    "family": "P_FAMILY_NUMEL",
    "baseHP": 70,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 40,
    "baseSpAttack": 105,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GROUND)",
    "abilities": "{ ABILITY_MAGMA_ARMOR, ABILITY_NONE, ABILITY_ANGER_POINT }",
    "speciesName": "_(\"Camerupt\")",
    "natDexNum": "NATIONAL_DEX_CAMERUPT",
    "levelUpLearnset": "sCameruptLevelUpLearnset",
    "teachableLearnset": "sCameruptTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Camerupt  Mega",
    "parsedTypes": [
      "FIRE",
      "GROUND"
    ],
    "parsedAbilities": [
      "SHEER_FORCE",
      "SHEER_FORCE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_CAMERUPT_MEGA",
    "family": "P_FAMILY_NUMEL",
    "baseHP": 70,
    "baseAttack": 120,
    "baseDefense": 100,
    "baseSpeed": 20,
    "baseSpAttack": 145,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GROUND)",
    "abilities": "{ ABILITY_SHEER_FORCE, ABILITY_SHEER_FORCE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Camerupt\")",
    "natDexNum": "NATIONAL_DEX_CAMERUPT",
    "levelUpLearnset": "sCameruptLevelUpLearnset",
    "teachableLearnset": "sCameruptTeachableLearnset",
    "baseBST": 560,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Torkoal",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "WHITE_SMOKE",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_TORKOAL",
    "family": "P_FAMILY_TORKOAL",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 140,
    "baseSpeed": 20,
    "baseSpAttack": 85,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_WHITE_SMOKE, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Torkoal\")",
    "natDexNum": "NATIONAL_DEX_TORKOAL",
    "levelUpLearnset": "sTorkoalLevelUpLearnset",
    "teachableLearnset": "sTorkoalTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spoink",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "OWN_TEMPO",
      "GLUTTONY"
    ],
    "id": "SPECIES_SPOINK",
    "family": "P_FAMILY_SPOINK",
    "baseHP": 60,
    "baseAttack": 25,
    "baseDefense": 35,
    "baseSpeed": 60,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_OWN_TEMPO, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Spoink\")",
    "natDexNum": "NATIONAL_DEX_SPOINK",
    "levelUpLearnset": "sSpoinkLevelUpLearnset",
    "teachableLearnset": "sSpoinkTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_GRUMPIG})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grumpig",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "OWN_TEMPO",
      "GLUTTONY"
    ],
    "id": "SPECIES_GRUMPIG",
    "family": "P_FAMILY_SPOINK",
    "baseHP": 80,
    "baseAttack": 45,
    "baseDefense": 65,
    "baseSpeed": 80,
    "baseSpAttack": 90,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_OWN_TEMPO, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Grumpig\")",
    "natDexNum": "NATIONAL_DEX_GRUMPIG",
    "levelUpLearnset": "sGrumpigLevelUpLearnset",
    "teachableLearnset": "sGrumpigTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spinda",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_SPINDA",
    "family": "P_FAMILY_SPINDA",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 60,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Spinda\")",
    "natDexNum": "NATIONAL_DEX_SPINDA",
    "levelUpLearnset": "sSpindaLevelUpLearnset",
    "teachableLearnset": "sSpindaTeachableLearnset",
    "baseBST": 360,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Trapinch",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "ARENA_TRAP",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_TRAPINCH",
    "family": "P_FAMILY_TRAPINCH",
    "baseHP": 45,
    "baseAttack": 100,
    "baseDefense": 45,
    "baseSpeed": 10,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_ARENA_TRAP, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Trapinch\")",
    "natDexNum": "NATIONAL_DEX_TRAPINCH",
    "levelUpLearnset": "sTrapinchLevelUpLearnset",
    "teachableLearnset": "sTrapinchTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_VIBRAVA})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vibrava",
    "parsedTypes": [
      "GROUND",
      "DRAGON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "LEVITATE",
      "LEVITATE"
    ],
    "id": "SPECIES_VIBRAVA",
    "family": "P_FAMILY_TRAPINCH",
    "baseHP": 50,
    "baseAttack": 70,
    "baseDefense": 50,
    "baseSpeed": 70,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_DRAGON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_LEVITATE, ABILITY_LEVITATE }",
    "speciesName": "_(\"Vibrava\")",
    "natDexNum": "NATIONAL_DEX_VIBRAVA",
    "levelUpLearnset": "sVibravaLevelUpLearnset",
    "teachableLearnset": "sVibravaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 45, SPECIES_FLYGON})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flygon",
    "parsedTypes": [
      "GROUND",
      "DRAGON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "LEVITATE",
      "LEVITATE"
    ],
    "id": "SPECIES_FLYGON",
    "family": "P_FAMILY_TRAPINCH",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 80,
    "baseSpeed": 100,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_DRAGON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_LEVITATE, ABILITY_LEVITATE }",
    "speciesName": "_(\"Flygon\")",
    "natDexNum": "NATIONAL_DEX_FLYGON",
    "levelUpLearnset": "sFlygonLevelUpLearnset",
    "teachableLearnset": "sFlygonTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cacnea",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_CACNEA",
    "family": "P_FAMILY_CACNEA",
    "baseHP": 50,
    "baseAttack": 85,
    "baseDefense": 40,
    "baseSpeed": 35,
    "baseSpAttack": 85,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Cacnea\")",
    "natDexNum": "NATIONAL_DEX_CACNEA",
    "levelUpLearnset": "sCacneaLevelUpLearnset",
    "teachableLearnset": "sCacneaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_CACTURNE})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cacturne",
    "parsedTypes": [
      "GRASS",
      "DARK"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_CACTURNE",
    "family": "P_FAMILY_CACNEA",
    "baseHP": 70,
    "baseAttack": 115,
    "baseDefense": 60,
    "baseSpeed": 55,
    "baseSpAttack": 115,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DARK)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Cacturne\")",
    "natDexNum": "NATIONAL_DEX_CACTURNE",
    "levelUpLearnset": "sCacturneLevelUpLearnset",
    "teachableLearnset": "sCacturneTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swablu",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "NONE",
      "CLOUD_NINE"
    ],
    "id": "SPECIES_SWABLU",
    "family": "P_FAMILY_SWABLU",
    "baseHP": 45,
    "baseAttack": 40,
    "baseDefense": 60,
    "baseSpeed": 50,
    "baseSpAttack": 40,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_NONE, ABILITY_CLOUD_NINE }",
    "speciesName": "_(\"Swablu\")",
    "natDexNum": "NATIONAL_DEX_SWABLU",
    "levelUpLearnset": "sSwabluLevelUpLearnset",
    "teachableLearnset": "sSwabluTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_ALTARIA})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Altaria",
    "parsedTypes": [
      "DRAGON",
      "FLYING"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "NONE",
      "CLOUD_NINE"
    ],
    "id": "SPECIES_ALTARIA",
    "family": "P_FAMILY_SWABLU",
    "baseHP": 75,
    "baseAttack": 70,
    "baseDefense": 90,
    "baseSpeed": 80,
    "baseSpAttack": 70,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FLYING)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_NONE, ABILITY_CLOUD_NINE }",
    "speciesName": "_(\"Altaria\")",
    "natDexNum": "NATIONAL_DEX_ALTARIA",
    "levelUpLearnset": "sAltariaLevelUpLearnset",
    "teachableLearnset": "sAltariaTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Altaria  Mega",
    "parsedTypes": [
      "DRAGON",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PIXILATE",
      "PIXILATE",
      "PIXILATE"
    ],
    "id": "SPECIES_ALTARIA_MEGA",
    "family": "P_FAMILY_SWABLU",
    "baseHP": 75,
    "baseAttack": 110,
    "baseDefense": 110,
    "baseSpeed": 80,
    "baseSpAttack": 110,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PIXILATE, ABILITY_PIXILATE, ABILITY_PIXILATE }",
    "speciesName": "_(\"Altaria\")",
    "natDexNum": "NATIONAL_DEX_ALTARIA",
    "levelUpLearnset": "sAltariaLevelUpLearnset",
    "teachableLearnset": "sAltariaTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zangoose",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "IMMUNITY",
      "NONE",
      "TOXIC_BOOST"
    ],
    "id": "SPECIES_ZANGOOSE",
    "family": "P_FAMILY_ZANGOOSE",
    "baseHP": 73,
    "baseAttack": 115,
    "baseDefense": 60,
    "baseSpeed": 90,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_IMMUNITY, ABILITY_NONE, ABILITY_TOXIC_BOOST }",
    "speciesName": "_(\"Zangoose\")",
    "natDexNum": "NATIONAL_DEX_ZANGOOSE",
    "levelUpLearnset": "sZangooseLevelUpLearnset",
    "teachableLearnset": "sZangooseTeachableLearnset",
    "baseBST": 458,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Seviper",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_SEVIPER",
    "family": "P_FAMILY_SEVIPER",
    "baseHP": 73,
    "baseAttack": 100,
    "baseDefense": 60,
    "baseSpeed": 65,
    "baseSpAttack": 100,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Seviper\")",
    "natDexNum": "NATIONAL_DEX_SEVIPER",
    "levelUpLearnset": "sSeviperLevelUpLearnset",
    "teachableLearnset": "sSeviperTeachableLearnset",
    "baseBST": 458,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lunatone",
    "parsedTypes": [
      "ROCK",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_LUNATONE",
    "family": "P_FAMILY_LUNATONE",
    "baseHP": 90,
    "baseAttack": 55,
    "baseDefense": 65,
    "baseSpeed": 70,
    "baseSpAttack": 95,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Lunatone\")",
    "natDexNum": "NATIONAL_DEX_LUNATONE",
    "levelUpLearnset": "sLunatoneLevelUpLearnset",
    "teachableLearnset": "sLunatoneTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Solrock",
    "parsedTypes": [
      "ROCK",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SOLROCK",
    "family": "P_FAMILY_SOLROCK",
    "baseHP": 90,
    "baseAttack": 95,
    "baseDefense": 85,
    "baseSpeed": 70,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Solrock\")",
    "natDexNum": "NATIONAL_DEX_SOLROCK",
    "levelUpLearnset": "sSolrockLevelUpLearnset",
    "teachableLearnset": "sSolrockTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Barboach",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "HYDRATION"
    ],
    "id": "SPECIES_BARBOACH",
    "family": "P_FAMILY_BARBOACH",
    "baseHP": 50,
    "baseAttack": 48,
    "baseDefense": 43,
    "baseSpeed": 60,
    "baseSpAttack": 46,
    "baseSpDefense": 41,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_HYDRATION }",
    "speciesName": "_(\"Barboach\")",
    "natDexNum": "NATIONAL_DEX_BARBOACH",
    "levelUpLearnset": "sBarboachLevelUpLearnset",
    "teachableLearnset": "sBarboachTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_WHISCASH})",
    "baseBST": 288,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Whiscash",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "OBLIVIOUS",
      "NONE",
      "HYDRATION"
    ],
    "id": "SPECIES_WHISCASH",
    "family": "P_FAMILY_BARBOACH",
    "baseHP": 110,
    "baseAttack": 78,
    "baseDefense": 73,
    "baseSpeed": 60,
    "baseSpAttack": 76,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_OBLIVIOUS, ABILITY_NONE, ABILITY_HYDRATION }",
    "speciesName": "_(\"Whiscash\")",
    "natDexNum": "NATIONAL_DEX_WHISCASH",
    "levelUpLearnset": "sWhiscashLevelUpLearnset",
    "teachableLearnset": "sWhiscashTeachableLearnset",
    "baseBST": 468,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Corphish",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "SHELL_ARMOR",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_CORPHISH",
    "family": "P_FAMILY_CORPHISH",
    "baseHP": 43,
    "baseAttack": 80,
    "baseDefense": 65,
    "baseSpeed": 35,
    "baseSpAttack": 50,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_SHELL_ARMOR, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Corphish\")",
    "natDexNum": "NATIONAL_DEX_CORPHISH",
    "levelUpLearnset": "sCorphishLevelUpLearnset",
    "teachableLearnset": "sCorphishTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_CRAWDAUNT})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Crawdaunt",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "SHELL_ARMOR",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_CRAWDAUNT",
    "family": "P_FAMILY_CORPHISH",
    "baseHP": 63,
    "baseAttack": 120,
    "baseDefense": 85,
    "baseSpeed": 55,
    "baseSpAttack": 90,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_SHELL_ARMOR, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Crawdaunt\")",
    "natDexNum": "NATIONAL_DEX_CRAWDAUNT",
    "levelUpLearnset": "sCrawdauntLevelUpLearnset",
    "teachableLearnset": "sCrawdauntTeachableLearnset",
    "baseBST": 468,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Baltoy",
    "parsedTypes": [
      "GROUND",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_BALTOY",
    "family": "P_FAMILY_BALTOY",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 55,
    "baseSpeed": 55,
    "baseSpAttack": 40,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Baltoy\")",
    "natDexNum": "NATIONAL_DEX_BALTOY",
    "levelUpLearnset": "sBaltoyLevelUpLearnset",
    "teachableLearnset": "sBaltoyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_CLAYDOL})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Claydol",
    "parsedTypes": [
      "GROUND",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CLAYDOL",
    "family": "P_FAMILY_BALTOY",
    "baseHP": 60,
    "baseAttack": 70,
    "baseDefense": 105,
    "baseSpeed": 75,
    "baseSpAttack": 70,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Claydol\")",
    "natDexNum": "NATIONAL_DEX_CLAYDOL",
    "levelUpLearnset": "sClaydolLevelUpLearnset",
    "teachableLearnset": "sClaydolTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lileep",
    "parsedTypes": [
      "ROCK",
      "GRASS"
    ],
    "parsedAbilities": [
      "SUCTION_CUPS",
      "NONE",
      "STORM_DRAIN"
    ],
    "id": "SPECIES_LILEEP",
    "family": "P_FAMILY_LILEEP",
    "baseHP": 66,
    "baseAttack": 41,
    "baseDefense": 77,
    "baseSpeed": 23,
    "baseSpAttack": 61,
    "baseSpDefense": 87,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GRASS)",
    "abilities": "{ ABILITY_SUCTION_CUPS, ABILITY_NONE, ABILITY_STORM_DRAIN }",
    "speciesName": "_(\"Lileep\")",
    "natDexNum": "NATIONAL_DEX_LILEEP",
    "levelUpLearnset": "sLileepLevelUpLearnset",
    "teachableLearnset": "sLileepTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_CRADILY})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cradily",
    "parsedTypes": [
      "ROCK",
      "GRASS"
    ],
    "parsedAbilities": [
      "SUCTION_CUPS",
      "NONE",
      "STORM_DRAIN"
    ],
    "id": "SPECIES_CRADILY",
    "family": "P_FAMILY_LILEEP",
    "baseHP": 86,
    "baseAttack": 81,
    "baseDefense": 97,
    "baseSpeed": 43,
    "baseSpAttack": 81,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_GRASS)",
    "abilities": "{ ABILITY_SUCTION_CUPS, ABILITY_NONE, ABILITY_STORM_DRAIN }",
    "speciesName": "_(\"Cradily\")",
    "natDexNum": "NATIONAL_DEX_CRADILY",
    "levelUpLearnset": "sCradilyLevelUpLearnset",
    "teachableLearnset": "sCradilyTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Anorith",
    "parsedTypes": [
      "ROCK",
      "BUG"
    ],
    "parsedAbilities": [
      "BATTLE_ARMOR",
      "NONE",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_ANORITH",
    "family": "P_FAMILY_ANORITH",
    "baseHP": 45,
    "baseAttack": 95,
    "baseDefense": 50,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_BUG)",
    "abilities": "{ ABILITY_BATTLE_ARMOR, ABILITY_NONE, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Anorith\")",
    "natDexNum": "NATIONAL_DEX_ANORITH",
    "levelUpLearnset": "sAnorithLevelUpLearnset",
    "teachableLearnset": "sAnorithTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_ARMALDO})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Armaldo",
    "parsedTypes": [
      "ROCK",
      "BUG"
    ],
    "parsedAbilities": [
      "BATTLE_ARMOR",
      "NONE",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_ARMALDO",
    "family": "P_FAMILY_ANORITH",
    "baseHP": 75,
    "baseAttack": 125,
    "baseDefense": 100,
    "baseSpeed": 45,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_BUG)",
    "abilities": "{ ABILITY_BATTLE_ARMOR, ABILITY_NONE, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Armaldo\")",
    "natDexNum": "NATIONAL_DEX_ARMALDO",
    "levelUpLearnset": "sArmaldoLevelUpLearnset",
    "teachableLearnset": "sArmaldoTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Feebas",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_FEEBAS",
    "family": "P_FAMILY_FEEBAS",
    "baseHP": 20,
    "baseAttack": 15,
    "baseDefense": 20,
    "baseSpeed": 80,
    "baseSpAttack": 10,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Feebas\")",
    "natDexNum": "NATIONAL_DEX_FEEBAS",
    "levelUpLearnset": "sFeebasLevelUpLearnset",
    "teachableLearnset": "sFeebasTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_MILOTIC, CONDITIONS({IF_MIN_BEAUTY, 170})}",
    "baseBST": 200,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Milotic",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "MARVEL_SCALE",
      "NONE",
      "CUTE_CHARM"
    ],
    "id": "SPECIES_MILOTIC",
    "family": "P_FAMILY_FEEBAS",
    "baseHP": 95,
    "baseAttack": 60,
    "baseDefense": 79,
    "baseSpeed": 81,
    "baseSpAttack": 100,
    "baseSpDefense": 125,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_MARVEL_SCALE, ABILITY_NONE, ABILITY_CUTE_CHARM }",
    "speciesName": "_(\"Milotic\")",
    "natDexNum": "NATIONAL_DEX_MILOTIC",
    "levelUpLearnset": "sMiloticLevelUpLearnset",
    "teachableLearnset": "sMiloticTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Castform  Normal",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "FORECAST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CASTFORM_NORMAL",
    "family": "P_FAMILY_CASTFORM",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_FORECAST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Castform\")",
    "natDexNum": "NATIONAL_DEX_CASTFORM",
    "levelUpLearnset": "sCastformLevelUpLearnset",
    "teachableLearnset": "sCastformTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Castform  Sunny",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FORECAST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CASTFORM_SUNNY",
    "family": "P_FAMILY_CASTFORM",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FORECAST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Castform\")",
    "natDexNum": "NATIONAL_DEX_CASTFORM",
    "levelUpLearnset": "sCastformLevelUpLearnset",
    "teachableLearnset": "sCastformTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Castform  Rainy",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "FORECAST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CASTFORM_RAINY",
    "family": "P_FAMILY_CASTFORM",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_FORECAST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Castform\")",
    "natDexNum": "NATIONAL_DEX_CASTFORM",
    "levelUpLearnset": "sCastformLevelUpLearnset",
    "teachableLearnset": "sCastformTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Castform  Snowy",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "FORECAST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CASTFORM_SNOWY",
    "family": "P_FAMILY_CASTFORM",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_FORECAST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Castform\")",
    "natDexNum": "NATIONAL_DEX_CASTFORM",
    "levelUpLearnset": "sCastformLevelUpLearnset",
    "teachableLearnset": "sCastformTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kecleon",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "COLOR_CHANGE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KECLEON",
    "family": "P_FAMILY_KECLEON",
    "baseHP": 60,
    "baseAttack": 90,
    "baseDefense": 70,
    "baseSpeed": 40,
    "baseSpAttack": 60,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_COLOR_CHANGE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kecleon\")",
    "natDexNum": "NATIONAL_DEX_KECLEON",
    "levelUpLearnset": "sKecleonLevelUpLearnset",
    "teachableLearnset": "sKecleonTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shuppet",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_SHUPPET",
    "family": "P_FAMILY_SHUPPET",
    "baseHP": 44,
    "baseAttack": 75,
    "baseDefense": 35,
    "baseSpeed": 45,
    "baseSpAttack": 63,
    "baseSpDefense": 33,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Shuppet\")",
    "natDexNum": "NATIONAL_DEX_SHUPPET",
    "levelUpLearnset": "sShuppetLevelUpLearnset",
    "teachableLearnset": "sShuppetTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_BANETTE})",
    "baseBST": 295,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Banette",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_BANETTE",
    "family": "P_FAMILY_SHUPPET",
    "baseHP": 64,
    "baseAttack": 115,
    "baseDefense": 65,
    "baseSpeed": 65,
    "baseSpAttack": 83,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Banette\")",
    "natDexNum": "NATIONAL_DEX_BANETTE",
    "levelUpLearnset": "sBanetteLevelUpLearnset",
    "teachableLearnset": "sBanetteTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Banette  Mega",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "PRANKSTER",
      "PRANKSTER"
    ],
    "id": "SPECIES_BANETTE_MEGA",
    "family": "P_FAMILY_SHUPPET",
    "baseHP": 64,
    "baseAttack": 165,
    "baseDefense": 75,
    "baseSpeed": 75,
    "baseSpAttack": 93,
    "baseSpDefense": 83,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_PRANKSTER, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Banette\")",
    "natDexNum": "NATIONAL_DEX_BANETTE",
    "levelUpLearnset": "sBanetteLevelUpLearnset",
    "teachableLearnset": "sBanetteTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Duskull",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DUSKULL",
    "family": "P_FAMILY_DUSKULL",
    "baseHP": 20,
    "baseAttack": 40,
    "baseDefense": 90,
    "baseSpeed": 25,
    "baseSpAttack": 30,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Duskull\")",
    "natDexNum": "NATIONAL_DEX_DUSKULL",
    "levelUpLearnset": "sDuskullLevelUpLearnset",
    "teachableLearnset": "sDuskullTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_DUSCLOPS})",
    "baseBST": 295,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dusclops",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DUSCLOPS",
    "family": "P_FAMILY_DUSKULL",
    "baseHP": 40,
    "baseAttack": 70,
    "baseDefense": 130,
    "baseSpeed": 25,
    "baseSpAttack": 60,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Dusclops\")",
    "natDexNum": "NATIONAL_DEX_DUSCLOPS",
    "levelUpLearnset": "sDusclopsLevelUpLearnset",
    "teachableLearnset": "sDusclopsTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_DUSKNOIR, CONDITIONS({IF_HOLD_ITEM, ITEM_REAPER_CLOTH})}",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dusknoir",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DUSKNOIR",
    "family": "P_FAMILY_DUSKULL",
    "baseHP": 45,
    "baseAttack": 100,
    "baseDefense": 135,
    "baseSpeed": 45,
    "baseSpAttack": 65,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Dusknoir\")",
    "natDexNum": "NATIONAL_DEX_DUSKNOIR",
    "levelUpLearnset": "sDusknoirLevelUpLearnset",
    "teachableLearnset": "sDusknoirTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tropius",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_TROPIUS",
    "family": "P_FAMILY_TROPIUS",
    "baseHP": 99,
    "baseAttack": 68,
    "baseDefense": 83,
    "baseSpeed": 51,
    "baseSpAttack": 72,
    "baseSpDefense": 87,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Tropius\")",
    "natDexNum": "NATIONAL_DEX_TROPIUS",
    "levelUpLearnset": "sTropiusLevelUpLearnset",
    "teachableLearnset": "sTropiusTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chingling",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHINGLING",
    "family": "P_FAMILY_CHIMECHO",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 50,
    "baseSpeed": 45,
    "baseSpAttack": 65,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Chingling\")",
    "natDexNum": "NATIONAL_DEX_CHINGLING",
    "levelUpLearnset": "sChinglingLevelUpLearnset",
    "teachableLearnset": "sChinglingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_CHIMECHO, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD},{IF_TIME, TIME_NIGHT})})",
    "baseBST": 285,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chimecho",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHIMECHO",
    "family": "P_FAMILY_CHIMECHO",
    "baseHP": 75,
    "baseAttack": 50,
    "baseDefense": 80,
    "baseSpeed": 65,
    "baseSpAttack": 95,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Chimecho\")",
    "natDexNum": "NATIONAL_DEX_CHIMECHO",
    "levelUpLearnset": "sChimechoLevelUpLearnset",
    "teachableLearnset": "sChimechoTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Absol",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "JUSTIFIED"
    ],
    "id": "SPECIES_ABSOL",
    "family": "P_FAMILY_ABSOL",
    "baseHP": 65,
    "baseAttack": 130,
    "baseDefense": 60,
    "baseSpeed": 75,
    "baseSpAttack": 75,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_JUSTIFIED }",
    "speciesName": "_(\"Absol\")",
    "natDexNum": "NATIONAL_DEX_ABSOL",
    "levelUpLearnset": "sAbsolLevelUpLearnset",
    "teachableLearnset": "sAbsolTeachableLearnset",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Absol  Mega",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "MAGIC_BOUNCE",
      "MAGIC_BOUNCE",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_ABSOL_MEGA",
    "family": "P_FAMILY_ABSOL",
    "baseHP": 65,
    "baseAttack": 150,
    "baseDefense": 60,
    "baseSpeed": 115,
    "baseSpAttack": 115,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_MAGIC_BOUNCE, ABILITY_MAGIC_BOUNCE, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Absol\")",
    "natDexNum": "NATIONAL_DEX_ABSOL",
    "levelUpLearnset": "sAbsolLevelUpLearnset",
    "teachableLearnset": "sAbsolTeachableLearnset",
    "baseBST": 565,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Snorunt",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "MOODY"
    ],
    "id": "SPECIES_SNORUNT",
    "family": "P_FAMILY_SNORUNT",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 50,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_MOODY }",
    "speciesName": "_(\"Snorunt\")",
    "natDexNum": "NATIONAL_DEX_SNORUNT",
    "levelUpLearnset": "sSnoruntLevelUpLearnset",
    "teachableLearnset": "sSnoruntTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_GLALIE}",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glalie",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "MOODY"
    ],
    "id": "SPECIES_GLALIE",
    "family": "P_FAMILY_SNORUNT",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 80,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_MOODY }",
    "speciesName": "_(\"Glalie\")",
    "natDexNum": "NATIONAL_DEX_GLALIE",
    "levelUpLearnset": "sGlalieLevelUpLearnset",
    "teachableLearnset": "sGlalieTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glalie  Mega",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "REFRIGERATE",
      "REFRIGERATE",
      "REFRIGERATE"
    ],
    "id": "SPECIES_GLALIE_MEGA",
    "family": "P_FAMILY_SNORUNT",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 80,
    "baseSpeed": 100,
    "baseSpAttack": 120,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_REFRIGERATE, ABILITY_REFRIGERATE, ABILITY_REFRIGERATE }",
    "speciesName": "_(\"Glalie\")",
    "natDexNum": "NATIONAL_DEX_GLALIE",
    "levelUpLearnset": "sGlalieLevelUpLearnset",
    "teachableLearnset": "sGlalieTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Froslass",
    "parsedTypes": [
      "ICE",
      "GHOST"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_FROSLASS",
    "family": "P_FAMILY_SNORUNT",
    "baseHP": 70,
    "baseAttack": 80,
    "baseDefense": 70,
    "baseSpeed": 110,
    "baseSpAttack": 80,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ICE, TYPE_GHOST)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Froslass\")",
    "natDexNum": "NATIONAL_DEX_FROSLASS",
    "levelUpLearnset": "sFroslassLevelUpLearnset",
    "teachableLearnset": "sFroslassTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spheal",
    "parsedTypes": [
      "ICE",
      "WATER"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "NONE",
      "OBLIVIOUS"
    ],
    "id": "SPECIES_SPHEAL",
    "family": "P_FAMILY_SPHEAL",
    "baseHP": 70,
    "baseAttack": 40,
    "baseDefense": 50,
    "baseSpeed": 25,
    "baseSpAttack": 55,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ICE, TYPE_WATER)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_NONE, ABILITY_OBLIVIOUS }",
    "speciesName": "_(\"Spheal\")",
    "natDexNum": "NATIONAL_DEX_SPHEAL",
    "levelUpLearnset": "sSphealLevelUpLearnset",
    "teachableLearnset": "sSphealTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_SEALEO})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sealeo",
    "parsedTypes": [
      "ICE",
      "WATER"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "NONE",
      "OBLIVIOUS"
    ],
    "id": "SPECIES_SEALEO",
    "family": "P_FAMILY_SPHEAL",
    "baseHP": 90,
    "baseAttack": 60,
    "baseDefense": 70,
    "baseSpeed": 45,
    "baseSpAttack": 75,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ICE, TYPE_WATER)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_NONE, ABILITY_OBLIVIOUS }",
    "speciesName": "_(\"Sealeo\")",
    "natDexNum": "NATIONAL_DEX_SEALEO",
    "levelUpLearnset": "sSealeoLevelUpLearnset",
    "teachableLearnset": "sSealeoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 44, SPECIES_WALREIN})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Walrein",
    "parsedTypes": [
      "ICE",
      "WATER"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "NONE",
      "OBLIVIOUS"
    ],
    "id": "SPECIES_WALREIN",
    "family": "P_FAMILY_SPHEAL",
    "baseHP": 110,
    "baseAttack": 80,
    "baseDefense": 90,
    "baseSpeed": 65,
    "baseSpAttack": 95,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ICE, TYPE_WATER)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_NONE, ABILITY_OBLIVIOUS }",
    "speciesName": "_(\"Walrein\")",
    "natDexNum": "NATIONAL_DEX_WALREIN",
    "levelUpLearnset": "sWalreinLevelUpLearnset",
    "teachableLearnset": "sWalreinTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clamperl",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SHELL_ARMOR",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_CLAMPERL",
    "family": "P_FAMILY_CLAMPERL",
    "baseHP": 35,
    "baseAttack": 64,
    "baseDefense": 85,
    "baseSpeed": 32,
    "baseSpAttack": 74,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SHELL_ARMOR, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Clamperl\")",
    "natDexNum": "NATIONAL_DEX_CLAMPERL",
    "levelUpLearnset": "sClamperlLevelUpLearnset",
    "teachableLearnset": "sClamperlTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_HUNTAIL, CONDITIONS({IF_HOLD_ITEM, ITEM_DEEP_SEA_TOOTH})}",
    "baseBST": 345,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Huntail",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "WATER_VEIL"
    ],
    "id": "SPECIES_HUNTAIL",
    "family": "P_FAMILY_CLAMPERL",
    "baseHP": 55,
    "baseAttack": 104,
    "baseDefense": 105,
    "baseSpeed": 52,
    "baseSpAttack": 94,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Huntail\")",
    "natDexNum": "NATIONAL_DEX_HUNTAIL",
    "levelUpLearnset": "sHuntailLevelUpLearnset",
    "teachableLearnset": "sHuntailTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gorebyss",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "HYDRATION"
    ],
    "id": "SPECIES_GOREBYSS",
    "family": "P_FAMILY_CLAMPERL",
    "baseHP": 55,
    "baseAttack": 84,
    "baseDefense": 105,
    "baseSpeed": 52,
    "baseSpAttack": 114,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_HYDRATION }",
    "speciesName": "_(\"Gorebyss\")",
    "natDexNum": "NATIONAL_DEX_GOREBYSS",
    "levelUpLearnset": "sGorebyssLevelUpLearnset",
    "teachableLearnset": "sGorebyssTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Relicanth",
    "parsedTypes": [
      "WATER",
      "ROCK"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "ROCK_HEAD",
      "STURDY"
    ],
    "id": "SPECIES_RELICANTH",
    "family": "P_FAMILY_RELICANTH",
    "baseHP": 100,
    "baseAttack": 90,
    "baseDefense": 130,
    "baseSpeed": 55,
    "baseSpAttack": 45,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ROCK)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_ROCK_HEAD, ABILITY_STURDY }",
    "speciesName": "_(\"Relicanth\")",
    "natDexNum": "NATIONAL_DEX_RELICANTH",
    "levelUpLearnset": "sRelicanthLevelUpLearnset",
    "teachableLearnset": "sRelicanthTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Luvdisc",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "HYDRATION"
    ],
    "id": "SPECIES_LUVDISC",
    "family": "P_FAMILY_LUVDISC",
    "baseHP": 43,
    "baseAttack": 30,
    "baseDefense": 55,
    "baseSpeed": 97,
    "baseSpAttack": 40,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_HYDRATION }",
    "speciesName": "_(\"Luvdisc\")",
    "natDexNum": "NATIONAL_DEX_LUVDISC",
    "levelUpLearnset": "sLuvdiscLevelUpLearnset",
    "teachableLearnset": "sLuvdiscTeachableLearnset",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bagon",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_BAGON",
    "family": "P_FAMILY_BAGON",
    "baseHP": 45,
    "baseAttack": 75,
    "baseDefense": 60,
    "baseSpeed": 50,
    "baseSpAttack": 40,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Bagon\")",
    "natDexNum": "NATIONAL_DEX_BAGON",
    "levelUpLearnset": "sBagonLevelUpLearnset",
    "teachableLearnset": "sBagonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_SHELGON})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shelgon",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "NONE",
      "OVERCOAT"
    ],
    "id": "SPECIES_SHELGON",
    "family": "P_FAMILY_BAGON",
    "baseHP": 65,
    "baseAttack": 95,
    "baseDefense": 100,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_NONE, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Shelgon\")",
    "natDexNum": "NATIONAL_DEX_SHELGON",
    "levelUpLearnset": "sShelgonLevelUpLearnset",
    "teachableLearnset": "sShelgonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 50, SPECIES_SALAMENCE})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Salamence",
    "parsedTypes": [
      "DRAGON",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_SALAMENCE",
    "family": "P_FAMILY_BAGON",
    "baseHP": 95,
    "baseAttack": 135,
    "baseDefense": 80,
    "baseSpeed": 100,
    "baseSpAttack": 110,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Salamence\")",
    "natDexNum": "NATIONAL_DEX_SALAMENCE",
    "levelUpLearnset": "sSalamenceLevelUpLearnset",
    "teachableLearnset": "sSalamenceTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Salamence  Mega",
    "parsedTypes": [
      "DRAGON",
      "FLYING"
    ],
    "parsedAbilities": [
      "AERILATE",
      "AERILATE",
      "AERILATE"
    ],
    "id": "SPECIES_SALAMENCE_MEGA",
    "family": "P_FAMILY_BAGON",
    "baseHP": 95,
    "baseAttack": 145,
    "baseDefense": 130,
    "baseSpeed": 120,
    "baseSpAttack": 120,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FLYING)",
    "abilities": "{ ABILITY_AERILATE, ABILITY_AERILATE, ABILITY_AERILATE }",
    "speciesName": "_(\"Salamence\")",
    "natDexNum": "NATIONAL_DEX_SALAMENCE",
    "levelUpLearnset": "sSalamenceLevelUpLearnset",
    "teachableLearnset": "sSalamenceTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Beldum",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "LIGHT_METAL"
    ],
    "id": "SPECIES_BELDUM",
    "family": "P_FAMILY_BELDUM",
    "baseHP": 40,
    "baseAttack": 55,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 35,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_LIGHT_METAL }",
    "speciesName": "_(\"Beldum\")",
    "natDexNum": "NATIONAL_DEX_BELDUM",
    "levelUpLearnset": "sBeldumLevelUpLearnset",
    "teachableLearnset": "sBeldumTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_METANG})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Metang",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "LIGHT_METAL"
    ],
    "id": "SPECIES_METANG",
    "family": "P_FAMILY_BELDUM",
    "baseHP": 60,
    "baseAttack": 75,
    "baseDefense": 100,
    "baseSpeed": 50,
    "baseSpAttack": 55,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_LIGHT_METAL }",
    "speciesName": "_(\"Metang\")",
    "natDexNum": "NATIONAL_DEX_METANG",
    "levelUpLearnset": "sMetangLevelUpLearnset",
    "teachableLearnset": "sMetangTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 45, SPECIES_METAGROSS})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Metagross",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "LIGHT_METAL"
    ],
    "id": "SPECIES_METAGROSS",
    "family": "P_FAMILY_BELDUM",
    "baseHP": 80,
    "baseAttack": 135,
    "baseDefense": 130,
    "baseSpeed": 70,
    "baseSpAttack": 95,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_LIGHT_METAL }",
    "speciesName": "_(\"Metagross\")",
    "natDexNum": "NATIONAL_DEX_METAGROSS",
    "levelUpLearnset": "sMetagrossLevelUpLearnset",
    "teachableLearnset": "sMetagrossTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Metagross  Mega",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "TOUGH_CLAWS",
      "TOUGH_CLAWS",
      "TOUGH_CLAWS"
    ],
    "id": "SPECIES_METAGROSS_MEGA",
    "family": "P_FAMILY_BELDUM",
    "baseHP": 80,
    "baseAttack": 145,
    "baseDefense": 150,
    "baseSpeed": 110,
    "baseSpAttack": 105,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_TOUGH_CLAWS, ABILITY_TOUGH_CLAWS, ABILITY_TOUGH_CLAWS }",
    "speciesName": "_(\"Metagross\")",
    "natDexNum": "NATIONAL_DEX_METAGROSS",
    "levelUpLearnset": "sMetagrossLevelUpLearnset",
    "teachableLearnset": "sMetagrossTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Regirock",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "STURDY"
    ],
    "id": "SPECIES_REGIROCK",
    "family": "P_FAMILY_REGIROCK",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 200,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_STURDY }",
    "speciesName": "_(\"Regirock\")",
    "natDexNum": "NATIONAL_DEX_REGIROCK",
    "levelUpLearnset": "sRegirockLevelUpLearnset",
    "teachableLearnset": "sRegirockTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Regice",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "ICE_BODY"
    ],
    "id": "SPECIES_REGICE",
    "family": "P_FAMILY_REGICE",
    "baseHP": 80,
    "baseAttack": 50,
    "baseDefense": 100,
    "baseSpeed": 50,
    "baseSpAttack": 100,
    "baseSpDefense": 200,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Regice\")",
    "natDexNum": "NATIONAL_DEX_REGICE",
    "levelUpLearnset": "sRegiceLevelUpLearnset",
    "teachableLearnset": "sRegiceTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Registeel",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "LIGHT_METAL"
    ],
    "id": "SPECIES_REGISTEEL",
    "family": "P_FAMILY_REGISTEEL",
    "baseHP": 80,
    "baseAttack": 75,
    "baseDefense": 150,
    "baseSpeed": 50,
    "baseSpAttack": 75,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_LIGHT_METAL }",
    "speciesName": "_(\"Registeel\")",
    "natDexNum": "NATIONAL_DEX_REGISTEEL",
    "levelUpLearnset": "sRegisteelLevelUpLearnset",
    "teachableLearnset": "sRegisteelTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Latias",
    "parsedTypes": [
      "DRAGON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_LATIAS",
    "family": "P_FAMILY_LATIAS",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 90,
    "baseSpeed": 110,
    "baseSpAttack": 110,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Latias\")",
    "natDexNum": "NATIONAL_DEX_LATIAS",
    "levelUpLearnset": "sLatiasLevelUpLearnset",
    "teachableLearnset": "sLatiasTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Latias  Mega",
    "parsedTypes": [
      "DRAGON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "LEVITATE",
      "LEVITATE"
    ],
    "id": "SPECIES_LATIAS_MEGA",
    "family": "P_FAMILY_LATIAS",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 120,
    "baseSpeed": 110,
    "baseSpAttack": 140,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_LEVITATE, ABILITY_LEVITATE }",
    "speciesName": "_(\"Latias\")",
    "natDexNum": "NATIONAL_DEX_LATIAS",
    "levelUpLearnset": "sLatiasLevelUpLearnset",
    "teachableLearnset": "sLatiasTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Latios",
    "parsedTypes": [
      "DRAGON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_LATIOS",
    "family": "P_FAMILY_LATIOS",
    "baseHP": 80,
    "baseAttack": 90,
    "baseDefense": 80,
    "baseSpeed": 110,
    "baseSpAttack": 130,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Latios\")",
    "natDexNum": "NATIONAL_DEX_LATIOS",
    "levelUpLearnset": "sLatiosLevelUpLearnset",
    "teachableLearnset": "sLatiosTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Latios  Mega",
    "parsedTypes": [
      "DRAGON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "LEVITATE",
      "LEVITATE"
    ],
    "id": "SPECIES_LATIOS_MEGA",
    "family": "P_FAMILY_LATIOS",
    "baseHP": 80,
    "baseAttack": 130,
    "baseDefense": 100,
    "baseSpeed": 110,
    "baseSpAttack": 160,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_LEVITATE, ABILITY_LEVITATE }",
    "speciesName": "_(\"Latios\")",
    "natDexNum": "NATIONAL_DEX_LATIOS",
    "levelUpLearnset": "sLatiosLevelUpLearnset",
    "teachableLearnset": "sLatiosTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kyogre",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "DRIZZLE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KYOGRE",
    "family": "P_FAMILY_KYOGRE",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 90,
    "baseSpeed": 90,
    "baseSpAttack": 150,
    "baseSpDefense": 140,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_DRIZZLE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kyogre\")",
    "natDexNum": "NATIONAL_DEX_KYOGRE",
    "levelUpLearnset": "sKyogreLevelUpLearnset",
    "teachableLearnset": "sKyogreTeachableLearnset",
    "baseBST": 670,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kyogre  Primal",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "PRIMORDIAL_SEA",
      "PRIMORDIAL_SEA"
    ],
    "id": "SPECIES_KYOGRE_PRIMAL",
    "family": "P_FAMILY_KYOGRE",
    "baseHP": 100,
    "baseAttack": 150,
    "baseDefense": 90,
    "baseSpeed": 90,
    "baseSpAttack": 180,
    "baseSpDefense": 160,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_PRIMORDIAL_SEA, ABILITY_PRIMORDIAL_SEA }",
    "speciesName": "_(\"Kyogre\")",
    "natDexNum": "NATIONAL_DEX_KYOGRE",
    "levelUpLearnset": "sKyogreLevelUpLearnset",
    "teachableLearnset": "sKyogreTeachableLearnset",
    "baseBST": 770,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Groudon",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "DROUGHT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GROUDON",
    "family": "P_FAMILY_GROUDON",
    "baseHP": 100,
    "baseAttack": 150,
    "baseDefense": 140,
    "baseSpeed": 90,
    "baseSpAttack": 100,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_DROUGHT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Groudon\")",
    "natDexNum": "NATIONAL_DEX_GROUDON",
    "levelUpLearnset": "sGroudonLevelUpLearnset",
    "teachableLearnset": "sGroudonTeachableLearnset",
    "baseBST": 670,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Groudon  Primal",
    "parsedTypes": [
      "GROUND",
      "FIRE"
    ],
    "parsedAbilities": [
      "DESOLATE_LAND",
      "DESOLATE_LAND"
    ],
    "id": "SPECIES_GROUDON_PRIMAL",
    "family": "P_FAMILY_GROUDON",
    "baseHP": 100,
    "baseAttack": 180,
    "baseDefense": 160,
    "baseSpeed": 90,
    "baseSpAttack": 150,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_FIRE)",
    "abilities": "{ ABILITY_DESOLATE_LAND, ABILITY_DESOLATE_LAND }",
    "speciesName": "_(\"Groudon\")",
    "natDexNum": "NATIONAL_DEX_GROUDON",
    "levelUpLearnset": "sGroudonLevelUpLearnset",
    "teachableLearnset": "sGroudonTeachableLearnset",
    "baseBST": 770,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rayquaza",
    "parsedTypes": [
      "DRAGON",
      "FLYING"
    ],
    "parsedAbilities": [
      "AIR_LOCK",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_RAYQUAZA",
    "family": "P_FAMILY_RAYQUAZA",
    "baseHP": 105,
    "baseAttack": 150,
    "baseDefense": 90,
    "baseSpeed": 95,
    "baseSpAttack": 150,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FLYING)",
    "abilities": "{ ABILITY_AIR_LOCK, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rayquaza\")",
    "natDexNum": "NATIONAL_DEX_RAYQUAZA",
    "levelUpLearnset": "sRayquazaLevelUpLearnset",
    "teachableLearnset": "sRayquazaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rayquaza  Mega",
    "parsedTypes": [
      "DRAGON",
      "FLYING"
    ],
    "parsedAbilities": [
      "DELTA_STREAM",
      "DELTA_STREAM",
      "DELTA_STREAM"
    ],
    "id": "SPECIES_RAYQUAZA_MEGA",
    "family": "P_FAMILY_RAYQUAZA",
    "baseHP": 105,
    "baseAttack": 180,
    "baseDefense": 100,
    "baseSpeed": 115,
    "baseSpAttack": 180,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FLYING)",
    "abilities": "{ ABILITY_DELTA_STREAM, ABILITY_DELTA_STREAM, ABILITY_DELTA_STREAM }",
    "speciesName": "_(\"Rayquaza\")",
    "natDexNum": "NATIONAL_DEX_RAYQUAZA",
    "levelUpLearnset": "sRayquazaLevelUpLearnset",
    "teachableLearnset": "sRayquazaTeachableLearnset",
    "baseBST": 780,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jirachi",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_JIRACHI",
    "family": "P_FAMILY_JIRACHI",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Jirachi\")",
    "natDexNum": "NATIONAL_DEX_JIRACHI",
    "levelUpLearnset": "sJirachiLevelUpLearnset",
    "teachableLearnset": "sJirachiTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deoxys  Normal",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DEOXYS_NORMAL",
    "family": "P_FAMILY_DEOXYS",
    "baseHP": 50,
    "baseAttack": 150,
    "baseDefense": 50,
    "baseSpeed": 150,
    "baseSpAttack": 150,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Deoxys\")",
    "natDexNum": "NATIONAL_DEX_DEOXYS",
    "levelUpLearnset": "sDeoxysNormalLevelUpLearnset",
    "teachableLearnset": "sDeoxysNormalTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deoxys  Attack",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DEOXYS_ATTACK",
    "family": "P_FAMILY_DEOXYS",
    "baseHP": 50,
    "baseAttack": 180,
    "baseDefense": 20,
    "baseSpeed": 150,
    "baseSpAttack": 180,
    "baseSpDefense": 20,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Deoxys\")",
    "natDexNum": "NATIONAL_DEX_DEOXYS",
    "levelUpLearnset": "sDeoxysAttackLevelUpLearnset",
    "teachableLearnset": "sDeoxysAttackTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deoxys  Defense",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DEOXYS_DEFENSE",
    "family": "P_FAMILY_DEOXYS",
    "baseHP": 50,
    "baseAttack": 70,
    "baseDefense": 160,
    "baseSpeed": 90,
    "baseSpAttack": 70,
    "baseSpDefense": 160,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Deoxys\")",
    "natDexNum": "NATIONAL_DEX_DEOXYS",
    "levelUpLearnset": "sDeoxysDefenseLevelUpLearnset",
    "teachableLearnset": "sDeoxysDefenseTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deoxys  Speed",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DEOXYS_SPEED",
    "family": "P_FAMILY_DEOXYS",
    "baseHP": 50,
    "baseAttack": 95,
    "baseDefense": 90,
    "baseSpeed": 180,
    "baseSpAttack": 95,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Deoxys\")",
    "natDexNum": "NATIONAL_DEX_DEOXYS",
    "levelUpLearnset": "sDeoxysSpeedLevelUpLearnset",
    "teachableLearnset": "sDeoxysSpeedTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Turtwig",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_TURTWIG",
    "family": "P_FAMILY_TURTWIG",
    "baseHP": 55,
    "baseAttack": 68,
    "baseDefense": 64,
    "baseSpeed": 31,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Turtwig\")",
    "natDexNum": "NATIONAL_DEX_TURTWIG",
    "levelUpLearnset": "sTurtwigLevelUpLearnset",
    "teachableLearnset": "sTurtwigTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_GROTLE})",
    "baseBST": 318,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grotle",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_GROTLE",
    "family": "P_FAMILY_TURTWIG",
    "baseHP": 75,
    "baseAttack": 89,
    "baseDefense": 85,
    "baseSpeed": 36,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Grotle\")",
    "natDexNum": "NATIONAL_DEX_GROTLE",
    "levelUpLearnset": "sGrotleLevelUpLearnset",
    "teachableLearnset": "sGrotleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_TORTERRA})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Torterra",
    "parsedTypes": [
      "GRASS",
      "GROUND"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_TORTERRA",
    "family": "P_FAMILY_TURTWIG",
    "baseHP": 95,
    "baseAttack": 109,
    "baseDefense": 105,
    "baseSpeed": 56,
    "baseSpAttack": 75,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GROUND)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Torterra\")",
    "natDexNum": "NATIONAL_DEX_TORTERRA",
    "levelUpLearnset": "sTorterraLevelUpLearnset",
    "teachableLearnset": "sTorterraTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chimchar",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "IRON_FIST"
    ],
    "id": "SPECIES_CHIMCHAR",
    "family": "P_FAMILY_CHIMCHAR",
    "baseHP": 44,
    "baseAttack": 58,
    "baseDefense": 44,
    "baseSpeed": 61,
    "baseSpAttack": 58,
    "baseSpDefense": 44,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Chimchar\")",
    "natDexNum": "NATIONAL_DEX_CHIMCHAR",
    "levelUpLearnset": "sChimcharLevelUpLearnset",
    "teachableLearnset": "sChimcharTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 14, SPECIES_MONFERNO})",
    "baseBST": 309,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Monferno",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "IRON_FIST"
    ],
    "id": "SPECIES_MONFERNO",
    "family": "P_FAMILY_CHIMCHAR",
    "baseHP": 64,
    "baseAttack": 78,
    "baseDefense": 52,
    "baseSpeed": 81,
    "baseSpAttack": 78,
    "baseSpDefense": 52,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Monferno\")",
    "natDexNum": "NATIONAL_DEX_MONFERNO",
    "levelUpLearnset": "sMonfernoLevelUpLearnset",
    "teachableLearnset": "sMonfernoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_INFERNAPE})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Infernape",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "IRON_FIST"
    ],
    "id": "SPECIES_INFERNAPE",
    "family": "P_FAMILY_CHIMCHAR",
    "baseHP": 76,
    "baseAttack": 104,
    "baseDefense": 71,
    "baseSpeed": 108,
    "baseSpAttack": 104,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Infernape\")",
    "natDexNum": "NATIONAL_DEX_INFERNAPE",
    "levelUpLearnset": "sInfernapeLevelUpLearnset",
    "teachableLearnset": "sInfernapeTeachableLearnset",
    "baseBST": 534,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Piplup",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_PIPLUP",
    "family": "P_FAMILY_PIPLUP",
    "baseHP": 53,
    "baseAttack": 51,
    "baseDefense": 53,
    "baseSpeed": 40,
    "baseSpAttack": 61,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Piplup\")",
    "natDexNum": "NATIONAL_DEX_PIPLUP",
    "levelUpLearnset": "sPiplupLevelUpLearnset",
    "teachableLearnset": "sPiplupTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_PRINPLUP})",
    "baseBST": 314,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Prinplup",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_PRINPLUP",
    "family": "P_FAMILY_PIPLUP",
    "baseHP": 64,
    "baseAttack": 66,
    "baseDefense": 68,
    "baseSpeed": 50,
    "baseSpAttack": 81,
    "baseSpDefense": 76,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Prinplup\")",
    "natDexNum": "NATIONAL_DEX_PRINPLUP",
    "levelUpLearnset": "sPrinplupLevelUpLearnset",
    "teachableLearnset": "sPrinplupTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_EMPOLEON})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Empoleon",
    "parsedTypes": [
      "WATER",
      "STEEL"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_EMPOLEON",
    "family": "P_FAMILY_PIPLUP",
    "baseHP": 84,
    "baseAttack": 86,
    "baseDefense": 88,
    "baseSpeed": 60,
    "baseSpAttack": 111,
    "baseSpDefense": 101,
    "types": "MON_TYPES(TYPE_WATER, TYPE_STEEL)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Empoleon\")",
    "natDexNum": "NATIONAL_DEX_EMPOLEON",
    "levelUpLearnset": "sEmpoleonLevelUpLearnset",
    "teachableLearnset": "sEmpoleonTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Starly",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_STARLY",
    "family": "P_FAMILY_STARLY",
    "baseHP": 40,
    "baseAttack": 55,
    "baseDefense": 30,
    "baseSpeed": 60,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Starly\")",
    "natDexNum": "NATIONAL_DEX_STARLY",
    "levelUpLearnset": "sStarlyLevelUpLearnset",
    "teachableLearnset": "sStarlyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 14, SPECIES_STARAVIA})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Staravia",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "RECKLESS"
    ],
    "id": "SPECIES_STARAVIA",
    "family": "P_FAMILY_STARLY",
    "baseHP": 55,
    "baseAttack": 75,
    "baseDefense": 50,
    "baseSpeed": 80,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_RECKLESS }",
    "speciesName": "_(\"Staravia\")",
    "natDexNum": "NATIONAL_DEX_STARAVIA",
    "levelUpLearnset": "sStaraviaLevelUpLearnset",
    "teachableLearnset": "sStaraviaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_STARAPTOR})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Staraptor",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "RECKLESS"
    ],
    "id": "SPECIES_STARAPTOR",
    "family": "P_FAMILY_STARLY",
    "baseHP": 85,
    "baseAttack": 120,
    "baseDefense": 70,
    "baseSpeed": 100,
    "baseSpAttack": 50,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_RECKLESS }",
    "speciesName": "_(\"Staraptor\")",
    "natDexNum": "NATIONAL_DEX_STARAPTOR",
    "levelUpLearnset": "sStaraptorLevelUpLearnset",
    "teachableLearnset": "sStaraptorTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bidoof",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SIMPLE",
      "UNAWARE",
      "MOODY"
    ],
    "id": "SPECIES_BIDOOF",
    "family": "P_FAMILY_BIDOOF",
    "baseHP": 59,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 31,
    "baseSpAttack": 35,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SIMPLE, ABILITY_UNAWARE, ABILITY_MOODY }",
    "speciesName": "_(\"Bidoof\")",
    "natDexNum": "NATIONAL_DEX_BIDOOF",
    "levelUpLearnset": "sBidoofLevelUpLearnset",
    "teachableLearnset": "sBidoofTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 15, SPECIES_BIBAREL})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bibarel",
    "parsedTypes": [
      "NORMAL",
      "WATER"
    ],
    "parsedAbilities": [
      "SIMPLE",
      "UNAWARE",
      "MOODY"
    ],
    "id": "SPECIES_BIBAREL",
    "family": "P_FAMILY_BIDOOF",
    "baseHP": 79,
    "baseAttack": 85,
    "baseDefense": 60,
    "baseSpeed": 71,
    "baseSpAttack": 55,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_WATER)",
    "abilities": "{ ABILITY_SIMPLE, ABILITY_UNAWARE, ABILITY_MOODY }",
    "speciesName": "_(\"Bibarel\")",
    "natDexNum": "NATIONAL_DEX_BIBAREL",
    "levelUpLearnset": "sBibarelLevelUpLearnset",
    "teachableLearnset": "sBibarelTeachableLearnset",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kricketot",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "RUN_AWAY"
    ],
    "id": "SPECIES_KRICKETOT",
    "family": "P_FAMILY_KRICKETOT",
    "baseHP": 37,
    "baseAttack": 25,
    "baseDefense": 41,
    "baseSpeed": 25,
    "baseSpAttack": 25,
    "baseSpDefense": 41,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Kricketot\")",
    "natDexNum": "NATIONAL_DEX_KRICKETOT",
    "levelUpLearnset": "sKricketotLevelUpLearnset",
    "teachableLearnset": "sKricketotTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 10, SPECIES_KRICKETUNE})",
    "baseBST": 194,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kricketune",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "TECHNICIAN"
    ],
    "id": "SPECIES_KRICKETUNE",
    "family": "P_FAMILY_KRICKETOT",
    "baseHP": 77,
    "baseAttack": 85,
    "baseDefense": 51,
    "baseSpeed": 65,
    "baseSpAttack": 55,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Kricketune\")",
    "natDexNum": "NATIONAL_DEX_KRICKETUNE",
    "levelUpLearnset": "sKricketuneLevelUpLearnset",
    "teachableLearnset": "sKricketuneTeachableLearnset",
    "baseBST": 384,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shinx",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "INTIMIDATE",
      "GUTS"
    ],
    "id": "SPECIES_SHINX",
    "family": "P_FAMILY_SHINX",
    "baseHP": 45,
    "baseAttack": 65,
    "baseDefense": 34,
    "baseSpeed": 45,
    "baseSpAttack": 40,
    "baseSpDefense": 34,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_INTIMIDATE, ABILITY_GUTS }",
    "speciesName": "_(\"Shinx\")",
    "natDexNum": "NATIONAL_DEX_SHINX",
    "levelUpLearnset": "sShinxLevelUpLearnset",
    "teachableLearnset": "sShinxTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 15, SPECIES_LUXIO})",
    "baseBST": 263,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Luxio",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "INTIMIDATE",
      "GUTS"
    ],
    "id": "SPECIES_LUXIO",
    "family": "P_FAMILY_SHINX",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 49,
    "baseSpeed": 60,
    "baseSpAttack": 60,
    "baseSpDefense": 49,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_INTIMIDATE, ABILITY_GUTS }",
    "speciesName": "_(\"Luxio\")",
    "natDexNum": "NATIONAL_DEX_LUXIO",
    "levelUpLearnset": "sLuxioLevelUpLearnset",
    "teachableLearnset": "sLuxioTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_LUXRAY})",
    "baseBST": 363,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Luxray",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "INTIMIDATE",
      "GUTS"
    ],
    "id": "SPECIES_LUXRAY",
    "family": "P_FAMILY_SHINX",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 79,
    "baseSpeed": 70,
    "baseSpAttack": 95,
    "baseSpDefense": 79,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_INTIMIDATE, ABILITY_GUTS }",
    "speciesName": "_(\"Luxray\")",
    "natDexNum": "NATIONAL_DEX_LUXRAY",
    "levelUpLearnset": "sLuxrayLevelUpLearnset",
    "teachableLearnset": "sLuxrayTeachableLearnset",
    "baseBST": 523,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cranidos",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_CRANIDOS",
    "family": "P_FAMILY_CRANIDOS",
    "baseHP": 67,
    "baseAttack": 125,
    "baseDefense": 40,
    "baseSpeed": 58,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Cranidos\")",
    "natDexNum": "NATIONAL_DEX_CRANIDOS",
    "levelUpLearnset": "sCranidosLevelUpLearnset",
    "teachableLearnset": "sCranidosTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_RAMPARDOS})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rampardos",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_RAMPARDOS",
    "family": "P_FAMILY_CRANIDOS",
    "baseHP": 97,
    "baseAttack": 165,
    "baseDefense": 60,
    "baseSpeed": 58,
    "baseSpAttack": 65,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Rampardos\")",
    "natDexNum": "NATIONAL_DEX_RAMPARDOS",
    "levelUpLearnset": "sRampardosLevelUpLearnset",
    "teachableLearnset": "sRampardosTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shieldon",
    "parsedTypes": [
      "ROCK",
      "STEEL"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "SOUNDPROOF"
    ],
    "id": "SPECIES_SHIELDON",
    "family": "P_FAMILY_SHIELDON",
    "baseHP": 30,
    "baseAttack": 42,
    "baseDefense": 118,
    "baseSpeed": 30,
    "baseSpAttack": 42,
    "baseSpDefense": 88,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_STEEL)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_SOUNDPROOF }",
    "speciesName": "_(\"Shieldon\")",
    "natDexNum": "NATIONAL_DEX_SHIELDON",
    "levelUpLearnset": "sShieldonLevelUpLearnset",
    "teachableLearnset": "sShieldonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_BASTIODON})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bastiodon",
    "parsedTypes": [
      "ROCK",
      "STEEL"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "SOUNDPROOF"
    ],
    "id": "SPECIES_BASTIODON",
    "family": "P_FAMILY_SHIELDON",
    "baseHP": 60,
    "baseAttack": 52,
    "baseDefense": 168,
    "baseSpeed": 30,
    "baseSpAttack": 47,
    "baseSpDefense": 138,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_STEEL)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_SOUNDPROOF }",
    "speciesName": "_(\"Bastiodon\")",
    "natDexNum": "NATIONAL_DEX_BASTIODON",
    "levelUpLearnset": "sBastiodonLevelUpLearnset",
    "teachableLearnset": "sBastiodonTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Combee",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "HONEY_GATHER",
      "NONE",
      "HUSTLE"
    ],
    "id": "SPECIES_COMBEE",
    "family": "P_FAMILY_COMBEE",
    "baseHP": 30,
    "baseAttack": 30,
    "baseDefense": 42,
    "baseSpeed": 70,
    "baseSpAttack": 30,
    "baseSpDefense": 42,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_HONEY_GATHER, ABILITY_NONE, ABILITY_HUSTLE }",
    "speciesName": "_(\"Combee\")",
    "natDexNum": "NATIONAL_DEX_COMBEE",
    "levelUpLearnset": "sCombeeLevelUpLearnset",
    "teachableLearnset": "sCombeeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 21, SPECIES_VESPIQUEN, CONDITIONS({IF_GENDER, MON_FEMALE})})",
    "baseBST": 244,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vespiquen",
    "parsedTypes": [
      "BUG",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "UNNERVE"
    ],
    "id": "SPECIES_VESPIQUEN",
    "family": "P_FAMILY_COMBEE",
    "baseHP": 70,
    "baseAttack": 80,
    "baseDefense": 102,
    "baseSpeed": 40,
    "baseSpAttack": 80,
    "baseSpDefense": 102,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_UNNERVE }",
    "speciesName": "_(\"Vespiquen\")",
    "natDexNum": "NATIONAL_DEX_VESPIQUEN",
    "levelUpLearnset": "sVespiquenLevelUpLearnset",
    "teachableLearnset": "sVespiquenTeachableLearnset",
    "baseBST": 474,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pachirisu",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "PICKUP",
      "VOLT_ABSORB"
    ],
    "id": "SPECIES_PACHIRISU",
    "family": "P_FAMILY_PACHIRISU",
    "baseHP": 60,
    "baseAttack": 45,
    "baseDefense": 70,
    "baseSpeed": 95,
    "baseSpAttack": 45,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_PICKUP, ABILITY_VOLT_ABSORB }",
    "speciesName": "_(\"Pachirisu\")",
    "natDexNum": "NATIONAL_DEX_PACHIRISU",
    "levelUpLearnset": "sPachirisuLevelUpLearnset",
    "teachableLearnset": "sPachirisuTeachableLearnset",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Buizel",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "WATER_VEIL"
    ],
    "id": "SPECIES_BUIZEL",
    "family": "P_FAMILY_BUIZEL",
    "baseHP": 55,
    "baseAttack": 65,
    "baseDefense": 35,
    "baseSpeed": 85,
    "baseSpAttack": 60,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Buizel\")",
    "natDexNum": "NATIONAL_DEX_BUIZEL",
    "levelUpLearnset": "sBuizelLevelUpLearnset",
    "teachableLearnset": "sBuizelTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_FLOATZEL})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Floatzel",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "WATER_VEIL"
    ],
    "id": "SPECIES_FLOATZEL",
    "family": "P_FAMILY_BUIZEL",
    "baseHP": 85,
    "baseAttack": 105,
    "baseDefense": 55,
    "baseSpeed": 115,
    "baseSpAttack": 85,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Floatzel\")",
    "natDexNum": "NATIONAL_DEX_FLOATZEL",
    "levelUpLearnset": "sFloatzelLevelUpLearnset",
    "teachableLearnset": "sFloatzelTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cherubi",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHERUBI",
    "family": "P_FAMILY_CHERUBI",
    "baseHP": 45,
    "baseAttack": 35,
    "baseDefense": 45,
    "baseSpeed": 35,
    "baseSpAttack": 62,
    "baseSpDefense": 53,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cherubi\")",
    "natDexNum": "NATIONAL_DEX_CHERUBI",
    "levelUpLearnset": "sCherubiLevelUpLearnset",
    "teachableLearnset": "sCherubiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_CHERRIM_OVERCAST})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cherrim  Sunshine",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "FLOWER_GIFT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHERRIM_SUNSHINE",
    "family": "P_FAMILY_CHERUBI",
    "baseHP": 70,
    "baseAttack": 60,
    "baseDefense": 70,
    "baseSpeed": 85,
    "baseSpAttack": 87,
    "baseSpDefense": 78,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_FLOWER_GIFT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cherrim\")",
    "natDexNum": "NATIONAL_DEX_CHERRIM",
    "levelUpLearnset": "sCherrimLevelUpLearnset",
    "teachableLearnset": "sCherrimTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shellos  West",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "STICKY_HOLD",
      "STORM_DRAIN",
      "SAND_FORCE"
    ],
    "id": "SPECIES_SHELLOS_WEST",
    "family": "P_FAMILY_SHELLOS",
    "baseHP": 76,
    "baseAttack": 48,
    "baseDefense": 48,
    "baseSpeed": 34,
    "baseSpAttack": 57,
    "baseSpDefense": 62,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_STICKY_HOLD, ABILITY_STORM_DRAIN, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Shellos\")",
    "natDexNum": "NATIONAL_DEX_SHELLOS",
    "levelUpLearnset": "sShellosLevelUpLearnset",
    "teachableLearnset": "sShellosTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_GASTRODON_WEST})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shellos  East",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "STICKY_HOLD",
      "STORM_DRAIN",
      "SAND_FORCE"
    ],
    "id": "SPECIES_SHELLOS_EAST",
    "family": "P_FAMILY_SHELLOS",
    "baseHP": 76,
    "baseAttack": 48,
    "baseDefense": 48,
    "baseSpeed": 34,
    "baseSpAttack": 57,
    "baseSpDefense": 62,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_STICKY_HOLD, ABILITY_STORM_DRAIN, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Shellos\")",
    "natDexNum": "NATIONAL_DEX_SHELLOS",
    "levelUpLearnset": "sShellosLevelUpLearnset",
    "teachableLearnset": "sShellosTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_GASTRODON_EAST})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gastrodon  West",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "STICKY_HOLD",
      "STORM_DRAIN",
      "SAND_FORCE"
    ],
    "id": "SPECIES_GASTRODON_WEST",
    "family": "P_FAMILY_SHELLOS",
    "baseHP": 111,
    "baseAttack": 83,
    "baseDefense": 68,
    "baseSpeed": 39,
    "baseSpAttack": 92,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_STICKY_HOLD, ABILITY_STORM_DRAIN, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Gastrodon\")",
    "natDexNum": "NATIONAL_DEX_GASTRODON",
    "levelUpLearnset": "sGastrodonLevelUpLearnset",
    "teachableLearnset": "sGastrodonTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gastrodon  East",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "STICKY_HOLD",
      "STORM_DRAIN",
      "SAND_FORCE"
    ],
    "id": "SPECIES_GASTRODON_EAST",
    "family": "P_FAMILY_SHELLOS",
    "baseHP": 111,
    "baseAttack": 83,
    "baseDefense": 68,
    "baseSpeed": 39,
    "baseSpAttack": 92,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_STICKY_HOLD, ABILITY_STORM_DRAIN, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Gastrodon\")",
    "natDexNum": "NATIONAL_DEX_GASTRODON",
    "levelUpLearnset": "sGastrodonLevelUpLearnset",
    "teachableLearnset": "sGastrodonTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drifloon",
    "parsedTypes": [
      "GHOST",
      "FLYING"
    ],
    "parsedAbilities": [
      "AFTERMATH",
      "UNBURDEN",
      "FLARE_BOOST"
    ],
    "id": "SPECIES_DRIFLOON",
    "family": "P_FAMILY_DRIFLOON",
    "baseHP": 90,
    "baseAttack": 50,
    "baseDefense": 34,
    "baseSpeed": 70,
    "baseSpAttack": 60,
    "baseSpDefense": 44,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FLYING)",
    "abilities": "{ ABILITY_AFTERMATH, ABILITY_UNBURDEN, ABILITY_FLARE_BOOST }",
    "speciesName": "_(\"Drifloon\")",
    "natDexNum": "NATIONAL_DEX_DRIFLOON",
    "levelUpLearnset": "sDrifloonLevelUpLearnset",
    "teachableLearnset": "sDrifloonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_DRIFBLIM})",
    "baseBST": 348,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drifblim",
    "parsedTypes": [
      "GHOST",
      "FLYING"
    ],
    "parsedAbilities": [
      "AFTERMATH",
      "UNBURDEN",
      "FLARE_BOOST"
    ],
    "id": "SPECIES_DRIFBLIM",
    "family": "P_FAMILY_DRIFLOON",
    "baseHP": 150,
    "baseAttack": 80,
    "baseDefense": 44,
    "baseSpeed": 80,
    "baseSpAttack": 90,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FLYING)",
    "abilities": "{ ABILITY_AFTERMATH, ABILITY_UNBURDEN, ABILITY_FLARE_BOOST }",
    "speciesName": "_(\"Drifblim\")",
    "natDexNum": "NATIONAL_DEX_DRIFBLIM",
    "levelUpLearnset": "sDrifblimLevelUpLearnset",
    "teachableLearnset": "sDrifblimTeachableLearnset",
    "baseBST": 498,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Buneary",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "KLUTZ",
      "LIMBER"
    ],
    "id": "SPECIES_BUNEARY",
    "family": "P_FAMILY_BUNEARY",
    "baseHP": 55,
    "baseAttack": 66,
    "baseDefense": 44,
    "baseSpeed": 85,
    "baseSpAttack": 44,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_KLUTZ, ABILITY_LIMBER }",
    "speciesName": "_(\"Buneary\")",
    "natDexNum": "NATIONAL_DEX_BUNEARY",
    "levelUpLearnset": "sBunearyLevelUpLearnset",
    "teachableLearnset": "sBunearyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_LOPUNNY, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lopunny",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "KLUTZ",
      "LIMBER"
    ],
    "id": "SPECIES_LOPUNNY",
    "family": "P_FAMILY_BUNEARY",
    "baseHP": 65,
    "baseAttack": 76,
    "baseDefense": 84,
    "baseSpeed": 105,
    "baseSpAttack": 54,
    "baseSpDefense": 96,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_KLUTZ, ABILITY_LIMBER }",
    "speciesName": "_(\"Lopunny\")",
    "natDexNum": "NATIONAL_DEX_LOPUNNY",
    "levelUpLearnset": "sLopunnyLevelUpLearnset",
    "teachableLearnset": "sLopunnyTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lopunny  Mega",
    "parsedTypes": [
      "NORMAL",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SCRAPPY",
      "SCRAPPY",
      "SCRAPPY"
    ],
    "id": "SPECIES_LOPUNNY_MEGA",
    "family": "P_FAMILY_BUNEARY",
    "baseHP": 65,
    "baseAttack": 136,
    "baseDefense": 94,
    "baseSpeed": 135,
    "baseSpAttack": 54,
    "baseSpDefense": 96,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SCRAPPY, ABILITY_SCRAPPY, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Lopunny\")",
    "natDexNum": "NATIONAL_DEX_LOPUNNY",
    "levelUpLearnset": "sLopunnyLevelUpLearnset",
    "teachableLearnset": "sLopunnyTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glameow",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "LIMBER",
      "OWN_TEMPO",
      "KEEN_EYE"
    ],
    "id": "SPECIES_GLAMEOW",
    "family": "P_FAMILY_GLAMEOW",
    "baseHP": 49,
    "baseAttack": 55,
    "baseDefense": 42,
    "baseSpeed": 85,
    "baseSpAttack": 42,
    "baseSpDefense": 37,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_OWN_TEMPO, ABILITY_KEEN_EYE }",
    "speciesName": "_(\"Glameow\")",
    "natDexNum": "NATIONAL_DEX_GLAMEOW",
    "levelUpLearnset": "sGlameowLevelUpLearnset",
    "teachableLearnset": "sGlameowTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_PURUGLY})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Purugly",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "OWN_TEMPO",
      "DEFIANT"
    ],
    "id": "SPECIES_PURUGLY",
    "family": "P_FAMILY_GLAMEOW",
    "baseHP": 71,
    "baseAttack": 82,
    "baseDefense": 64,
    "baseSpeed": 112,
    "baseSpAttack": 64,
    "baseSpDefense": 59,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_OWN_TEMPO, ABILITY_DEFIANT }",
    "speciesName": "_(\"Purugly\")",
    "natDexNum": "NATIONAL_DEX_PURUGLY",
    "levelUpLearnset": "sPuruglyLevelUpLearnset",
    "teachableLearnset": "sPuruglyTeachableLearnset",
    "baseBST": 452,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stunky",
    "parsedTypes": [
      "POISON",
      "DARK"
    ],
    "parsedAbilities": [
      "STENCH",
      "AFTERMATH",
      "KEEN_EYE"
    ],
    "id": "SPECIES_STUNKY",
    "family": "P_FAMILY_STUNKY",
    "baseHP": 63,
    "baseAttack": 63,
    "baseDefense": 47,
    "baseSpeed": 74,
    "baseSpAttack": 41,
    "baseSpDefense": 41,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DARK)",
    "abilities": "{ ABILITY_STENCH, ABILITY_AFTERMATH, ABILITY_KEEN_EYE }",
    "speciesName": "_(\"Stunky\")",
    "natDexNum": "NATIONAL_DEX_STUNKY",
    "levelUpLearnset": "sStunkyLevelUpLearnset",
    "teachableLearnset": "sStunkyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_SKUNTANK})",
    "baseBST": 329,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skuntank",
    "parsedTypes": [
      "POISON",
      "DARK"
    ],
    "parsedAbilities": [
      "STENCH",
      "AFTERMATH",
      "KEEN_EYE"
    ],
    "id": "SPECIES_SKUNTANK",
    "family": "P_FAMILY_STUNKY",
    "baseHP": 103,
    "baseAttack": 93,
    "baseDefense": 67,
    "baseSpeed": 84,
    "baseSpAttack": 71,
    "baseSpDefense": 61,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DARK)",
    "abilities": "{ ABILITY_STENCH, ABILITY_AFTERMATH, ABILITY_KEEN_EYE }",
    "speciesName": "_(\"Skuntank\")",
    "natDexNum": "NATIONAL_DEX_SKUNTANK",
    "levelUpLearnset": "sSkuntankLevelUpLearnset",
    "teachableLearnset": "sSkuntankTeachableLearnset",
    "baseBST": 479,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bronzor",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "HEATPROOF",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_BRONZOR",
    "family": "P_FAMILY_BRONZOR",
    "baseHP": 57,
    "baseAttack": 24,
    "baseDefense": 86,
    "baseSpeed": 23,
    "baseSpAttack": 24,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_HEATPROOF, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Bronzor\")",
    "natDexNum": "NATIONAL_DEX_BRONZOR",
    "levelUpLearnset": "sBronzorLevelUpLearnset",
    "teachableLearnset": "sBronzorTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 33, SPECIES_BRONZONG})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bronzong",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "HEATPROOF",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_BRONZONG",
    "family": "P_FAMILY_BRONZOR",
    "baseHP": 67,
    "baseAttack": 89,
    "baseDefense": 116,
    "baseSpeed": 33,
    "baseSpAttack": 79,
    "baseSpDefense": 116,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_HEATPROOF, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Bronzong\")",
    "natDexNum": "NATIONAL_DEX_BRONZONG",
    "levelUpLearnset": "sBronzongLevelUpLearnset",
    "teachableLearnset": "sBronzongTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chatot",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "TANGLED_FEET",
      "BIG_PECKS"
    ],
    "id": "SPECIES_CHATOT",
    "family": "P_FAMILY_CHATOT",
    "baseHP": 76,
    "baseAttack": 65,
    "baseDefense": 45,
    "baseSpeed": 91,
    "baseSpAttack": 92,
    "baseSpDefense": 42,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_TANGLED_FEET, ABILITY_BIG_PECKS }",
    "speciesName": "_(\"Chatot\")",
    "natDexNum": "NATIONAL_DEX_CHATOT",
    "levelUpLearnset": "sChatotLevelUpLearnset",
    "teachableLearnset": "sChatotTeachableLearnset",
    "baseBST": 411,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spiritomb",
    "parsedTypes": [
      "GHOST",
      "DARK"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_SPIRITOMB",
    "family": "P_FAMILY_SPIRITOMB",
    "baseHP": 50,
    "baseAttack": 92,
    "baseDefense": 108,
    "baseSpeed": 35,
    "baseSpAttack": 92,
    "baseSpDefense": 108,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_DARK)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Spiritomb\")",
    "natDexNum": "NATIONAL_DEX_SPIRITOMB",
    "levelUpLearnset": "sSpiritombLevelUpLearnset",
    "teachableLearnset": "sSpiritombTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gible",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "ROUGH_SKIN"
    ],
    "id": "SPECIES_GIBLE",
    "family": "P_FAMILY_GIBLE",
    "baseHP": 58,
    "baseAttack": 70,
    "baseDefense": 45,
    "baseSpeed": 42,
    "baseSpAttack": 40,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_ROUGH_SKIN }",
    "speciesName": "_(\"Gible\")",
    "natDexNum": "NATIONAL_DEX_GIBLE",
    "levelUpLearnset": "sGibleLevelUpLearnset",
    "teachableLearnset": "sGibleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_GABITE})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gabite",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "ROUGH_SKIN"
    ],
    "id": "SPECIES_GABITE",
    "family": "P_FAMILY_GIBLE",
    "baseHP": 68,
    "baseAttack": 90,
    "baseDefense": 65,
    "baseSpeed": 82,
    "baseSpAttack": 50,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_ROUGH_SKIN }",
    "speciesName": "_(\"Gabite\")",
    "natDexNum": "NATIONAL_DEX_GABITE",
    "levelUpLearnset": "sGabiteLevelUpLearnset",
    "teachableLearnset": "sGabiteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 48, SPECIES_GARCHOMP})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Garchomp",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_VEIL",
      "NONE",
      "ROUGH_SKIN"
    ],
    "id": "SPECIES_GARCHOMP",
    "family": "P_FAMILY_GIBLE",
    "baseHP": 108,
    "baseAttack": 130,
    "baseDefense": 95,
    "baseSpeed": 102,
    "baseSpAttack": 80,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_VEIL, ABILITY_NONE, ABILITY_ROUGH_SKIN }",
    "speciesName": "_(\"Garchomp\")",
    "natDexNum": "NATIONAL_DEX_GARCHOMP",
    "levelUpLearnset": "sGarchompLevelUpLearnset",
    "teachableLearnset": "sGarchompTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Garchomp  Mega",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_FORCE",
      "SAND_FORCE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_GARCHOMP_MEGA",
    "family": "P_FAMILY_GIBLE",
    "baseHP": 108,
    "baseAttack": 170,
    "baseDefense": 115,
    "baseSpeed": 92,
    "baseSpAttack": 120,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_FORCE, ABILITY_SAND_FORCE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Garchomp\")",
    "natDexNum": "NATIONAL_DEX_GARCHOMP",
    "levelUpLearnset": "sGarchompLevelUpLearnset",
    "teachableLearnset": "sGarchompTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Riolu",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "STEADFAST",
      "INNER_FOCUS",
      "PRANKSTER"
    ],
    "id": "SPECIES_RIOLU",
    "family": "P_FAMILY_RIOLU",
    "baseHP": 40,
    "baseAttack": 70,
    "baseDefense": 40,
    "baseSpeed": 60,
    "baseSpAttack": 35,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_STEADFAST, ABILITY_INNER_FOCUS, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Riolu\")",
    "natDexNum": "NATIONAL_DEX_RIOLU",
    "levelUpLearnset": "sRioluLevelUpLearnset",
    "teachableLearnset": "sRioluTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_LUCARIO, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD},{IF_NOT_TIME, TIME_NIGHT})})",
    "baseBST": 285,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lucario",
    "parsedTypes": [
      "FIGHTING",
      "STEEL"
    ],
    "parsedAbilities": [
      "STEADFAST",
      "INNER_FOCUS",
      "JUSTIFIED"
    ],
    "id": "SPECIES_LUCARIO",
    "family": "P_FAMILY_RIOLU",
    "baseHP": 70,
    "baseAttack": 110,
    "baseDefense": 70,
    "baseSpeed": 90,
    "baseSpAttack": 115,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_STEEL)",
    "abilities": "{ ABILITY_STEADFAST, ABILITY_INNER_FOCUS, ABILITY_JUSTIFIED }",
    "speciesName": "_(\"Lucario\")",
    "natDexNum": "NATIONAL_DEX_LUCARIO",
    "levelUpLearnset": "sLucarioLevelUpLearnset",
    "teachableLearnset": "sLucarioTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lucario  Mega",
    "parsedTypes": [
      "FIGHTING",
      "STEEL"
    ],
    "parsedAbilities": [
      "ADAPTABILITY",
      "ADAPTABILITY",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_LUCARIO_MEGA",
    "family": "P_FAMILY_RIOLU",
    "baseHP": 70,
    "baseAttack": 145,
    "baseDefense": 88,
    "baseSpeed": 112,
    "baseSpAttack": 140,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_STEEL)",
    "abilities": "{ ABILITY_ADAPTABILITY, ABILITY_ADAPTABILITY, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Lucario\")",
    "natDexNum": "NATIONAL_DEX_LUCARIO",
    "levelUpLearnset": "sLucarioLevelUpLearnset",
    "teachableLearnset": "sLucarioTeachableLearnset",
    "baseBST": 625,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hippopotas",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_STREAM",
      "NONE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_HIPPOPOTAS",
    "family": "P_FAMILY_HIPPOPOTAS",
    "baseHP": 68,
    "baseAttack": 72,
    "baseDefense": 78,
    "baseSpeed": 32,
    "baseSpAttack": 38,
    "baseSpDefense": 42,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_STREAM, ABILITY_NONE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Hippopotas\")",
    "natDexNum": "NATIONAL_DEX_HIPPOPOTAS",
    "levelUpLearnset": "sHippopotasLevelUpLearnset",
    "teachableLearnset": "sHippopotasTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_HIPPOWDON})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hippowdon",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_STREAM",
      "NONE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_HIPPOWDON",
    "family": "P_FAMILY_HIPPOPOTAS",
    "baseHP": 108,
    "baseAttack": 112,
    "baseDefense": 118,
    "baseSpeed": 47,
    "baseSpAttack": 68,
    "baseSpDefense": 72,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_STREAM, ABILITY_NONE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Hippowdon\")",
    "natDexNum": "NATIONAL_DEX_HIPPOWDON",
    "levelUpLearnset": "sHippowdonLevelUpLearnset",
    "teachableLearnset": "sHippowdonTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skorupi",
    "parsedTypes": [
      "POISON",
      "BUG"
    ],
    "parsedAbilities": [
      "BATTLE_ARMOR",
      "SNIPER",
      "KEEN_EYE"
    ],
    "id": "SPECIES_SKORUPI",
    "family": "P_FAMILY_SKORUPI",
    "baseHP": 40,
    "baseAttack": 50,
    "baseDefense": 90,
    "baseSpeed": 65,
    "baseSpAttack": 30,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_POISON, TYPE_BUG)",
    "abilities": "{ ABILITY_BATTLE_ARMOR, ABILITY_SNIPER, ABILITY_KEEN_EYE }",
    "speciesName": "_(\"Skorupi\")",
    "natDexNum": "NATIONAL_DEX_SKORUPI",
    "levelUpLearnset": "sSkorupiLevelUpLearnset",
    "teachableLearnset": "sSkorupiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_DRAPION})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drapion",
    "parsedTypes": [
      "POISON",
      "DARK"
    ],
    "parsedAbilities": [
      "BATTLE_ARMOR",
      "SNIPER",
      "KEEN_EYE"
    ],
    "id": "SPECIES_DRAPION",
    "family": "P_FAMILY_SKORUPI",
    "baseHP": 70,
    "baseAttack": 90,
    "baseDefense": 110,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DARK)",
    "abilities": "{ ABILITY_BATTLE_ARMOR, ABILITY_SNIPER, ABILITY_KEEN_EYE }",
    "speciesName": "_(\"Drapion\")",
    "natDexNum": "NATIONAL_DEX_DRAPION",
    "levelUpLearnset": "sDrapionLevelUpLearnset",
    "teachableLearnset": "sDrapionTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Croagunk",
    "parsedTypes": [
      "POISON",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "ANTICIPATION",
      "DRY_SKIN",
      "POISON_TOUCH"
    ],
    "id": "SPECIES_CROAGUNK",
    "family": "P_FAMILY_CROAGUNK",
    "baseHP": 48,
    "baseAttack": 61,
    "baseDefense": 40,
    "baseSpeed": 50,
    "baseSpAttack": 61,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_ANTICIPATION, ABILITY_DRY_SKIN, ABILITY_POISON_TOUCH }",
    "speciesName": "_(\"Croagunk\")",
    "natDexNum": "NATIONAL_DEX_CROAGUNK",
    "levelUpLearnset": "sCroagunkLevelUpLearnset",
    "teachableLearnset": "sCroagunkTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_TOXICROAK})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toxicroak",
    "parsedTypes": [
      "POISON",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "ANTICIPATION",
      "DRY_SKIN",
      "POISON_TOUCH"
    ],
    "id": "SPECIES_TOXICROAK",
    "family": "P_FAMILY_CROAGUNK",
    "baseHP": 83,
    "baseAttack": 106,
    "baseDefense": 65,
    "baseSpeed": 85,
    "baseSpAttack": 86,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_ANTICIPATION, ABILITY_DRY_SKIN, ABILITY_POISON_TOUCH }",
    "speciesName": "_(\"Toxicroak\")",
    "natDexNum": "NATIONAL_DEX_TOXICROAK",
    "levelUpLearnset": "sToxicroakLevelUpLearnset",
    "teachableLearnset": "sToxicroakTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Carnivine",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CARNIVINE",
    "family": "P_FAMILY_CARNIVINE",
    "baseHP": 74,
    "baseAttack": 100,
    "baseDefense": 72,
    "baseSpeed": 46,
    "baseSpAttack": 90,
    "baseSpDefense": 72,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Carnivine\")",
    "natDexNum": "NATIONAL_DEX_CARNIVINE",
    "levelUpLearnset": "sCarnivineLevelUpLearnset",
    "teachableLearnset": "sCarnivineTeachableLearnset",
    "baseBST": 454,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Finneon",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "STORM_DRAIN",
      "WATER_VEIL"
    ],
    "id": "SPECIES_FINNEON",
    "family": "P_FAMILY_FINNEON",
    "baseHP": 49,
    "baseAttack": 49,
    "baseDefense": 56,
    "baseSpeed": 66,
    "baseSpAttack": 49,
    "baseSpDefense": 61,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_STORM_DRAIN, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Finneon\")",
    "natDexNum": "NATIONAL_DEX_FINNEON",
    "levelUpLearnset": "sFinneonLevelUpLearnset",
    "teachableLearnset": "sFinneonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 31, SPECIES_LUMINEON})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lumineon",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "STORM_DRAIN",
      "WATER_VEIL"
    ],
    "id": "SPECIES_LUMINEON",
    "family": "P_FAMILY_FINNEON",
    "baseHP": 69,
    "baseAttack": 69,
    "baseDefense": 76,
    "baseSpeed": 91,
    "baseSpAttack": 69,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_STORM_DRAIN, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Lumineon\")",
    "natDexNum": "NATIONAL_DEX_LUMINEON",
    "levelUpLearnset": "sLumineonLevelUpLearnset",
    "teachableLearnset": "sLumineonTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Snover",
    "parsedTypes": [
      "GRASS",
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_WARNING",
      "NONE",
      "SOUNDPROOF"
    ],
    "id": "SPECIES_SNOVER",
    "family": "P_FAMILY_SNOVER",
    "baseHP": 60,
    "baseAttack": 62,
    "baseDefense": 50,
    "baseSpeed": 40,
    "baseSpAttack": 62,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_WARNING, ABILITY_NONE, ABILITY_SOUNDPROOF }",
    "speciesName": "_(\"Snover\")",
    "natDexNum": "NATIONAL_DEX_SNOVER",
    "levelUpLearnset": "sSnoverLevelUpLearnset",
    "teachableLearnset": "sSnoverTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_ABOMASNOW})",
    "baseBST": 334,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Abomasnow",
    "parsedTypes": [
      "GRASS",
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_WARNING",
      "NONE",
      "SOUNDPROOF"
    ],
    "id": "SPECIES_ABOMASNOW",
    "family": "P_FAMILY_SNOVER",
    "baseHP": 90,
    "baseAttack": 92,
    "baseDefense": 75,
    "baseSpeed": 60,
    "baseSpAttack": 92,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_WARNING, ABILITY_NONE, ABILITY_SOUNDPROOF }",
    "speciesName": "_(\"Abomasnow\")",
    "natDexNum": "NATIONAL_DEX_ABOMASNOW",
    "levelUpLearnset": "sAbomasnowLevelUpLearnset",
    "teachableLearnset": "sAbomasnowTeachableLearnset",
    "baseBST": 494,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Abomasnow  Mega",
    "parsedTypes": [
      "GRASS",
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_WARNING",
      "SNOW_WARNING",
      "SNOW_WARNING"
    ],
    "id": "SPECIES_ABOMASNOW_MEGA",
    "family": "P_FAMILY_SNOVER",
    "baseHP": 90,
    "baseAttack": 132,
    "baseDefense": 105,
    "baseSpeed": 30,
    "baseSpAttack": 132,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_WARNING, ABILITY_SNOW_WARNING, ABILITY_SNOW_WARNING }",
    "speciesName": "_(\"Abomasnow\")",
    "natDexNum": "NATIONAL_DEX_ABOMASNOW",
    "levelUpLearnset": "sAbomasnowLevelUpLearnset",
    "teachableLearnset": "sAbomasnowTeachableLearnset",
    "baseBST": 594,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rotom",
    "parsedTypes": [
      "ELECTRIC",
      "GHOST"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROTOM",
    "family": "P_FAMILY_ROTOM",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 77,
    "baseSpeed": 91,
    "baseSpAttack": 95,
    "baseSpDefense": 77,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_GHOST)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rotom\")",
    "natDexNum": "NATIONAL_DEX_ROTOM",
    "levelUpLearnset": "sRotomLevelUpLearnset",
    "teachableLearnset": "sRotomTeachableLearnset",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rotom  Heat",
    "parsedTypes": [
      "ELECTRIC",
      "FIRE"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROTOM_HEAT",
    "family": "P_FAMILY_ROTOM",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 107,
    "baseSpeed": 86,
    "baseSpAttack": 105,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FIRE)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rotom\")",
    "natDexNum": "NATIONAL_DEX_ROTOM",
    "levelUpLearnset": "sRotomLevelUpLearnset",
    "teachableLearnset": "sRotomTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rotom  Wash",
    "parsedTypes": [
      "ELECTRIC",
      "WATER"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROTOM_WASH",
    "family": "P_FAMILY_ROTOM",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 107,
    "baseSpeed": 86,
    "baseSpAttack": 105,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_WATER)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rotom\")",
    "natDexNum": "NATIONAL_DEX_ROTOM",
    "levelUpLearnset": "sRotomLevelUpLearnset",
    "teachableLearnset": "sRotomTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rotom  Frost",
    "parsedTypes": [
      "ELECTRIC",
      "ICE"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROTOM_FROST",
    "family": "P_FAMILY_ROTOM",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 107,
    "baseSpeed": 86,
    "baseSpAttack": 105,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_ICE)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rotom\")",
    "natDexNum": "NATIONAL_DEX_ROTOM",
    "levelUpLearnset": "sRotomLevelUpLearnset",
    "teachableLearnset": "sRotomTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rotom  Fan",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROTOM_FAN",
    "family": "P_FAMILY_ROTOM",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 107,
    "baseSpeed": 86,
    "baseSpAttack": 105,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rotom\")",
    "natDexNum": "NATIONAL_DEX_ROTOM",
    "levelUpLearnset": "sRotomLevelUpLearnset",
    "teachableLearnset": "sRotomTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rotom  Mow",
    "parsedTypes": [
      "ELECTRIC",
      "GRASS"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROTOM_MOW",
    "family": "P_FAMILY_ROTOM",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 107,
    "baseSpeed": 86,
    "baseSpAttack": 105,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_GRASS)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rotom\")",
    "natDexNum": "NATIONAL_DEX_ROTOM",
    "levelUpLearnset": "sRotomLevelUpLearnset",
    "teachableLearnset": "sRotomTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Uxie",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_UXIE",
    "family": "P_FAMILY_UXIE",
    "baseHP": 75,
    "baseAttack": 75,
    "baseDefense": 130,
    "baseSpeed": 95,
    "baseSpAttack": 75,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Uxie\")",
    "natDexNum": "NATIONAL_DEX_UXIE",
    "levelUpLearnset": "sUxieLevelUpLearnset",
    "teachableLearnset": "sUxieTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mesprit",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MESPRIT",
    "family": "P_FAMILY_MESPRIT",
    "baseHP": 80,
    "baseAttack": 105,
    "baseDefense": 105,
    "baseSpeed": 80,
    "baseSpAttack": 105,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Mesprit\")",
    "natDexNum": "NATIONAL_DEX_MESPRIT",
    "levelUpLearnset": "sMespritLevelUpLearnset",
    "teachableLearnset": "sMespritTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Azelf",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_AZELF",
    "family": "P_FAMILY_AZELF",
    "baseHP": 75,
    "baseAttack": 125,
    "baseDefense": 70,
    "baseSpeed": 115,
    "baseSpAttack": 125,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Azelf\")",
    "natDexNum": "NATIONAL_DEX_AZELF",
    "levelUpLearnset": "sAzelfLevelUpLearnset",
    "teachableLearnset": "sAzelfTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dialga",
    "parsedTypes": [
      "STEEL",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_DIALGA",
    "family": "P_FAMILY_DIALGA",
    "baseHP": 100,
    "baseAttack": 120,
    "baseDefense": 120,
    "baseSpeed": 90,
    "baseSpAttack": 150,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Dialga\")",
    "natDexNum": "NATIONAL_DEX_DIALGA",
    "levelUpLearnset": "sDialgaLevelUpLearnset",
    "teachableLearnset": "sDialgaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dialga  Origin",
    "parsedTypes": [
      "STEEL",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_DIALGA_ORIGIN",
    "family": "P_FAMILY_DIALGA",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 120,
    "baseSpeed": 90,
    "baseSpAttack": 150,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Dialga\")",
    "natDexNum": "NATIONAL_DEX_DIALGA",
    "levelUpLearnset": "sDialgaLevelUpLearnset",
    "teachableLearnset": "sDialgaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Palkia",
    "parsedTypes": [
      "WATER",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_PALKIA",
    "family": "P_FAMILY_PALKIA",
    "baseHP": 90,
    "baseAttack": 120,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 150,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Palkia\")",
    "natDexNum": "NATIONAL_DEX_PALKIA",
    "levelUpLearnset": "sPalkiaLevelUpLearnset",
    "teachableLearnset": "sPalkiaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Palkia  Origin",
    "parsedTypes": [
      "WATER",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_PALKIA_ORIGIN",
    "family": "P_FAMILY_PALKIA",
    "baseHP": 90,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 120,
    "baseSpAttack": 150,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Palkia\")",
    "natDexNum": "NATIONAL_DEX_PALKIA",
    "levelUpLearnset": "sPalkiaLevelUpLearnset",
    "teachableLearnset": "sPalkiaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Heatran",
    "parsedTypes": [
      "FIRE",
      "STEEL"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "NONE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_HEATRAN",
    "family": "P_FAMILY_HEATRAN",
    "baseHP": 91,
    "baseAttack": 90,
    "baseDefense": 106,
    "baseSpeed": 77,
    "baseSpAttack": 130,
    "baseSpDefense": 106,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_STEEL)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_NONE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Heatran\")",
    "natDexNum": "NATIONAL_DEX_HEATRAN",
    "levelUpLearnset": "sHeatranLevelUpLearnset",
    "teachableLearnset": "sHeatranTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Regigigas",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "SLOW_START",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_REGIGIGAS",
    "family": "P_FAMILY_REGIGIGAS",
    "baseHP": 110,
    "baseAttack": 160,
    "baseDefense": 110,
    "baseSpeed": 100,
    "baseSpAttack": 80,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_SLOW_START, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Regigigas\")",
    "natDexNum": "NATIONAL_DEX_REGIGIGAS",
    "levelUpLearnset": "sRegigigasLevelUpLearnset",
    "teachableLearnset": "sRegigigasTeachableLearnset",
    "baseBST": 670,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Giratina  Altered",
    "parsedTypes": [
      "GHOST",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_GIRATINA_ALTERED",
    "family": "P_FAMILY_GIRATINA",
    "baseHP": 150,
    "baseAttack": 100,
    "baseDefense": 120,
    "baseSpeed": 90,
    "baseSpAttack": 100,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Giratina\")",
    "natDexNum": "NATIONAL_DEX_GIRATINA",
    "levelUpLearnset": "sGiratinaLevelUpLearnset",
    "teachableLearnset": "sGiratinaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Giratina  Origin",
    "parsedTypes": [
      "GHOST",
      "DRAGON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GIRATINA_ORIGIN",
    "family": "P_FAMILY_GIRATINA",
    "baseHP": 150,
    "baseAttack": 120,
    "baseDefense": 100,
    "baseSpeed": 90,
    "baseSpAttack": 120,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_DRAGON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Giratina\")",
    "natDexNum": "NATIONAL_DEX_GIRATINA",
    "levelUpLearnset": "sGiratinaLevelUpLearnset",
    "teachableLearnset": "sGiratinaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cresselia",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CRESSELIA",
    "family": "P_FAMILY_CRESSELIA",
    "baseHP": 120,
    "baseAttack": 70,
    "baseDefense": 110,
    "baseSpeed": 85,
    "baseSpAttack": 75,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cresselia\")",
    "natDexNum": "NATIONAL_DEX_CRESSELIA",
    "levelUpLearnset": "sCresseliaLevelUpLearnset",
    "teachableLearnset": "sCresseliaTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Phione",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HYDRATION",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PHIONE",
    "family": "P_FAMILY_MANAPHY",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 80,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HYDRATION, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Phione\")",
    "natDexNum": "NATIONAL_DEX_PHIONE",
    "levelUpLearnset": "sPhioneLevelUpLearnset",
    "teachableLearnset": "sPhioneTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Manaphy",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HYDRATION",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MANAPHY",
    "family": "P_FAMILY_MANAPHY",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HYDRATION, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Manaphy\")",
    "natDexNum": "NATIONAL_DEX_MANAPHY",
    "levelUpLearnset": "sManaphyLevelUpLearnset",
    "teachableLearnset": "sManaphyTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darkrai",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "BAD_DREAMS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DARKRAI",
    "family": "P_FAMILY_DARKRAI",
    "baseHP": 70,
    "baseAttack": 90,
    "baseDefense": 90,
    "baseSpeed": 125,
    "baseSpAttack": 135,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_BAD_DREAMS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Darkrai\")",
    "natDexNum": "NATIONAL_DEX_DARKRAI",
    "levelUpLearnset": "sDarkraiLevelUpLearnset",
    "teachableLearnset": "sDarkraiTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shaymin  Land",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SHAYMIN_LAND",
    "family": "P_FAMILY_SHAYMIN",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Shaymin\")",
    "natDexNum": "NATIONAL_DEX_SHAYMIN",
    "levelUpLearnset": "sShayminLandLevelUpLearnset",
    "teachableLearnset": "sShayminLandTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shaymin  Sky",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SHAYMIN_SKY",
    "family": "P_FAMILY_SHAYMIN",
    "baseHP": 100,
    "baseAttack": 103,
    "baseDefense": 75,
    "baseSpeed": 127,
    "baseSpAttack": 120,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Shaymin\")",
    "natDexNum": "NATIONAL_DEX_SHAYMIN",
    "levelUpLearnset": "sShayminSkyLevelUpLearnset",
    "teachableLearnset": "sShayminSkyTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Victini",
    "parsedTypes": [
      "PSYCHIC",
      "FIRE"
    ],
    "parsedAbilities": [
      "VICTORY_STAR",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_VICTINI",
    "family": "P_FAMILY_VICTINI",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 100,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FIRE)",
    "abilities": "{ ABILITY_VICTORY_STAR, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Victini\")",
    "natDexNum": "NATIONAL_DEX_VICTINI",
    "levelUpLearnset": "sVictiniLevelUpLearnset",
    "teachableLearnset": "sVictiniTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Snivy",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_SNIVY",
    "family": "P_FAMILY_SNIVY",
    "baseHP": 45,
    "baseAttack": 45,
    "baseDefense": 55,
    "baseSpeed": 63,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Snivy\")",
    "natDexNum": "NATIONAL_DEX_SNIVY",
    "levelUpLearnset": "sSnivyLevelUpLearnset",
    "teachableLearnset": "sSnivyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_SERVINE})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Servine",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_SERVINE",
    "family": "P_FAMILY_SNIVY",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 75,
    "baseSpeed": 83,
    "baseSpAttack": 60,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Servine\")",
    "natDexNum": "NATIONAL_DEX_SERVINE",
    "levelUpLearnset": "sServineLevelUpLearnset",
    "teachableLearnset": "sServineTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SERPERIOR})",
    "baseBST": 413,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Serperior",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_SERPERIOR",
    "family": "P_FAMILY_SNIVY",
    "baseHP": 75,
    "baseAttack": 75,
    "baseDefense": 95,
    "baseSpeed": 113,
    "baseSpAttack": 75,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Serperior\")",
    "natDexNum": "NATIONAL_DEX_SERPERIOR",
    "levelUpLearnset": "sSerperiorLevelUpLearnset",
    "teachableLearnset": "sSerperiorTeachableLearnset",
    "baseBST": 528,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tepig",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "THICK_FAT"
    ],
    "id": "SPECIES_TEPIG",
    "family": "P_FAMILY_TEPIG",
    "baseHP": 65,
    "baseAttack": 63,
    "baseDefense": 45,
    "baseSpeed": 45,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Tepig\")",
    "natDexNum": "NATIONAL_DEX_TEPIG",
    "levelUpLearnset": "sTepigLevelUpLearnset",
    "teachableLearnset": "sTepigTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_PIGNITE})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pignite",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "THICK_FAT"
    ],
    "id": "SPECIES_PIGNITE",
    "family": "P_FAMILY_TEPIG",
    "baseHP": 90,
    "baseAttack": 93,
    "baseDefense": 55,
    "baseSpeed": 55,
    "baseSpAttack": 70,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Pignite\")",
    "natDexNum": "NATIONAL_DEX_PIGNITE",
    "levelUpLearnset": "sPigniteLevelUpLearnset",
    "teachableLearnset": "sPigniteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_EMBOAR})",
    "baseBST": 418,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Emboar",
    "parsedTypes": [
      "FIRE",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "RECKLESS"
    ],
    "id": "SPECIES_EMBOAR",
    "family": "P_FAMILY_TEPIG",
    "baseHP": 110,
    "baseAttack": 123,
    "baseDefense": 65,
    "baseSpeed": 65,
    "baseSpAttack": 100,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_RECKLESS }",
    "speciesName": "_(\"Emboar\")",
    "natDexNum": "NATIONAL_DEX_EMBOAR",
    "levelUpLearnset": "sEmboarLevelUpLearnset",
    "teachableLearnset": "sEmboarTeachableLearnset",
    "baseBST": 528,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oshawott",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_OSHAWOTT",
    "family": "P_FAMILY_OSHAWOTT",
    "baseHP": 55,
    "baseAttack": 55,
    "baseDefense": 45,
    "baseSpeed": 45,
    "baseSpAttack": 63,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Oshawott\")",
    "natDexNum": "NATIONAL_DEX_OSHAWOTT",
    "levelUpLearnset": "sOshawottLevelUpLearnset",
    "teachableLearnset": "sOshawottTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_DEWOTT})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dewott",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_DEWOTT",
    "family": "P_FAMILY_OSHAWOTT",
    "baseHP": 75,
    "baseAttack": 75,
    "baseDefense": 60,
    "baseSpeed": 60,
    "baseSpAttack": 83,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Dewott\")",
    "natDexNum": "NATIONAL_DEX_DEWOTT",
    "levelUpLearnset": "sDewottLevelUpLearnset",
    "teachableLearnset": "sDewottTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SAMUROTT}",
    "baseBST": 413,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Samurott",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHELL_ARMOR"
    ],
    "id": "SPECIES_SAMUROTT",
    "family": "P_FAMILY_OSHAWOTT",
    "baseHP": 95,
    "baseAttack": 100,
    "baseDefense": 85,
    "baseSpeed": 70,
    "baseSpAttack": 108,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHELL_ARMOR }",
    "speciesName": "_(\"Samurott\")",
    "natDexNum": "NATIONAL_DEX_SAMUROTT",
    "levelUpLearnset": "sSamurottLevelUpLearnset",
    "teachableLearnset": "sSamurottTeachableLearnset",
    "baseBST": 528,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Samurott  Hisui",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SHARPNESS"
    ],
    "id": "SPECIES_SAMUROTT_HISUI",
    "family": "P_FAMILY_OSHAWOTT",
    "baseHP": 90,
    "baseAttack": 108,
    "baseDefense": 80,
    "baseSpeed": 85,
    "baseSpAttack": 100,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SHARPNESS }",
    "speciesName": "_(\"Samurott\")",
    "natDexNum": "NATIONAL_DEX_SAMUROTT",
    "levelUpLearnset": "sSamurottHisuiLevelUpLearnset",
    "teachableLearnset": "sSamurottHisuiTeachableLearnset",
    "baseBST": 528,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Patrat",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "KEEN_EYE",
      "ANALYTIC"
    ],
    "id": "SPECIES_PATRAT",
    "family": "P_FAMILY_PATRAT",
    "baseHP": 45,
    "baseAttack": 55,
    "baseDefense": 39,
    "baseSpeed": 42,
    "baseSpAttack": 35,
    "baseSpDefense": 39,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_KEEN_EYE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Patrat\")",
    "natDexNum": "NATIONAL_DEX_PATRAT",
    "levelUpLearnset": "sPatratLevelUpLearnset",
    "teachableLearnset": "sPatratTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_WATCHOG})",
    "baseBST": 255,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Watchog",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "ILLUMINATE",
      "KEEN_EYE",
      "ANALYTIC"
    ],
    "id": "SPECIES_WATCHOG",
    "family": "P_FAMILY_PATRAT",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 69,
    "baseSpeed": 77,
    "baseSpAttack": 60,
    "baseSpDefense": 69,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_ILLUMINATE, ABILITY_KEEN_EYE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Watchog\")",
    "natDexNum": "NATIONAL_DEX_WATCHOG",
    "levelUpLearnset": "sWatchogLevelUpLearnset",
    "teachableLearnset": "sWatchogTeachableLearnset",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lillipup",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "VITAL_SPIRIT",
      "PICKUP",
      "RUN_AWAY"
    ],
    "id": "SPECIES_LILLIPUP",
    "family": "P_FAMILY_LILLIPUP",
    "baseHP": 45,
    "baseAttack": 60,
    "baseDefense": 45,
    "baseSpeed": 55,
    "baseSpAttack": 25,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_VITAL_SPIRIT, ABILITY_PICKUP, ABILITY_RUN_AWAY }",
    "speciesName": "_(\"Lillipup\")",
    "natDexNum": "NATIONAL_DEX_LILLIPUP",
    "levelUpLearnset": "sLillipupLevelUpLearnset",
    "teachableLearnset": "sLillipupTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_HERDIER})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Herdier",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "SAND_RUSH",
      "SCRAPPY"
    ],
    "id": "SPECIES_HERDIER",
    "family": "P_FAMILY_LILLIPUP",
    "baseHP": 65,
    "baseAttack": 80,
    "baseDefense": 65,
    "baseSpeed": 60,
    "baseSpAttack": 35,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_SAND_RUSH, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Herdier\")",
    "natDexNum": "NATIONAL_DEX_HERDIER",
    "levelUpLearnset": "sHerdierLevelUpLearnset",
    "teachableLearnset": "sHerdierTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_STOUTLAND})",
    "baseBST": 370,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stoutland",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "SAND_RUSH",
      "SCRAPPY"
    ],
    "id": "SPECIES_STOUTLAND",
    "family": "P_FAMILY_LILLIPUP",
    "baseHP": 85,
    "baseAttack": 110,
    "baseDefense": 90,
    "baseSpeed": 80,
    "baseSpAttack": 45,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_SAND_RUSH, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Stoutland\")",
    "natDexNum": "NATIONAL_DEX_STOUTLAND",
    "levelUpLearnset": "sStoutlandLevelUpLearnset",
    "teachableLearnset": "sStoutlandTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Purrloin",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "LIMBER",
      "UNBURDEN",
      "PRANKSTER"
    ],
    "id": "SPECIES_PURRLOIN",
    "family": "P_FAMILY_PURRLOIN",
    "baseHP": 41,
    "baseAttack": 50,
    "baseDefense": 37,
    "baseSpeed": 66,
    "baseSpAttack": 50,
    "baseSpDefense": 37,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_UNBURDEN, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Purrloin\")",
    "natDexNum": "NATIONAL_DEX_PURRLOIN",
    "levelUpLearnset": "sPurrloinLevelUpLearnset",
    "teachableLearnset": "sPurrloinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_LIEPARD})",
    "baseBST": 281,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Liepard",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "LIMBER",
      "UNBURDEN",
      "PRANKSTER"
    ],
    "id": "SPECIES_LIEPARD",
    "family": "P_FAMILY_PURRLOIN",
    "baseHP": 64,
    "baseAttack": 88,
    "baseDefense": 50,
    "baseSpeed": 106,
    "baseSpAttack": 88,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_UNBURDEN, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Liepard\")",
    "natDexNum": "NATIONAL_DEX_LIEPARD",
    "levelUpLearnset": "sLiepardLevelUpLearnset",
    "teachableLearnset": "sLiepardTeachableLearnset",
    "baseBST": 446,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pansage",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "NONE",
      "OVERGROW"
    ],
    "id": "SPECIES_PANSAGE",
    "family": "P_FAMILY_PANSAGE",
    "baseHP": 50,
    "baseAttack": 53,
    "baseDefense": 48,
    "baseSpeed": 64,
    "baseSpAttack": 53,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_NONE, ABILITY_OVERGROW }",
    "speciesName": "_(\"Pansage\")",
    "natDexNum": "NATIONAL_DEX_PANSAGE",
    "levelUpLearnset": "sPansageLevelUpLearnset",
    "teachableLearnset": "sPansageTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_LEAF_STONE, SPECIES_SIMISAGE})",
    "baseBST": 316,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Simisage",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "NONE",
      "OVERGROW"
    ],
    "id": "SPECIES_SIMISAGE",
    "family": "P_FAMILY_PANSAGE",
    "baseHP": 75,
    "baseAttack": 98,
    "baseDefense": 63,
    "baseSpeed": 101,
    "baseSpAttack": 98,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_NONE, ABILITY_OVERGROW }",
    "speciesName": "_(\"Simisage\")",
    "natDexNum": "NATIONAL_DEX_SIMISAGE",
    "levelUpLearnset": "sSimisageLevelUpLearnset",
    "teachableLearnset": "sSimisageTeachableLearnset",
    "baseBST": 498,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pansear",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "NONE",
      "BLAZE"
    ],
    "id": "SPECIES_PANSEAR",
    "family": "P_FAMILY_PANSEAR",
    "baseHP": 50,
    "baseAttack": 53,
    "baseDefense": 48,
    "baseSpeed": 64,
    "baseSpAttack": 53,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_NONE, ABILITY_BLAZE }",
    "speciesName": "_(\"Pansear\")",
    "natDexNum": "NATIONAL_DEX_PANSEAR",
    "levelUpLearnset": "sPansearLevelUpLearnset",
    "teachableLearnset": "sPansearTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_FIRE_STONE, SPECIES_SIMISEAR})",
    "baseBST": 316,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Simisear",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "NONE",
      "BLAZE"
    ],
    "id": "SPECIES_SIMISEAR",
    "family": "P_FAMILY_PANSEAR",
    "baseHP": 75,
    "baseAttack": 98,
    "baseDefense": 63,
    "baseSpeed": 101,
    "baseSpAttack": 98,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_NONE, ABILITY_BLAZE }",
    "speciesName": "_(\"Simisear\")",
    "natDexNum": "NATIONAL_DEX_SIMISEAR",
    "levelUpLearnset": "sSimisearLevelUpLearnset",
    "teachableLearnset": "sSimisearTeachableLearnset",
    "baseBST": 498,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Panpour",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "NONE",
      "TORRENT"
    ],
    "id": "SPECIES_PANPOUR",
    "family": "P_FAMILY_PANPOUR",
    "baseHP": 50,
    "baseAttack": 53,
    "baseDefense": 48,
    "baseSpeed": 64,
    "baseSpAttack": 53,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_NONE, ABILITY_TORRENT }",
    "speciesName": "_(\"Panpour\")",
    "natDexNum": "NATIONAL_DEX_PANPOUR",
    "levelUpLearnset": "sPanpourLevelUpLearnset",
    "teachableLearnset": "sPanpourTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_WATER_STONE, SPECIES_SIMIPOUR})",
    "baseBST": 316,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Simipour",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "NONE",
      "TORRENT"
    ],
    "id": "SPECIES_SIMIPOUR",
    "family": "P_FAMILY_PANPOUR",
    "baseHP": 75,
    "baseAttack": 98,
    "baseDefense": 63,
    "baseSpeed": 101,
    "baseSpAttack": 98,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_NONE, ABILITY_TORRENT }",
    "speciesName": "_(\"Simipour\")",
    "natDexNum": "NATIONAL_DEX_SIMIPOUR",
    "levelUpLearnset": "sSimipourLevelUpLearnset",
    "teachableLearnset": "sSimipourTeachableLearnset",
    "baseBST": 498,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Munna",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "FOREWARN",
      "SYNCHRONIZE",
      "TELEPATHY"
    ],
    "id": "SPECIES_MUNNA",
    "family": "P_FAMILY_MUNNA",
    "baseHP": 76,
    "baseAttack": 25,
    "baseDefense": 45,
    "baseSpeed": 24,
    "baseSpAttack": 67,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_FOREWARN, ABILITY_SYNCHRONIZE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Munna\")",
    "natDexNum": "NATIONAL_DEX_MUNNA",
    "levelUpLearnset": "sMunnaLevelUpLearnset",
    "teachableLearnset": "sMunnaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MOON_STONE, SPECIES_MUSHARNA})",
    "baseBST": 292,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Musharna",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "FOREWARN",
      "SYNCHRONIZE",
      "TELEPATHY"
    ],
    "id": "SPECIES_MUSHARNA",
    "family": "P_FAMILY_MUNNA",
    "baseHP": 116,
    "baseAttack": 55,
    "baseDefense": 85,
    "baseSpeed": 29,
    "baseSpAttack": 107,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_FOREWARN, ABILITY_SYNCHRONIZE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Musharna\")",
    "natDexNum": "NATIONAL_DEX_MUSHARNA",
    "levelUpLearnset": "sMusharnaLevelUpLearnset",
    "teachableLearnset": "sMusharnaTeachableLearnset",
    "baseBST": 487,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pidove",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "SUPER_LUCK",
      "RIVALRY"
    ],
    "id": "SPECIES_PIDOVE",
    "family": "P_FAMILY_PIDOVE",
    "baseHP": 50,
    "baseAttack": 55,
    "baseDefense": 50,
    "baseSpeed": 43,
    "baseSpAttack": 36,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_SUPER_LUCK, ABILITY_RIVALRY }",
    "speciesName": "_(\"Pidove\")",
    "natDexNum": "NATIONAL_DEX_PIDOVE",
    "levelUpLearnset": "sPidoveLevelUpLearnset",
    "teachableLearnset": "sPidoveTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 21, SPECIES_TRANQUILL})",
    "baseBST": 264,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tranquill",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "SUPER_LUCK",
      "RIVALRY"
    ],
    "id": "SPECIES_TRANQUILL",
    "family": "P_FAMILY_PIDOVE",
    "baseHP": 62,
    "baseAttack": 77,
    "baseDefense": 62,
    "baseSpeed": 65,
    "baseSpAttack": 50,
    "baseSpDefense": 42,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_SUPER_LUCK, ABILITY_RIVALRY }",
    "speciesName": "_(\"Tranquill\")",
    "natDexNum": "NATIONAL_DEX_TRANQUILL",
    "levelUpLearnset": "sTranquillLevelUpLearnset",
    "teachableLearnset": "sTranquillTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_UNFEZANT})",
    "baseBST": 358,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Unfezant",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "SUPER_LUCK",
      "RIVALRY"
    ],
    "id": "SPECIES_UNFEZANT",
    "family": "P_FAMILY_PIDOVE",
    "baseHP": 80,
    "baseAttack": 115,
    "baseDefense": 80,
    "baseSpeed": 93,
    "baseSpAttack": 65,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_SUPER_LUCK, ABILITY_RIVALRY }",
    "speciesName": "_(\"Unfezant\")",
    "natDexNum": "NATIONAL_DEX_UNFEZANT",
    "levelUpLearnset": "sUnfezantLevelUpLearnset",
    "teachableLearnset": "sUnfezantTeachableLearnset",
    "baseBST": 488,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blitzle",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "MOTOR_DRIVE",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_BLITZLE",
    "family": "P_FAMILY_BLITZLE",
    "baseHP": 45,
    "baseAttack": 60,
    "baseDefense": 32,
    "baseSpeed": 76,
    "baseSpAttack": 50,
    "baseSpDefense": 32,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_MOTOR_DRIVE, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Blitzle\")",
    "natDexNum": "NATIONAL_DEX_BLITZLE",
    "levelUpLearnset": "sBlitzleLevelUpLearnset",
    "teachableLearnset": "sBlitzleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 27, SPECIES_ZEBSTRIKA})",
    "baseBST": 295,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zebstrika",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "MOTOR_DRIVE",
      "SAP_SIPPER"
    ],
    "id": "SPECIES_ZEBSTRIKA",
    "family": "P_FAMILY_BLITZLE",
    "baseHP": 75,
    "baseAttack": 100,
    "baseDefense": 63,
    "baseSpeed": 116,
    "baseSpAttack": 80,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_MOTOR_DRIVE, ABILITY_SAP_SIPPER }",
    "speciesName": "_(\"Zebstrika\")",
    "natDexNum": "NATIONAL_DEX_ZEBSTRIKA",
    "levelUpLearnset": "sZebstrikaLevelUpLearnset",
    "teachableLearnset": "sZebstrikaTeachableLearnset",
    "baseBST": 497,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Roggenrola",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_ROGGENROLA",
    "family": "P_FAMILY_ROGGENROLA",
    "baseHP": 55,
    "baseAttack": 75,
    "baseDefense": 85,
    "baseSpeed": 15,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Roggenrola\")",
    "natDexNum": "NATIONAL_DEX_ROGGENROLA",
    "levelUpLearnset": "sRoggenrolaLevelUpLearnset",
    "teachableLearnset": "sRoggenrolaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_BOLDORE})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Boldore",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_BOLDORE",
    "family": "P_FAMILY_ROGGENROLA",
    "baseHP": 70,
    "baseAttack": 105,
    "baseDefense": 105,
    "baseSpeed": 20,
    "baseSpAttack": 50,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Boldore\")",
    "natDexNum": "NATIONAL_DEX_BOLDORE",
    "levelUpLearnset": "sBoldoreLevelUpLearnset",
    "teachableLearnset": "sBoldoreTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GIGALITH}",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gigalith",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "SAND_FORCE"
    ],
    "id": "SPECIES_GIGALITH",
    "family": "P_FAMILY_ROGGENROLA",
    "baseHP": 85,
    "baseAttack": 135,
    "baseDefense": 130,
    "baseSpeed": 25,
    "baseSpAttack": 60,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_SAND_FORCE }",
    "speciesName": "_(\"Gigalith\")",
    "natDexNum": "NATIONAL_DEX_GIGALITH",
    "levelUpLearnset": "sGigalithLevelUpLearnset",
    "teachableLearnset": "sGigalithTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Woobat",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "UNAWARE",
      "KLUTZ",
      "SIMPLE"
    ],
    "id": "SPECIES_WOOBAT",
    "family": "P_FAMILY_WOOBAT",
    "baseHP": 65,
    "baseAttack": 45,
    "baseDefense": 43,
    "baseSpeed": 72,
    "baseSpAttack": 55,
    "baseSpDefense": 43,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_UNAWARE, ABILITY_KLUTZ, ABILITY_SIMPLE }",
    "speciesName": "_(\"Woobat\")",
    "natDexNum": "NATIONAL_DEX_WOOBAT",
    "levelUpLearnset": "sWoobatLevelUpLearnset",
    "teachableLearnset": "sWoobatTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_SWOOBAT, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 323,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swoobat",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "UNAWARE",
      "KLUTZ",
      "SIMPLE"
    ],
    "id": "SPECIES_SWOOBAT",
    "family": "P_FAMILY_WOOBAT",
    "baseHP": 67,
    "baseAttack": 57,
    "baseDefense": 55,
    "baseSpeed": 114,
    "baseSpAttack": 77,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_UNAWARE, ABILITY_KLUTZ, ABILITY_SIMPLE }",
    "speciesName": "_(\"Swoobat\")",
    "natDexNum": "NATIONAL_DEX_SWOOBAT",
    "levelUpLearnset": "sSwoobatLevelUpLearnset",
    "teachableLearnset": "sSwoobatTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drilbur",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_RUSH",
      "SAND_FORCE",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_DRILBUR",
    "family": "P_FAMILY_DRILBUR",
    "baseHP": 60,
    "baseAttack": 85,
    "baseDefense": 40,
    "baseSpeed": 68,
    "baseSpAttack": 30,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_RUSH, ABILITY_SAND_FORCE, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Drilbur\")",
    "natDexNum": "NATIONAL_DEX_DRILBUR",
    "levelUpLearnset": "sDrilburLevelUpLearnset",
    "teachableLearnset": "sDrilburTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 31, SPECIES_EXCADRILL})",
    "baseBST": 328,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Excadrill",
    "parsedTypes": [
      "GROUND",
      "STEEL"
    ],
    "parsedAbilities": [
      "SAND_RUSH",
      "SAND_FORCE",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_EXCADRILL",
    "family": "P_FAMILY_DRILBUR",
    "baseHP": 110,
    "baseAttack": 135,
    "baseDefense": 60,
    "baseSpeed": 88,
    "baseSpAttack": 50,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_STEEL)",
    "abilities": "{ ABILITY_SAND_RUSH, ABILITY_SAND_FORCE, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Excadrill\")",
    "natDexNum": "NATIONAL_DEX_EXCADRILL",
    "levelUpLearnset": "sExcadrillLevelUpLearnset",
    "teachableLearnset": "sExcadrillTeachableLearnset",
    "baseBST": 508,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Audino",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "HEALER",
      "REGENERATOR",
      "KLUTZ"
    ],
    "id": "SPECIES_AUDINO",
    "family": "P_FAMILY_AUDINO",
    "baseHP": 103,
    "baseAttack": 60,
    "baseDefense": 86,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_HEALER, ABILITY_REGENERATOR, ABILITY_KLUTZ }",
    "speciesName": "_(\"Audino\")",
    "natDexNum": "NATIONAL_DEX_AUDINO",
    "levelUpLearnset": "sAudinoLevelUpLearnset",
    "teachableLearnset": "sAudinoTeachableLearnset",
    "baseBST": 445,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Audino  Mega",
    "parsedTypes": [
      "NORMAL",
      "FAIRY"
    ],
    "parsedAbilities": [
      "HEALER",
      "HEALER",
      "HEALER"
    ],
    "id": "SPECIES_AUDINO_MEGA",
    "family": "P_FAMILY_AUDINO",
    "baseHP": 103,
    "baseAttack": 60,
    "baseDefense": 126,
    "baseSpeed": 50,
    "baseSpAttack": 80,
    "baseSpDefense": 126,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FAIRY)",
    "abilities": "{ ABILITY_HEALER, ABILITY_HEALER, ABILITY_HEALER }",
    "speciesName": "_(\"Audino\")",
    "natDexNum": "NATIONAL_DEX_AUDINO",
    "levelUpLearnset": "sAudinoLevelUpLearnset",
    "teachableLearnset": "sAudinoTeachableLearnset",
    "baseBST": 545,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Timburr",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "SHEER_FORCE",
      "IRON_FIST"
    ],
    "id": "SPECIES_TIMBURR",
    "family": "P_FAMILY_TIMBURR",
    "baseHP": 75,
    "baseAttack": 80,
    "baseDefense": 55,
    "baseSpeed": 35,
    "baseSpAttack": 25,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_SHEER_FORCE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Timburr\")",
    "natDexNum": "NATIONAL_DEX_TIMBURR",
    "levelUpLearnset": "sTimburrLevelUpLearnset",
    "teachableLearnset": "sTimburrTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_GURDURR})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gurdurr",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "SHEER_FORCE",
      "IRON_FIST"
    ],
    "id": "SPECIES_GURDURR",
    "family": "P_FAMILY_TIMBURR",
    "baseHP": 85,
    "baseAttack": 105,
    "baseDefense": 85,
    "baseSpeed": 40,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_SHEER_FORCE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Gurdurr\")",
    "natDexNum": "NATIONAL_DEX_GURDURR",
    "levelUpLearnset": "sGurdurrLevelUpLearnset",
    "teachableLearnset": "sGurdurrTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_CONKELDURR}",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Conkeldurr",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "SHEER_FORCE",
      "IRON_FIST"
    ],
    "id": "SPECIES_CONKELDURR",
    "family": "P_FAMILY_TIMBURR",
    "baseHP": 105,
    "baseAttack": 140,
    "baseDefense": 95,
    "baseSpeed": 45,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_SHEER_FORCE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Conkeldurr\")",
    "natDexNum": "NATIONAL_DEX_CONKELDURR",
    "levelUpLearnset": "sConkeldurrLevelUpLearnset",
    "teachableLearnset": "sConkeldurrTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tympole",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "HYDRATION",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_TYMPOLE",
    "family": "P_FAMILY_TYMPOLE",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 40,
    "baseSpeed": 64,
    "baseSpAttack": 50,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_HYDRATION, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Tympole\")",
    "natDexNum": "NATIONAL_DEX_TYMPOLE",
    "levelUpLearnset": "sTympoleLevelUpLearnset",
    "teachableLearnset": "sTympoleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_PALPITOAD})",
    "baseBST": 294,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Palpitoad",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "HYDRATION",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_PALPITOAD",
    "family": "P_FAMILY_TYMPOLE",
    "baseHP": 75,
    "baseAttack": 65,
    "baseDefense": 55,
    "baseSpeed": 69,
    "baseSpAttack": 65,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_HYDRATION, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Palpitoad\")",
    "natDexNum": "NATIONAL_DEX_PALPITOAD",
    "levelUpLearnset": "sPalpitoadLevelUpLearnset",
    "teachableLearnset": "sPalpitoadTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SEISMITOAD})",
    "baseBST": 384,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Seismitoad",
    "parsedTypes": [
      "WATER",
      "GROUND"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "POISON_TOUCH",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_SEISMITOAD",
    "family": "P_FAMILY_TYMPOLE",
    "baseHP": 105,
    "baseAttack": 95,
    "baseDefense": 75,
    "baseSpeed": 74,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GROUND)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_POISON_TOUCH, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Seismitoad\")",
    "natDexNum": "NATIONAL_DEX_SEISMITOAD",
    "levelUpLearnset": "sSeismitoadLevelUpLearnset",
    "teachableLearnset": "sSeismitoadTeachableLearnset",
    "baseBST": 509,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Throh",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "GUTS",
      "INNER_FOCUS",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_THROH",
    "family": "P_FAMILY_THROH",
    "baseHP": 120,
    "baseAttack": 100,
    "baseDefense": 85,
    "baseSpeed": 45,
    "baseSpAttack": 30,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_GUTS, ABILITY_INNER_FOCUS, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Throh\")",
    "natDexNum": "NATIONAL_DEX_THROH",
    "levelUpLearnset": "sThrohLevelUpLearnset",
    "teachableLearnset": "sThrohTeachableLearnset",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sawk",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "STURDY",
      "INNER_FOCUS",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_SAWK",
    "family": "P_FAMILY_SAWK",
    "baseHP": 75,
    "baseAttack": 125,
    "baseDefense": 75,
    "baseSpeed": 85,
    "baseSpAttack": 30,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_STURDY, ABILITY_INNER_FOCUS, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Sawk\")",
    "natDexNum": "NATIONAL_DEX_SAWK",
    "levelUpLearnset": "sSawkLevelUpLearnset",
    "teachableLearnset": "sSawkTeachableLearnset",
    "baseBST": 465,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sewaddle",
    "parsedTypes": [
      "BUG",
      "GRASS"
    ],
    "parsedAbilities": [
      "SWARM",
      "CHLOROPHYLL",
      "OVERCOAT"
    ],
    "id": "SPECIES_SEWADDLE",
    "family": "P_FAMILY_SEWADDLE",
    "baseHP": 45,
    "baseAttack": 53,
    "baseDefense": 70,
    "baseSpeed": 42,
    "baseSpAttack": 40,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GRASS)",
    "abilities": "{ ABILITY_SWARM, ABILITY_CHLOROPHYLL, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Sewaddle\")",
    "natDexNum": "NATIONAL_DEX_SEWADDLE",
    "levelUpLearnset": "sSewaddleLevelUpLearnset",
    "teachableLearnset": "sSewaddleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_SWADLOON})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swadloon",
    "parsedTypes": [
      "BUG",
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "CHLOROPHYLL",
      "OVERCOAT"
    ],
    "id": "SPECIES_SWADLOON",
    "family": "P_FAMILY_SEWADDLE",
    "baseHP": 55,
    "baseAttack": 63,
    "baseDefense": 90,
    "baseSpeed": 42,
    "baseSpAttack": 50,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_CHLOROPHYLL, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Swadloon\")",
    "natDexNum": "NATIONAL_DEX_SWADLOON",
    "levelUpLearnset": "sSwadloonLevelUpLearnset",
    "teachableLearnset": "sSwadloonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_LEAVANNY, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD})})",
    "baseBST": 380,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Leavanny",
    "parsedTypes": [
      "BUG",
      "GRASS"
    ],
    "parsedAbilities": [
      "SWARM",
      "CHLOROPHYLL",
      "OVERCOAT"
    ],
    "id": "SPECIES_LEAVANNY",
    "family": "P_FAMILY_SEWADDLE",
    "baseHP": 75,
    "baseAttack": 103,
    "baseDefense": 80,
    "baseSpeed": 92,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_BUG, TYPE_GRASS)",
    "abilities": "{ ABILITY_SWARM, ABILITY_CHLOROPHYLL, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Leavanny\")",
    "natDexNum": "NATIONAL_DEX_LEAVANNY",
    "levelUpLearnset": "sLeavannyLevelUpLearnset",
    "teachableLearnset": "sLeavannyTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Venipede",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "SWARM",
      "QUICK_FEET"
    ],
    "id": "SPECIES_VENIPEDE",
    "family": "P_FAMILY_VENIPEDE",
    "baseHP": 30,
    "baseAttack": 45,
    "baseDefense": 59,
    "baseSpeed": 57,
    "baseSpAttack": 30,
    "baseSpDefense": 39,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_SWARM, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Venipede\")",
    "natDexNum": "NATIONAL_DEX_VENIPEDE",
    "levelUpLearnset": "sVenipedeLevelUpLearnset",
    "teachableLearnset": "sVenipedeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_WHIRLIPEDE})",
    "baseBST": 260,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Whirlipede",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "SWARM",
      "QUICK_FEET"
    ],
    "id": "SPECIES_WHIRLIPEDE",
    "family": "P_FAMILY_VENIPEDE",
    "baseHP": 40,
    "baseAttack": 55,
    "baseDefense": 99,
    "baseSpeed": 47,
    "baseSpAttack": 40,
    "baseSpDefense": 79,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_SWARM, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Whirlipede\")",
    "natDexNum": "NATIONAL_DEX_WHIRLIPEDE",
    "levelUpLearnset": "sWhirlipedeLevelUpLearnset",
    "teachableLearnset": "sWhirlipedeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_SCOLIPEDE})",
    "baseBST": 360,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scolipede",
    "parsedTypes": [
      "BUG",
      "POISON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "SWARM",
      "QUICK_FEET"
    ],
    "id": "SPECIES_SCOLIPEDE",
    "family": "P_FAMILY_VENIPEDE",
    "baseHP": 60,
    "baseAttack": 100,
    "baseDefense": 89,
    "baseSpeed": 112,
    "baseSpAttack": 55,
    "baseSpDefense": 69,
    "types": "MON_TYPES(TYPE_BUG, TYPE_POISON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_SWARM, ABILITY_QUICK_FEET }",
    "speciesName": "_(\"Scolipede\")",
    "natDexNum": "NATIONAL_DEX_SCOLIPEDE",
    "levelUpLearnset": "sScolipedeLevelUpLearnset",
    "teachableLearnset": "sScolipedeTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cottonee",
    "parsedTypes": [
      "COTTONEE_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "INFILTRATOR",
      "CHLOROPHYLL"
    ],
    "id": "SPECIES_COTTONEE",
    "family": "P_FAMILY_COTTONEE",
    "baseHP": 40,
    "baseAttack": 27,
    "baseDefense": 60,
    "baseSpeed": 66,
    "baseSpAttack": 37,
    "baseSpDefense": 50,
    "types": "COTTONEE_FAMILY_TYPES",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_INFILTRATOR, ABILITY_CHLOROPHYLL }",
    "speciesName": "_(\"Cottonee\")",
    "natDexNum": "NATIONAL_DEX_COTTONEE",
    "levelUpLearnset": "sCottoneeLevelUpLearnset",
    "teachableLearnset": "sCottoneeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SUN_STONE, SPECIES_WHIMSICOTT})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Whimsicott",
    "parsedTypes": [
      "COTTONEE_FAMILY_TYPES"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "INFILTRATOR",
      "CHLOROPHYLL"
    ],
    "id": "SPECIES_WHIMSICOTT",
    "family": "P_FAMILY_COTTONEE",
    "baseHP": 60,
    "baseAttack": 67,
    "baseDefense": 85,
    "baseSpeed": 116,
    "baseSpAttack": 77,
    "baseSpDefense": 75,
    "types": "COTTONEE_FAMILY_TYPES",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_INFILTRATOR, ABILITY_CHLOROPHYLL }",
    "speciesName": "_(\"Whimsicott\")",
    "natDexNum": "NATIONAL_DEX_WHIMSICOTT",
    "levelUpLearnset": "sWhimsicottLevelUpLearnset",
    "teachableLearnset": "sWhimsicottTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Petilil",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "OWN_TEMPO",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_PETILIL",
    "family": "P_FAMILY_PETILIL",
    "baseHP": 45,
    "baseAttack": 35,
    "baseDefense": 50,
    "baseSpeed": 30,
    "baseSpAttack": 70,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_OWN_TEMPO, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Petilil\")",
    "natDexNum": "NATIONAL_DEX_PETILIL",
    "levelUpLearnset": "sPetililLevelUpLearnset",
    "teachableLearnset": "sPetililTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SUN_STONE, SPECIES_LILLIGANT}",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lilligant",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "OWN_TEMPO",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_LILLIGANT",
    "family": "P_FAMILY_PETILIL",
    "baseHP": 70,
    "baseAttack": 60,
    "baseDefense": 75,
    "baseSpeed": 90,
    "baseSpAttack": 110,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_OWN_TEMPO, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Lilligant\")",
    "natDexNum": "NATIONAL_DEX_LILLIGANT",
    "levelUpLearnset": "sLilligantLevelUpLearnset",
    "teachableLearnset": "sLilligantTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lilligant  Hisui",
    "parsedTypes": [
      "GRASS",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "HUSTLE",
      "LEAF_GUARD"
    ],
    "id": "SPECIES_LILLIGANT_HISUI",
    "family": "P_FAMILY_PETILIL",
    "baseHP": 70,
    "baseAttack": 105,
    "baseDefense": 75,
    "baseSpeed": 105,
    "baseSpAttack": 50,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_HUSTLE, ABILITY_LEAF_GUARD }",
    "speciesName": "_(\"Lilligant\")",
    "natDexNum": "NATIONAL_DEX_LILLIGANT",
    "levelUpLearnset": "sLilligantHisuiLevelUpLearnset",
    "teachableLearnset": "sLilligantHisuiTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Basculin  Red  Striped",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "RECKLESS",
      "ADAPTABILITY",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_BASCULIN_RED_STRIPED",
    "family": "P_FAMILY_BASCULIN",
    "baseHP": 70,
    "baseAttack": 92,
    "baseDefense": 65,
    "baseSpeed": 98,
    "baseSpAttack": 80,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_RECKLESS, ABILITY_ADAPTABILITY, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Basculin\")",
    "natDexNum": "NATIONAL_DEX_BASCULIN",
    "levelUpLearnset": "sBasculinLevelUpLearnset",
    "teachableLearnset": "sBasculinTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Basculin  Blue  Striped",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "ROCK_HEAD",
      "ADAPTABILITY",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_BASCULIN_BLUE_STRIPED",
    "family": "P_FAMILY_BASCULIN",
    "baseHP": 70,
    "baseAttack": 92,
    "baseDefense": 65,
    "baseSpeed": 98,
    "baseSpAttack": 80,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_ROCK_HEAD, ABILITY_ADAPTABILITY, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Basculin\")",
    "natDexNum": "NATIONAL_DEX_BASCULIN",
    "levelUpLearnset": "sBasculinLevelUpLearnset",
    "teachableLearnset": "sBasculinTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Basculin  White  Striped",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "RATTLED",
      "ADAPTABILITY",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_BASCULIN_WHITE_STRIPED",
    "family": "P_FAMILY_BASCULIN",
    "baseHP": 70,
    "baseAttack": 92,
    "baseDefense": 65,
    "baseSpeed": 98,
    "baseSpAttack": 80,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_RATTLED, ABILITY_ADAPTABILITY, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Basculin\")",
    "natDexNum": "NATIONAL_DEX_BASCULIN",
    "levelUpLearnset": "sBasculinWhiteStripedLevelUpLearnset",
    "teachableLearnset": "sBasculinWhiteStripedTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_BASCULEGION_M, CONDITIONS({IF_RECOIL_DAMAGE_GE, 294}, {IF_GENDER, MON_MALE})}",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Basculegion  M",
    "parsedTypes": [
      "WATER",
      "GHOST"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "ADAPTABILITY",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_BASCULEGION_M",
    "family": "P_FAMILY_BASCULIN",
    "baseHP": 120,
    "baseAttack": 112,
    "baseDefense": 65,
    "baseSpeed": 78,
    "baseSpAttack": 80,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GHOST)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_ADAPTABILITY, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Basculegion\")",
    "natDexNum": "NATIONAL_DEX_BASCULEGION",
    "levelUpLearnset": "sBasculegionLevelUpLearnset",
    "teachableLearnset": "sBasculegionTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Basculegion  F",
    "parsedTypes": [
      "WATER",
      "GHOST"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "ADAPTABILITY",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_BASCULEGION_F",
    "family": "P_FAMILY_BASCULIN",
    "baseHP": 120,
    "baseAttack": 92,
    "baseDefense": 65,
    "baseSpeed": 78,
    "baseSpAttack": 100,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GHOST)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_ADAPTABILITY, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Basculegion\")",
    "natDexNum": "NATIONAL_DEX_BASCULEGION",
    "levelUpLearnset": "sBasculegionLevelUpLearnset",
    "teachableLearnset": "sBasculegionTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandile",
    "parsedTypes": [
      "GROUND",
      "DARK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "MOXIE",
      "ANGER_POINT"
    ],
    "id": "SPECIES_SANDILE",
    "family": "P_FAMILY_SANDILE",
    "baseHP": 50,
    "baseAttack": 72,
    "baseDefense": 35,
    "baseSpeed": 65,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_DARK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_MOXIE, ABILITY_ANGER_POINT }",
    "speciesName": "_(\"Sandile\")",
    "natDexNum": "NATIONAL_DEX_SANDILE",
    "levelUpLearnset": "sSandileLevelUpLearnset",
    "teachableLearnset": "sSandileTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 29, SPECIES_KROKOROK})",
    "baseBST": 292,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Krokorok",
    "parsedTypes": [
      "GROUND",
      "DARK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "MOXIE",
      "ANGER_POINT"
    ],
    "id": "SPECIES_KROKOROK",
    "family": "P_FAMILY_SANDILE",
    "baseHP": 60,
    "baseAttack": 82,
    "baseDefense": 45,
    "baseSpeed": 74,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_DARK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_MOXIE, ABILITY_ANGER_POINT }",
    "speciesName": "_(\"Krokorok\")",
    "natDexNum": "NATIONAL_DEX_KROKOROK",
    "levelUpLearnset": "sKrokorokLevelUpLearnset",
    "teachableLearnset": "sKrokorokTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_KROOKODILE})",
    "baseBST": 351,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Krookodile",
    "parsedTypes": [
      "GROUND",
      "DARK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "MOXIE",
      "ANGER_POINT"
    ],
    "id": "SPECIES_KROOKODILE",
    "family": "P_FAMILY_SANDILE",
    "baseHP": 95,
    "baseAttack": 117,
    "baseDefense": 80,
    "baseSpeed": 92,
    "baseSpAttack": 65,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_DARK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_MOXIE, ABILITY_ANGER_POINT }",
    "speciesName": "_(\"Krookodile\")",
    "natDexNum": "NATIONAL_DEX_KROOKODILE",
    "levelUpLearnset": "sKrookodileLevelUpLearnset",
    "teachableLearnset": "sKrookodileTeachableLearnset",
    "baseBST": 519,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darumaka",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "NONE",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_DARUMAKA",
    "family": "P_FAMILY_DARUMAKA",
    "baseHP": 70,
    "baseAttack": 90,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 15,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_NONE, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Darumaka\")",
    "natDexNum": "NATIONAL_DEX_DARUMAKA",
    "levelUpLearnset": "sDarumakaLevelUpLearnset",
    "teachableLearnset": "sDarumakaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_DARMANITAN_STANDARD})",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darmanitan  Standard",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "SHEER_FORCE",
      "NONE",
      "ZEN_MODE"
    ],
    "id": "SPECIES_DARMANITAN_STANDARD",
    "family": "P_FAMILY_DARUMAKA",
    "baseHP": 105,
    "baseAttack": 140,
    "baseDefense": 55,
    "baseSpeed": 95,
    "baseSpAttack": 30,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_SHEER_FORCE, ABILITY_NONE, ABILITY_ZEN_MODE }",
    "speciesName": "_(\"Darmanitan\")",
    "natDexNum": "NATIONAL_DEX_DARMANITAN",
    "levelUpLearnset": "sDarmanitanLevelUpLearnset",
    "teachableLearnset": "sDarmanitanTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darmanitan  Zen",
    "parsedTypes": [
      "FIRE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SHEER_FORCE",
      "NONE",
      "ZEN_MODE"
    ],
    "id": "SPECIES_DARMANITAN_ZEN",
    "family": "P_FAMILY_DARUMAKA",
    "baseHP": 105,
    "baseAttack": 30,
    "baseDefense": 105,
    "baseSpeed": 55,
    "baseSpAttack": 140,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SHEER_FORCE, ABILITY_NONE, ABILITY_ZEN_MODE }",
    "speciesName": "_(\"Darmanitan\")",
    "natDexNum": "NATIONAL_DEX_DARMANITAN",
    "levelUpLearnset": "sDarmanitanLevelUpLearnset",
    "teachableLearnset": "sDarmanitanTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darumaka  Galar",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "NONE",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_DARUMAKA_GALAR",
    "family": "P_FAMILY_DARUMAKA",
    "baseHP": 70,
    "baseAttack": 90,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 15,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_NONE, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Darumaka\")",
    "natDexNum": "NATIONAL_DEX_DARUMAKA",
    "levelUpLearnset": "sDarumakaGalarLevelUpLearnset",
    "teachableLearnset": "sDarumakaGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_ICE_STONE, SPECIES_DARMANITAN_GALAR_STANDARD})",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darmanitan  Galar  Standard",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "GORILLA_TACTICS",
      "NONE",
      "ZEN_MODE"
    ],
    "id": "SPECIES_DARMANITAN_GALAR_STANDARD",
    "family": "P_FAMILY_DARUMAKA",
    "baseHP": 105,
    "baseAttack": 140,
    "baseDefense": 55,
    "baseSpeed": 95,
    "baseSpAttack": 30,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_GORILLA_TACTICS, ABILITY_NONE, ABILITY_ZEN_MODE }",
    "speciesName": "_(\"Darmanitan\")",
    "natDexNum": "NATIONAL_DEX_DARMANITAN",
    "levelUpLearnset": "sDarmanitanGalarLevelUpLearnset",
    "teachableLearnset": "sDarmanitanGalarTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Darmanitan  Galar  Zen",
    "parsedTypes": [
      "ICE",
      "FIRE"
    ],
    "parsedAbilities": [
      "GORILLA_TACTICS",
      "NONE",
      "ZEN_MODE"
    ],
    "id": "SPECIES_DARMANITAN_GALAR_ZEN",
    "family": "P_FAMILY_DARUMAKA",
    "baseHP": 105,
    "baseAttack": 160,
    "baseDefense": 55,
    "baseSpeed": 135,
    "baseSpAttack": 30,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ICE, TYPE_FIRE)",
    "abilities": "{ ABILITY_GORILLA_TACTICS, ABILITY_NONE, ABILITY_ZEN_MODE }",
    "speciesName": "_(\"Darmanitan\")",
    "natDexNum": "NATIONAL_DEX_DARMANITAN",
    "levelUpLearnset": "sDarmanitanGalarLevelUpLearnset",
    "teachableLearnset": "sDarmanitanGalarTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Maractus",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "CHLOROPHYLL",
      "STORM_DRAIN"
    ],
    "id": "SPECIES_MARACTUS",
    "family": "P_FAMILY_MARACTUS",
    "baseHP": 75,
    "baseAttack": 86,
    "baseDefense": 67,
    "baseSpeed": 60,
    "baseSpAttack": 106,
    "baseSpDefense": 67,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_CHLOROPHYLL, ABILITY_STORM_DRAIN }",
    "speciesName": "_(\"Maractus\")",
    "natDexNum": "NATIONAL_DEX_MARACTUS",
    "levelUpLearnset": "sMaractusLevelUpLearnset",
    "teachableLearnset": "sMaractusTeachableLearnset",
    "baseBST": 461,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dwebble",
    "parsedTypes": [
      "BUG",
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "SHELL_ARMOR",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_DWEBBLE",
    "family": "P_FAMILY_DWEBBLE",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 85,
    "baseSpeed": 55,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_SHELL_ARMOR, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Dwebble\")",
    "natDexNum": "NATIONAL_DEX_DWEBBLE",
    "levelUpLearnset": "sDwebbleLevelUpLearnset",
    "teachableLearnset": "sDwebbleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_CRUSTLE})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Crustle",
    "parsedTypes": [
      "BUG",
      "ROCK"
    ],
    "parsedAbilities": [
      "STURDY",
      "SHELL_ARMOR",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_CRUSTLE",
    "family": "P_FAMILY_DWEBBLE",
    "baseHP": 70,
    "baseAttack": 105,
    "baseDefense": 125,
    "baseSpeed": 45,
    "baseSpAttack": 65,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ROCK)",
    "abilities": "{ ABILITY_STURDY, ABILITY_SHELL_ARMOR, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Crustle\")",
    "natDexNum": "NATIONAL_DEX_CRUSTLE",
    "levelUpLearnset": "sCrustleLevelUpLearnset",
    "teachableLearnset": "sCrustleTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scraggy",
    "parsedTypes": [
      "DARK",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "MOXIE",
      "INTIMIDATE"
    ],
    "id": "SPECIES_SCRAGGY",
    "family": "P_FAMILY_SCRAGGY",
    "baseHP": 50,
    "baseAttack": 75,
    "baseDefense": 70,
    "baseSpeed": 48,
    "baseSpAttack": 35,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_MOXIE, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Scraggy\")",
    "natDexNum": "NATIONAL_DEX_SCRAGGY",
    "levelUpLearnset": "sScraggyLevelUpLearnset",
    "teachableLearnset": "sScraggyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 39, SPECIES_SCRAFTY})",
    "baseBST": 348,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scrafty",
    "parsedTypes": [
      "DARK",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "MOXIE",
      "INTIMIDATE"
    ],
    "id": "SPECIES_SCRAFTY",
    "family": "P_FAMILY_SCRAGGY",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 115,
    "baseSpeed": 58,
    "baseSpAttack": 45,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_MOXIE, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Scrafty\")",
    "natDexNum": "NATIONAL_DEX_SCRAFTY",
    "levelUpLearnset": "sScraftyLevelUpLearnset",
    "teachableLearnset": "sScraftyTeachableLearnset",
    "baseBST": 488,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sigilyph",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "WONDER_SKIN",
      "MAGIC_GUARD",
      "TINTED_LENS"
    ],
    "id": "SPECIES_SIGILYPH",
    "family": "P_FAMILY_SIGILYPH",
    "baseHP": 72,
    "baseAttack": 58,
    "baseDefense": 80,
    "baseSpeed": 97,
    "baseSpAttack": 103,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_WONDER_SKIN, ABILITY_MAGIC_GUARD, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Sigilyph\")",
    "natDexNum": "NATIONAL_DEX_SIGILYPH",
    "levelUpLearnset": "sSigilyphLevelUpLearnset",
    "teachableLearnset": "sSigilyphTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yamask",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "MUMMY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_YAMASK",
    "family": "P_FAMILY_YAMASK",
    "baseHP": 38,
    "baseAttack": 30,
    "baseDefense": 85,
    "baseSpeed": 30,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_MUMMY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Yamask\")",
    "natDexNum": "NATIONAL_DEX_YAMASK",
    "levelUpLearnset": "sYamaskLevelUpLearnset",
    "teachableLearnset": "sYamaskTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_COFAGRIGUS})",
    "baseBST": 303,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cofagrigus",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "MUMMY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_COFAGRIGUS",
    "family": "P_FAMILY_YAMASK",
    "baseHP": 58,
    "baseAttack": 50,
    "baseDefense": 145,
    "baseSpeed": 30,
    "baseSpAttack": 95,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_MUMMY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cofagrigus\")",
    "natDexNum": "NATIONAL_DEX_COFAGRIGUS",
    "levelUpLearnset": "sCofagrigusLevelUpLearnset",
    "teachableLearnset": "sCofagrigusTeachableLearnset",
    "baseBST": 483,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yamask  Galar",
    "parsedTypes": [
      "GROUND",
      "GHOST"
    ],
    "parsedAbilities": [
      "WANDERING_SPIRIT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_YAMASK_GALAR",
    "family": "P_FAMILY_YAMASK",
    "baseHP": 38,
    "baseAttack": 55,
    "baseDefense": 85,
    "baseSpeed": 30,
    "baseSpAttack": 30,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_GHOST)",
    "abilities": "{ ABILITY_WANDERING_SPIRIT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Yamask\")",
    "natDexNum": "NATIONAL_DEX_YAMASK",
    "levelUpLearnset": "sYamaskGalarLevelUpLearnset",
    "teachableLearnset": "sYamaskGalarTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_SCRIPT_TRIGGER, 0, SPECIES_RUNERIGUS, CONDITIONS({IF_CURRENT_DAMAGE_GE, 49})})",
    "baseBST": 303,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Runerigus",
    "parsedTypes": [
      "GROUND",
      "GHOST"
    ],
    "parsedAbilities": [
      "WANDERING_SPIRIT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_RUNERIGUS",
    "family": "P_FAMILY_YAMASK",
    "baseHP": 58,
    "baseAttack": 95,
    "baseDefense": 145,
    "baseSpeed": 30,
    "baseSpAttack": 50,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_GHOST)",
    "abilities": "{ ABILITY_WANDERING_SPIRIT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Runerigus\")",
    "natDexNum": "NATIONAL_DEX_RUNERIGUS",
    "levelUpLearnset": "sRunerigusLevelUpLearnset",
    "teachableLearnset": "sRunerigusTeachableLearnset",
    "baseBST": 483,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tirtouga",
    "parsedTypes": [
      "WATER",
      "ROCK"
    ],
    "parsedAbilities": [
      "SOLID_ROCK",
      "STURDY",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_TIRTOUGA",
    "family": "P_FAMILY_TIRTOUGA",
    "baseHP": 54,
    "baseAttack": 78,
    "baseDefense": 103,
    "baseSpeed": 22,
    "baseSpAttack": 53,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ROCK)",
    "abilities": "{ ABILITY_SOLID_ROCK, ABILITY_STURDY, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Tirtouga\")",
    "natDexNum": "NATIONAL_DEX_TIRTOUGA",
    "levelUpLearnset": "sTirtougaLevelUpLearnset",
    "teachableLearnset": "sTirtougaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_CARRACOSTA})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Carracosta",
    "parsedTypes": [
      "WATER",
      "ROCK"
    ],
    "parsedAbilities": [
      "SOLID_ROCK",
      "STURDY",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_CARRACOSTA",
    "family": "P_FAMILY_TIRTOUGA",
    "baseHP": 74,
    "baseAttack": 108,
    "baseDefense": 133,
    "baseSpeed": 32,
    "baseSpAttack": 83,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ROCK)",
    "abilities": "{ ABILITY_SOLID_ROCK, ABILITY_STURDY, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Carracosta\")",
    "natDexNum": "NATIONAL_DEX_CARRACOSTA",
    "levelUpLearnset": "sCarracostaLevelUpLearnset",
    "teachableLearnset": "sCarracostaTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Archen",
    "parsedTypes": [
      "ROCK",
      "FLYING"
    ],
    "parsedAbilities": [
      "DEFEATIST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ARCHEN",
    "family": "P_FAMILY_ARCHEN",
    "baseHP": 55,
    "baseAttack": 112,
    "baseDefense": 45,
    "baseSpeed": 70,
    "baseSpAttack": 74,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FLYING)",
    "abilities": "{ ABILITY_DEFEATIST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Archen\")",
    "natDexNum": "NATIONAL_DEX_ARCHEN",
    "levelUpLearnset": "sArchenLevelUpLearnset",
    "teachableLearnset": "sArchenTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_ARCHEOPS})",
    "baseBST": 401,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Archeops",
    "parsedTypes": [
      "ROCK",
      "FLYING"
    ],
    "parsedAbilities": [
      "DEFEATIST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ARCHEOPS",
    "family": "P_FAMILY_ARCHEN",
    "baseHP": 75,
    "baseAttack": 140,
    "baseDefense": 65,
    "baseSpeed": 110,
    "baseSpAttack": 112,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FLYING)",
    "abilities": "{ ABILITY_DEFEATIST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Archeops\")",
    "natDexNum": "NATIONAL_DEX_ARCHEOPS",
    "levelUpLearnset": "sArcheopsLevelUpLearnset",
    "teachableLearnset": "sArcheopsTeachableLearnset",
    "baseBST": 567,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Trubbish",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "STENCH",
      "STICKY_HOLD",
      "AFTERMATH"
    ],
    "id": "SPECIES_TRUBBISH",
    "family": "P_FAMILY_TRUBBISH",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 62,
    "baseSpeed": 65,
    "baseSpAttack": 40,
    "baseSpDefense": 62,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_STENCH, ABILITY_STICKY_HOLD, ABILITY_AFTERMATH }",
    "speciesName": "_(\"Trubbish\")",
    "natDexNum": "NATIONAL_DEX_TRUBBISH",
    "levelUpLearnset": "sTrubbishLevelUpLearnset",
    "teachableLearnset": "sTrubbishTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_GARBODOR})",
    "baseBST": 329,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Garbodor",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "STENCH",
      "WEAK_ARMOR",
      "AFTERMATH"
    ],
    "id": "SPECIES_GARBODOR",
    "family": "P_FAMILY_TRUBBISH",
    "baseHP": 80,
    "baseAttack": 95,
    "baseDefense": 82,
    "baseSpeed": 75,
    "baseSpAttack": 60,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_STENCH, ABILITY_WEAK_ARMOR, ABILITY_AFTERMATH }",
    "speciesName": "_(\"Garbodor\")",
    "natDexNum": "NATIONAL_DEX_GARBODOR",
    "levelUpLearnset": "sGarbodorLevelUpLearnset",
    "teachableLearnset": "sGarbodorTeachableLearnset",
    "baseBST": 474,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zorua",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "ILLUSION",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZORUA",
    "family": "P_FAMILY_ZORUA",
    "baseHP": 40,
    "baseAttack": 65,
    "baseDefense": 40,
    "baseSpeed": 65,
    "baseSpAttack": 80,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_ILLUSION, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zorua\")",
    "natDexNum": "NATIONAL_DEX_ZORUA",
    "levelUpLearnset": "sZoruaLevelUpLearnset",
    "teachableLearnset": "sZoruaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_ZOROARK})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zoroark",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "ILLUSION",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZOROARK",
    "family": "P_FAMILY_ZORUA",
    "baseHP": 60,
    "baseAttack": 105,
    "baseDefense": 60,
    "baseSpeed": 105,
    "baseSpAttack": 120,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_ILLUSION, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zoroark\")",
    "natDexNum": "NATIONAL_DEX_ZOROARK",
    "levelUpLearnset": "sZoroarkLevelUpLearnset",
    "teachableLearnset": "sZoroarkTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zorua  Hisui",
    "parsedTypes": [
      "NORMAL",
      "GHOST"
    ],
    "parsedAbilities": [
      "ILLUSION",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZORUA_HISUI",
    "family": "P_FAMILY_ZORUA",
    "baseHP": 35,
    "baseAttack": 60,
    "baseDefense": 40,
    "baseSpeed": 70,
    "baseSpAttack": 85,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GHOST)",
    "abilities": "{ ABILITY_ILLUSION, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zorua\")",
    "natDexNum": "NATIONAL_DEX_ZORUA",
    "levelUpLearnset": "sZoruaHisuiLevelUpLearnset",
    "teachableLearnset": "sZoruaHisuiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_ZOROARK_HISUI})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zoroark  Hisui",
    "parsedTypes": [
      "NORMAL",
      "GHOST"
    ],
    "parsedAbilities": [
      "ILLUSION",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZOROARK_HISUI",
    "family": "P_FAMILY_ZORUA",
    "baseHP": 55,
    "baseAttack": 100,
    "baseDefense": 60,
    "baseSpeed": 110,
    "baseSpAttack": 125,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GHOST)",
    "abilities": "{ ABILITY_ILLUSION, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zoroark\")",
    "natDexNum": "NATIONAL_DEX_ZOROARK",
    "levelUpLearnset": "sZoroarkHisuiLevelUpLearnset",
    "teachableLearnset": "sZoroarkHisuiTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Minccino",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "TECHNICIAN",
      "SKILL_LINK"
    ],
    "id": "SPECIES_MINCCINO",
    "family": "P_FAMILY_MINCCINO",
    "baseHP": 55,
    "baseAttack": 50,
    "baseDefense": 40,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_TECHNICIAN, ABILITY_SKILL_LINK }",
    "speciesName": "_(\"Minccino\")",
    "natDexNum": "NATIONAL_DEX_MINCCINO",
    "levelUpLearnset": "sMinccinoLevelUpLearnset",
    "teachableLearnset": "sMinccinoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SHINY_STONE, SPECIES_CINCCINO})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cinccino",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "TECHNICIAN",
      "SKILL_LINK"
    ],
    "id": "SPECIES_CINCCINO",
    "family": "P_FAMILY_MINCCINO",
    "baseHP": 75,
    "baseAttack": 95,
    "baseDefense": 60,
    "baseSpeed": 115,
    "baseSpAttack": 65,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_TECHNICIAN, ABILITY_SKILL_LINK }",
    "speciesName": "_(\"Cinccino\")",
    "natDexNum": "NATIONAL_DEX_CINCCINO",
    "levelUpLearnset": "sCinccinoLevelUpLearnset",
    "teachableLearnset": "sCinccinoTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gothita",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "FRISK",
      "NONE",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_GOTHITA",
    "family": "P_FAMILY_GOTHITA",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 50,
    "baseSpeed": 45,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_FRISK, ABILITY_NONE, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Gothita\")",
    "natDexNum": "NATIONAL_DEX_GOTHITA",
    "levelUpLearnset": "sGothitaLevelUpLearnset",
    "teachableLearnset": "sGothitaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_GOTHORITA})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gothorita",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "FRISK",
      "NONE",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_GOTHORITA",
    "family": "P_FAMILY_GOTHITA",
    "baseHP": 60,
    "baseAttack": 45,
    "baseDefense": 70,
    "baseSpeed": 55,
    "baseSpAttack": 75,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_FRISK, ABILITY_NONE, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Gothorita\")",
    "natDexNum": "NATIONAL_DEX_GOTHORITA",
    "levelUpLearnset": "sGothoritaLevelUpLearnset",
    "teachableLearnset": "sGothoritaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 41, SPECIES_GOTHITELLE})",
    "baseBST": 390,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gothitelle",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "FRISK",
      "NONE",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_GOTHITELLE",
    "family": "P_FAMILY_GOTHITA",
    "baseHP": 70,
    "baseAttack": 55,
    "baseDefense": 95,
    "baseSpeed": 65,
    "baseSpAttack": 95,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_FRISK, ABILITY_NONE, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Gothitelle\")",
    "natDexNum": "NATIONAL_DEX_GOTHITELLE",
    "levelUpLearnset": "sGothitelleLevelUpLearnset",
    "teachableLearnset": "sGothitelleTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Solosis",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OVERCOAT",
      "MAGIC_GUARD",
      "REGENERATOR"
    ],
    "id": "SPECIES_SOLOSIS",
    "family": "P_FAMILY_SOLOSIS",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 40,
    "baseSpeed": 20,
    "baseSpAttack": 105,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OVERCOAT, ABILITY_MAGIC_GUARD, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Solosis\")",
    "natDexNum": "NATIONAL_DEX_SOLOSIS",
    "levelUpLearnset": "sSolosisLevelUpLearnset",
    "teachableLearnset": "sSolosisTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_DUOSION})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Duosion",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OVERCOAT",
      "MAGIC_GUARD",
      "REGENERATOR"
    ],
    "id": "SPECIES_DUOSION",
    "family": "P_FAMILY_SOLOSIS",
    "baseHP": 65,
    "baseAttack": 40,
    "baseDefense": 50,
    "baseSpeed": 30,
    "baseSpAttack": 125,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OVERCOAT, ABILITY_MAGIC_GUARD, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Duosion\")",
    "natDexNum": "NATIONAL_DEX_DUOSION",
    "levelUpLearnset": "sDuosionLevelUpLearnset",
    "teachableLearnset": "sDuosionTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 41, SPECIES_REUNICLUS})",
    "baseBST": 370,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Reuniclus",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OVERCOAT",
      "MAGIC_GUARD",
      "REGENERATOR"
    ],
    "id": "SPECIES_REUNICLUS",
    "family": "P_FAMILY_SOLOSIS",
    "baseHP": 110,
    "baseAttack": 65,
    "baseDefense": 75,
    "baseSpeed": 30,
    "baseSpAttack": 125,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OVERCOAT, ABILITY_MAGIC_GUARD, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Reuniclus\")",
    "natDexNum": "NATIONAL_DEX_REUNICLUS",
    "levelUpLearnset": "sReuniclusLevelUpLearnset",
    "teachableLearnset": "sReuniclusTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ducklett",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "BIG_PECKS",
      "HYDRATION"
    ],
    "id": "SPECIES_DUCKLETT",
    "family": "P_FAMILY_DUCKLETT",
    "baseHP": 62,
    "baseAttack": 44,
    "baseDefense": 50,
    "baseSpeed": 55,
    "baseSpAttack": 44,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_BIG_PECKS, ABILITY_HYDRATION }",
    "speciesName": "_(\"Ducklett\")",
    "natDexNum": "NATIONAL_DEX_DUCKLETT",
    "levelUpLearnset": "sDucklettLevelUpLearnset",
    "teachableLearnset": "sDucklettTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_SWANNA})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swanna",
    "parsedTypes": [
      "WATER",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "BIG_PECKS",
      "HYDRATION"
    ],
    "id": "SPECIES_SWANNA",
    "family": "P_FAMILY_DUCKLETT",
    "baseHP": 75,
    "baseAttack": 87,
    "baseDefense": 63,
    "baseSpeed": 98,
    "baseSpAttack": 87,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_BIG_PECKS, ABILITY_HYDRATION }",
    "speciesName": "_(\"Swanna\")",
    "natDexNum": "NATIONAL_DEX_SWANNA",
    "levelUpLearnset": "sSwannaLevelUpLearnset",
    "teachableLearnset": "sSwannaTeachableLearnset",
    "baseBST": 473,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vanillite",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "ICE_BODY",
      "NONE",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_VANILLITE",
    "family": "P_FAMILY_VANILLITE",
    "baseHP": 36,
    "baseAttack": 50,
    "baseDefense": 50,
    "baseSpeed": 44,
    "baseSpAttack": 65,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_ICE_BODY, ABILITY_NONE, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Vanillite\")",
    "natDexNum": "NATIONAL_DEX_VANILLITE",
    "levelUpLearnset": "sVanilliteLevelUpLearnset",
    "teachableLearnset": "sVanilliteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_VANILLISH})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vanillish",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "ICE_BODY",
      "NONE",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_VANILLISH",
    "family": "P_FAMILY_VANILLITE",
    "baseHP": 51,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 59,
    "baseSpAttack": 80,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_ICE_BODY, ABILITY_NONE, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Vanillish\")",
    "natDexNum": "NATIONAL_DEX_VANILLISH",
    "levelUpLearnset": "sVanillishLevelUpLearnset",
    "teachableLearnset": "sVanillishTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 47, SPECIES_VANILLUXE})",
    "baseBST": 395,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vanilluxe",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "ICE_BODY",
      "NONE",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_VANILLUXE",
    "family": "P_FAMILY_VANILLITE",
    "baseHP": 71,
    "baseAttack": 95,
    "baseDefense": 85,
    "baseSpeed": 79,
    "baseSpAttack": 110,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_ICE_BODY, ABILITY_NONE, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Vanilluxe\")",
    "natDexNum": "NATIONAL_DEX_VANILLUXE",
    "levelUpLearnset": "sVanilluxeLevelUpLearnset",
    "teachableLearnset": "sVanilluxeTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deerling  Spring",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_DEERLING_SPRING",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 50,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Deerling\")",
    "natDexNum": "NATIONAL_DEX_DEERLING",
    "levelUpLearnset": "sDeerlingLevelUpLearnset",
    "teachableLearnset": "sDeerlingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_SAWSBUCK_SPRING})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deerling  Summer",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_DEERLING_SUMMER",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 50,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Deerling\")",
    "natDexNum": "NATIONAL_DEX_DEERLING",
    "levelUpLearnset": "sDeerlingLevelUpLearnset",
    "teachableLearnset": "sDeerlingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_SAWSBUCK_SUMMER})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deerling  Autumn",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_DEERLING_AUTUMN",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 50,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Deerling\")",
    "natDexNum": "NATIONAL_DEX_DEERLING",
    "levelUpLearnset": "sDeerlingLevelUpLearnset",
    "teachableLearnset": "sDeerlingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_SAWSBUCK_AUTUMN})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deerling  Winter",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_DEERLING_WINTER",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 50,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Deerling\")",
    "natDexNum": "NATIONAL_DEX_DEERLING",
    "levelUpLearnset": "sDeerlingLevelUpLearnset",
    "teachableLearnset": "sDeerlingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_SAWSBUCK_WINTER})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sawsbuck  Spring",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_SAWSBUCK_SPRING",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Sawsbuck\")",
    "natDexNum": "NATIONAL_DEX_SAWSBUCK",
    "levelUpLearnset": "sSawsbuckLevelUpLearnset",
    "teachableLearnset": "sSawsbuckTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sawsbuck  Summer",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_SAWSBUCK_SUMMER",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Sawsbuck\")",
    "natDexNum": "NATIONAL_DEX_SAWSBUCK",
    "levelUpLearnset": "sSawsbuckLevelUpLearnset",
    "teachableLearnset": "sSawsbuckTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sawsbuck  Autumn",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_SAWSBUCK_AUTUMN",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Sawsbuck\")",
    "natDexNum": "NATIONAL_DEX_SAWSBUCK",
    "levelUpLearnset": "sSawsbuckLevelUpLearnset",
    "teachableLearnset": "sSawsbuckTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sawsbuck  Winter",
    "parsedTypes": [
      "NORMAL",
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "SAP_SIPPER",
      "SERENE_GRACE"
    ],
    "id": "SPECIES_SAWSBUCK_WINTER",
    "family": "P_FAMILY_DEERLING",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 95,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_SAP_SIPPER, ABILITY_SERENE_GRACE }",
    "speciesName": "_(\"Sawsbuck\")",
    "natDexNum": "NATIONAL_DEX_SAWSBUCK",
    "levelUpLearnset": "sSawsbuckLevelUpLearnset",
    "teachableLearnset": "sSawsbuckTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Emolga",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "STATIC",
      "NONE",
      "MOTOR_DRIVE"
    ],
    "id": "SPECIES_EMOLGA",
    "family": "P_FAMILY_EMOLGA",
    "baseHP": 55,
    "baseAttack": 75,
    "baseDefense": 60,
    "baseSpeed": 103,
    "baseSpAttack": 75,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NONE, ABILITY_MOTOR_DRIVE }",
    "speciesName": "_(\"Emolga\")",
    "natDexNum": "NATIONAL_DEX_EMOLGA",
    "levelUpLearnset": "sEmolgaLevelUpLearnset",
    "teachableLearnset": "sEmolgaTeachableLearnset",
    "baseBST": 428,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Karrablast",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SWARM",
      "SHED_SKIN",
      "NO_GUARD"
    ],
    "id": "SPECIES_KARRABLAST",
    "family": "P_FAMILY_KARRABLAST",
    "baseHP": 50,
    "baseAttack": 75,
    "baseDefense": 45,
    "baseSpeed": 60,
    "baseSpAttack": 40,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SWARM, ABILITY_SHED_SKIN, ABILITY_NO_GUARD }",
    "speciesName": "_(\"Karrablast\")",
    "natDexNum": "NATIONAL_DEX_KARRABLAST",
    "levelUpLearnset": "sKarrablastLevelUpLearnset",
    "teachableLearnset": "sKarrablastTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_ESCAVALIER, CONDITIONS({IF_TRADE_PARTNER_SPECIES, SPECIES_SHELMET})})",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Escavalier",
    "parsedTypes": [
      "BUG",
      "STEEL"
    ],
    "parsedAbilities": [
      "SWARM",
      "SHELL_ARMOR",
      "OVERCOAT"
    ],
    "id": "SPECIES_ESCAVALIER",
    "family": "P_FAMILY_KARRABLAST",
    "baseHP": 70,
    "baseAttack": 135,
    "baseDefense": 105,
    "baseSpeed": 20,
    "baseSpAttack": 60,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_BUG, TYPE_STEEL)",
    "abilities": "{ ABILITY_SWARM, ABILITY_SHELL_ARMOR, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Escavalier\")",
    "natDexNum": "NATIONAL_DEX_ESCAVALIER",
    "levelUpLearnset": "sEscavalierLevelUpLearnset",
    "teachableLearnset": "sEscavalierTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Foongus",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "EFFECT_SPORE",
      "NONE",
      "REGENERATOR"
    ],
    "id": "SPECIES_FOONGUS",
    "family": "P_FAMILY_FOONGUS",
    "baseHP": 69,
    "baseAttack": 55,
    "baseDefense": 45,
    "baseSpeed": 15,
    "baseSpAttack": 55,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_EFFECT_SPORE, ABILITY_NONE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Foongus\")",
    "natDexNum": "NATIONAL_DEX_FOONGUS",
    "levelUpLearnset": "sFoongusLevelUpLearnset",
    "teachableLearnset": "sFoongusTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 39, SPECIES_AMOONGUSS})",
    "baseBST": 294,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Amoonguss",
    "parsedTypes": [
      "GRASS",
      "POISON"
    ],
    "parsedAbilities": [
      "EFFECT_SPORE",
      "NONE",
      "REGENERATOR"
    ],
    "id": "SPECIES_AMOONGUSS",
    "family": "P_FAMILY_FOONGUS",
    "baseHP": 114,
    "baseAttack": 85,
    "baseDefense": 70,
    "baseSpeed": 30,
    "baseSpAttack": 85,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_POISON)",
    "abilities": "{ ABILITY_EFFECT_SPORE, ABILITY_NONE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Amoonguss\")",
    "natDexNum": "NATIONAL_DEX_AMOONGUSS",
    "levelUpLearnset": "sAmoongussLevelUpLearnset",
    "teachableLearnset": "sAmoongussTeachableLearnset",
    "baseBST": 464,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Frillish",
    "parsedTypes": [
      "WATER",
      "GHOST"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "CURSED_BODY",
      "DAMP"
    ],
    "id": "SPECIES_FRILLISH",
    "family": "P_FAMILY_FRILLISH",
    "baseHP": 55,
    "baseAttack": 40,
    "baseDefense": 50,
    "baseSpeed": 40,
    "baseSpAttack": 65,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GHOST)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_CURSED_BODY, ABILITY_DAMP }",
    "speciesName": "_(\"Frillish\")",
    "natDexNum": "NATIONAL_DEX_FRILLISH",
    "levelUpLearnset": "sFrillishLevelUpLearnset",
    "teachableLearnset": "sFrillishTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_JELLICENT})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jellicent",
    "parsedTypes": [
      "WATER",
      "GHOST"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "CURSED_BODY",
      "DAMP"
    ],
    "id": "SPECIES_JELLICENT",
    "family": "P_FAMILY_FRILLISH",
    "baseHP": 100,
    "baseAttack": 60,
    "baseDefense": 70,
    "baseSpeed": 60,
    "baseSpAttack": 85,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_WATER, TYPE_GHOST)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_CURSED_BODY, ABILITY_DAMP }",
    "speciesName": "_(\"Jellicent\")",
    "natDexNum": "NATIONAL_DEX_JELLICENT",
    "levelUpLearnset": "sJellicentLevelUpLearnset",
    "teachableLearnset": "sJellicentTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Alomomola",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "HEALER",
      "HYDRATION",
      "REGENERATOR"
    ],
    "id": "SPECIES_ALOMOMOLA",
    "family": "P_FAMILY_ALOMOMOLA",
    "baseHP": 165,
    "baseAttack": 75,
    "baseDefense": 80,
    "baseSpeed": 65,
    "baseSpAttack": 40,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_HEALER, ABILITY_HYDRATION, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Alomomola\")",
    "natDexNum": "NATIONAL_DEX_ALOMOMOLA",
    "levelUpLearnset": "sAlomomolaLevelUpLearnset",
    "teachableLearnset": "sAlomomolaTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Joltik",
    "parsedTypes": [
      "BUG",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "COMPOUND_EYES",
      "UNNERVE",
      "SWARM"
    ],
    "id": "SPECIES_JOLTIK",
    "family": "P_FAMILY_JOLTIK",
    "baseHP": 50,
    "baseAttack": 47,
    "baseDefense": 50,
    "baseSpeed": 65,
    "baseSpAttack": 57,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_COMPOUND_EYES, ABILITY_UNNERVE, ABILITY_SWARM }",
    "speciesName": "_(\"Joltik\")",
    "natDexNum": "NATIONAL_DEX_JOLTIK",
    "levelUpLearnset": "sJoltikLevelUpLearnset",
    "teachableLearnset": "sJoltikTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_GALVANTULA})",
    "baseBST": 319,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Galvantula",
    "parsedTypes": [
      "BUG",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "COMPOUND_EYES",
      "UNNERVE",
      "SWARM"
    ],
    "id": "SPECIES_GALVANTULA",
    "family": "P_FAMILY_JOLTIK",
    "baseHP": 70,
    "baseAttack": 77,
    "baseDefense": 60,
    "baseSpeed": 108,
    "baseSpAttack": 97,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_COMPOUND_EYES, ABILITY_UNNERVE, ABILITY_SWARM }",
    "speciesName": "_(\"Galvantula\")",
    "natDexNum": "NATIONAL_DEX_GALVANTULA",
    "levelUpLearnset": "sGalvantulaLevelUpLearnset",
    "teachableLearnset": "sGalvantulaTeachableLearnset",
    "baseBST": 472,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ferroseed",
    "parsedTypes": [
      "GRASS",
      "STEEL"
    ],
    "parsedAbilities": [
      "IRON_BARBS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_FERROSEED",
    "family": "P_FAMILY_FERROSEED",
    "baseHP": 44,
    "baseAttack": 50,
    "baseDefense": 91,
    "baseSpeed": 10,
    "baseSpAttack": 24,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_STEEL)",
    "abilities": "{ ABILITY_IRON_BARBS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Ferroseed\")",
    "natDexNum": "NATIONAL_DEX_FERROSEED",
    "levelUpLearnset": "sFerroseedLevelUpLearnset",
    "teachableLearnset": "sFerroseedTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_FERROTHORN})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ferrothorn",
    "parsedTypes": [
      "GRASS",
      "STEEL"
    ],
    "parsedAbilities": [
      "IRON_BARBS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_FERROTHORN",
    "family": "P_FAMILY_FERROSEED",
    "baseHP": 74,
    "baseAttack": 94,
    "baseDefense": 131,
    "baseSpeed": 20,
    "baseSpAttack": 54,
    "baseSpDefense": 116,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_STEEL)",
    "abilities": "{ ABILITY_IRON_BARBS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Ferrothorn\")",
    "natDexNum": "NATIONAL_DEX_FERROTHORN",
    "levelUpLearnset": "sFerrothornLevelUpLearnset",
    "teachableLearnset": "sFerrothornTeachableLearnset",
    "baseBST": 489,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Klink",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "PLUS",
      "MINUS",
      "CLEAR_BODY"
    ],
    "id": "SPECIES_KLINK",
    "family": "P_FAMILY_KLINK",
    "baseHP": 40,
    "baseAttack": 55,
    "baseDefense": 70,
    "baseSpeed": 30,
    "baseSpAttack": 45,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_PLUS, ABILITY_MINUS, ABILITY_CLEAR_BODY }",
    "speciesName": "_(\"Klink\")",
    "natDexNum": "NATIONAL_DEX_KLINK",
    "levelUpLearnset": "sKlinkLevelUpLearnset",
    "teachableLearnset": "sKlinkTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_KLANG})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Klang",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "PLUS",
      "MINUS",
      "CLEAR_BODY"
    ],
    "id": "SPECIES_KLANG",
    "family": "P_FAMILY_KLINK",
    "baseHP": 60,
    "baseAttack": 80,
    "baseDefense": 95,
    "baseSpeed": 50,
    "baseSpAttack": 70,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_PLUS, ABILITY_MINUS, ABILITY_CLEAR_BODY }",
    "speciesName": "_(\"Klang\")",
    "natDexNum": "NATIONAL_DEX_KLANG",
    "levelUpLearnset": "sKlangLevelUpLearnset",
    "teachableLearnset": "sKlangTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 49, SPECIES_KLINKLANG})",
    "baseBST": 440,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Klinklang",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "PLUS",
      "MINUS",
      "CLEAR_BODY"
    ],
    "id": "SPECIES_KLINKLANG",
    "family": "P_FAMILY_KLINK",
    "baseHP": 60,
    "baseAttack": 100,
    "baseDefense": 115,
    "baseSpeed": 90,
    "baseSpAttack": 70,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_PLUS, ABILITY_MINUS, ABILITY_CLEAR_BODY }",
    "speciesName": "_(\"Klinklang\")",
    "natDexNum": "NATIONAL_DEX_KLINKLANG",
    "levelUpLearnset": "sKlinklangLevelUpLearnset",
    "teachableLearnset": "sKlinklangTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tynamo",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TYNAMO",
    "family": "P_FAMILY_TYNAMO",
    "baseHP": 35,
    "baseAttack": 55,
    "baseDefense": 40,
    "baseSpeed": 60,
    "baseSpAttack": 45,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Tynamo\")",
    "natDexNum": "NATIONAL_DEX_TYNAMO",
    "levelUpLearnset": "sTynamoLevelUpLearnset",
    "teachableLearnset": "sTynamoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 39, SPECIES_EELEKTRIK})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eelektrik",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_EELEKTRIK",
    "family": "P_FAMILY_TYNAMO",
    "baseHP": 65,
    "baseAttack": 85,
    "baseDefense": 70,
    "baseSpeed": 40,
    "baseSpAttack": 75,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Eelektrik\")",
    "natDexNum": "NATIONAL_DEX_EELEKTRIK",
    "levelUpLearnset": "sEelektrikLevelUpLearnset",
    "teachableLearnset": "sEelektrikTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_THUNDER_STONE, SPECIES_EELEKTROSS})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eelektross",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_EELEKTROSS",
    "family": "P_FAMILY_TYNAMO",
    "baseHP": 85,
    "baseAttack": 115,
    "baseDefense": 80,
    "baseSpeed": 50,
    "baseSpAttack": 105,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Eelektross\")",
    "natDexNum": "NATIONAL_DEX_EELEKTROSS",
    "levelUpLearnset": "sEelektrossLevelUpLearnset",
    "teachableLearnset": "sEelektrossTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Elgyem",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "TELEPATHY",
      "SYNCHRONIZE",
      "ANALYTIC"
    ],
    "id": "SPECIES_ELGYEM",
    "family": "P_FAMILY_ELGYEM",
    "baseHP": 55,
    "baseAttack": 55,
    "baseDefense": 55,
    "baseSpeed": 30,
    "baseSpAttack": 85,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_TELEPATHY, ABILITY_SYNCHRONIZE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Elgyem\")",
    "natDexNum": "NATIONAL_DEX_ELGYEM",
    "levelUpLearnset": "sElgyemLevelUpLearnset",
    "teachableLearnset": "sElgyemTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_BEHEEYEM})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Beheeyem",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "TELEPATHY",
      "SYNCHRONIZE",
      "ANALYTIC"
    ],
    "id": "SPECIES_BEHEEYEM",
    "family": "P_FAMILY_ELGYEM",
    "baseHP": 75,
    "baseAttack": 75,
    "baseDefense": 75,
    "baseSpeed": 40,
    "baseSpAttack": 125,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_TELEPATHY, ABILITY_SYNCHRONIZE, ABILITY_ANALYTIC }",
    "speciesName": "_(\"Beheeyem\")",
    "natDexNum": "NATIONAL_DEX_BEHEEYEM",
    "levelUpLearnset": "sBeheeyemLevelUpLearnset",
    "teachableLearnset": "sBeheeyemTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Litwick",
    "parsedTypes": [
      "GHOST",
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "FLAME_BODY",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_LITWICK",
    "family": "P_FAMILY_LITWICK",
    "baseHP": 50,
    "baseAttack": 30,
    "baseDefense": 55,
    "baseSpeed": 20,
    "baseSpAttack": 65,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_FLAME_BODY, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Litwick\")",
    "natDexNum": "NATIONAL_DEX_LITWICK",
    "levelUpLearnset": "sLitwickLevelUpLearnset",
    "teachableLearnset": "sLitwickTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 41, SPECIES_LAMPENT})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lampent",
    "parsedTypes": [
      "GHOST",
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "FLAME_BODY",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_LAMPENT",
    "family": "P_FAMILY_LITWICK",
    "baseHP": 60,
    "baseAttack": 40,
    "baseDefense": 60,
    "baseSpeed": 55,
    "baseSpAttack": 95,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_FLAME_BODY, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Lampent\")",
    "natDexNum": "NATIONAL_DEX_LAMPENT",
    "levelUpLearnset": "sLampentLevelUpLearnset",
    "teachableLearnset": "sLampentTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_DUSK_STONE, SPECIES_CHANDELURE})",
    "baseBST": 370,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chandelure",
    "parsedTypes": [
      "GHOST",
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "FLAME_BODY",
      "SHADOW_TAG"
    ],
    "id": "SPECIES_CHANDELURE",
    "family": "P_FAMILY_LITWICK",
    "baseHP": 60,
    "baseAttack": 55,
    "baseDefense": 90,
    "baseSpeed": 80,
    "baseSpAttack": 145,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_FLAME_BODY, ABILITY_SHADOW_TAG }",
    "speciesName": "_(\"Chandelure\")",
    "natDexNum": "NATIONAL_DEX_CHANDELURE",
    "levelUpLearnset": "sChandelureLevelUpLearnset",
    "teachableLearnset": "sChandelureTeachableLearnset",
    "baseBST": 520,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Axew",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "MOLD_BREAKER",
      "UNNERVE"
    ],
    "id": "SPECIES_AXEW",
    "family": "P_FAMILY_AXEW",
    "baseHP": 46,
    "baseAttack": 87,
    "baseDefense": 60,
    "baseSpeed": 57,
    "baseSpAttack": 30,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_MOLD_BREAKER, ABILITY_UNNERVE }",
    "speciesName": "_(\"Axew\")",
    "natDexNum": "NATIONAL_DEX_AXEW",
    "levelUpLearnset": "sAxewLevelUpLearnset",
    "teachableLearnset": "sAxewTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_FRAXURE})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fraxure",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "MOLD_BREAKER",
      "UNNERVE"
    ],
    "id": "SPECIES_FRAXURE",
    "family": "P_FAMILY_AXEW",
    "baseHP": 66,
    "baseAttack": 117,
    "baseDefense": 70,
    "baseSpeed": 67,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_MOLD_BREAKER, ABILITY_UNNERVE }",
    "speciesName": "_(\"Fraxure\")",
    "natDexNum": "NATIONAL_DEX_FRAXURE",
    "levelUpLearnset": "sFraxureLevelUpLearnset",
    "teachableLearnset": "sFraxureTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 48, SPECIES_HAXORUS})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Haxorus",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "MOLD_BREAKER",
      "UNNERVE"
    ],
    "id": "SPECIES_HAXORUS",
    "family": "P_FAMILY_AXEW",
    "baseHP": 76,
    "baseAttack": 147,
    "baseDefense": 90,
    "baseSpeed": 97,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_MOLD_BREAKER, ABILITY_UNNERVE }",
    "speciesName": "_(\"Haxorus\")",
    "natDexNum": "NATIONAL_DEX_HAXORUS",
    "levelUpLearnset": "sHaxorusLevelUpLearnset",
    "teachableLearnset": "sHaxorusTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cubchoo",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_CUBCHOO",
    "family": "P_FAMILY_CUBCHOO",
    "baseHP": 55,
    "baseAttack": 70,
    "baseDefense": 40,
    "baseSpeed": 40,
    "baseSpAttack": 60,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Cubchoo\")",
    "natDexNum": "NATIONAL_DEX_CUBCHOO",
    "levelUpLearnset": "sCubchooLevelUpLearnset",
    "teachableLearnset": "sCubchooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_BEARTIC})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Beartic",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "SNOW_CLOAK",
      "NONE",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_BEARTIC",
    "family": "P_FAMILY_CUBCHOO",
    "baseHP": 95,
    "baseAttack": 130,
    "baseDefense": 80,
    "baseSpeed": 50,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_SNOW_CLOAK, ABILITY_NONE, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Beartic\")",
    "natDexNum": "NATIONAL_DEX_BEARTIC",
    "levelUpLearnset": "sBearticLevelUpLearnset",
    "teachableLearnset": "sBearticTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cryogonal",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CRYOGONAL",
    "family": "P_FAMILY_CRYOGONAL",
    "baseHP": 80,
    "baseAttack": 50,
    "baseDefense": 50,
    "baseSpeed": 105,
    "baseSpAttack": 95,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cryogonal\")",
    "natDexNum": "NATIONAL_DEX_CRYOGONAL",
    "levelUpLearnset": "sCryogonalLevelUpLearnset",
    "teachableLearnset": "sCryogonalTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shelmet",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "HYDRATION",
      "SHELL_ARMOR",
      "OVERCOAT"
    ],
    "id": "SPECIES_SHELMET",
    "family": "P_FAMILY_SHELMET",
    "baseHP": 50,
    "baseAttack": 40,
    "baseDefense": 85,
    "baseSpeed": 25,
    "baseSpAttack": 40,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_HYDRATION, ABILITY_SHELL_ARMOR, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Shelmet\")",
    "natDexNum": "NATIONAL_DEX_SHELMET",
    "levelUpLearnset": "sShelmetLevelUpLearnset",
    "teachableLearnset": "sShelmetTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_ACCELGOR, CONDITIONS({IF_TRADE_PARTNER_SPECIES, SPECIES_KARRABLAST})})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Accelgor",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "HYDRATION",
      "STICKY_HOLD",
      "UNBURDEN"
    ],
    "id": "SPECIES_ACCELGOR",
    "family": "P_FAMILY_SHELMET",
    "baseHP": 80,
    "baseAttack": 70,
    "baseDefense": 40,
    "baseSpeed": 145,
    "baseSpAttack": 100,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_HYDRATION, ABILITY_STICKY_HOLD, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Accelgor\")",
    "natDexNum": "NATIONAL_DEX_ACCELGOR",
    "levelUpLearnset": "sAccelgorLevelUpLearnset",
    "teachableLearnset": "sAccelgorTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stunfisk",
    "parsedTypes": [
      "GROUND",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "LIMBER",
      "SAND_VEIL"
    ],
    "id": "SPECIES_STUNFISK",
    "family": "P_FAMILY_STUNFISK",
    "baseHP": 109,
    "baseAttack": 66,
    "baseDefense": 84,
    "baseSpeed": 32,
    "baseSpAttack": 81,
    "baseSpDefense": 99,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_LIMBER, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Stunfisk\")",
    "natDexNum": "NATIONAL_DEX_STUNFISK",
    "levelUpLearnset": "sStunfiskLevelUpLearnset",
    "teachableLearnset": "sStunfiskTeachableLearnset",
    "baseBST": 471,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stunfisk  Galar",
    "parsedTypes": [
      "GROUND",
      "STEEL"
    ],
    "parsedAbilities": [
      "MIMICRY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_STUNFISK_GALAR",
    "family": "P_FAMILY_STUNFISK",
    "baseHP": 109,
    "baseAttack": 81,
    "baseDefense": 99,
    "baseSpeed": 32,
    "baseSpAttack": 66,
    "baseSpDefense": 84,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_STEEL)",
    "abilities": "{ ABILITY_MIMICRY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Stunfisk\")",
    "natDexNum": "NATIONAL_DEX_STUNFISK",
    "levelUpLearnset": "sStunfiskGalarLevelUpLearnset",
    "teachableLearnset": "sStunfiskGalarTeachableLearnset",
    "baseBST": 471,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mienfoo",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "REGENERATOR",
      "RECKLESS"
    ],
    "id": "SPECIES_MIENFOO",
    "family": "P_FAMILY_MIENFOO",
    "baseHP": 45,
    "baseAttack": 85,
    "baseDefense": 50,
    "baseSpeed": 65,
    "baseSpAttack": 55,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_REGENERATOR, ABILITY_RECKLESS }",
    "speciesName": "_(\"Mienfoo\")",
    "natDexNum": "NATIONAL_DEX_MIENFOO",
    "levelUpLearnset": "sMienfooLevelUpLearnset",
    "teachableLearnset": "sMienfooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 50, SPECIES_MIENSHAO})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mienshao",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "REGENERATOR",
      "RECKLESS"
    ],
    "id": "SPECIES_MIENSHAO",
    "family": "P_FAMILY_MIENFOO",
    "baseHP": 65,
    "baseAttack": 125,
    "baseDefense": 60,
    "baseSpeed": 105,
    "baseSpAttack": 95,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_REGENERATOR, ABILITY_RECKLESS }",
    "speciesName": "_(\"Mienshao\")",
    "natDexNum": "NATIONAL_DEX_MIENSHAO",
    "levelUpLearnset": "sMienshaoLevelUpLearnset",
    "teachableLearnset": "sMienshaoTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Druddigon",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "ROUGH_SKIN",
      "SHEER_FORCE",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_DRUDDIGON",
    "family": "P_FAMILY_DRUDDIGON",
    "baseHP": 77,
    "baseAttack": 120,
    "baseDefense": 90,
    "baseSpeed": 48,
    "baseSpAttack": 60,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_ROUGH_SKIN, ABILITY_SHEER_FORCE, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Druddigon\")",
    "natDexNum": "NATIONAL_DEX_DRUDDIGON",
    "levelUpLearnset": "sDruddigonLevelUpLearnset",
    "teachableLearnset": "sDruddigonTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golett",
    "parsedTypes": [
      "GROUND",
      "GHOST"
    ],
    "parsedAbilities": [
      "IRON_FIST",
      "KLUTZ",
      "NO_GUARD"
    ],
    "id": "SPECIES_GOLETT",
    "family": "P_FAMILY_GOLETT",
    "baseHP": 59,
    "baseAttack": 74,
    "baseDefense": 50,
    "baseSpeed": 35,
    "baseSpAttack": 35,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_GHOST)",
    "abilities": "{ ABILITY_IRON_FIST, ABILITY_KLUTZ, ABILITY_NO_GUARD }",
    "speciesName": "_(\"Golett\")",
    "natDexNum": "NATIONAL_DEX_GOLETT",
    "levelUpLearnset": "sGolettLevelUpLearnset",
    "teachableLearnset": "sGolettTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 43, SPECIES_GOLURK})",
    "baseBST": 303,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golurk",
    "parsedTypes": [
      "GROUND",
      "GHOST"
    ],
    "parsedAbilities": [
      "IRON_FIST",
      "KLUTZ",
      "NO_GUARD"
    ],
    "id": "SPECIES_GOLURK",
    "family": "P_FAMILY_GOLETT",
    "baseHP": 89,
    "baseAttack": 124,
    "baseDefense": 80,
    "baseSpeed": 55,
    "baseSpAttack": 55,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_GHOST)",
    "abilities": "{ ABILITY_IRON_FIST, ABILITY_KLUTZ, ABILITY_NO_GUARD }",
    "speciesName": "_(\"Golurk\")",
    "natDexNum": "NATIONAL_DEX_GOLURK",
    "levelUpLearnset": "sGolurkLevelUpLearnset",
    "teachableLearnset": "sGolurkTeachableLearnset",
    "baseBST": 483,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pawniard",
    "parsedTypes": [
      "DARK",
      "STEEL"
    ],
    "parsedAbilities": [
      "DEFIANT",
      "INNER_FOCUS",
      "PRESSURE"
    ],
    "id": "SPECIES_PAWNIARD",
    "family": "P_FAMILY_PAWNIARD",
    "baseHP": 45,
    "baseAttack": 85,
    "baseDefense": 70,
    "baseSpeed": 60,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_DARK, TYPE_STEEL)",
    "abilities": "{ ABILITY_DEFIANT, ABILITY_INNER_FOCUS, ABILITY_PRESSURE }",
    "speciesName": "_(\"Pawniard\")",
    "natDexNum": "NATIONAL_DEX_PAWNIARD",
    "levelUpLearnset": "sPawniardLevelUpLearnset",
    "teachableLearnset": "sPawniardTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 52, SPECIES_BISHARP})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bisharp",
    "parsedTypes": [
      "DARK",
      "STEEL"
    ],
    "parsedAbilities": [
      "DEFIANT",
      "INNER_FOCUS",
      "PRESSURE"
    ],
    "id": "SPECIES_BISHARP",
    "family": "P_FAMILY_PAWNIARD",
    "baseHP": 65,
    "baseAttack": 125,
    "baseDefense": 100,
    "baseSpeed": 70,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DARK, TYPE_STEEL)",
    "abilities": "{ ABILITY_DEFIANT, ABILITY_INNER_FOCUS, ABILITY_PRESSURE }",
    "speciesName": "_(\"Bisharp\")",
    "natDexNum": "NATIONAL_DEX_BISHARP",
    "levelUpLearnset": "sBisharpLevelUpLearnset",
    "teachableLearnset": "sBisharpTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_KINGAMBIT, CONDITIONS({IF_DEFEAT_X_WITH_ITEMS, SPECIES_BISHARP, ITEM_LEADERS_CREST, 3})})",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kingambit",
    "parsedTypes": [
      "DARK",
      "STEEL"
    ],
    "parsedAbilities": [
      "DEFIANT",
      "SUPREME_OVERLORD",
      "PRESSURE"
    ],
    "id": "SPECIES_KINGAMBIT",
    "family": "P_FAMILY_PAWNIARD",
    "baseHP": 100,
    "baseAttack": 135,
    "baseDefense": 120,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_DARK, TYPE_STEEL)",
    "abilities": "{ ABILITY_DEFIANT, ABILITY_SUPREME_OVERLORD, ABILITY_PRESSURE }",
    "speciesName": "_(\"Kingambit\")",
    "natDexNum": "NATIONAL_DEX_KINGAMBIT",
    "levelUpLearnset": "sKingambitLevelUpLearnset",
    "teachableLearnset": "sKingambitTeachableLearnset",
    "baseBST": 550,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bouffalant",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RECKLESS",
      "SAP_SIPPER",
      "SOUNDPROOF"
    ],
    "id": "SPECIES_BOUFFALANT",
    "family": "P_FAMILY_BOUFFALANT",
    "baseHP": 95,
    "baseAttack": 110,
    "baseDefense": 95,
    "baseSpeed": 55,
    "baseSpAttack": 40,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RECKLESS, ABILITY_SAP_SIPPER, ABILITY_SOUNDPROOF }",
    "speciesName": "_(\"Bouffalant\")",
    "natDexNum": "NATIONAL_DEX_BOUFFALANT",
    "levelUpLearnset": "sBouffalantLevelUpLearnset",
    "teachableLearnset": "sBouffalantTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rufflet",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SHEER_FORCE",
      "HUSTLE"
    ],
    "id": "SPECIES_RUFFLET",
    "family": "P_FAMILY_RUFFLET",
    "baseHP": 70,
    "baseAttack": 83,
    "baseDefense": 50,
    "baseSpeed": 60,
    "baseSpAttack": 37,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SHEER_FORCE, ABILITY_HUSTLE }",
    "speciesName": "_(\"Rufflet\")",
    "natDexNum": "NATIONAL_DEX_RUFFLET",
    "levelUpLearnset": "sRuffletLevelUpLearnset",
    "teachableLearnset": "sRuffletTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 54, SPECIES_BRAVIARY}",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Braviary",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SHEER_FORCE",
      "DEFIANT"
    ],
    "id": "SPECIES_BRAVIARY",
    "family": "P_FAMILY_RUFFLET",
    "baseHP": 100,
    "baseAttack": 123,
    "baseDefense": 75,
    "baseSpeed": 80,
    "baseSpAttack": 57,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SHEER_FORCE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Braviary\")",
    "natDexNum": "NATIONAL_DEX_BRAVIARY",
    "levelUpLearnset": "sBraviaryLevelUpLearnset",
    "teachableLearnset": "sBraviaryTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Braviary  Hisui",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SHEER_FORCE",
      "TINTED_LENS"
    ],
    "id": "SPECIES_BRAVIARY_HISUI",
    "family": "P_FAMILY_RUFFLET",
    "baseHP": 110,
    "baseAttack": 83,
    "baseDefense": 70,
    "baseSpeed": 65,
    "baseSpAttack": 112,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SHEER_FORCE, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Braviary\")",
    "natDexNum": "NATIONAL_DEX_BRAVIARY",
    "levelUpLearnset": "sBraviaryHisuiLevelUpLearnset",
    "teachableLearnset": "sBraviaryHisuiTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vullaby",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "OVERCOAT",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_VULLABY",
    "family": "P_FAMILY_VULLABY",
    "baseHP": 70,
    "baseAttack": 55,
    "baseDefense": 75,
    "baseSpeed": 60,
    "baseSpAttack": 45,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_OVERCOAT, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Vullaby\")",
    "natDexNum": "NATIONAL_DEX_VULLABY",
    "levelUpLearnset": "sVullabyLevelUpLearnset",
    "teachableLearnset": "sVullabyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 54, SPECIES_MANDIBUZZ})",
    "baseBST": 370,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mandibuzz",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "OVERCOAT",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_MANDIBUZZ",
    "family": "P_FAMILY_VULLABY",
    "baseHP": 110,
    "baseAttack": 65,
    "baseDefense": 105,
    "baseSpeed": 80,
    "baseSpAttack": 55,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_OVERCOAT, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Mandibuzz\")",
    "natDexNum": "NATIONAL_DEX_MANDIBUZZ",
    "levelUpLearnset": "sMandibuzzLevelUpLearnset",
    "teachableLearnset": "sMandibuzzTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Heatmor",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "GLUTTONY",
      "FLASH_FIRE",
      "WHITE_SMOKE"
    ],
    "id": "SPECIES_HEATMOR",
    "family": "P_FAMILY_HEATMOR",
    "baseHP": 85,
    "baseAttack": 97,
    "baseDefense": 66,
    "baseSpeed": 65,
    "baseSpAttack": 105,
    "baseSpDefense": 66,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_GLUTTONY, ABILITY_FLASH_FIRE, ABILITY_WHITE_SMOKE }",
    "speciesName": "_(\"Heatmor\")",
    "natDexNum": "NATIONAL_DEX_HEATMOR",
    "levelUpLearnset": "sHeatmorLevelUpLearnset",
    "teachableLearnset": "sHeatmorTeachableLearnset",
    "baseBST": 484,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Durant",
    "parsedTypes": [
      "BUG",
      "STEEL"
    ],
    "parsedAbilities": [
      "SWARM",
      "HUSTLE",
      "TRUANT"
    ],
    "id": "SPECIES_DURANT",
    "family": "P_FAMILY_DURANT",
    "baseHP": 58,
    "baseAttack": 109,
    "baseDefense": 112,
    "baseSpeed": 109,
    "baseSpAttack": 48,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_BUG, TYPE_STEEL)",
    "abilities": "{ ABILITY_SWARM, ABILITY_HUSTLE, ABILITY_TRUANT }",
    "speciesName": "_(\"Durant\")",
    "natDexNum": "NATIONAL_DEX_DURANT",
    "levelUpLearnset": "sDurantLevelUpLearnset",
    "teachableLearnset": "sDurantTeachableLearnset",
    "baseBST": 484,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Deino",
    "parsedTypes": [
      "DARK",
      "DRAGON"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DEINO",
    "family": "P_FAMILY_DEINO",
    "baseHP": 52,
    "baseAttack": 65,
    "baseDefense": 50,
    "baseSpeed": 38,
    "baseSpAttack": 45,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DARK, TYPE_DRAGON)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Deino\")",
    "natDexNum": "NATIONAL_DEX_DEINO",
    "levelUpLearnset": "sDeinoLevelUpLearnset",
    "teachableLearnset": "sDeinoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 50, SPECIES_ZWEILOUS})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zweilous",
    "parsedTypes": [
      "DARK",
      "DRAGON"
    ],
    "parsedAbilities": [
      "HUSTLE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZWEILOUS",
    "family": "P_FAMILY_DEINO",
    "baseHP": 72,
    "baseAttack": 85,
    "baseDefense": 70,
    "baseSpeed": 58,
    "baseSpAttack": 65,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DARK, TYPE_DRAGON)",
    "abilities": "{ ABILITY_HUSTLE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zweilous\")",
    "natDexNum": "NATIONAL_DEX_ZWEILOUS",
    "levelUpLearnset": "sZweilousLevelUpLearnset",
    "teachableLearnset": "sZweilousTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 64, SPECIES_HYDREIGON})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hydreigon",
    "parsedTypes": [
      "DARK",
      "DRAGON"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_HYDREIGON",
    "family": "P_FAMILY_DEINO",
    "baseHP": 92,
    "baseAttack": 105,
    "baseDefense": 90,
    "baseSpeed": 98,
    "baseSpAttack": 125,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DARK, TYPE_DRAGON)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Hydreigon\")",
    "natDexNum": "NATIONAL_DEX_HYDREIGON",
    "levelUpLearnset": "sHydreigonLevelUpLearnset",
    "teachableLearnset": "sHydreigonTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Larvesta",
    "parsedTypes": [
      "BUG",
      "FIRE"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "SWARM"
    ],
    "id": "SPECIES_LARVESTA",
    "family": "P_FAMILY_LARVESTA",
    "baseHP": 55,
    "baseAttack": 85,
    "baseDefense": 55,
    "baseSpeed": 60,
    "baseSpAttack": 50,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIRE)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_SWARM }",
    "speciesName": "_(\"Larvesta\")",
    "natDexNum": "NATIONAL_DEX_LARVESTA",
    "levelUpLearnset": "sLarvestaLevelUpLearnset",
    "teachableLearnset": "sLarvestaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 59, SPECIES_VOLCARONA})",
    "baseBST": 360,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Volcarona",
    "parsedTypes": [
      "BUG",
      "FIRE"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "SWARM"
    ],
    "id": "SPECIES_VOLCARONA",
    "family": "P_FAMILY_LARVESTA",
    "baseHP": 85,
    "baseAttack": 60,
    "baseDefense": 65,
    "baseSpeed": 100,
    "baseSpAttack": 135,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIRE)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_SWARM }",
    "speciesName": "_(\"Volcarona\")",
    "natDexNum": "NATIONAL_DEX_VOLCARONA",
    "levelUpLearnset": "sVolcaronaLevelUpLearnset",
    "teachableLearnset": "sVolcaronaTeachableLearnset",
    "baseBST": 550,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cobalion",
    "parsedTypes": [
      "STEEL",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "JUSTIFIED",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_COBALION",
    "family": "P_FAMILY_COBALION",
    "baseHP": 91,
    "baseAttack": 90,
    "baseDefense": 129,
    "baseSpeed": 108,
    "baseSpAttack": 90,
    "baseSpDefense": 72,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_JUSTIFIED, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cobalion\")",
    "natDexNum": "NATIONAL_DEX_COBALION",
    "levelUpLearnset": "sCobalionLevelUpLearnset",
    "teachableLearnset": "sCobalionTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Terrakion",
    "parsedTypes": [
      "ROCK",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "JUSTIFIED",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TERRAKION",
    "family": "P_FAMILY_TERRAKION",
    "baseHP": 91,
    "baseAttack": 129,
    "baseDefense": 90,
    "baseSpeed": 108,
    "baseSpAttack": 72,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_JUSTIFIED, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Terrakion\")",
    "natDexNum": "NATIONAL_DEX_TERRAKION",
    "levelUpLearnset": "sTerrakionLevelUpLearnset",
    "teachableLearnset": "sTerrakionTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Virizion",
    "parsedTypes": [
      "GRASS",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "JUSTIFIED",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_VIRIZION",
    "family": "P_FAMILY_VIRIZION",
    "baseHP": 91,
    "baseAttack": 90,
    "baseDefense": 72,
    "baseSpeed": 108,
    "baseSpAttack": 90,
    "baseSpDefense": 129,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_JUSTIFIED, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Virizion\")",
    "natDexNum": "NATIONAL_DEX_VIRIZION",
    "levelUpLearnset": "sVirizionLevelUpLearnset",
    "teachableLearnset": "sVirizionTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tornadus  Incarnate",
    "parsedTypes": [
      "FLYING"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_TORNADUS_INCARNATE",
    "family": "P_FAMILY_TORNADUS",
    "baseHP": 79,
    "baseAttack": 115,
    "baseDefense": 70,
    "baseSpeed": 111,
    "baseSpAttack": 125,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FLYING)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Tornadus\")",
    "natDexNum": "NATIONAL_DEX_TORNADUS",
    "levelUpLearnset": "sTornadusLevelUpLearnset",
    "teachableLearnset": "sTornadusTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tornadus  Therian",
    "parsedTypes": [
      "FLYING"
    ],
    "parsedAbilities": [
      "REGENERATOR",
      "NONE",
      "REGENERATOR"
    ],
    "id": "SPECIES_TORNADUS_THERIAN",
    "family": "P_FAMILY_TORNADUS",
    "baseHP": 79,
    "baseAttack": 100,
    "baseDefense": 80,
    "baseSpeed": 121,
    "baseSpAttack": 110,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FLYING)",
    "abilities": "{ ABILITY_REGENERATOR, ABILITY_NONE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Tornadus\")",
    "natDexNum": "NATIONAL_DEX_TORNADUS",
    "levelUpLearnset": "sTornadusLevelUpLearnset",
    "teachableLearnset": "sTornadusTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Thundurus  Incarnate",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_THUNDURUS_INCARNATE",
    "family": "P_FAMILY_THUNDURUS",
    "baseHP": 79,
    "baseAttack": 115,
    "baseDefense": 70,
    "baseSpeed": 111,
    "baseSpAttack": 125,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Thundurus\")",
    "natDexNum": "NATIONAL_DEX_THUNDURUS",
    "levelUpLearnset": "sThundurusLevelUpLearnset",
    "teachableLearnset": "sThundurusTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Thundurus  Therian",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "NONE",
      "VOLT_ABSORB"
    ],
    "id": "SPECIES_THUNDURUS_THERIAN",
    "family": "P_FAMILY_THUNDURUS",
    "baseHP": 79,
    "baseAttack": 105,
    "baseDefense": 70,
    "baseSpeed": 101,
    "baseSpAttack": 145,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_NONE, ABILITY_VOLT_ABSORB }",
    "speciesName": "_(\"Thundurus\")",
    "natDexNum": "NATIONAL_DEX_THUNDURUS",
    "levelUpLearnset": "sThundurusLevelUpLearnset",
    "teachableLearnset": "sThundurusTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Reshiram",
    "parsedTypes": [
      "DRAGON",
      "FIRE"
    ],
    "parsedAbilities": [
      "TURBOBLAZE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_RESHIRAM",
    "family": "P_FAMILY_RESHIRAM",
    "baseHP": 100,
    "baseAttack": 120,
    "baseDefense": 100,
    "baseSpeed": 90,
    "baseSpAttack": 150,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FIRE)",
    "abilities": "{ ABILITY_TURBOBLAZE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Reshiram\")",
    "natDexNum": "NATIONAL_DEX_RESHIRAM",
    "levelUpLearnset": "sReshiramLevelUpLearnset",
    "teachableLearnset": "sReshiramTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zekrom",
    "parsedTypes": [
      "DRAGON",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "TERAVOLT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZEKROM",
    "family": "P_FAMILY_ZEKROM",
    "baseHP": 100,
    "baseAttack": 150,
    "baseDefense": 120,
    "baseSpeed": 90,
    "baseSpAttack": 120,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_TERAVOLT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zekrom\")",
    "natDexNum": "NATIONAL_DEX_ZEKROM",
    "levelUpLearnset": "sZekromLevelUpLearnset",
    "teachableLearnset": "sZekromTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Landorus  Incarnate",
    "parsedTypes": [
      "GROUND",
      "FLYING"
    ],
    "parsedAbilities": [
      "SAND_FORCE",
      "NONE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_LANDORUS_INCARNATE",
    "family": "P_FAMILY_LANDORUS",
    "baseHP": 89,
    "baseAttack": 125,
    "baseDefense": 90,
    "baseSpeed": 101,
    "baseSpAttack": 115,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_FLYING)",
    "abilities": "{ ABILITY_SAND_FORCE, ABILITY_NONE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Landorus\")",
    "natDexNum": "NATIONAL_DEX_LANDORUS",
    "levelUpLearnset": "sLandorusLevelUpLearnset",
    "teachableLearnset": "sLandorusTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Landorus  Therian",
    "parsedTypes": [
      "GROUND",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_LANDORUS_THERIAN",
    "family": "P_FAMILY_LANDORUS",
    "baseHP": 89,
    "baseAttack": 145,
    "baseDefense": 90,
    "baseSpeed": 91,
    "baseSpAttack": 105,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Landorus\")",
    "natDexNum": "NATIONAL_DEX_LANDORUS",
    "levelUpLearnset": "sLandorusLevelUpLearnset",
    "teachableLearnset": "sLandorusTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kyurem",
    "parsedTypes": [
      "DRAGON",
      "ICE"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KYUREM",
    "family": "P_FAMILY_KYUREM",
    "baseHP": 125,
    "baseAttack": 130,
    "baseDefense": 90,
    "baseSpeed": 95,
    "baseSpAttack": 130,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ICE)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kyurem\")",
    "natDexNum": "NATIONAL_DEX_KYUREM",
    "levelUpLearnset": "sKyuremLevelUpLearnset",
    "teachableLearnset": "sKyuremTeachableLearnset",
    "baseBST": 660,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kyurem  White",
    "parsedTypes": [
      "DRAGON",
      "ICE"
    ],
    "parsedAbilities": [
      "TURBOBLAZE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KYUREM_WHITE",
    "family": "P_FAMILY_KYUREM",
    "baseHP": 125,
    "baseAttack": 120,
    "baseDefense": 90,
    "baseSpeed": 95,
    "baseSpAttack": 170,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ICE)",
    "abilities": "{ ABILITY_TURBOBLAZE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kyurem\")",
    "natDexNum": "NATIONAL_DEX_KYUREM",
    "levelUpLearnset": "sKyuremWhiteLevelUpLearnset",
    "teachableLearnset": "sKyuremTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kyurem  Black",
    "parsedTypes": [
      "DRAGON",
      "ICE"
    ],
    "parsedAbilities": [
      "TERAVOLT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KYUREM_BLACK",
    "family": "P_FAMILY_KYUREM",
    "baseHP": 125,
    "baseAttack": 170,
    "baseDefense": 100,
    "baseSpeed": 95,
    "baseSpAttack": 120,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ICE)",
    "abilities": "{ ABILITY_TERAVOLT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kyurem\")",
    "natDexNum": "NATIONAL_DEX_KYUREM",
    "levelUpLearnset": "sKyuremBlackLevelUpLearnset",
    "teachableLearnset": "sKyuremTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Keldeo  Ordinary",
    "parsedTypes": [
      "WATER",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "JUSTIFIED",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KELDEO_ORDINARY",
    "family": "P_FAMILY_KELDEO",
    "baseHP": 91,
    "baseAttack": 72,
    "baseDefense": 90,
    "baseSpeed": 108,
    "baseSpAttack": 129,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_JUSTIFIED, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Keldeo\")",
    "natDexNum": "NATIONAL_DEX_KELDEO",
    "levelUpLearnset": "sKeldeoLevelUpLearnset",
    "teachableLearnset": "sKeldeoTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Keldeo  Resolute",
    "parsedTypes": [
      "WATER",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "JUSTIFIED",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KELDEO_RESOLUTE",
    "family": "P_FAMILY_KELDEO",
    "baseHP": 91,
    "baseAttack": 72,
    "baseDefense": 90,
    "baseSpeed": 108,
    "baseSpAttack": 129,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_JUSTIFIED, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Keldeo\")",
    "natDexNum": "NATIONAL_DEX_KELDEO",
    "levelUpLearnset": "sKeldeoLevelUpLearnset",
    "teachableLearnset": "sKeldeoTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meloetta  Aria",
    "parsedTypes": [
      "NORMAL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MELOETTA_ARIA",
    "family": "P_FAMILY_MELOETTA",
    "baseHP": 100,
    "baseAttack": 77,
    "baseDefense": 77,
    "baseSpeed": 90,
    "baseSpAttack": 128,
    "baseSpDefense": 128,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Meloetta\")",
    "natDexNum": "NATIONAL_DEX_MELOETTA",
    "levelUpLearnset": "sMeloettaLevelUpLearnset",
    "teachableLearnset": "sMeloettaTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meloetta  Pirouette",
    "parsedTypes": [
      "NORMAL",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SERENE_GRACE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MELOETTA_PIROUETTE",
    "family": "P_FAMILY_MELOETTA",
    "baseHP": 100,
    "baseAttack": 128,
    "baseDefense": 90,
    "baseSpeed": 128,
    "baseSpAttack": 77,
    "baseSpDefense": 77,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SERENE_GRACE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Meloetta\")",
    "natDexNum": "NATIONAL_DEX_MELOETTA",
    "levelUpLearnset": "sMeloettaLevelUpLearnset",
    "teachableLearnset": "sMeloettaTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chespin",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "BULLETPROOF"
    ],
    "id": "SPECIES_CHESPIN",
    "family": "P_FAMILY_CHESPIN",
    "baseHP": 56,
    "baseAttack": 61,
    "baseDefense": 65,
    "baseSpeed": 38,
    "baseSpAttack": 48,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_BULLETPROOF }",
    "speciesName": "_(\"Chespin\")",
    "natDexNum": "NATIONAL_DEX_CHESPIN",
    "levelUpLearnset": "sChespinLevelUpLearnset",
    "teachableLearnset": "sChespinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_QUILLADIN})",
    "baseBST": 313,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Quilladin",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "BULLETPROOF"
    ],
    "id": "SPECIES_QUILLADIN",
    "family": "P_FAMILY_CHESPIN",
    "baseHP": 61,
    "baseAttack": 78,
    "baseDefense": 95,
    "baseSpeed": 57,
    "baseSpAttack": 56,
    "baseSpDefense": 58,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_BULLETPROOF }",
    "speciesName": "_(\"Quilladin\")",
    "natDexNum": "NATIONAL_DEX_QUILLADIN",
    "levelUpLearnset": "sQuilladinLevelUpLearnset",
    "teachableLearnset": "sQuilladinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_CHESNAUGHT})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chesnaught",
    "parsedTypes": [
      "GRASS",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "BULLETPROOF"
    ],
    "id": "SPECIES_CHESNAUGHT",
    "family": "P_FAMILY_CHESPIN",
    "baseHP": 88,
    "baseAttack": 107,
    "baseDefense": 122,
    "baseSpeed": 64,
    "baseSpAttack": 74,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_BULLETPROOF }",
    "speciesName": "_(\"Chesnaught\")",
    "natDexNum": "NATIONAL_DEX_CHESNAUGHT",
    "levelUpLearnset": "sChesnaughtLevelUpLearnset",
    "teachableLearnset": "sChesnaughtTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fennekin",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "MAGICIAN"
    ],
    "id": "SPECIES_FENNEKIN",
    "family": "P_FAMILY_FENNEKIN",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 60,
    "baseSpAttack": 62,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_MAGICIAN }",
    "speciesName": "_(\"Fennekin\")",
    "natDexNum": "NATIONAL_DEX_FENNEKIN",
    "levelUpLearnset": "sFennekinLevelUpLearnset",
    "teachableLearnset": "sFennekinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_BRAIXEN})",
    "baseBST": 307,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Braixen",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "MAGICIAN"
    ],
    "id": "SPECIES_BRAIXEN",
    "family": "P_FAMILY_FENNEKIN",
    "baseHP": 59,
    "baseAttack": 59,
    "baseDefense": 58,
    "baseSpeed": 73,
    "baseSpAttack": 90,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_MAGICIAN }",
    "speciesName": "_(\"Braixen\")",
    "natDexNum": "NATIONAL_DEX_BRAIXEN",
    "levelUpLearnset": "sBraixenLevelUpLearnset",
    "teachableLearnset": "sBraixenTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_DELPHOX})",
    "baseBST": 409,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Delphox",
    "parsedTypes": [
      "FIRE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "MAGICIAN"
    ],
    "id": "SPECIES_DELPHOX",
    "family": "P_FAMILY_FENNEKIN",
    "baseHP": 75,
    "baseAttack": 69,
    "baseDefense": 72,
    "baseSpeed": 104,
    "baseSpAttack": 114,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_MAGICIAN }",
    "speciesName": "_(\"Delphox\")",
    "natDexNum": "NATIONAL_DEX_DELPHOX",
    "levelUpLearnset": "sDelphoxLevelUpLearnset",
    "teachableLearnset": "sDelphoxTeachableLearnset",
    "baseBST": 534,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Froakie",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "PROTEAN"
    ],
    "id": "SPECIES_FROAKIE",
    "family": "P_FAMILY_FROAKIE",
    "baseHP": 41,
    "baseAttack": 56,
    "baseDefense": 40,
    "baseSpeed": 71,
    "baseSpAttack": 62,
    "baseSpDefense": 44,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_PROTEAN }",
    "speciesName": "_(\"Froakie\")",
    "natDexNum": "NATIONAL_DEX_FROAKIE",
    "levelUpLearnset": "sFroakieLevelUpLearnset",
    "teachableLearnset": "sFroakieTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_FROGADIER})",
    "baseBST": 314,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Frogadier",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "PROTEAN"
    ],
    "id": "SPECIES_FROGADIER",
    "family": "P_FAMILY_FROAKIE",
    "baseHP": 54,
    "baseAttack": 63,
    "baseDefense": 52,
    "baseSpeed": 97,
    "baseSpAttack": 83,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_PROTEAN }",
    "speciesName": "_(\"Frogadier\")",
    "natDexNum": "NATIONAL_DEX_FROGADIER",
    "levelUpLearnset": "sFrogadierLevelUpLearnset",
    "teachableLearnset": "sFrogadierTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_GRENINJA})",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Greninja",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "PROTEAN"
    ],
    "id": "SPECIES_GRENINJA",
    "family": "P_FAMILY_FROAKIE",
    "baseHP": 72,
    "baseAttack": 95,
    "baseDefense": 67,
    "baseSpeed": 122,
    "baseSpAttack": 103,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_PROTEAN }",
    "speciesName": "_(\"Greninja\")",
    "natDexNum": "NATIONAL_DEX_GRENINJA",
    "levelUpLearnset": "sGreninjaLevelUpLearnset",
    "teachableLearnset": "sGreninjaTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Greninja  Battle  Bond",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "BATTLE_BOND",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GRENINJA_BATTLE_BOND",
    "family": "P_FAMILY_FROAKIE",
    "baseHP": 72,
    "baseAttack": 95,
    "baseDefense": 67,
    "baseSpeed": 122,
    "baseSpAttack": 103,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_BATTLE_BOND, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Greninja\")",
    "natDexNum": "NATIONAL_DEX_GRENINJA",
    "levelUpLearnset": "sGreninjaLevelUpLearnset",
    "teachableLearnset": "sGreninjaTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Greninja  Ash",
    "parsedTypes": [
      "WATER",
      "DARK"
    ],
    "parsedAbilities": [
      "BATTLE_BOND",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GRENINJA_ASH",
    "family": "P_FAMILY_FROAKIE",
    "baseHP": 72,
    "baseAttack": 145,
    "baseDefense": 67,
    "baseSpeed": 132,
    "baseSpAttack": 153,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DARK)",
    "abilities": "{ ABILITY_BATTLE_BOND, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Greninja\")",
    "natDexNum": "NATIONAL_DEX_GRENINJA",
    "levelUpLearnset": "sGreninjaLevelUpLearnset",
    "teachableLearnset": "sGreninjaTeachableLearnset",
    "baseBST": 640,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bunnelby",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "PICKUP",
      "CHEEK_POUCH",
      "HUGE_POWER"
    ],
    "id": "SPECIES_BUNNELBY",
    "family": "P_FAMILY_BUNNELBY",
    "baseHP": 38,
    "baseAttack": 36,
    "baseDefense": 38,
    "baseSpeed": 57,
    "baseSpAttack": 32,
    "baseSpDefense": 36,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_CHEEK_POUCH, ABILITY_HUGE_POWER }",
    "speciesName": "_(\"Bunnelby\")",
    "natDexNum": "NATIONAL_DEX_BUNNELBY",
    "levelUpLearnset": "sBunnelbyLevelUpLearnset",
    "teachableLearnset": "sBunnelbyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_DIGGERSBY})",
    "baseBST": 237,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Diggersby",
    "parsedTypes": [
      "NORMAL",
      "GROUND"
    ],
    "parsedAbilities": [
      "PICKUP",
      "CHEEK_POUCH",
      "HUGE_POWER"
    ],
    "id": "SPECIES_DIGGERSBY",
    "family": "P_FAMILY_BUNNELBY",
    "baseHP": 85,
    "baseAttack": 56,
    "baseDefense": 77,
    "baseSpeed": 78,
    "baseSpAttack": 50,
    "baseSpDefense": 77,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_GROUND)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_CHEEK_POUCH, ABILITY_HUGE_POWER }",
    "speciesName": "_(\"Diggersby\")",
    "natDexNum": "NATIONAL_DEX_DIGGERSBY",
    "levelUpLearnset": "sDiggersbyLevelUpLearnset",
    "teachableLearnset": "sDiggersbyTeachableLearnset",
    "baseBST": 423,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fletchling",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "NONE",
      "GALE_WINGS"
    ],
    "id": "SPECIES_FLETCHLING",
    "family": "P_FAMILY_FLETCHLING",
    "baseHP": 45,
    "baseAttack": 50,
    "baseDefense": 43,
    "baseSpeed": 62,
    "baseSpAttack": 40,
    "baseSpDefense": 38,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_NONE, ABILITY_GALE_WINGS }",
    "speciesName": "_(\"Fletchling\")",
    "natDexNum": "NATIONAL_DEX_FLETCHLING",
    "levelUpLearnset": "sFletchlingLevelUpLearnset",
    "teachableLearnset": "sFletchlingTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_FLETCHINDER})",
    "baseBST": 278,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fletchinder",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "GALE_WINGS"
    ],
    "id": "SPECIES_FLETCHINDER",
    "family": "P_FAMILY_FLETCHLING",
    "baseHP": 62,
    "baseAttack": 73,
    "baseDefense": 55,
    "baseSpeed": 84,
    "baseSpAttack": 56,
    "baseSpDefense": 52,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_GALE_WINGS }",
    "speciesName": "_(\"Fletchinder\")",
    "natDexNum": "NATIONAL_DEX_FLETCHINDER",
    "levelUpLearnset": "sFletchinderLevelUpLearnset",
    "teachableLearnset": "sFletchinderTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_TALONFLAME})",
    "baseBST": 382,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Talonflame",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "FLAME_BODY",
      "NONE",
      "GALE_WINGS"
    ],
    "id": "SPECIES_TALONFLAME",
    "family": "P_FAMILY_FLETCHLING",
    "baseHP": 78,
    "baseAttack": 81,
    "baseDefense": 71,
    "baseSpeed": 126,
    "baseSpAttack": 74,
    "baseSpDefense": 69,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_FLAME_BODY, ABILITY_NONE, ABILITY_GALE_WINGS }",
    "speciesName": "_(\"Talonflame\")",
    "natDexNum": "NATIONAL_DEX_TALONFLAME",
    "levelUpLearnset": "sTalonflameLevelUpLearnset",
    "teachableLearnset": "sTalonflameTeachableLearnset",
    "baseBST": 499,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Litleo",
    "parsedTypes": [
      "FIRE",
      "NORMAL"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "UNNERVE",
      "MOXIE"
    ],
    "id": "SPECIES_LITLEO",
    "family": "P_FAMILY_LITLEO",
    "baseHP": 62,
    "baseAttack": 50,
    "baseDefense": 58,
    "baseSpeed": 72,
    "baseSpAttack": 73,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_NORMAL)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_UNNERVE, ABILITY_MOXIE }",
    "speciesName": "_(\"Litleo\")",
    "natDexNum": "NATIONAL_DEX_LITLEO",
    "levelUpLearnset": "sLitleoLevelUpLearnset",
    "teachableLearnset": "sLitleoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_PYROAR})",
    "baseBST": 369,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pyroar",
    "parsedTypes": [
      "FIRE",
      "NORMAL"
    ],
    "parsedAbilities": [
      "RIVALRY",
      "UNNERVE",
      "MOXIE"
    ],
    "id": "SPECIES_PYROAR",
    "family": "P_FAMILY_LITLEO",
    "baseHP": 86,
    "baseAttack": 68,
    "baseDefense": 72,
    "baseSpeed": 106,
    "baseSpAttack": 109,
    "baseSpDefense": 66,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_NORMAL)",
    "abilities": "{ ABILITY_RIVALRY, ABILITY_UNNERVE, ABILITY_MOXIE }",
    "speciesName": "_(\"Pyroar\")",
    "natDexNum": "NATIONAL_DEX_PYROAR",
    "levelUpLearnset": "sPyroarLevelUpLearnset",
    "teachableLearnset": "sPyroarTeachableLearnset",
    "baseBST": 507,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skiddo",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "NONE",
      "GRASS_PELT"
    ],
    "id": "SPECIES_SKIDDO",
    "family": "P_FAMILY_SKIDDO",
    "baseHP": 66,
    "baseAttack": 65,
    "baseDefense": 48,
    "baseSpeed": 52,
    "baseSpAttack": 62,
    "baseSpDefense": 57,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_NONE, ABILITY_GRASS_PELT }",
    "speciesName": "_(\"Skiddo\")",
    "natDexNum": "NATIONAL_DEX_SKIDDO",
    "levelUpLearnset": "sSkiddoLevelUpLearnset",
    "teachableLearnset": "sSkiddoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_GOGOAT})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gogoat",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "NONE",
      "GRASS_PELT"
    ],
    "id": "SPECIES_GOGOAT",
    "family": "P_FAMILY_SKIDDO",
    "baseHP": 123,
    "baseAttack": 100,
    "baseDefense": 62,
    "baseSpeed": 68,
    "baseSpAttack": 97,
    "baseSpDefense": 81,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_NONE, ABILITY_GRASS_PELT }",
    "speciesName": "_(\"Gogoat\")",
    "natDexNum": "NATIONAL_DEX_GOGOAT",
    "levelUpLearnset": "sGogoatLevelUpLearnset",
    "teachableLearnset": "sGogoatTeachableLearnset",
    "baseBST": 531,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pancham",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "IRON_FIST",
      "MOLD_BREAKER",
      "SCRAPPY"
    ],
    "id": "SPECIES_PANCHAM",
    "family": "P_FAMILY_PANCHAM",
    "baseHP": 67,
    "baseAttack": 82,
    "baseDefense": 62,
    "baseSpeed": 43,
    "baseSpAttack": 46,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_IRON_FIST, ABILITY_MOLD_BREAKER, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Pancham\")",
    "natDexNum": "NATIONAL_DEX_PANCHAM",
    "levelUpLearnset": "sPanchamLevelUpLearnset",
    "teachableLearnset": "sPanchamTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_PANGORO, CONDITIONS({IF_TYPE_IN_PARTY, TYPE_DARK})})",
    "baseBST": 348,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pangoro",
    "parsedTypes": [
      "FIGHTING",
      "DARK"
    ],
    "parsedAbilities": [
      "IRON_FIST",
      "MOLD_BREAKER",
      "SCRAPPY"
    ],
    "id": "SPECIES_PANGORO",
    "family": "P_FAMILY_PANCHAM",
    "baseHP": 95,
    "baseAttack": 124,
    "baseDefense": 78,
    "baseSpeed": 58,
    "baseSpAttack": 69,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_DARK)",
    "abilities": "{ ABILITY_IRON_FIST, ABILITY_MOLD_BREAKER, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Pangoro\")",
    "natDexNum": "NATIONAL_DEX_PANGORO",
    "levelUpLearnset": "sPangoroLevelUpLearnset",
    "teachableLearnset": "sPangoroTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Espurr",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "INFILTRATOR",
      "OWN_TEMPO"
    ],
    "id": "SPECIES_ESPURR",
    "family": "P_FAMILY_ESPURR",
    "baseHP": 62,
    "baseAttack": 48,
    "baseDefense": 54,
    "baseSpeed": 68,
    "baseSpAttack": 63,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_INFILTRATOR, ABILITY_OWN_TEMPO }",
    "speciesName": "_(\"Espurr\")",
    "natDexNum": "NATIONAL_DEX_ESPURR",
    "levelUpLearnset": "sEspurrLevelUpLearnset",
    "teachableLearnset": "sEspurrTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_MEOWSTIC_M, CONDITIONS({IF_GENDER, MON_MALE})}",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meowstic  M",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "INFILTRATOR",
      "PRANKSTER"
    ],
    "id": "SPECIES_MEOWSTIC_M",
    "family": "P_FAMILY_ESPURR",
    "baseHP": 74,
    "baseAttack": 48,
    "baseDefense": 76,
    "baseSpeed": 104,
    "baseSpAttack": 83,
    "baseSpDefense": 81,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_INFILTRATOR, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Meowstic\")",
    "natDexNum": "NATIONAL_DEX_MEOWSTIC",
    "levelUpLearnset": "sMeowsticMLevelUpLearnset",
    "teachableLearnset": "sMeowsticMTeachableLearnset",
    "baseBST": 466,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meowstic  F",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "INFILTRATOR",
      "COMPETITIVE"
    ],
    "id": "SPECIES_MEOWSTIC_F",
    "family": "P_FAMILY_ESPURR",
    "baseHP": 74,
    "baseAttack": 48,
    "baseDefense": 76,
    "baseSpeed": 104,
    "baseSpAttack": 83,
    "baseSpDefense": 81,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_INFILTRATOR, ABILITY_COMPETITIVE }",
    "speciesName": "_(\"Meowstic\")",
    "natDexNum": "NATIONAL_DEX_MEOWSTIC",
    "levelUpLearnset": "sMeowsticFLevelUpLearnset",
    "teachableLearnset": "sMeowsticFTeachableLearnset",
    "baseBST": 466,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Honedge",
    "parsedTypes": [
      "STEEL",
      "GHOST"
    ],
    "parsedAbilities": [
      "NO_GUARD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_HONEDGE",
    "family": "P_FAMILY_HONEDGE",
    "baseHP": 45,
    "baseAttack": 80,
    "baseDefense": 100,
    "baseSpeed": 28,
    "baseSpAttack": 35,
    "baseSpDefense": 37,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GHOST)",
    "abilities": "{ ABILITY_NO_GUARD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Honedge\")",
    "natDexNum": "NATIONAL_DEX_HONEDGE",
    "levelUpLearnset": "sHonedgeLevelUpLearnset",
    "teachableLearnset": "sHonedgeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_DOUBLADE})",
    "baseBST": 325,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Doublade",
    "parsedTypes": [
      "STEEL",
      "GHOST"
    ],
    "parsedAbilities": [
      "NO_GUARD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DOUBLADE",
    "family": "P_FAMILY_HONEDGE",
    "baseHP": 59,
    "baseAttack": 110,
    "baseDefense": 150,
    "baseSpeed": 35,
    "baseSpAttack": 45,
    "baseSpDefense": 49,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GHOST)",
    "abilities": "{ ABILITY_NO_GUARD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Doublade\")",
    "natDexNum": "NATIONAL_DEX_DOUBLADE",
    "levelUpLearnset": "sDoubladeLevelUpLearnset",
    "teachableLearnset": "sDoubladeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_DUSK_STONE, SPECIES_AEGISLASH_SHIELD})",
    "baseBST": 448,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aegislash  Shield",
    "parsedTypes": [
      "STEEL",
      "GHOST"
    ],
    "parsedAbilities": [
      "STANCE_CHANGE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_AEGISLASH_SHIELD",
    "family": "P_FAMILY_HONEDGE",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 140,
    "baseSpeed": 60,
    "baseSpAttack": 50,
    "baseSpDefense": 140,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GHOST)",
    "abilities": "{ ABILITY_STANCE_CHANGE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Aegislash\")",
    "natDexNum": "NATIONAL_DEX_AEGISLASH",
    "levelUpLearnset": "sAegislashLevelUpLearnset",
    "teachableLearnset": "sAegislashTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aegislash  Blade",
    "parsedTypes": [
      "STEEL",
      "GHOST"
    ],
    "parsedAbilities": [
      "STANCE_CHANGE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_AEGISLASH_BLADE",
    "family": "P_FAMILY_HONEDGE",
    "baseHP": 60,
    "baseAttack": 140,
    "baseDefense": 50,
    "baseSpeed": 60,
    "baseSpAttack": 140,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GHOST)",
    "abilities": "{ ABILITY_STANCE_CHANGE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Aegislash\")",
    "natDexNum": "NATIONAL_DEX_AEGISLASH",
    "levelUpLearnset": "sAegislashLevelUpLearnset",
    "teachableLearnset": "sAegislashTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spritzee",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "HEALER",
      "NONE",
      "AROMA_VEIL"
    ],
    "id": "SPECIES_SPRITZEE",
    "family": "P_FAMILY_SPRITZEE",
    "baseHP": 78,
    "baseAttack": 52,
    "baseDefense": 60,
    "baseSpeed": 23,
    "baseSpAttack": 63,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_HEALER, ABILITY_NONE, ABILITY_AROMA_VEIL }",
    "speciesName": "_(\"Spritzee\")",
    "natDexNum": "NATIONAL_DEX_SPRITZEE",
    "levelUpLearnset": "sSpritzeeLevelUpLearnset",
    "teachableLearnset": "sSpritzeeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_AROMATISSE, CONDITIONS({IF_HOLD_ITEM, ITEM_SACHET})}",
    "baseBST": 341,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aromatisse",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "HEALER",
      "NONE",
      "AROMA_VEIL"
    ],
    "id": "SPECIES_AROMATISSE",
    "family": "P_FAMILY_SPRITZEE",
    "baseHP": 101,
    "baseAttack": 72,
    "baseDefense": 72,
    "baseSpeed": 29,
    "baseSpAttack": 99,
    "baseSpDefense": 89,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_HEALER, ABILITY_NONE, ABILITY_AROMA_VEIL }",
    "speciesName": "_(\"Aromatisse\")",
    "natDexNum": "NATIONAL_DEX_AROMATISSE",
    "levelUpLearnset": "sAromatisseLevelUpLearnset",
    "teachableLearnset": "sAromatisseTeachableLearnset",
    "baseBST": 462,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Swirlix",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "SWEET_VEIL",
      "NONE",
      "UNBURDEN"
    ],
    "id": "SPECIES_SWIRLIX",
    "family": "P_FAMILY_SWIRLIX",
    "baseHP": 62,
    "baseAttack": 48,
    "baseDefense": 66,
    "baseSpeed": 49,
    "baseSpAttack": 59,
    "baseSpDefense": 57,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_SWEET_VEIL, ABILITY_NONE, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Swirlix\")",
    "natDexNum": "NATIONAL_DEX_SWIRLIX",
    "levelUpLearnset": "sSwirlixLevelUpLearnset",
    "teachableLearnset": "sSwirlixTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_SLURPUFF, CONDITIONS({IF_HOLD_ITEM, ITEM_WHIPPED_DREAM})}",
    "baseBST": 341,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slurpuff",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "SWEET_VEIL",
      "NONE",
      "UNBURDEN"
    ],
    "id": "SPECIES_SLURPUFF",
    "family": "P_FAMILY_SWIRLIX",
    "baseHP": 82,
    "baseAttack": 80,
    "baseDefense": 86,
    "baseSpeed": 72,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_SWEET_VEIL, ABILITY_NONE, ABILITY_UNBURDEN }",
    "speciesName": "_(\"Slurpuff\")",
    "natDexNum": "NATIONAL_DEX_SLURPUFF",
    "levelUpLearnset": "sSlurpuffLevelUpLearnset",
    "teachableLearnset": "sSlurpuffTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Inkay",
    "parsedTypes": [
      "DARK",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CONTRARY",
      "SUCTION_CUPS",
      "INFILTRATOR"
    ],
    "id": "SPECIES_INKAY",
    "family": "P_FAMILY_INKAY",
    "baseHP": 53,
    "baseAttack": 54,
    "baseDefense": 53,
    "baseSpeed": 45,
    "baseSpAttack": 37,
    "baseSpDefense": 46,
    "types": "MON_TYPES(TYPE_DARK, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CONTRARY, ABILITY_SUCTION_CUPS, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Inkay\")",
    "natDexNum": "NATIONAL_DEX_INKAY",
    "levelUpLearnset": "sInkayLevelUpLearnset",
    "teachableLearnset": "sInkayTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_MALAMAR})",
    "baseBST": 288,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Malamar",
    "parsedTypes": [
      "DARK",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "CONTRARY",
      "SUCTION_CUPS",
      "INFILTRATOR"
    ],
    "id": "SPECIES_MALAMAR",
    "family": "P_FAMILY_INKAY",
    "baseHP": 86,
    "baseAttack": 92,
    "baseDefense": 88,
    "baseSpeed": 73,
    "baseSpAttack": 68,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_DARK, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_CONTRARY, ABILITY_SUCTION_CUPS, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Malamar\")",
    "natDexNum": "NATIONAL_DEX_MALAMAR",
    "levelUpLearnset": "sMalamarLevelUpLearnset",
    "teachableLearnset": "sMalamarTeachableLearnset",
    "baseBST": 482,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Binacle",
    "parsedTypes": [
      "ROCK",
      "WATER"
    ],
    "parsedAbilities": [
      "TOUGH_CLAWS",
      "SNIPER",
      "PICKPOCKET"
    ],
    "id": "SPECIES_BINACLE",
    "family": "P_FAMILY_BINACLE",
    "baseHP": 42,
    "baseAttack": 52,
    "baseDefense": 67,
    "baseSpeed": 50,
    "baseSpAttack": 39,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_WATER)",
    "abilities": "{ ABILITY_TOUGH_CLAWS, ABILITY_SNIPER, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Binacle\")",
    "natDexNum": "NATIONAL_DEX_BINACLE",
    "levelUpLearnset": "sBinacleLevelUpLearnset",
    "teachableLearnset": "sBinacleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 39, SPECIES_BARBARACLE})",
    "baseBST": 306,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Barbaracle",
    "parsedTypes": [
      "ROCK",
      "WATER"
    ],
    "parsedAbilities": [
      "TOUGH_CLAWS",
      "SNIPER",
      "PICKPOCKET"
    ],
    "id": "SPECIES_BARBARACLE",
    "family": "P_FAMILY_BINACLE",
    "baseHP": 72,
    "baseAttack": 105,
    "baseDefense": 115,
    "baseSpeed": 68,
    "baseSpAttack": 54,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_WATER)",
    "abilities": "{ ABILITY_TOUGH_CLAWS, ABILITY_SNIPER, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Barbaracle\")",
    "natDexNum": "NATIONAL_DEX_BARBARACLE",
    "levelUpLearnset": "sBarbaracleLevelUpLearnset",
    "teachableLearnset": "sBarbaracleTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skrelp",
    "parsedTypes": [
      "POISON",
      "WATER"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "POISON_TOUCH",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_SKRELP",
    "family": "P_FAMILY_SKRELP",
    "baseHP": 50,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 30,
    "baseSpAttack": 60,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_POISON, TYPE_WATER)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_POISON_TOUCH, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Skrelp\")",
    "natDexNum": "NATIONAL_DEX_SKRELP",
    "levelUpLearnset": "sSkrelpLevelUpLearnset",
    "teachableLearnset": "sSkrelpTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 48, SPECIES_DRAGALGE})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dragalge",
    "parsedTypes": [
      "POISON",
      "DRAGON"
    ],
    "parsedAbilities": [
      "POISON_POINT",
      "POISON_TOUCH",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_DRAGALGE",
    "family": "P_FAMILY_SKRELP",
    "baseHP": 65,
    "baseAttack": 75,
    "baseDefense": 90,
    "baseSpeed": 44,
    "baseSpAttack": 97,
    "baseSpDefense": 123,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DRAGON)",
    "abilities": "{ ABILITY_POISON_POINT, ABILITY_POISON_TOUCH, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Dragalge\")",
    "natDexNum": "NATIONAL_DEX_DRAGALGE",
    "levelUpLearnset": "sDragalgeLevelUpLearnset",
    "teachableLearnset": "sDragalgeTeachableLearnset",
    "baseBST": 494,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clauncher",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "MEGA_LAUNCHER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CLAUNCHER",
    "family": "P_FAMILY_CLAUNCHER",
    "baseHP": 50,
    "baseAttack": 53,
    "baseDefense": 62,
    "baseSpeed": 44,
    "baseSpAttack": 58,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_MEGA_LAUNCHER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Clauncher\")",
    "natDexNum": "NATIONAL_DEX_CLAUNCHER",
    "levelUpLearnset": "sClauncherLevelUpLearnset",
    "teachableLearnset": "sClauncherTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_CLAWITZER})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clawitzer",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "MEGA_LAUNCHER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CLAWITZER",
    "family": "P_FAMILY_CLAUNCHER",
    "baseHP": 71,
    "baseAttack": 73,
    "baseDefense": 88,
    "baseSpeed": 59,
    "baseSpAttack": 120,
    "baseSpDefense": 89,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_MEGA_LAUNCHER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Clawitzer\")",
    "natDexNum": "NATIONAL_DEX_CLAWITZER",
    "levelUpLearnset": "sClawitzerLevelUpLearnset",
    "teachableLearnset": "sClawitzerTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Helioptile",
    "parsedTypes": [
      "ELECTRIC",
      "NORMAL"
    ],
    "parsedAbilities": [
      "DRY_SKIN",
      "SAND_VEIL",
      "SOLAR_POWER"
    ],
    "id": "SPECIES_HELIOPTILE",
    "family": "P_FAMILY_HELIOPTILE",
    "baseHP": 44,
    "baseAttack": 38,
    "baseDefense": 33,
    "baseSpeed": 70,
    "baseSpAttack": 61,
    "baseSpDefense": 43,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_NORMAL)",
    "abilities": "{ ABILITY_DRY_SKIN, ABILITY_SAND_VEIL, ABILITY_SOLAR_POWER }",
    "speciesName": "_(\"Helioptile\")",
    "natDexNum": "NATIONAL_DEX_HELIOPTILE",
    "levelUpLearnset": "sHelioptileLevelUpLearnset",
    "teachableLearnset": "sHelioptileTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_SUN_STONE, SPECIES_HELIOLISK})",
    "baseBST": 289,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Heliolisk",
    "parsedTypes": [
      "ELECTRIC",
      "NORMAL"
    ],
    "parsedAbilities": [
      "DRY_SKIN",
      "SAND_VEIL",
      "SOLAR_POWER"
    ],
    "id": "SPECIES_HELIOLISK",
    "family": "P_FAMILY_HELIOPTILE",
    "baseHP": 62,
    "baseAttack": 55,
    "baseDefense": 52,
    "baseSpeed": 109,
    "baseSpAttack": 109,
    "baseSpDefense": 94,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_NORMAL)",
    "abilities": "{ ABILITY_DRY_SKIN, ABILITY_SAND_VEIL, ABILITY_SOLAR_POWER }",
    "speciesName": "_(\"Heliolisk\")",
    "natDexNum": "NATIONAL_DEX_HELIOLISK",
    "levelUpLearnset": "sHelioliskLevelUpLearnset",
    "teachableLearnset": "sHelioliskTeachableLearnset",
    "baseBST": 481,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tyrunt",
    "parsedTypes": [
      "ROCK",
      "DRAGON"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "NONE",
      "STURDY"
    ],
    "id": "SPECIES_TYRUNT",
    "family": "P_FAMILY_TYRUNT",
    "baseHP": 58,
    "baseAttack": 89,
    "baseDefense": 77,
    "baseSpeed": 48,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_DRAGON)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_NONE, ABILITY_STURDY }",
    "speciesName": "_(\"Tyrunt\")",
    "natDexNum": "NATIONAL_DEX_TYRUNT",
    "levelUpLearnset": "sTyruntLevelUpLearnset",
    "teachableLearnset": "sTyruntTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 39, SPECIES_TYRANTRUM, CONDITIONS({IF_NOT_TIME, TIME_NIGHT})})",
    "baseBST": 362,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tyrantrum",
    "parsedTypes": [
      "ROCK",
      "DRAGON"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "NONE",
      "ROCK_HEAD"
    ],
    "id": "SPECIES_TYRANTRUM",
    "family": "P_FAMILY_TYRUNT",
    "baseHP": 82,
    "baseAttack": 121,
    "baseDefense": 119,
    "baseSpeed": 71,
    "baseSpAttack": 69,
    "baseSpDefense": 59,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_DRAGON)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_NONE, ABILITY_ROCK_HEAD }",
    "speciesName": "_(\"Tyrantrum\")",
    "natDexNum": "NATIONAL_DEX_TYRANTRUM",
    "levelUpLearnset": "sTyrantrumLevelUpLearnset",
    "teachableLearnset": "sTyrantrumTeachableLearnset",
    "baseBST": 521,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Amaura",
    "parsedTypes": [
      "ROCK",
      "ICE"
    ],
    "parsedAbilities": [
      "REFRIGERATE",
      "NONE",
      "SNOW_WARNING"
    ],
    "id": "SPECIES_AMAURA",
    "family": "P_FAMILY_AMAURA",
    "baseHP": 77,
    "baseAttack": 59,
    "baseDefense": 50,
    "baseSpeed": 46,
    "baseSpAttack": 67,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_ICE)",
    "abilities": "{ ABILITY_REFRIGERATE, ABILITY_NONE, ABILITY_SNOW_WARNING }",
    "speciesName": "_(\"Amaura\")",
    "natDexNum": "NATIONAL_DEX_AMAURA",
    "levelUpLearnset": "sAmauraLevelUpLearnset",
    "teachableLearnset": "sAmauraTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 39, SPECIES_AURORUS, CONDITIONS({IF_TIME, TIME_NIGHT})})",
    "baseBST": 362,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Aurorus",
    "parsedTypes": [
      "ROCK",
      "ICE"
    ],
    "parsedAbilities": [
      "REFRIGERATE",
      "NONE",
      "SNOW_WARNING"
    ],
    "id": "SPECIES_AURORUS",
    "family": "P_FAMILY_AMAURA",
    "baseHP": 123,
    "baseAttack": 77,
    "baseDefense": 72,
    "baseSpeed": 58,
    "baseSpAttack": 99,
    "baseSpDefense": 92,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_ICE)",
    "abilities": "{ ABILITY_REFRIGERATE, ABILITY_NONE, ABILITY_SNOW_WARNING }",
    "speciesName": "_(\"Aurorus\")",
    "natDexNum": "NATIONAL_DEX_AURORUS",
    "levelUpLearnset": "sAurorusLevelUpLearnset",
    "teachableLearnset": "sAurorusTeachableLearnset",
    "baseBST": 521,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hawlucha",
    "parsedTypes": [
      "FIGHTING",
      "FLYING"
    ],
    "parsedAbilities": [
      "LIMBER",
      "UNBURDEN",
      "MOLD_BREAKER"
    ],
    "id": "SPECIES_HAWLUCHA",
    "family": "P_FAMILY_HAWLUCHA",
    "baseHP": 78,
    "baseAttack": 92,
    "baseDefense": 75,
    "baseSpeed": 118,
    "baseSpAttack": 74,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_FLYING)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_UNBURDEN, ABILITY_MOLD_BREAKER }",
    "speciesName": "_(\"Hawlucha\")",
    "natDexNum": "NATIONAL_DEX_HAWLUCHA",
    "levelUpLearnset": "sHawluchaLevelUpLearnset",
    "teachableLearnset": "sHawluchaTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dedenne",
    "parsedTypes": [
      "ELECTRIC",
      "FAIRY"
    ],
    "parsedAbilities": [
      "CHEEK_POUCH",
      "PICKUP",
      "PLUS"
    ],
    "id": "SPECIES_DEDENNE",
    "family": "P_FAMILY_DEDENNE",
    "baseHP": 67,
    "baseAttack": 58,
    "baseDefense": 57,
    "baseSpeed": 101,
    "baseSpAttack": 81,
    "baseSpDefense": 67,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FAIRY)",
    "abilities": "{ ABILITY_CHEEK_POUCH, ABILITY_PICKUP, ABILITY_PLUS }",
    "speciesName": "_(\"Dedenne\")",
    "natDexNum": "NATIONAL_DEX_DEDENNE",
    "levelUpLearnset": "sDedenneLevelUpLearnset",
    "teachableLearnset": "sDedenneTeachableLearnset",
    "baseBST": 431,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Carbink",
    "parsedTypes": [
      "ROCK",
      "FAIRY"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "STURDY"
    ],
    "id": "SPECIES_CARBINK",
    "family": "P_FAMILY_CARBINK",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 150,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FAIRY)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_STURDY }",
    "speciesName": "_(\"Carbink\")",
    "natDexNum": "NATIONAL_DEX_CARBINK",
    "levelUpLearnset": "sCarbinkLevelUpLearnset",
    "teachableLearnset": "sCarbinkTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Goomy",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "HYDRATION",
      "GOOEY"
    ],
    "id": "SPECIES_GOOMY",
    "family": "P_FAMILY_GOOMY",
    "baseHP": 45,
    "baseAttack": 50,
    "baseDefense": 35,
    "baseSpeed": 40,
    "baseSpAttack": 55,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_HYDRATION, ABILITY_GOOEY }",
    "speciesName": "_(\"Goomy\")",
    "natDexNum": "NATIONAL_DEX_GOOMY",
    "levelUpLearnset": "sGoomyLevelUpLearnset",
    "teachableLearnset": "sGoomyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_SLIGGOO}",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sliggoo",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "HYDRATION",
      "GOOEY"
    ],
    "id": "SPECIES_SLIGGOO",
    "family": "P_FAMILY_GOOMY",
    "baseHP": 68,
    "baseAttack": 75,
    "baseDefense": 53,
    "baseSpeed": 60,
    "baseSpAttack": 83,
    "baseSpDefense": 113,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_HYDRATION, ABILITY_GOOEY }",
    "speciesName": "_(\"Sliggoo\")",
    "natDexNum": "NATIONAL_DEX_SLIGGOO",
    "levelUpLearnset": "sSliggooLevelUpLearnset",
    "teachableLearnset": "sSliggooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 50, SPECIES_GOODRA, CONDITIONS({IF_WEATHER, WEATHER_RAIN})}",
    "baseBST": 452,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Goodra",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "HYDRATION",
      "GOOEY"
    ],
    "id": "SPECIES_GOODRA",
    "family": "P_FAMILY_GOOMY",
    "baseHP": 90,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 80,
    "baseSpAttack": 110,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_HYDRATION, ABILITY_GOOEY }",
    "speciesName": "_(\"Goodra\")",
    "natDexNum": "NATIONAL_DEX_GOODRA",
    "levelUpLearnset": "sGoodraLevelUpLearnset",
    "teachableLearnset": "sGoodraTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sliggoo  Hisui",
    "parsedTypes": [
      "DRAGON",
      "STEEL"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "SHELL_ARMOR",
      "GOOEY"
    ],
    "id": "SPECIES_SLIGGOO_HISUI",
    "family": "P_FAMILY_GOOMY",
    "baseHP": 58,
    "baseAttack": 75,
    "baseDefense": 83,
    "baseSpeed": 40,
    "baseSpAttack": 83,
    "baseSpDefense": 113,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_STEEL)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_SHELL_ARMOR, ABILITY_GOOEY }",
    "speciesName": "_(\"Sliggoo\")",
    "natDexNum": "NATIONAL_DEX_SLIGGOO",
    "levelUpLearnset": "sSliggooHisuiLevelUpLearnset",
    "teachableLearnset": "sSliggooHisuiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 50, SPECIES_GOODRA_HISUI, CONDITIONS({IF_WEATHER, WEATHER_RAIN})}",
    "baseBST": 452,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Goodra  Hisui",
    "parsedTypes": [
      "DRAGON",
      "STEEL"
    ],
    "parsedAbilities": [
      "SAP_SIPPER",
      "SHELL_ARMOR",
      "GOOEY"
    ],
    "id": "SPECIES_GOODRA_HISUI",
    "family": "P_FAMILY_GOOMY",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 60,
    "baseSpAttack": 110,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_STEEL)",
    "abilities": "{ ABILITY_SAP_SIPPER, ABILITY_SHELL_ARMOR, ABILITY_GOOEY }",
    "speciesName": "_(\"Goodra\")",
    "natDexNum": "NATIONAL_DEX_GOODRA",
    "levelUpLearnset": "sGoodraHisuiLevelUpLearnset",
    "teachableLearnset": "sGoodraHisuiTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Klefki",
    "parsedTypes": [
      "STEEL",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "NONE",
      "MAGICIAN"
    ],
    "id": "SPECIES_KLEFKI",
    "family": "P_FAMILY_KLEFKI",
    "baseHP": 57,
    "baseAttack": 80,
    "baseDefense": 91,
    "baseSpeed": 75,
    "baseSpAttack": 80,
    "baseSpDefense": 87,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_NONE, ABILITY_MAGICIAN }",
    "speciesName": "_(\"Klefki\")",
    "natDexNum": "NATIONAL_DEX_KLEFKI",
    "levelUpLearnset": "sKlefkiLevelUpLearnset",
    "teachableLearnset": "sKlefkiTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Phantump",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "FRISK",
      "HARVEST"
    ],
    "id": "SPECIES_PHANTUMP",
    "family": "P_FAMILY_PHANTUMP",
    "baseHP": 43,
    "baseAttack": 70,
    "baseDefense": 48,
    "baseSpeed": 38,
    "baseSpAttack": 50,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_FRISK, ABILITY_HARVEST }",
    "speciesName": "_(\"Phantump\")",
    "natDexNum": "NATIONAL_DEX_PHANTUMP",
    "levelUpLearnset": "sPhantumpLevelUpLearnset",
    "teachableLearnset": "sPhantumpTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_TREVENANT}",
    "baseBST": 309,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Trevenant",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "NATURAL_CURE",
      "FRISK",
      "HARVEST"
    ],
    "id": "SPECIES_TREVENANT",
    "family": "P_FAMILY_PHANTUMP",
    "baseHP": 85,
    "baseAttack": 110,
    "baseDefense": 76,
    "baseSpeed": 56,
    "baseSpAttack": 65,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_NATURAL_CURE, ABILITY_FRISK, ABILITY_HARVEST }",
    "speciesName": "_(\"Trevenant\")",
    "natDexNum": "NATIONAL_DEX_TREVENANT",
    "levelUpLearnset": "sTrevenantLevelUpLearnset",
    "teachableLearnset": "sTrevenantTeachableLearnset",
    "baseBST": 474,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pumpkaboo  Average",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_PUMPKABOO_AVERAGE",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 49,
    "baseAttack": 66,
    "baseDefense": 70,
    "baseSpeed": 51,
    "baseSpAttack": 44,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Pumpkaboo\")",
    "natDexNum": "NATIONAL_DEX_PUMPKABOO",
    "levelUpLearnset": "sPumpkabooLevelUpLearnset",
    "teachableLearnset": "sPumpkabooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GOURGEIST_AVERAGE}",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pumpkaboo  Small",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_PUMPKABOO_SMALL",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 44,
    "baseAttack": 66,
    "baseDefense": 70,
    "baseSpeed": 56,
    "baseSpAttack": 44,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Pumpkaboo\")",
    "natDexNum": "NATIONAL_DEX_PUMPKABOO",
    "levelUpLearnset": "sPumpkabooLevelUpLearnset",
    "teachableLearnset": "sPumpkabooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GOURGEIST_SMALL}",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pumpkaboo  Large",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_PUMPKABOO_LARGE",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 54,
    "baseAttack": 66,
    "baseDefense": 70,
    "baseSpeed": 46,
    "baseSpAttack": 44,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Pumpkaboo\")",
    "natDexNum": "NATIONAL_DEX_PUMPKABOO",
    "levelUpLearnset": "sPumpkabooLevelUpLearnset",
    "teachableLearnset": "sPumpkabooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GOURGEIST_LARGE}",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pumpkaboo  Super",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_PUMPKABOO_SUPER",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 59,
    "baseAttack": 66,
    "baseDefense": 70,
    "baseSpeed": 41,
    "baseSpAttack": 44,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Pumpkaboo\")",
    "natDexNum": "NATIONAL_DEX_PUMPKABOO",
    "levelUpLearnset": "sPumpkabooLevelUpLearnset",
    "teachableLearnset": "sPumpkabooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_TRADE, 0, SPECIES_GOURGEIST_SUPER}",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gourgeist  Average",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_GOURGEIST_AVERAGE",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 65,
    "baseAttack": 90,
    "baseDefense": 122,
    "baseSpeed": 84,
    "baseSpAttack": 58,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Gourgeist\")",
    "natDexNum": "NATIONAL_DEX_GOURGEIST",
    "levelUpLearnset": "sGourgeistLevelUpLearnset",
    "teachableLearnset": "sGourgeistTeachableLearnset",
    "baseBST": 494,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gourgeist  Small",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_GOURGEIST_SMALL",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 55,
    "baseAttack": 85,
    "baseDefense": 122,
    "baseSpeed": 99,
    "baseSpAttack": 58,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Gourgeist\")",
    "natDexNum": "NATIONAL_DEX_GOURGEIST",
    "levelUpLearnset": "sGourgeistLevelUpLearnset",
    "teachableLearnset": "sGourgeistTeachableLearnset",
    "baseBST": 494,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gourgeist  Large",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_GOURGEIST_LARGE",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 75,
    "baseAttack": 95,
    "baseDefense": 122,
    "baseSpeed": 69,
    "baseSpAttack": 58,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Gourgeist\")",
    "natDexNum": "NATIONAL_DEX_GOURGEIST",
    "levelUpLearnset": "sGourgeistLevelUpLearnset",
    "teachableLearnset": "sGourgeistTeachableLearnset",
    "baseBST": 494,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gourgeist  Super",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "PICKUP",
      "FRISK",
      "INSOMNIA"
    ],
    "id": "SPECIES_GOURGEIST_SUPER",
    "family": "P_FAMILY_PUMPKABOO",
    "baseHP": 85,
    "baseAttack": 100,
    "baseDefense": 122,
    "baseSpeed": 54,
    "baseSpAttack": 58,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_FRISK, ABILITY_INSOMNIA }",
    "speciesName": "_(\"Gourgeist\")",
    "natDexNum": "NATIONAL_DEX_GOURGEIST",
    "levelUpLearnset": "sGourgeistLevelUpLearnset",
    "teachableLearnset": "sGourgeistTeachableLearnset",
    "baseBST": 494,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bergmite",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "ICE_BODY",
      "STURDY"
    ],
    "id": "SPECIES_BERGMITE",
    "family": "P_FAMILY_BERGMITE",
    "baseHP": 55,
    "baseAttack": 69,
    "baseDefense": 85,
    "baseSpeed": 28,
    "baseSpAttack": 32,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_ICE_BODY, ABILITY_STURDY }",
    "speciesName": "_(\"Bergmite\")",
    "natDexNum": "NATIONAL_DEX_BERGMITE",
    "levelUpLearnset": "sBergmiteLevelUpLearnset",
    "teachableLearnset": "sBergmiteTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 37, SPECIES_AVALUGG}",
    "baseBST": 304,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Avalugg",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "ICE_BODY",
      "STURDY"
    ],
    "id": "SPECIES_AVALUGG",
    "family": "P_FAMILY_BERGMITE",
    "baseHP": 95,
    "baseAttack": 117,
    "baseDefense": 184,
    "baseSpeed": 28,
    "baseSpAttack": 44,
    "baseSpDefense": 46,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_ICE_BODY, ABILITY_STURDY }",
    "speciesName": "_(\"Avalugg\")",
    "natDexNum": "NATIONAL_DEX_AVALUGG",
    "levelUpLearnset": "sAvaluggLevelUpLearnset",
    "teachableLearnset": "sAvaluggTeachableLearnset",
    "baseBST": 514,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Avalugg  Hisui",
    "parsedTypes": [
      "ICE",
      "ROCK"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "ICE_BODY",
      "STURDY"
    ],
    "id": "SPECIES_AVALUGG_HISUI",
    "family": "P_FAMILY_BERGMITE",
    "baseHP": 95,
    "baseAttack": 127,
    "baseDefense": 184,
    "baseSpeed": 38,
    "baseSpAttack": 34,
    "baseSpDefense": 36,
    "types": "MON_TYPES(TYPE_ICE, TYPE_ROCK)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_ICE_BODY, ABILITY_STURDY }",
    "speciesName": "_(\"Avalugg\")",
    "natDexNum": "NATIONAL_DEX_AVALUGG",
    "levelUpLearnset": "sAvaluggHisuiLevelUpLearnset",
    "teachableLearnset": "sAvaluggHisuiTeachableLearnset",
    "baseBST": 514,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Noibat",
    "parsedTypes": [
      "FLYING",
      "DRAGON"
    ],
    "parsedAbilities": [
      "FRISK",
      "INFILTRATOR",
      "TELEPATHY"
    ],
    "id": "SPECIES_NOIBAT",
    "family": "P_FAMILY_NOIBAT",
    "baseHP": 40,
    "baseAttack": 30,
    "baseDefense": 35,
    "baseSpeed": 55,
    "baseSpAttack": 45,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_DRAGON)",
    "abilities": "{ ABILITY_FRISK, ABILITY_INFILTRATOR, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Noibat\")",
    "natDexNum": "NATIONAL_DEX_NOIBAT",
    "levelUpLearnset": "sNoibatLevelUpLearnset",
    "teachableLearnset": "sNoibatTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 48, SPECIES_NOIVERN})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Noivern",
    "parsedTypes": [
      "FLYING",
      "DRAGON"
    ],
    "parsedAbilities": [
      "FRISK",
      "INFILTRATOR",
      "TELEPATHY"
    ],
    "id": "SPECIES_NOIVERN",
    "family": "P_FAMILY_NOIBAT",
    "baseHP": 85,
    "baseAttack": 70,
    "baseDefense": 80,
    "baseSpeed": 123,
    "baseSpAttack": 97,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_DRAGON)",
    "abilities": "{ ABILITY_FRISK, ABILITY_INFILTRATOR, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Noivern\")",
    "natDexNum": "NATIONAL_DEX_NOIVERN",
    "levelUpLearnset": "sNoivernLevelUpLearnset",
    "teachableLearnset": "sNoivernTeachableLearnset",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Xerneas  Neutral",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "FAIRY_AURA",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_XERNEAS_NEUTRAL",
    "family": "P_FAMILY_XERNEAS",
    "baseHP": 126,
    "baseAttack": 131,
    "baseDefense": 95,
    "baseSpeed": 99,
    "baseSpAttack": 131,
    "baseSpDefense": 98,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_FAIRY_AURA, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Xerneas\")",
    "natDexNum": "NATIONAL_DEX_XERNEAS",
    "levelUpLearnset": "sXerneasLevelUpLearnset",
    "teachableLearnset": "sXerneasTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Xerneas  Active",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "FAIRY_AURA",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_XERNEAS_ACTIVE",
    "family": "P_FAMILY_XERNEAS",
    "baseHP": 126,
    "baseAttack": 131,
    "baseDefense": 95,
    "baseSpeed": 99,
    "baseSpAttack": 131,
    "baseSpDefense": 98,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_FAIRY_AURA, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Xerneas\")",
    "natDexNum": "NATIONAL_DEX_XERNEAS",
    "levelUpLearnset": "sXerneasLevelUpLearnset",
    "teachableLearnset": "sXerneasTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yveltal",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "DARK_AURA",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_YVELTAL",
    "family": "P_FAMILY_YVELTAL",
    "baseHP": 126,
    "baseAttack": 131,
    "baseDefense": 95,
    "baseSpeed": 99,
    "baseSpAttack": 131,
    "baseSpDefense": 98,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_DARK_AURA, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Yveltal\")",
    "natDexNum": "NATIONAL_DEX_YVELTAL",
    "levelUpLearnset": "sYveltalLevelUpLearnset",
    "teachableLearnset": "sYveltalTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zygarde  50",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "AURA_BREAK",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZYGARDE_50",
    "family": "P_FAMILY_ZYGARDE",
    "baseHP": 108,
    "baseAttack": 100,
    "baseDefense": 121,
    "baseSpeed": 95,
    "baseSpAttack": 81,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_AURA_BREAK, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zygarde\")",
    "natDexNum": "NATIONAL_DEX_ZYGARDE",
    "levelUpLearnset": "sZygardeLevelUpLearnset",
    "teachableLearnset": "sZygardeTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zygarde  50  Power  Construct",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POWER_CONSTRUCT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZYGARDE_50_POWER_CONSTRUCT",
    "family": "P_FAMILY_ZYGARDE",
    "baseHP": 108,
    "baseAttack": 100,
    "baseDefense": 121,
    "baseSpeed": 95,
    "baseSpAttack": 81,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POWER_CONSTRUCT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zygarde\")",
    "natDexNum": "NATIONAL_DEX_ZYGARDE",
    "levelUpLearnset": "sZygardeLevelUpLearnset",
    "teachableLearnset": "sZygardeTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zygarde  10  Aura  Break",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "AURA_BREAK",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZYGARDE_10_AURA_BREAK",
    "family": "P_FAMILY_ZYGARDE",
    "baseHP": 54,
    "baseAttack": 100,
    "baseDefense": 71,
    "baseSpeed": 115,
    "baseSpAttack": 61,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_AURA_BREAK, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zygarde\")",
    "natDexNum": "NATIONAL_DEX_ZYGARDE",
    "levelUpLearnset": "sZygardeLevelUpLearnset",
    "teachableLearnset": "sZygardeTeachableLearnset",
    "baseBST": 486,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zygarde  10  Power  Construct",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POWER_CONSTRUCT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZYGARDE_10_POWER_CONSTRUCT",
    "family": "P_FAMILY_ZYGARDE",
    "baseHP": 54,
    "baseAttack": 100,
    "baseDefense": 71,
    "baseSpeed": 115,
    "baseSpAttack": 61,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POWER_CONSTRUCT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zygarde\")",
    "natDexNum": "NATIONAL_DEX_ZYGARDE",
    "levelUpLearnset": "sZygardeLevelUpLearnset",
    "teachableLearnset": "sZygardeTeachableLearnset",
    "baseBST": 486,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zygarde  Complete",
    "parsedTypes": [
      "DRAGON",
      "GROUND"
    ],
    "parsedAbilities": [
      "POWER_CONSTRUCT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZYGARDE_COMPLETE",
    "family": "P_FAMILY_ZYGARDE",
    "baseHP": 216,
    "baseAttack": 100,
    "baseDefense": 121,
    "baseSpeed": 85,
    "baseSpAttack": 91,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GROUND)",
    "abilities": "{ ABILITY_POWER_CONSTRUCT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zygarde\")",
    "natDexNum": "NATIONAL_DEX_ZYGARDE",
    "levelUpLearnset": "sZygardeLevelUpLearnset",
    "teachableLearnset": "sZygardeTeachableLearnset",
    "baseBST": 708,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Diancie",
    "parsedTypes": [
      "ROCK",
      "FAIRY"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DIANCIE",
    "family": "P_FAMILY_DIANCIE",
    "baseHP": 50,
    "baseAttack": 100,
    "baseDefense": 150,
    "baseSpeed": 50,
    "baseSpAttack": 100,
    "baseSpDefense": 150,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FAIRY)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Diancie\")",
    "natDexNum": "NATIONAL_DEX_DIANCIE",
    "levelUpLearnset": "sDiancieLevelUpLearnset",
    "teachableLearnset": "sDiancieTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Diancie  Mega",
    "parsedTypes": [
      "ROCK",
      "FAIRY"
    ],
    "parsedAbilities": [
      "MAGIC_BOUNCE",
      "MAGIC_BOUNCE",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_DIANCIE_MEGA",
    "family": "P_FAMILY_DIANCIE",
    "baseHP": 50,
    "baseAttack": 160,
    "baseDefense": 110,
    "baseSpeed": 110,
    "baseSpAttack": 160,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FAIRY)",
    "abilities": "{ ABILITY_MAGIC_BOUNCE, ABILITY_MAGIC_BOUNCE, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Diancie\")",
    "natDexNum": "NATIONAL_DEX_DIANCIE",
    "levelUpLearnset": "sDiancieLevelUpLearnset",
    "teachableLearnset": "sDiancieTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hoopa  Confined",
    "parsedTypes": [
      "PSYCHIC",
      "GHOST"
    ],
    "parsedAbilities": [
      "MAGICIAN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_HOOPA_CONFINED",
    "family": "P_FAMILY_HOOPA",
    "baseHP": 80,
    "baseAttack": 110,
    "baseDefense": 60,
    "baseSpeed": 70,
    "baseSpAttack": 150,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_GHOST)",
    "abilities": "{ ABILITY_MAGICIAN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Hoopa\")",
    "natDexNum": "NATIONAL_DEX_HOOPA",
    "levelUpLearnset": "sHoopaConfinedLevelUpLearnset",
    "teachableLearnset": "sHoopaConfinedTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hoopa  Unbound",
    "parsedTypes": [
      "PSYCHIC",
      "DARK"
    ],
    "parsedAbilities": [
      "MAGICIAN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_HOOPA_UNBOUND",
    "family": "P_FAMILY_HOOPA",
    "baseHP": 80,
    "baseAttack": 160,
    "baseDefense": 60,
    "baseSpeed": 80,
    "baseSpAttack": 170,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_DARK)",
    "abilities": "{ ABILITY_MAGICIAN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Hoopa\")",
    "natDexNum": "NATIONAL_DEX_HOOPA",
    "levelUpLearnset": "sHoopaUnboundLevelUpLearnset",
    "teachableLearnset": "sHoopaUnboundTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Volcanion",
    "parsedTypes": [
      "FIRE",
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_VOLCANION",
    "family": "P_FAMILY_VOLCANION",
    "baseHP": 80,
    "baseAttack": 110,
    "baseDefense": 120,
    "baseSpeed": 70,
    "baseSpAttack": 130,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Volcanion\")",
    "natDexNum": "NATIONAL_DEX_VOLCANION",
    "levelUpLearnset": "sVolcanionLevelUpLearnset",
    "teachableLearnset": "sVolcanionTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rowlet",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "LONG_REACH"
    ],
    "id": "SPECIES_ROWLET",
    "family": "P_FAMILY_ROWLET",
    "baseHP": 68,
    "baseAttack": 55,
    "baseDefense": 55,
    "baseSpeed": 42,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_LONG_REACH }",
    "speciesName": "_(\"Rowlet\")",
    "natDexNum": "NATIONAL_DEX_ROWLET",
    "levelUpLearnset": "sRowletLevelUpLearnset",
    "teachableLearnset": "sRowletTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_DARTRIX})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dartrix",
    "parsedTypes": [
      "GRASS",
      "FLYING"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "LONG_REACH"
    ],
    "id": "SPECIES_DARTRIX",
    "family": "P_FAMILY_ROWLET",
    "baseHP": 78,
    "baseAttack": 75,
    "baseDefense": 75,
    "baseSpeed": 52,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FLYING)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_LONG_REACH }",
    "speciesName": "_(\"Dartrix\")",
    "natDexNum": "NATIONAL_DEX_DARTRIX",
    "levelUpLearnset": "sDartrixLevelUpLearnset",
    "teachableLearnset": "sDartrixTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_DECIDUEYE}",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Decidueye",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "LONG_REACH"
    ],
    "id": "SPECIES_DECIDUEYE",
    "family": "P_FAMILY_ROWLET",
    "baseHP": 78,
    "baseAttack": 107,
    "baseDefense": 75,
    "baseSpeed": 70,
    "baseSpAttack": 100,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_LONG_REACH }",
    "speciesName": "_(\"Decidueye\")",
    "natDexNum": "NATIONAL_DEX_DECIDUEYE",
    "levelUpLearnset": "sDecidueyeLevelUpLearnset",
    "teachableLearnset": "sDecidueyeTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Decidueye  Hisui",
    "parsedTypes": [
      "GRASS",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "SCRAPPY"
    ],
    "id": "SPECIES_DECIDUEYE_HISUI",
    "family": "P_FAMILY_ROWLET",
    "baseHP": 88,
    "baseAttack": 112,
    "baseDefense": 80,
    "baseSpeed": 60,
    "baseSpAttack": 95,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_SCRAPPY }",
    "speciesName": "_(\"Decidueye\")",
    "natDexNum": "NATIONAL_DEX_DECIDUEYE",
    "levelUpLearnset": "sDecidueyeHisuiLevelUpLearnset",
    "teachableLearnset": "sDecidueyeHisuiTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Litten",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "INTIMIDATE"
    ],
    "id": "SPECIES_LITTEN",
    "family": "P_FAMILY_LITTEN",
    "baseHP": 45,
    "baseAttack": 65,
    "baseDefense": 40,
    "baseSpeed": 70,
    "baseSpAttack": 60,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Litten\")",
    "natDexNum": "NATIONAL_DEX_LITTEN",
    "levelUpLearnset": "sLittenLevelUpLearnset",
    "teachableLearnset": "sLittenTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_TORRACAT})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Torracat",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "INTIMIDATE"
    ],
    "id": "SPECIES_TORRACAT",
    "family": "P_FAMILY_LITTEN",
    "baseHP": 65,
    "baseAttack": 85,
    "baseDefense": 50,
    "baseSpeed": 90,
    "baseSpAttack": 80,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Torracat\")",
    "natDexNum": "NATIONAL_DEX_TORRACAT",
    "levelUpLearnset": "sTorracatLevelUpLearnset",
    "teachableLearnset": "sTorracatTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_INCINEROAR})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Incineroar",
    "parsedTypes": [
      "FIRE",
      "DARK"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "INTIMIDATE"
    ],
    "id": "SPECIES_INCINEROAR",
    "family": "P_FAMILY_LITTEN",
    "baseHP": 95,
    "baseAttack": 115,
    "baseDefense": 90,
    "baseSpeed": 60,
    "baseSpAttack": 80,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_DARK)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_INTIMIDATE }",
    "speciesName": "_(\"Incineroar\")",
    "natDexNum": "NATIONAL_DEX_INCINEROAR",
    "levelUpLearnset": "sIncineroarLevelUpLearnset",
    "teachableLearnset": "sIncineroarTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Popplio",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "LIQUID_VOICE"
    ],
    "id": "SPECIES_POPPLIO",
    "family": "P_FAMILY_POPPLIO",
    "baseHP": 50,
    "baseAttack": 54,
    "baseDefense": 54,
    "baseSpeed": 40,
    "baseSpAttack": 66,
    "baseSpDefense": 56,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_LIQUID_VOICE }",
    "speciesName": "_(\"Popplio\")",
    "natDexNum": "NATIONAL_DEX_POPPLIO",
    "levelUpLearnset": "sPopplioLevelUpLearnset",
    "teachableLearnset": "sPopplioTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 17, SPECIES_BRIONNE})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Brionne",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "LIQUID_VOICE"
    ],
    "id": "SPECIES_BRIONNE",
    "family": "P_FAMILY_POPPLIO",
    "baseHP": 60,
    "baseAttack": 69,
    "baseDefense": 69,
    "baseSpeed": 50,
    "baseSpAttack": 91,
    "baseSpDefense": 81,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_LIQUID_VOICE }",
    "speciesName": "_(\"Brionne\")",
    "natDexNum": "NATIONAL_DEX_BRIONNE",
    "levelUpLearnset": "sBrionneLevelUpLearnset",
    "teachableLearnset": "sBrionneTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_PRIMARINA})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Primarina",
    "parsedTypes": [
      "WATER",
      "FAIRY"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "LIQUID_VOICE"
    ],
    "id": "SPECIES_PRIMARINA",
    "family": "P_FAMILY_POPPLIO",
    "baseHP": 80,
    "baseAttack": 74,
    "baseDefense": 74,
    "baseSpeed": 60,
    "baseSpAttack": 126,
    "baseSpDefense": 116,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FAIRY)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_LIQUID_VOICE }",
    "speciesName": "_(\"Primarina\")",
    "natDexNum": "NATIONAL_DEX_PRIMARINA",
    "levelUpLearnset": "sPrimarinaLevelUpLearnset",
    "teachableLearnset": "sPrimarinaTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pikipek",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SKILL_LINK",
      "PICKUP"
    ],
    "id": "SPECIES_PIKIPEK",
    "family": "P_FAMILY_PIKIPEK",
    "baseHP": 35,
    "baseAttack": 75,
    "baseDefense": 30,
    "baseSpeed": 65,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SKILL_LINK, ABILITY_PICKUP }",
    "speciesName": "_(\"Pikipek\")",
    "natDexNum": "NATIONAL_DEX_PIKIPEK",
    "levelUpLearnset": "sPikipekLevelUpLearnset",
    "teachableLearnset": "sPikipekTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 14, SPECIES_TRUMBEAK})",
    "baseBST": 265,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Trumbeak",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SKILL_LINK",
      "PICKUP"
    ],
    "id": "SPECIES_TRUMBEAK",
    "family": "P_FAMILY_PIKIPEK",
    "baseHP": 55,
    "baseAttack": 85,
    "baseDefense": 50,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SKILL_LINK, ABILITY_PICKUP }",
    "speciesName": "_(\"Trumbeak\")",
    "natDexNum": "NATIONAL_DEX_TRUMBEAK",
    "levelUpLearnset": "sTrumbeakLevelUpLearnset",
    "teachableLearnset": "sTrumbeakTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_TOUCANNON})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toucannon",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SKILL_LINK",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_TOUCANNON",
    "family": "P_FAMILY_PIKIPEK",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 75,
    "baseSpeed": 60,
    "baseSpAttack": 75,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SKILL_LINK, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Toucannon\")",
    "natDexNum": "NATIONAL_DEX_TOUCANNON",
    "levelUpLearnset": "sToucannonLevelUpLearnset",
    "teachableLearnset": "sToucannonTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yungoos",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "STAKEOUT",
      "STRONG_JAW",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_YUNGOOS",
    "family": "P_FAMILY_YUNGOOS",
    "baseHP": 48,
    "baseAttack": 70,
    "baseDefense": 30,
    "baseSpeed": 45,
    "baseSpAttack": 30,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_STAKEOUT, ABILITY_STRONG_JAW, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Yungoos\")",
    "natDexNum": "NATIONAL_DEX_YUNGOOS",
    "levelUpLearnset": "sYungoosLevelUpLearnset",
    "teachableLearnset": "sYungoosTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_GUMSHOOS, CONDITIONS({IF_NOT_TIME, TIME_NIGHT})})",
    "baseBST": 253,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gumshoos",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "STAKEOUT",
      "STRONG_JAW",
      "ADAPTABILITY"
    ],
    "id": "SPECIES_GUMSHOOS",
    "family": "P_FAMILY_YUNGOOS",
    "baseHP": 88,
    "baseAttack": 110,
    "baseDefense": 60,
    "baseSpeed": 45,
    "baseSpAttack": 55,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_STAKEOUT, ABILITY_STRONG_JAW, ABILITY_ADAPTABILITY }",
    "speciesName": "_(\"Gumshoos\")",
    "natDexNum": "NATIONAL_DEX_GUMSHOOS",
    "levelUpLearnset": "sGumshoosLevelUpLearnset",
    "teachableLearnset": "sGumshoosTeachableLearnset",
    "baseBST": 418,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grubbin",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GRUBBIN",
    "family": "P_FAMILY_GRUBBIN",
    "baseHP": 47,
    "baseAttack": 62,
    "baseDefense": 45,
    "baseSpeed": 46,
    "baseSpAttack": 55,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Grubbin\")",
    "natDexNum": "NATIONAL_DEX_GRUBBIN",
    "levelUpLearnset": "sGrubbinLevelUpLearnset",
    "teachableLearnset": "sGrubbinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_CHARJABUG})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charjabug",
    "parsedTypes": [
      "BUG",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "BATTERY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHARJABUG",
    "family": "P_FAMILY_GRUBBIN",
    "baseHP": 57,
    "baseAttack": 82,
    "baseDefense": 95,
    "baseSpeed": 36,
    "baseSpAttack": 55,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_BATTERY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Charjabug\")",
    "natDexNum": "NATIONAL_DEX_CHARJABUG",
    "levelUpLearnset": "sCharjabugLevelUpLearnset",
    "teachableLearnset": "sCharjabugTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_VIKAVOLT, CONDITIONS({IF_IN_MAPSEC, MAPSEC_NEW_MAUVILLE})}",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Vikavolt",
    "parsedTypes": [
      "BUG",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LEVITATE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_VIKAVOLT",
    "family": "P_FAMILY_GRUBBIN",
    "baseHP": 77,
    "baseAttack": 70,
    "baseDefense": 90,
    "baseSpeed": 43,
    "baseSpAttack": 145,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_BUG, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LEVITATE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Vikavolt\")",
    "natDexNum": "NATIONAL_DEX_VIKAVOLT",
    "levelUpLearnset": "sVikavoltLevelUpLearnset",
    "teachableLearnset": "sVikavoltTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Crabrawler",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "IRON_FIST",
      "ANGER_POINT"
    ],
    "id": "SPECIES_CRABRAWLER",
    "family": "P_FAMILY_CRABRAWLER",
    "baseHP": 47,
    "baseAttack": 82,
    "baseDefense": 57,
    "baseSpeed": 63,
    "baseSpAttack": 42,
    "baseSpDefense": 47,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_IRON_FIST, ABILITY_ANGER_POINT }",
    "speciesName": "_(\"Crabrawler\")",
    "natDexNum": "NATIONAL_DEX_CRABRAWLER",
    "levelUpLearnset": "sCrabrawlerLevelUpLearnset",
    "teachableLearnset": "sCrabrawlerTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_CRABOMINABLE, CONDITIONS({IF_IN_MAP, MAP_SHOAL_CAVE_LOW_TIDE_ICE_ROOM})}",
    "baseBST": 338,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Crabominable",
    "parsedTypes": [
      "FIGHTING",
      "ICE"
    ],
    "parsedAbilities": [
      "HYPER_CUTTER",
      "IRON_FIST",
      "ANGER_POINT"
    ],
    "id": "SPECIES_CRABOMINABLE",
    "family": "P_FAMILY_CRABRAWLER",
    "baseHP": 97,
    "baseAttack": 132,
    "baseDefense": 77,
    "baseSpeed": 43,
    "baseSpAttack": 62,
    "baseSpDefense": 67,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_ICE)",
    "abilities": "{ ABILITY_HYPER_CUTTER, ABILITY_IRON_FIST, ABILITY_ANGER_POINT }",
    "speciesName": "_(\"Crabominable\")",
    "natDexNum": "NATIONAL_DEX_CRABOMINABLE",
    "levelUpLearnset": "sCrabominableLevelUpLearnset",
    "teachableLearnset": "sCrabominableTeachableLearnset",
    "baseBST": 478,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oricorio  Baile",
    "parsedTypes": [
      "FIRE",
      "FLYING"
    ],
    "parsedAbilities": [
      "DANCER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ORICORIO_BAILE",
    "family": "P_FAMILY_ORICORIO",
    "baseHP": 75,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 93,
    "baseSpAttack": 98,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_FLYING)",
    "abilities": "{ ABILITY_DANCER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Oricorio\")",
    "natDexNum": "NATIONAL_DEX_ORICORIO",
    "levelUpLearnset": "sOricorioLevelUpLearnset",
    "teachableLearnset": "sOricorioTeachableLearnset",
    "baseBST": 476,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oricorio  Pom  Pom",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "DANCER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ORICORIO_POM_POM",
    "family": "P_FAMILY_ORICORIO",
    "baseHP": 75,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 93,
    "baseSpAttack": 98,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_DANCER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Oricorio\")",
    "natDexNum": "NATIONAL_DEX_ORICORIO",
    "levelUpLearnset": "sOricorioLevelUpLearnset",
    "teachableLearnset": "sOricorioTeachableLearnset",
    "baseBST": 476,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oricorio  Pau",
    "parsedTypes": [
      "PSYCHIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "DANCER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ORICORIO_PAU",
    "family": "P_FAMILY_ORICORIO",
    "baseHP": 75,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 93,
    "baseSpAttack": 98,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_DANCER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Oricorio\")",
    "natDexNum": "NATIONAL_DEX_ORICORIO",
    "levelUpLearnset": "sOricorioLevelUpLearnset",
    "teachableLearnset": "sOricorioTeachableLearnset",
    "baseBST": 476,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oricorio  Sensu",
    "parsedTypes": [
      "GHOST",
      "FLYING"
    ],
    "parsedAbilities": [
      "DANCER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ORICORIO_SENSU",
    "family": "P_FAMILY_ORICORIO",
    "baseHP": 75,
    "baseAttack": 70,
    "baseDefense": 70,
    "baseSpeed": 93,
    "baseSpAttack": 98,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FLYING)",
    "abilities": "{ ABILITY_DANCER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Oricorio\")",
    "natDexNum": "NATIONAL_DEX_ORICORIO",
    "levelUpLearnset": "sOricorioLevelUpLearnset",
    "teachableLearnset": "sOricorioTeachableLearnset",
    "baseBST": 476,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cutiefly",
    "parsedTypes": [
      "BUG",
      "FAIRY"
    ],
    "parsedAbilities": [
      "HONEY_GATHER",
      "SHIELD_DUST",
      "SWEET_VEIL"
    ],
    "id": "SPECIES_CUTIEFLY",
    "family": "P_FAMILY_CUTIEFLY",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 84,
    "baseSpAttack": 55,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FAIRY)",
    "abilities": "{ ABILITY_HONEY_GATHER, ABILITY_SHIELD_DUST, ABILITY_SWEET_VEIL }",
    "speciesName": "_(\"Cutiefly\")",
    "natDexNum": "NATIONAL_DEX_CUTIEFLY",
    "levelUpLearnset": "sCutieflyLevelUpLearnset",
    "teachableLearnset": "sCutieflyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_RIBOMBEE}",
    "baseBST": 304,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ribombee",
    "parsedTypes": [
      "BUG",
      "FAIRY"
    ],
    "parsedAbilities": [
      "HONEY_GATHER",
      "SHIELD_DUST",
      "SWEET_VEIL"
    ],
    "id": "SPECIES_RIBOMBEE",
    "family": "P_FAMILY_CUTIEFLY",
    "baseHP": 60,
    "baseAttack": 55,
    "baseDefense": 60,
    "baseSpeed": 124,
    "baseSpAttack": 95,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FAIRY)",
    "abilities": "{ ABILITY_HONEY_GATHER, ABILITY_SHIELD_DUST, ABILITY_SWEET_VEIL }",
    "speciesName": "_(\"Ribombee\")",
    "natDexNum": "NATIONAL_DEX_RIBOMBEE",
    "levelUpLearnset": "sRibombeeLevelUpLearnset",
    "teachableLearnset": "sRibombeeTeachableLearnset",
    "baseBST": 464,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rockruff",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "VITAL_SPIRIT",
      "STEADFAST"
    ],
    "id": "SPECIES_ROCKRUFF",
    "family": "P_FAMILY_ROCKRUFF",
    "baseHP": 45,
    "baseAttack": 65,
    "baseDefense": 40,
    "baseSpeed": 60,
    "baseSpAttack": 30,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_VITAL_SPIRIT, ABILITY_STEADFAST }",
    "speciesName": "_(\"Rockruff\")",
    "natDexNum": "NATIONAL_DEX_ROCKRUFF",
    "levelUpLearnset": "sRockruffLevelUpLearnset",
    "teachableLearnset": "sRockruffTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_LYCANROC_MIDDAY, CONDITIONS({IF_NOT_TIME, TIME_NIGHT})}",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rockruff  Own  Tempo",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROCKRUFF_OWN_TEMPO",
    "family": "P_FAMILY_ROCKRUFF",
    "baseHP": 45,
    "baseAttack": 65,
    "baseDefense": 40,
    "baseSpeed": 60,
    "baseSpAttack": 30,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Rockruff\")",
    "natDexNum": "NATIONAL_DEX_ROCKRUFF",
    "levelUpLearnset": "sRockruffLevelUpLearnset",
    "teachableLearnset": "sRockruffTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_LYCANROC_DUSK, CONDITIONS({IF_TIME, TIME_EVENING})})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lycanroc  Midday",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "SAND_RUSH",
      "STEADFAST"
    ],
    "id": "SPECIES_LYCANROC_MIDDAY",
    "family": "P_FAMILY_ROCKRUFF",
    "baseHP": 75,
    "baseAttack": 115,
    "baseDefense": 65,
    "baseSpeed": 112,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_SAND_RUSH, ABILITY_STEADFAST }",
    "speciesName": "_(\"Lycanroc\")",
    "natDexNum": "NATIONAL_DEX_LYCANROC",
    "levelUpLearnset": "sLycanrocMiddayLevelUpLearnset",
    "teachableLearnset": "sLycanrocMiddayTeachableLearnset",
    "baseBST": 487,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lycanroc  Midnight",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "VITAL_SPIRIT",
      "NO_GUARD"
    ],
    "id": "SPECIES_LYCANROC_MIDNIGHT",
    "family": "P_FAMILY_ROCKRUFF",
    "baseHP": 85,
    "baseAttack": 115,
    "baseDefense": 75,
    "baseSpeed": 82,
    "baseSpAttack": 55,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_VITAL_SPIRIT, ABILITY_NO_GUARD }",
    "speciesName": "_(\"Lycanroc\")",
    "natDexNum": "NATIONAL_DEX_LYCANROC",
    "levelUpLearnset": "sLycanrocMidnightLevelUpLearnset",
    "teachableLearnset": "sLycanrocMidnightTeachableLearnset",
    "baseBST": 487,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lycanroc  Dusk",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "TOUGH_CLAWS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_LYCANROC_DUSK",
    "family": "P_FAMILY_ROCKRUFF",
    "baseHP": 75,
    "baseAttack": 117,
    "baseDefense": 65,
    "baseSpeed": 110,
    "baseSpAttack": 55,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_TOUGH_CLAWS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Lycanroc\")",
    "natDexNum": "NATIONAL_DEX_LYCANROC",
    "levelUpLearnset": "sLycanrocDuskLevelUpLearnset",
    "teachableLearnset": "sLycanrocDuskTeachableLearnset",
    "baseBST": 487,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wishiwashi  Solo",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SCHOOLING",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_WISHIWASHI_SOLO",
    "family": "P_FAMILY_WISHIWASHI",
    "baseHP": 45,
    "baseAttack": 20,
    "baseDefense": 20,
    "baseSpeed": 40,
    "baseSpAttack": 25,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SCHOOLING, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Wishiwashi\")",
    "natDexNum": "NATIONAL_DEX_WISHIWASHI",
    "levelUpLearnset": "sWishiwashiLevelUpLearnset",
    "teachableLearnset": "sWishiwashiTeachableLearnset",
    "baseBST": 175,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wishiwashi  School",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SCHOOLING",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_WISHIWASHI_SCHOOL",
    "family": "P_FAMILY_WISHIWASHI",
    "baseHP": 45,
    "baseAttack": 140,
    "baseDefense": 130,
    "baseSpeed": 30,
    "baseSpAttack": 140,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SCHOOLING, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Wishiwashi\")",
    "natDexNum": "NATIONAL_DEX_WISHIWASHI",
    "levelUpLearnset": "sWishiwashiLevelUpLearnset",
    "teachableLearnset": "sWishiwashiTeachableLearnset",
    "baseBST": 620,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mareanie",
    "parsedTypes": [
      "POISON",
      "WATER"
    ],
    "parsedAbilities": [
      "MERCILESS",
      "LIMBER",
      "REGENERATOR"
    ],
    "id": "SPECIES_MAREANIE",
    "family": "P_FAMILY_MAREANIE",
    "baseHP": 50,
    "baseAttack": 53,
    "baseDefense": 62,
    "baseSpeed": 45,
    "baseSpAttack": 43,
    "baseSpDefense": 52,
    "types": "MON_TYPES(TYPE_POISON, TYPE_WATER)",
    "abilities": "{ ABILITY_MERCILESS, ABILITY_LIMBER, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Mareanie\")",
    "natDexNum": "NATIONAL_DEX_MAREANIE",
    "levelUpLearnset": "sMareanieLevelUpLearnset",
    "teachableLearnset": "sMareanieTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_TOXAPEX})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toxapex",
    "parsedTypes": [
      "POISON",
      "WATER"
    ],
    "parsedAbilities": [
      "MERCILESS",
      "LIMBER",
      "REGENERATOR"
    ],
    "id": "SPECIES_TOXAPEX",
    "family": "P_FAMILY_MAREANIE",
    "baseHP": 50,
    "baseAttack": 63,
    "baseDefense": 152,
    "baseSpeed": 35,
    "baseSpAttack": 53,
    "baseSpDefense": 142,
    "types": "MON_TYPES(TYPE_POISON, TYPE_WATER)",
    "abilities": "{ ABILITY_MERCILESS, ABILITY_LIMBER, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Toxapex\")",
    "natDexNum": "NATIONAL_DEX_TOXAPEX",
    "levelUpLearnset": "sToxapexLevelUpLearnset",
    "teachableLearnset": "sToxapexTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mudbray",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "STAMINA",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_MUDBRAY",
    "family": "P_FAMILY_MUDBRAY",
    "baseHP": 70,
    "baseAttack": 100,
    "baseDefense": 70,
    "baseSpeed": 45,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_STAMINA, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Mudbray\")",
    "natDexNum": "NATIONAL_DEX_MUDBRAY",
    "levelUpLearnset": "sMudbrayLevelUpLearnset",
    "teachableLearnset": "sMudbrayTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_MUDSDALE})",
    "baseBST": 385,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mudsdale",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "STAMINA",
      "INNER_FOCUS"
    ],
    "id": "SPECIES_MUDSDALE",
    "family": "P_FAMILY_MUDBRAY",
    "baseHP": 100,
    "baseAttack": 125,
    "baseDefense": 100,
    "baseSpeed": 35,
    "baseSpAttack": 55,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_STAMINA, ABILITY_INNER_FOCUS }",
    "speciesName": "_(\"Mudsdale\")",
    "natDexNum": "NATIONAL_DEX_MUDSDALE",
    "levelUpLearnset": "sMudsdaleLevelUpLearnset",
    "teachableLearnset": "sMudsdaleTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dewpider",
    "parsedTypes": [
      "WATER",
      "BUG"
    ],
    "parsedAbilities": [
      "WATER_BUBBLE",
      "NONE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_DEWPIDER",
    "family": "P_FAMILY_DEWPIDER",
    "baseHP": 38,
    "baseAttack": 40,
    "baseDefense": 52,
    "baseSpeed": 27,
    "baseSpAttack": 40,
    "baseSpDefense": 72,
    "types": "MON_TYPES(TYPE_WATER, TYPE_BUG)",
    "abilities": "{ ABILITY_WATER_BUBBLE, ABILITY_NONE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Dewpider\")",
    "natDexNum": "NATIONAL_DEX_DEWPIDER",
    "levelUpLearnset": "sDewpiderLevelUpLearnset",
    "teachableLearnset": "sDewpiderTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_ARAQUANID}",
    "baseBST": 269,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Araquanid",
    "parsedTypes": [
      "WATER",
      "BUG"
    ],
    "parsedAbilities": [
      "WATER_BUBBLE",
      "NONE",
      "WATER_ABSORB"
    ],
    "id": "SPECIES_ARAQUANID",
    "family": "P_FAMILY_DEWPIDER",
    "baseHP": 68,
    "baseAttack": 70,
    "baseDefense": 92,
    "baseSpeed": 42,
    "baseSpAttack": 50,
    "baseSpDefense": 132,
    "types": "MON_TYPES(TYPE_WATER, TYPE_BUG)",
    "abilities": "{ ABILITY_WATER_BUBBLE, ABILITY_NONE, ABILITY_WATER_ABSORB }",
    "speciesName": "_(\"Araquanid\")",
    "natDexNum": "NATIONAL_DEX_ARAQUANID",
    "levelUpLearnset": "sAraquanidLevelUpLearnset",
    "teachableLearnset": "sAraquanidTeachableLearnset",
    "baseBST": 454,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fomantis",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_FOMANTIS",
    "family": "P_FAMILY_FOMANTIS",
    "baseHP": 40,
    "baseAttack": 55,
    "baseDefense": 35,
    "baseSpeed": 35,
    "baseSpAttack": 50,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Fomantis\")",
    "natDexNum": "NATIONAL_DEX_FOMANTIS",
    "levelUpLearnset": "sFomantisLevelUpLearnset",
    "teachableLearnset": "sFomantisTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_LURANTIS, CONDITIONS({IF_NOT_TIME, TIME_NIGHT})}",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lurantis",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_LURANTIS",
    "family": "P_FAMILY_FOMANTIS",
    "baseHP": 70,
    "baseAttack": 105,
    "baseDefense": 90,
    "baseSpeed": 45,
    "baseSpAttack": 80,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Lurantis\")",
    "natDexNum": "NATIONAL_DEX_LURANTIS",
    "levelUpLearnset": "sLurantisLevelUpLearnset",
    "teachableLearnset": "sLurantisTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Morelull",
    "parsedTypes": [
      "GRASS",
      "FAIRY"
    ],
    "parsedAbilities": [
      "ILLUMINATE",
      "EFFECT_SPORE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_MORELULL",
    "family": "P_FAMILY_MORELULL",
    "baseHP": 40,
    "baseAttack": 35,
    "baseDefense": 55,
    "baseSpeed": 15,
    "baseSpAttack": 65,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FAIRY)",
    "abilities": "{ ABILITY_ILLUMINATE, ABILITY_EFFECT_SPORE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Morelull\")",
    "natDexNum": "NATIONAL_DEX_MORELULL",
    "levelUpLearnset": "sMorelullLevelUpLearnset",
    "teachableLearnset": "sMorelullTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_SHIINOTIC})",
    "baseBST": 285,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shiinotic",
    "parsedTypes": [
      "GRASS",
      "FAIRY"
    ],
    "parsedAbilities": [
      "ILLUMINATE",
      "EFFECT_SPORE",
      "RAIN_DISH"
    ],
    "id": "SPECIES_SHIINOTIC",
    "family": "P_FAMILY_MORELULL",
    "baseHP": 60,
    "baseAttack": 45,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 90,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FAIRY)",
    "abilities": "{ ABILITY_ILLUMINATE, ABILITY_EFFECT_SPORE, ABILITY_RAIN_DISH }",
    "speciesName": "_(\"Shiinotic\")",
    "natDexNum": "NATIONAL_DEX_SHIINOTIC",
    "levelUpLearnset": "sShiinoticLevelUpLearnset",
    "teachableLearnset": "sShiinoticTeachableLearnset",
    "baseBST": 405,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Salandit",
    "parsedTypes": [
      "POISON",
      "FIRE"
    ],
    "parsedAbilities": [
      "CORROSION",
      "NONE",
      "OBLIVIOUS"
    ],
    "id": "SPECIES_SALANDIT",
    "family": "P_FAMILY_SALANDIT",
    "baseHP": 48,
    "baseAttack": 44,
    "baseDefense": 40,
    "baseSpeed": 77,
    "baseSpAttack": 71,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FIRE)",
    "abilities": "{ ABILITY_CORROSION, ABILITY_NONE, ABILITY_OBLIVIOUS }",
    "speciesName": "_(\"Salandit\")",
    "natDexNum": "NATIONAL_DEX_SALANDIT",
    "levelUpLearnset": "sSalanditLevelUpLearnset",
    "teachableLearnset": "sSalanditTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 33, SPECIES_SALAZZLE, CONDITIONS({IF_GENDER, MON_FEMALE})}",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Salazzle",
    "parsedTypes": [
      "POISON",
      "FIRE"
    ],
    "parsedAbilities": [
      "CORROSION",
      "NONE",
      "OBLIVIOUS"
    ],
    "id": "SPECIES_SALAZZLE",
    "family": "P_FAMILY_SALANDIT",
    "baseHP": 68,
    "baseAttack": 64,
    "baseDefense": 60,
    "baseSpeed": 117,
    "baseSpAttack": 111,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FIRE)",
    "abilities": "{ ABILITY_CORROSION, ABILITY_NONE, ABILITY_OBLIVIOUS }",
    "speciesName": "_(\"Salazzle\")",
    "natDexNum": "NATIONAL_DEX_SALAZZLE",
    "levelUpLearnset": "sSalazzleLevelUpLearnset",
    "teachableLearnset": "sSalazzleTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stufful",
    "parsedTypes": [
      "NORMAL",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "FLUFFY",
      "KLUTZ",
      "CUTE_CHARM"
    ],
    "id": "SPECIES_STUFFUL",
    "family": "P_FAMILY_STUFFUL",
    "baseHP": 70,
    "baseAttack": 75,
    "baseDefense": 50,
    "baseSpeed": 50,
    "baseSpAttack": 45,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_FLUFFY, ABILITY_KLUTZ, ABILITY_CUTE_CHARM }",
    "speciesName": "_(\"Stufful\")",
    "natDexNum": "NATIONAL_DEX_STUFFUL",
    "levelUpLearnset": "sStuffulLevelUpLearnset",
    "teachableLearnset": "sStuffulTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 27, SPECIES_BEWEAR})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bewear",
    "parsedTypes": [
      "NORMAL",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "FLUFFY",
      "KLUTZ",
      "UNNERVE"
    ],
    "id": "SPECIES_BEWEAR",
    "family": "P_FAMILY_STUFFUL",
    "baseHP": 120,
    "baseAttack": 125,
    "baseDefense": 80,
    "baseSpeed": 60,
    "baseSpAttack": 55,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_FLUFFY, ABILITY_KLUTZ, ABILITY_UNNERVE }",
    "speciesName": "_(\"Bewear\")",
    "natDexNum": "NATIONAL_DEX_BEWEAR",
    "levelUpLearnset": "sBewearLevelUpLearnset",
    "teachableLearnset": "sBewearTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bounsweet",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "OBLIVIOUS",
      "SWEET_VEIL"
    ],
    "id": "SPECIES_BOUNSWEET",
    "family": "P_FAMILY_BOUNSWEET",
    "baseHP": 42,
    "baseAttack": 30,
    "baseDefense": 38,
    "baseSpeed": 32,
    "baseSpAttack": 30,
    "baseSpDefense": 38,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_OBLIVIOUS, ABILITY_SWEET_VEIL }",
    "speciesName": "_(\"Bounsweet\")",
    "natDexNum": "NATIONAL_DEX_BOUNSWEET",
    "levelUpLearnset": "sBounsweetLevelUpLearnset",
    "teachableLearnset": "sBounsweetTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_STEENEE})",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Steenee",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "OBLIVIOUS",
      "SWEET_VEIL"
    ],
    "id": "SPECIES_STEENEE",
    "family": "P_FAMILY_BOUNSWEET",
    "baseHP": 52,
    "baseAttack": 40,
    "baseDefense": 48,
    "baseSpeed": 62,
    "baseSpAttack": 40,
    "baseSpDefense": 48,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_OBLIVIOUS, ABILITY_SWEET_VEIL }",
    "speciesName": "_(\"Steenee\")",
    "natDexNum": "NATIONAL_DEX_STEENEE",
    "levelUpLearnset": "sSteeneeLevelUpLearnset",
    "teachableLearnset": "sSteeneeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_TSAREENA, CONDITIONS({IF_KNOWS_MOVE, MOVE_STOMP})})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tsareena",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "QUEENLY_MAJESTY",
      "SWEET_VEIL"
    ],
    "id": "SPECIES_TSAREENA",
    "family": "P_FAMILY_BOUNSWEET",
    "baseHP": 72,
    "baseAttack": 120,
    "baseDefense": 98,
    "baseSpeed": 72,
    "baseSpAttack": 50,
    "baseSpDefense": 98,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_QUEENLY_MAJESTY, ABILITY_SWEET_VEIL }",
    "speciesName": "_(\"Tsareena\")",
    "natDexNum": "NATIONAL_DEX_TSAREENA",
    "levelUpLearnset": "sTsareenaLevelUpLearnset",
    "teachableLearnset": "sTsareenaTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Comfey",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "FLOWER_VEIL",
      "TRIAGE",
      "NATURAL_CURE"
    ],
    "id": "SPECIES_COMFEY",
    "family": "P_FAMILY_COMFEY",
    "baseHP": 51,
    "baseAttack": 52,
    "baseDefense": 90,
    "baseSpeed": 100,
    "baseSpAttack": 82,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_FLOWER_VEIL, ABILITY_TRIAGE, ABILITY_NATURAL_CURE }",
    "speciesName": "_(\"Comfey\")",
    "natDexNum": "NATIONAL_DEX_COMFEY",
    "levelUpLearnset": "sComfeyLevelUpLearnset",
    "teachableLearnset": "sComfeyTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oranguru",
    "parsedTypes": [
      "NORMAL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "TELEPATHY",
      "SYMBIOSIS"
    ],
    "id": "SPECIES_ORANGURU",
    "family": "P_FAMILY_ORANGURU",
    "baseHP": 90,
    "baseAttack": 60,
    "baseDefense": 80,
    "baseSpeed": 60,
    "baseSpAttack": 90,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_TELEPATHY, ABILITY_SYMBIOSIS }",
    "speciesName": "_(\"Oranguru\")",
    "natDexNum": "NATIONAL_DEX_ORANGURU",
    "levelUpLearnset": "sOranguruLevelUpLearnset",
    "teachableLearnset": "sOranguruTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Passimian",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "RECEIVER",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_PASSIMIAN",
    "family": "P_FAMILY_PASSIMIAN",
    "baseHP": 100,
    "baseAttack": 120,
    "baseDefense": 90,
    "baseSpeed": 80,
    "baseSpAttack": 40,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_RECEIVER, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Passimian\")",
    "natDexNum": "NATIONAL_DEX_PASSIMIAN",
    "levelUpLearnset": "sPassimianLevelUpLearnset",
    "teachableLearnset": "sPassimianTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wimpod",
    "parsedTypes": [
      "BUG",
      "WATER"
    ],
    "parsedAbilities": [
      "WIMP_OUT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_WIMPOD",
    "family": "P_FAMILY_WIMPOD",
    "baseHP": 25,
    "baseAttack": 35,
    "baseDefense": 40,
    "baseSpeed": 80,
    "baseSpAttack": 20,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_BUG, TYPE_WATER)",
    "abilities": "{ ABILITY_WIMP_OUT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Wimpod\")",
    "natDexNum": "NATIONAL_DEX_WIMPOD",
    "levelUpLearnset": "sWimpodLevelUpLearnset",
    "teachableLearnset": "sWimpodTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_GOLISOPOD})",
    "baseBST": 230,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Golisopod",
    "parsedTypes": [
      "BUG",
      "WATER"
    ],
    "parsedAbilities": [
      "EMERGENCY_EXIT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GOLISOPOD",
    "family": "P_FAMILY_WIMPOD",
    "baseHP": 75,
    "baseAttack": 125,
    "baseDefense": 140,
    "baseSpeed": 40,
    "baseSpAttack": 60,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_BUG, TYPE_WATER)",
    "abilities": "{ ABILITY_EMERGENCY_EXIT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Golisopod\")",
    "natDexNum": "NATIONAL_DEX_GOLISOPOD",
    "levelUpLearnset": "sGolisopodLevelUpLearnset",
    "teachableLearnset": "sGolisopodTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandygast",
    "parsedTypes": [
      "GHOST",
      "GROUND"
    ],
    "parsedAbilities": [
      "WATER_COMPACTION",
      "NONE",
      "SAND_VEIL"
    ],
    "id": "SPECIES_SANDYGAST",
    "family": "P_FAMILY_SANDYGAST",
    "baseHP": 55,
    "baseAttack": 55,
    "baseDefense": 80,
    "baseSpeed": 15,
    "baseSpAttack": 70,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GROUND)",
    "abilities": "{ ABILITY_WATER_COMPACTION, ABILITY_NONE, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Sandygast\")",
    "natDexNum": "NATIONAL_DEX_SANDYGAST",
    "levelUpLearnset": "sSandygastLevelUpLearnset",
    "teachableLearnset": "sSandygastTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_PALOSSAND})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Palossand",
    "parsedTypes": [
      "GHOST",
      "GROUND"
    ],
    "parsedAbilities": [
      "WATER_COMPACTION",
      "NONE",
      "SAND_VEIL"
    ],
    "id": "SPECIES_PALOSSAND",
    "family": "P_FAMILY_SANDYGAST",
    "baseHP": 85,
    "baseAttack": 75,
    "baseDefense": 110,
    "baseSpeed": 35,
    "baseSpAttack": 100,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GROUND)",
    "abilities": "{ ABILITY_WATER_COMPACTION, ABILITY_NONE, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Palossand\")",
    "natDexNum": "NATIONAL_DEX_PALOSSAND",
    "levelUpLearnset": "sPalossandLevelUpLearnset",
    "teachableLearnset": "sPalossandTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pyukumuku",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "INNARDS_OUT",
      "NONE",
      "UNAWARE"
    ],
    "id": "SPECIES_PYUKUMUKU",
    "family": "P_FAMILY_PYUKUMUKU",
    "baseHP": 55,
    "baseAttack": 60,
    "baseDefense": 130,
    "baseSpeed": 5,
    "baseSpAttack": 30,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_INNARDS_OUT, ABILITY_NONE, ABILITY_UNAWARE }",
    "speciesName": "_(\"Pyukumuku\")",
    "natDexNum": "NATIONAL_DEX_PYUKUMUKU",
    "levelUpLearnset": "sPyukumukuLevelUpLearnset",
    "teachableLearnset": "sPyukumukuTeachableLearnset",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Komala",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "COMATOSE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KOMALA",
    "family": "P_FAMILY_KOMALA",
    "baseHP": 65,
    "baseAttack": 115,
    "baseDefense": 65,
    "baseSpeed": 65,
    "baseSpAttack": 75,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_COMATOSE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Komala\")",
    "natDexNum": "NATIONAL_DEX_KOMALA",
    "levelUpLearnset": "sKomalaLevelUpLearnset",
    "teachableLearnset": "sKomalaTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Turtonator",
    "parsedTypes": [
      "FIRE",
      "DRAGON"
    ],
    "parsedAbilities": [
      "SHELL_ARMOR",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TURTONATOR",
    "family": "P_FAMILY_TURTONATOR",
    "baseHP": 60,
    "baseAttack": 78,
    "baseDefense": 135,
    "baseSpeed": 36,
    "baseSpAttack": 91,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_DRAGON)",
    "abilities": "{ ABILITY_SHELL_ARMOR, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Turtonator\")",
    "natDexNum": "NATIONAL_DEX_TURTONATOR",
    "levelUpLearnset": "sTurtonatorLevelUpLearnset",
    "teachableLearnset": "sTurtonatorTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Togedemaru",
    "parsedTypes": [
      "ELECTRIC",
      "STEEL"
    ],
    "parsedAbilities": [
      "IRON_BARBS",
      "LIGHTNING_ROD",
      "STURDY"
    ],
    "id": "SPECIES_TOGEDEMARU",
    "family": "P_FAMILY_TOGEDEMARU",
    "baseHP": 65,
    "baseAttack": 98,
    "baseDefense": 63,
    "baseSpeed": 96,
    "baseSpAttack": 40,
    "baseSpDefense": 73,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_STEEL)",
    "abilities": "{ ABILITY_IRON_BARBS, ABILITY_LIGHTNING_ROD, ABILITY_STURDY }",
    "speciesName": "_(\"Togedemaru\")",
    "natDexNum": "NATIONAL_DEX_TOGEDEMARU",
    "levelUpLearnset": "sTogedemaruLevelUpLearnset",
    "teachableLearnset": "sTogedemaruTeachableLearnset",
    "baseBST": 435,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mimikyu  Disguised",
    "parsedTypes": [
      "GHOST",
      "FAIRY"
    ],
    "parsedAbilities": [
      "DISGUISE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MIMIKYU_DISGUISED",
    "family": "P_FAMILY_MIMIKYU",
    "baseHP": 55,
    "baseAttack": 90,
    "baseDefense": 80,
    "baseSpeed": 96,
    "baseSpAttack": 50,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FAIRY)",
    "abilities": "{ ABILITY_DISGUISE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Mimikyu\")",
    "natDexNum": "NATIONAL_DEX_MIMIKYU",
    "levelUpLearnset": "sMimikyuLevelUpLearnset",
    "teachableLearnset": "sMimikyuTeachableLearnset",
    "baseBST": 476,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mimikyu  Busted",
    "parsedTypes": [
      "GHOST",
      "FAIRY"
    ],
    "parsedAbilities": [
      "DISGUISE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MIMIKYU_BUSTED",
    "family": "P_FAMILY_MIMIKYU",
    "baseHP": 55,
    "baseAttack": 90,
    "baseDefense": 80,
    "baseSpeed": 96,
    "baseSpAttack": 50,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FAIRY)",
    "abilities": "{ ABILITY_DISGUISE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Mimikyu\")",
    "natDexNum": "NATIONAL_DEX_MIMIKYU",
    "levelUpLearnset": "sMimikyuLevelUpLearnset",
    "teachableLearnset": "sMimikyuTeachableLearnset",
    "baseBST": 476,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bruxish",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "DAZZLING",
      "STRONG_JAW",
      "WONDER_SKIN"
    ],
    "id": "SPECIES_BRUXISH",
    "family": "P_FAMILY_BRUXISH",
    "baseHP": 68,
    "baseAttack": 105,
    "baseDefense": 70,
    "baseSpeed": 92,
    "baseSpAttack": 70,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_DAZZLING, ABILITY_STRONG_JAW, ABILITY_WONDER_SKIN }",
    "speciesName": "_(\"Bruxish\")",
    "natDexNum": "NATIONAL_DEX_BRUXISH",
    "levelUpLearnset": "sBruxishLevelUpLearnset",
    "teachableLearnset": "sBruxishTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drampa",
    "parsedTypes": [
      "NORMAL",
      "DRAGON"
    ],
    "parsedAbilities": [
      "BERSERK",
      "SAP_SIPPER",
      "CLOUD_NINE"
    ],
    "id": "SPECIES_DRAMPA",
    "family": "P_FAMILY_DRAMPA",
    "baseHP": 78,
    "baseAttack": 60,
    "baseDefense": 85,
    "baseSpeed": 36,
    "baseSpAttack": 135,
    "baseSpDefense": 91,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_DRAGON)",
    "abilities": "{ ABILITY_BERSERK, ABILITY_SAP_SIPPER, ABILITY_CLOUD_NINE }",
    "speciesName": "_(\"Drampa\")",
    "natDexNum": "NATIONAL_DEX_DRAMPA",
    "levelUpLearnset": "sDrampaLevelUpLearnset",
    "teachableLearnset": "sDrampaTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dhelmise",
    "parsedTypes": [
      "GHOST",
      "GRASS"
    ],
    "parsedAbilities": [
      "STEELWORKER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_DHELMISE",
    "family": "P_FAMILY_DHELMISE",
    "baseHP": 70,
    "baseAttack": 131,
    "baseDefense": 100,
    "baseSpeed": 40,
    "baseSpAttack": 86,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_GRASS)",
    "abilities": "{ ABILITY_STEELWORKER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Dhelmise\")",
    "natDexNum": "NATIONAL_DEX_DHELMISE",
    "levelUpLearnset": "sDhelmiseLevelUpLearnset",
    "teachableLearnset": "sDhelmiseTeachableLearnset",
    "baseBST": 517,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Jangmo  O",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "BULLETPROOF",
      "SOUNDPROOF",
      "OVERCOAT"
    ],
    "id": "SPECIES_JANGMO_O",
    "family": "P_FAMILY_JANGMO_O",
    "baseHP": 45,
    "baseAttack": 55,
    "baseDefense": 65,
    "baseSpeed": 45,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_BULLETPROOF, ABILITY_SOUNDPROOF, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Jangmo-o\")",
    "natDexNum": "NATIONAL_DEX_JANGMO_O",
    "levelUpLearnset": "sJangmoOLevelUpLearnset",
    "teachableLearnset": "sJangmoOTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_HAKAMO_O})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hakamo  O",
    "parsedTypes": [
      "DRAGON",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BULLETPROOF",
      "SOUNDPROOF",
      "OVERCOAT"
    ],
    "id": "SPECIES_HAKAMO_O",
    "family": "P_FAMILY_JANGMO_O",
    "baseHP": 55,
    "baseAttack": 75,
    "baseDefense": 90,
    "baseSpeed": 65,
    "baseSpAttack": 65,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BULLETPROOF, ABILITY_SOUNDPROOF, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Hakamo-o\")",
    "natDexNum": "NATIONAL_DEX_HAKAMO_O",
    "levelUpLearnset": "sHakamoOLevelUpLearnset",
    "teachableLearnset": "sHakamoOTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 45, SPECIES_KOMMO_O}",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kommo  O",
    "parsedTypes": [
      "DRAGON",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BULLETPROOF",
      "SOUNDPROOF",
      "OVERCOAT"
    ],
    "id": "SPECIES_KOMMO_O",
    "family": "P_FAMILY_JANGMO_O",
    "baseHP": 75,
    "baseAttack": 110,
    "baseDefense": 125,
    "baseSpeed": 85,
    "baseSpAttack": 100,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BULLETPROOF, ABILITY_SOUNDPROOF, ABILITY_OVERCOAT }",
    "speciesName": "_(\"Kommo-o\")",
    "natDexNum": "NATIONAL_DEX_KOMMO_O",
    "levelUpLearnset": "sKommoOLevelUpLearnset",
    "teachableLearnset": "sKommoOTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tapu  Koko",
    "parsedTypes": [
      "ELECTRIC",
      "FAIRY"
    ],
    "parsedAbilities": [
      "ELECTRIC_SURGE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_TAPU_KOKO",
    "family": "P_FAMILY_TAPU_KOKO",
    "baseHP": 70,
    "baseAttack": 115,
    "baseDefense": 85,
    "baseSpeed": 130,
    "baseSpAttack": 95,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FAIRY)",
    "abilities": "{ ABILITY_ELECTRIC_SURGE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Tapu Koko\")",
    "natDexNum": "NATIONAL_DEX_TAPU_KOKO",
    "levelUpLearnset": "sTapuKokoLevelUpLearnset",
    "teachableLearnset": "sTapuKokoTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tapu  Lele",
    "parsedTypes": [
      "PSYCHIC",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PSYCHIC_SURGE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_TAPU_LELE",
    "family": "P_FAMILY_TAPU_LELE",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 75,
    "baseSpeed": 95,
    "baseSpAttack": 130,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PSYCHIC_SURGE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Tapu Lele\")",
    "natDexNum": "NATIONAL_DEX_TAPU_LELE",
    "levelUpLearnset": "sTapuLeleLevelUpLearnset",
    "teachableLearnset": "sTapuLeleTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tapu  Bulu",
    "parsedTypes": [
      "GRASS",
      "FAIRY"
    ],
    "parsedAbilities": [
      "GRASSY_SURGE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_TAPU_BULU",
    "family": "P_FAMILY_TAPU_BULU",
    "baseHP": 70,
    "baseAttack": 130,
    "baseDefense": 115,
    "baseSpeed": 75,
    "baseSpAttack": 85,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FAIRY)",
    "abilities": "{ ABILITY_GRASSY_SURGE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Tapu Bulu\")",
    "natDexNum": "NATIONAL_DEX_TAPU_BULU",
    "levelUpLearnset": "sTapuBuluLevelUpLearnset",
    "teachableLearnset": "sTapuBuluTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tapu  Fini",
    "parsedTypes": [
      "WATER",
      "FAIRY"
    ],
    "parsedAbilities": [
      "MISTY_SURGE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_TAPU_FINI",
    "family": "P_FAMILY_TAPU_FINI",
    "baseHP": 70,
    "baseAttack": 75,
    "baseDefense": 115,
    "baseSpeed": 85,
    "baseSpAttack": 95,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FAIRY)",
    "abilities": "{ ABILITY_MISTY_SURGE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Tapu Fini\")",
    "natDexNum": "NATIONAL_DEX_TAPU_FINI",
    "levelUpLearnset": "sTapuFiniLevelUpLearnset",
    "teachableLearnset": "sTapuFiniTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cosmog",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "UNAWARE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_COSMOG",
    "family": "P_FAMILY_COSMOG",
    "baseHP": 43,
    "baseAttack": 29,
    "baseDefense": 31,
    "baseSpeed": 37,
    "baseSpAttack": 29,
    "baseSpDefense": 31,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_UNAWARE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cosmog\")",
    "natDexNum": "NATIONAL_DEX_COSMOG",
    "levelUpLearnset": "sCosmogLevelUpLearnset",
    "teachableLearnset": "sCosmogTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 43, SPECIES_COSMOEM})",
    "baseBST": 200,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cosmoem",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "STURDY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_COSMOEM",
    "family": "P_FAMILY_COSMOG",
    "baseHP": 43,
    "baseAttack": 29,
    "baseDefense": 131,
    "baseSpeed": 37,
    "baseSpAttack": 29,
    "baseSpDefense": 131,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_STURDY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cosmoem\")",
    "natDexNum": "NATIONAL_DEX_COSMOEM",
    "levelUpLearnset": "sCosmoemLevelUpLearnset",
    "teachableLearnset": "sCosmoemTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 53, SPECIES_SOLGALEO, CONDITIONS({IF_NOT_TIME, TIME_NIGHT})}",
    "baseBST": 400,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Solgaleo",
    "parsedTypes": [
      "PSYCHIC",
      "STEEL"
    ],
    "parsedAbilities": [
      "FULL_METAL_BODY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SOLGALEO",
    "family": "P_FAMILY_COSMOG",
    "baseHP": 137,
    "baseAttack": 137,
    "baseDefense": 107,
    "baseSpeed": 97,
    "baseSpAttack": 113,
    "baseSpDefense": 89,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_STEEL)",
    "abilities": "{ ABILITY_FULL_METAL_BODY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Solgaleo\")",
    "natDexNum": "NATIONAL_DEX_SOLGALEO",
    "levelUpLearnset": "sSolgaleoLevelUpLearnset",
    "teachableLearnset": "sSolgaleoTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lunala",
    "parsedTypes": [
      "PSYCHIC",
      "GHOST"
    ],
    "parsedAbilities": [
      "SHADOW_SHIELD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_LUNALA",
    "family": "P_FAMILY_COSMOG",
    "baseHP": 137,
    "baseAttack": 113,
    "baseDefense": 89,
    "baseSpeed": 97,
    "baseSpAttack": 137,
    "baseSpDefense": 107,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_GHOST)",
    "abilities": "{ ABILITY_SHADOW_SHIELD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Lunala\")",
    "natDexNum": "NATIONAL_DEX_LUNALA",
    "levelUpLearnset": "sLunalaLevelUpLearnset",
    "teachableLearnset": "sLunalaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nihilego",
    "parsedTypes": [
      "ROCK",
      "POISON"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_NIHILEGO",
    "family": "P_FAMILY_NIHILEGO",
    "baseHP": 109,
    "baseAttack": 53,
    "baseDefense": 47,
    "baseSpeed": 103,
    "baseSpAttack": 127,
    "baseSpDefense": 131,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_POISON)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Nihilego\")",
    "natDexNum": "NATIONAL_DEX_NIHILEGO",
    "levelUpLearnset": "sNihilegoLevelUpLearnset",
    "teachableLearnset": "sNihilegoTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Buzzwole",
    "parsedTypes": [
      "BUG",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_BUZZWOLE",
    "family": "P_FAMILY_BUZZWOLE",
    "baseHP": 107,
    "baseAttack": 139,
    "baseDefense": 139,
    "baseSpeed": 79,
    "baseSpAttack": 53,
    "baseSpDefense": 53,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Buzzwole\")",
    "natDexNum": "NATIONAL_DEX_BUZZWOLE",
    "levelUpLearnset": "sBuzzwoleLevelUpLearnset",
    "teachableLearnset": "sBuzzwoleTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pheromosa",
    "parsedTypes": [
      "BUG",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PHEROMOSA",
    "family": "P_FAMILY_PHEROMOSA",
    "baseHP": 71,
    "baseAttack": 137,
    "baseDefense": 37,
    "baseSpeed": 151,
    "baseSpAttack": 137,
    "baseSpDefense": 37,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Pheromosa\")",
    "natDexNum": "NATIONAL_DEX_PHEROMOSA",
    "levelUpLearnset": "sPheromosaLevelUpLearnset",
    "teachableLearnset": "sPheromosaTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Xurkitree",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_XURKITREE",
    "family": "P_FAMILY_XURKITREE",
    "baseHP": 83,
    "baseAttack": 89,
    "baseDefense": 71,
    "baseSpeed": 83,
    "baseSpAttack": 173,
    "baseSpDefense": 71,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Xurkitree\")",
    "natDexNum": "NATIONAL_DEX_XURKITREE",
    "levelUpLearnset": "sXurkitreeLevelUpLearnset",
    "teachableLearnset": "sXurkitreeTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Celesteela",
    "parsedTypes": [
      "STEEL",
      "FLYING"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CELESTEELA",
    "family": "P_FAMILY_CELESTEELA",
    "baseHP": 97,
    "baseAttack": 101,
    "baseDefense": 103,
    "baseSpeed": 61,
    "baseSpAttack": 107,
    "baseSpDefense": 101,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_FLYING)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Celesteela\")",
    "natDexNum": "NATIONAL_DEX_CELESTEELA",
    "levelUpLearnset": "sCelesteelaLevelUpLearnset",
    "teachableLearnset": "sCelesteelaTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kartana",
    "parsedTypes": [
      "GRASS",
      "STEEL"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KARTANA",
    "family": "P_FAMILY_KARTANA",
    "baseHP": 59,
    "baseAttack": 181,
    "baseDefense": 131,
    "baseSpeed": 109,
    "baseSpAttack": 59,
    "baseSpDefense": 31,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_STEEL)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kartana\")",
    "natDexNum": "NATIONAL_DEX_KARTANA",
    "levelUpLearnset": "sKartanaLevelUpLearnset",
    "teachableLearnset": "sKartanaTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Guzzlord",
    "parsedTypes": [
      "DARK",
      "DRAGON"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GUZZLORD",
    "family": "P_FAMILY_GUZZLORD",
    "baseHP": 223,
    "baseAttack": 101,
    "baseDefense": 53,
    "baseSpeed": 43,
    "baseSpAttack": 97,
    "baseSpDefense": 53,
    "types": "MON_TYPES(TYPE_DARK, TYPE_DRAGON)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Guzzlord\")",
    "natDexNum": "NATIONAL_DEX_GUZZLORD",
    "levelUpLearnset": "sGuzzlordLevelUpLearnset",
    "teachableLearnset": "sGuzzlordTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Necrozma",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PRISM_ARMOR",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_NECROZMA",
    "family": "P_FAMILY_NECROZMA",
    "baseHP": 97,
    "baseAttack": 107,
    "baseDefense": 101,
    "baseSpeed": 79,
    "baseSpAttack": 127,
    "baseSpDefense": 89,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PRISM_ARMOR, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Necrozma\")",
    "natDexNum": "NATIONAL_DEX_NECROZMA",
    "levelUpLearnset": "sNecrozmaLevelUpLearnset",
    "teachableLearnset": "sNecrozmaTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Necrozma  Dusk  Mane",
    "parsedTypes": [
      "PSYCHIC",
      "STEEL"
    ],
    "parsedAbilities": [
      "PRISM_ARMOR",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_NECROZMA_DUSK_MANE",
    "family": "P_FAMILY_NECROZMA",
    "baseHP": 97,
    "baseAttack": 157,
    "baseDefense": 127,
    "baseSpeed": 77,
    "baseSpAttack": 113,
    "baseSpDefense": 109,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_STEEL)",
    "abilities": "{ ABILITY_PRISM_ARMOR, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Necrozma\")",
    "natDexNum": "NATIONAL_DEX_NECROZMA",
    "levelUpLearnset": "sNecrozmaLevelUpLearnset",
    "teachableLearnset": "sNecrozmaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Necrozma  Dawn  Wings",
    "parsedTypes": [
      "PSYCHIC",
      "GHOST"
    ],
    "parsedAbilities": [
      "PRISM_ARMOR",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_NECROZMA_DAWN_WINGS",
    "family": "P_FAMILY_NECROZMA",
    "baseHP": 97,
    "baseAttack": 113,
    "baseDefense": 109,
    "baseSpeed": 77,
    "baseSpAttack": 157,
    "baseSpDefense": 127,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_GHOST)",
    "abilities": "{ ABILITY_PRISM_ARMOR, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Necrozma\")",
    "natDexNum": "NATIONAL_DEX_NECROZMA",
    "levelUpLearnset": "sNecrozmaLevelUpLearnset",
    "teachableLearnset": "sNecrozmaTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Necrozma  Ultra",
    "parsedTypes": [
      "PSYCHIC",
      "DRAGON"
    ],
    "parsedAbilities": [
      "NEUROFORCE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_NECROZMA_ULTRA",
    "family": "P_FAMILY_NECROZMA",
    "baseHP": 97,
    "baseAttack": 167,
    "baseDefense": 97,
    "baseSpeed": 129,
    "baseSpAttack": 167,
    "baseSpDefense": 97,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_DRAGON)",
    "abilities": "{ ABILITY_NEUROFORCE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Necrozma\")",
    "natDexNum": "NATIONAL_DEX_NECROZMA",
    "levelUpLearnset": "sNecrozmaLevelUpLearnset",
    "teachableLearnset": "sNecrozmaTeachableLearnset",
    "baseBST": 754,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magearna",
    "parsedTypes": [
      "STEEL",
      "FAIRY"
    ],
    "parsedAbilities": [
      "SOUL_HEART",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MAGEARNA",
    "family": "P_FAMILY_MAGEARNA",
    "baseHP": 80,
    "baseAttack": 95,
    "baseDefense": 115,
    "baseSpeed": 65,
    "baseSpAttack": 130,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_FAIRY)",
    "abilities": "{ ABILITY_SOUL_HEART, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Magearna\")",
    "natDexNum": "NATIONAL_DEX_MAGEARNA",
    "levelUpLearnset": "sMagearnaLevelUpLearnset",
    "teachableLearnset": "sMagearnaTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Magearna  Original",
    "parsedTypes": [
      "STEEL",
      "FAIRY"
    ],
    "parsedAbilities": [
      "SOUL_HEART",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MAGEARNA_ORIGINAL",
    "family": "P_FAMILY_MAGEARNA",
    "baseHP": 80,
    "baseAttack": 95,
    "baseDefense": 115,
    "baseSpeed": 65,
    "baseSpAttack": 130,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_FAIRY)",
    "abilities": "{ ABILITY_SOUL_HEART, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Magearna\")",
    "natDexNum": "NATIONAL_DEX_MAGEARNA",
    "levelUpLearnset": "sMagearnaLevelUpLearnset",
    "teachableLearnset": "sMagearnaTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Marshadow",
    "parsedTypes": [
      "FIGHTING",
      "GHOST"
    ],
    "parsedAbilities": [
      "TECHNICIAN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MARSHADOW",
    "family": "P_FAMILY_MARSHADOW",
    "baseHP": 90,
    "baseAttack": 125,
    "baseDefense": 80,
    "baseSpeed": 125,
    "baseSpAttack": 90,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_GHOST)",
    "abilities": "{ ABILITY_TECHNICIAN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Marshadow\")",
    "natDexNum": "NATIONAL_DEX_MARSHADOW",
    "levelUpLearnset": "sMarshadowLevelUpLearnset",
    "teachableLearnset": "sMarshadowTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poipole",
    "parsedTypes": [
      "POISON"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_POIPOLE",
    "family": "P_FAMILY_POIPOLE",
    "baseHP": 67,
    "baseAttack": 73,
    "baseDefense": 67,
    "baseSpeed": 73,
    "baseSpAttack": 73,
    "baseSpDefense": 67,
    "types": "MON_TYPES(TYPE_POISON)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Poipole\")",
    "natDexNum": "NATIONAL_DEX_POIPOLE",
    "levelUpLearnset": "sPoipoleLevelUpLearnset",
    "teachableLearnset": "sPoipoleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_NAGANADEL, CONDITIONS({IF_KNOWS_MOVE, MOVE_DRAGON_PULSE})})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Naganadel",
    "parsedTypes": [
      "POISON",
      "DRAGON"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_NAGANADEL",
    "family": "P_FAMILY_POIPOLE",
    "baseHP": 73,
    "baseAttack": 73,
    "baseDefense": 73,
    "baseSpeed": 121,
    "baseSpAttack": 127,
    "baseSpDefense": 73,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DRAGON)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Naganadel\")",
    "natDexNum": "NATIONAL_DEX_NAGANADEL",
    "levelUpLearnset": "sNaganadelLevelUpLearnset",
    "teachableLearnset": "sNaganadelTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stakataka",
    "parsedTypes": [
      "ROCK",
      "STEEL"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_STAKATAKA",
    "family": "P_FAMILY_STAKATAKA",
    "baseHP": 61,
    "baseAttack": 131,
    "baseDefense": 211,
    "baseSpeed": 13,
    "baseSpAttack": 53,
    "baseSpDefense": 101,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_STEEL)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Stakataka\")",
    "natDexNum": "NATIONAL_DEX_STAKATAKA",
    "levelUpLearnset": "sStakatakaLevelUpLearnset",
    "teachableLearnset": "sStakatakaTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blacephalon",
    "parsedTypes": [
      "FIRE",
      "GHOST"
    ],
    "parsedAbilities": [
      "BEAST_BOOST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_BLACEPHALON",
    "family": "P_FAMILY_BLACEPHALON",
    "baseHP": 53,
    "baseAttack": 127,
    "baseDefense": 53,
    "baseSpeed": 107,
    "baseSpAttack": 151,
    "baseSpDefense": 79,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GHOST)",
    "abilities": "{ ABILITY_BEAST_BOOST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Blacephalon\")",
    "natDexNum": "NATIONAL_DEX_BLACEPHALON",
    "levelUpLearnset": "sBlacephalonLevelUpLearnset",
    "teachableLearnset": "sBlacephalonTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zeraora",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZERAORA",
    "family": "P_FAMILY_ZERAORA",
    "baseHP": 88,
    "baseAttack": 112,
    "baseDefense": 75,
    "baseSpeed": 143,
    "baseSpAttack": 102,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zeraora\")",
    "natDexNum": "NATIONAL_DEX_ZERAORA",
    "levelUpLearnset": "sZeraoraLevelUpLearnset",
    "teachableLearnset": "sZeraoraTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meltan",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "MAGNET_PULL",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MELTAN",
    "family": "P_FAMILY_MELTAN",
    "baseHP": 46,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 34,
    "baseSpAttack": 55,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_MAGNET_PULL, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Meltan\")",
    "natDexNum": "NATIONAL_DEX_MELTAN",
    "levelUpLearnset": "sMeltanLevelUpLearnset",
    "teachableLearnset": "sMeltanTeachableLearnset",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Melmetal",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "IRON_FIST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MELMETAL",
    "family": "P_FAMILY_MELTAN",
    "baseHP": 135,
    "baseAttack": 143,
    "baseDefense": 143,
    "baseSpeed": 34,
    "baseSpAttack": 80,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_IRON_FIST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Melmetal\")",
    "natDexNum": "NATIONAL_DEX_MELMETAL",
    "levelUpLearnset": "sMelmetalLevelUpLearnset",
    "teachableLearnset": "sMelmetalTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grookey",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "GRASSY_SURGE"
    ],
    "id": "SPECIES_GROOKEY",
    "family": "P_FAMILY_GROOKEY",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 50,
    "baseSpeed": 65,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_GRASSY_SURGE }",
    "speciesName": "_(\"Grookey\")",
    "natDexNum": "NATIONAL_DEX_GROOKEY",
    "levelUpLearnset": "sGrookeyLevelUpLearnset",
    "teachableLearnset": "sGrookeyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_THWACKEY})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Thwackey",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "GRASSY_SURGE"
    ],
    "id": "SPECIES_THWACKEY",
    "family": "P_FAMILY_GROOKEY",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 70,
    "baseSpeed": 80,
    "baseSpAttack": 55,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_GRASSY_SURGE }",
    "speciesName": "_(\"Thwackey\")",
    "natDexNum": "NATIONAL_DEX_THWACKEY",
    "levelUpLearnset": "sThwackeyLevelUpLearnset",
    "teachableLearnset": "sThwackeyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_RILLABOOM})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rillaboom",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "GRASSY_SURGE"
    ],
    "id": "SPECIES_RILLABOOM",
    "family": "P_FAMILY_GROOKEY",
    "baseHP": 100,
    "baseAttack": 125,
    "baseDefense": 90,
    "baseSpeed": 85,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_GRASSY_SURGE }",
    "speciesName": "_(\"Rillaboom\")",
    "natDexNum": "NATIONAL_DEX_RILLABOOM",
    "levelUpLearnset": "sRillaboomLevelUpLearnset",
    "teachableLearnset": "sRillaboomTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scorbunny",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "LIBERO"
    ],
    "id": "SPECIES_SCORBUNNY",
    "family": "P_FAMILY_SCORBUNNY",
    "baseHP": 50,
    "baseAttack": 71,
    "baseDefense": 40,
    "baseSpeed": 69,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_LIBERO }",
    "speciesName": "_(\"Scorbunny\")",
    "natDexNum": "NATIONAL_DEX_SCORBUNNY",
    "levelUpLearnset": "sScorbunnyLevelUpLearnset",
    "teachableLearnset": "sScorbunnyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_RABOOT})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raboot",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "LIBERO"
    ],
    "id": "SPECIES_RABOOT",
    "family": "P_FAMILY_SCORBUNNY",
    "baseHP": 65,
    "baseAttack": 86,
    "baseDefense": 60,
    "baseSpeed": 94,
    "baseSpAttack": 55,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_LIBERO }",
    "speciesName": "_(\"Raboot\")",
    "natDexNum": "NATIONAL_DEX_RABOOT",
    "levelUpLearnset": "sRabootLevelUpLearnset",
    "teachableLearnset": "sRabootTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_CINDERACE})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cinderace",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "LIBERO"
    ],
    "id": "SPECIES_CINDERACE",
    "family": "P_FAMILY_SCORBUNNY",
    "baseHP": 80,
    "baseAttack": 116,
    "baseDefense": 75,
    "baseSpeed": 119,
    "baseSpAttack": 65,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_LIBERO }",
    "speciesName": "_(\"Cinderace\")",
    "natDexNum": "NATIONAL_DEX_CINDERACE",
    "levelUpLearnset": "sCinderaceLevelUpLearnset",
    "teachableLearnset": "sCinderaceTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sobble",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SNIPER"
    ],
    "id": "SPECIES_SOBBLE",
    "family": "P_FAMILY_SOBBLE",
    "baseHP": 50,
    "baseAttack": 40,
    "baseDefense": 40,
    "baseSpeed": 70,
    "baseSpAttack": 70,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SNIPER }",
    "speciesName": "_(\"Sobble\")",
    "natDexNum": "NATIONAL_DEX_SOBBLE",
    "levelUpLearnset": "sSobbleLevelUpLearnset",
    "teachableLearnset": "sSobbleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_DRIZZILE})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drizzile",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SNIPER"
    ],
    "id": "SPECIES_DRIZZILE",
    "family": "P_FAMILY_SOBBLE",
    "baseHP": 65,
    "baseAttack": 60,
    "baseDefense": 55,
    "baseSpeed": 90,
    "baseSpAttack": 95,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SNIPER }",
    "speciesName": "_(\"Drizzile\")",
    "natDexNum": "NATIONAL_DEX_DRIZZILE",
    "levelUpLearnset": "sDrizzileLevelUpLearnset",
    "teachableLearnset": "sDrizzileTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_INTELEON})",
    "baseBST": 420,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Inteleon",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "SNIPER"
    ],
    "id": "SPECIES_INTELEON",
    "family": "P_FAMILY_SOBBLE",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 65,
    "baseSpeed": 120,
    "baseSpAttack": 125,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_SNIPER }",
    "speciesName": "_(\"Inteleon\")",
    "natDexNum": "NATIONAL_DEX_INTELEON",
    "levelUpLearnset": "sInteleonLevelUpLearnset",
    "teachableLearnset": "sInteleonTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skwovet",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CHEEK_POUCH",
      "NONE",
      "GLUTTONY"
    ],
    "id": "SPECIES_SKWOVET",
    "family": "P_FAMILY_SKWOVET",
    "baseHP": 70,
    "baseAttack": 55,
    "baseDefense": 55,
    "baseSpeed": 25,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CHEEK_POUCH, ABILITY_NONE, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Skwovet\")",
    "natDexNum": "NATIONAL_DEX_SKWOVET",
    "levelUpLearnset": "sSkwovetLevelUpLearnset",
    "teachableLearnset": "sSkwovetTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_GREEDENT})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Greedent",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "CHEEK_POUCH",
      "NONE",
      "GLUTTONY"
    ],
    "id": "SPECIES_GREEDENT",
    "family": "P_FAMILY_SKWOVET",
    "baseHP": 120,
    "baseAttack": 95,
    "baseDefense": 95,
    "baseSpeed": 20,
    "baseSpAttack": 55,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_CHEEK_POUCH, ABILITY_NONE, ABILITY_GLUTTONY }",
    "speciesName": "_(\"Greedent\")",
    "natDexNum": "NATIONAL_DEX_GREEDENT",
    "levelUpLearnset": "sGreedentLevelUpLearnset",
    "teachableLearnset": "sGreedentTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rookidee",
    "parsedTypes": [
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "UNNERVE",
      "BIG_PECKS"
    ],
    "id": "SPECIES_ROOKIDEE",
    "family": "P_FAMILY_ROOKIDEE",
    "baseHP": 38,
    "baseAttack": 47,
    "baseDefense": 35,
    "baseSpeed": 57,
    "baseSpAttack": 33,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_UNNERVE, ABILITY_BIG_PECKS }",
    "speciesName": "_(\"Rookidee\")",
    "natDexNum": "NATIONAL_DEX_ROOKIDEE",
    "levelUpLearnset": "sRookideeLevelUpLearnset",
    "teachableLearnset": "sRookideeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_CORVISQUIRE})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Corvisquire",
    "parsedTypes": [
      "FLYING"
    ],
    "parsedAbilities": [
      "KEEN_EYE",
      "UNNERVE",
      "BIG_PECKS"
    ],
    "id": "SPECIES_CORVISQUIRE",
    "family": "P_FAMILY_ROOKIDEE",
    "baseHP": 68,
    "baseAttack": 67,
    "baseDefense": 55,
    "baseSpeed": 77,
    "baseSpAttack": 43,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_FLYING)",
    "abilities": "{ ABILITY_KEEN_EYE, ABILITY_UNNERVE, ABILITY_BIG_PECKS }",
    "speciesName": "_(\"Corvisquire\")",
    "natDexNum": "NATIONAL_DEX_CORVISQUIRE",
    "levelUpLearnset": "sCorvisquireLevelUpLearnset",
    "teachableLearnset": "sCorvisquireTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_CORVIKNIGHT})",
    "baseBST": 365,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Corviknight",
    "parsedTypes": [
      "FLYING",
      "STEEL"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "UNNERVE",
      "MIRROR_ARMOR"
    ],
    "id": "SPECIES_CORVIKNIGHT",
    "family": "P_FAMILY_ROOKIDEE",
    "baseHP": 98,
    "baseAttack": 87,
    "baseDefense": 105,
    "baseSpeed": 67,
    "baseSpAttack": 53,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_STEEL)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_UNNERVE, ABILITY_MIRROR_ARMOR }",
    "speciesName": "_(\"Corviknight\")",
    "natDexNum": "NATIONAL_DEX_CORVIKNIGHT",
    "levelUpLearnset": "sCorviknightLevelUpLearnset",
    "teachableLearnset": "sCorviknightTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Blipbug",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SWARM",
      "COMPOUND_EYES",
      "TELEPATHY"
    ],
    "id": "SPECIES_BLIPBUG",
    "family": "P_FAMILY_BLIPBUG",
    "baseHP": 25,
    "baseAttack": 20,
    "baseDefense": 20,
    "baseSpeed": 45,
    "baseSpAttack": 25,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SWARM, ABILITY_COMPOUND_EYES, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Blipbug\")",
    "natDexNum": "NATIONAL_DEX_BLIPBUG",
    "levelUpLearnset": "sBlipbugLevelUpLearnset",
    "teachableLearnset": "sBlipbugTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 10, SPECIES_DOTTLER})",
    "baseBST": 180,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dottler",
    "parsedTypes": [
      "BUG",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SWARM",
      "COMPOUND_EYES",
      "TELEPATHY"
    ],
    "id": "SPECIES_DOTTLER",
    "family": "P_FAMILY_BLIPBUG",
    "baseHP": 50,
    "baseAttack": 35,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 50,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_BUG, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SWARM, ABILITY_COMPOUND_EYES, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Dottler\")",
    "natDexNum": "NATIONAL_DEX_DOTTLER",
    "levelUpLearnset": "sDottlerLevelUpLearnset",
    "teachableLearnset": "sDottlerTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_ORBEETLE})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Orbeetle",
    "parsedTypes": [
      "BUG",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SWARM",
      "FRISK",
      "TELEPATHY"
    ],
    "id": "SPECIES_ORBEETLE",
    "family": "P_FAMILY_BLIPBUG",
    "baseHP": 60,
    "baseAttack": 45,
    "baseDefense": 110,
    "baseSpeed": 90,
    "baseSpAttack": 80,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_BUG, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SWARM, ABILITY_FRISK, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Orbeetle\")",
    "natDexNum": "NATIONAL_DEX_ORBEETLE",
    "levelUpLearnset": "sOrbeetleLevelUpLearnset",
    "teachableLearnset": "sOrbeetleTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nickit",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "UNBURDEN",
      "STAKEOUT"
    ],
    "id": "SPECIES_NICKIT",
    "family": "P_FAMILY_NICKIT",
    "baseHP": 40,
    "baseAttack": 28,
    "baseDefense": 28,
    "baseSpeed": 50,
    "baseSpAttack": 47,
    "baseSpDefense": 52,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_UNBURDEN, ABILITY_STAKEOUT }",
    "speciesName": "_(\"Nickit\")",
    "natDexNum": "NATIONAL_DEX_NICKIT",
    "levelUpLearnset": "sNickitLevelUpLearnset",
    "teachableLearnset": "sNickitTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_THIEVUL})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Thievul",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "UNBURDEN",
      "STAKEOUT"
    ],
    "id": "SPECIES_THIEVUL",
    "family": "P_FAMILY_NICKIT",
    "baseHP": 70,
    "baseAttack": 58,
    "baseDefense": 58,
    "baseSpeed": 90,
    "baseSpAttack": 87,
    "baseSpDefense": 92,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_UNBURDEN, ABILITY_STAKEOUT }",
    "speciesName": "_(\"Thievul\")",
    "natDexNum": "NATIONAL_DEX_THIEVUL",
    "levelUpLearnset": "sThievulLevelUpLearnset",
    "teachableLearnset": "sThievulTeachableLearnset",
    "baseBST": 455,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gossifleur",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "COTTON_DOWN",
      "REGENERATOR",
      "EFFECT_SPORE"
    ],
    "id": "SPECIES_GOSSIFLEUR",
    "family": "P_FAMILY_GOSSIFLEUR",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 60,
    "baseSpeed": 10,
    "baseSpAttack": 40,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_COTTON_DOWN, ABILITY_REGENERATOR, ABILITY_EFFECT_SPORE }",
    "speciesName": "_(\"Gossifleur\")",
    "natDexNum": "NATIONAL_DEX_GOSSIFLEUR",
    "levelUpLearnset": "sGossifleurLevelUpLearnset",
    "teachableLearnset": "sGossifleurTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 20, SPECIES_ELDEGOSS})",
    "baseBST": 250,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eldegoss",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "COTTON_DOWN",
      "REGENERATOR",
      "EFFECT_SPORE"
    ],
    "id": "SPECIES_ELDEGOSS",
    "family": "P_FAMILY_GOSSIFLEUR",
    "baseHP": 60,
    "baseAttack": 50,
    "baseDefense": 90,
    "baseSpeed": 60,
    "baseSpAttack": 80,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_COTTON_DOWN, ABILITY_REGENERATOR, ABILITY_EFFECT_SPORE }",
    "speciesName": "_(\"Eldegoss\")",
    "natDexNum": "NATIONAL_DEX_ELDEGOSS",
    "levelUpLearnset": "sEldegossLevelUpLearnset",
    "teachableLearnset": "sEldegossTeachableLearnset",
    "baseBST": 460,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wooloo",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "FLUFFY",
      "RUN_AWAY",
      "BULLETPROOF"
    ],
    "id": "SPECIES_WOOLOO",
    "family": "P_FAMILY_WOOLOO",
    "baseHP": 42,
    "baseAttack": 40,
    "baseDefense": 55,
    "baseSpeed": 48,
    "baseSpAttack": 40,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_FLUFFY, ABILITY_RUN_AWAY, ABILITY_BULLETPROOF }",
    "speciesName": "_(\"Wooloo\")",
    "natDexNum": "NATIONAL_DEX_WOOLOO",
    "levelUpLearnset": "sWoolooLevelUpLearnset",
    "teachableLearnset": "sWoolooTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_DUBWOOL})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dubwool",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "FLUFFY",
      "STEADFAST",
      "BULLETPROOF"
    ],
    "id": "SPECIES_DUBWOOL",
    "family": "P_FAMILY_WOOLOO",
    "baseHP": 72,
    "baseAttack": 80,
    "baseDefense": 100,
    "baseSpeed": 88,
    "baseSpAttack": 60,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_FLUFFY, ABILITY_STEADFAST, ABILITY_BULLETPROOF }",
    "speciesName": "_(\"Dubwool\")",
    "natDexNum": "NATIONAL_DEX_DUBWOOL",
    "levelUpLearnset": "sDubwoolLevelUpLearnset",
    "teachableLearnset": "sDubwoolTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chewtle",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "SHELL_ARMOR",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_CHEWTLE",
    "family": "P_FAMILY_CHEWTLE",
    "baseHP": 50,
    "baseAttack": 64,
    "baseDefense": 50,
    "baseSpeed": 44,
    "baseSpAttack": 38,
    "baseSpDefense": 38,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_SHELL_ARMOR, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Chewtle\")",
    "natDexNum": "NATIONAL_DEX_CHEWTLE",
    "levelUpLearnset": "sChewtleLevelUpLearnset",
    "teachableLearnset": "sChewtleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 22, SPECIES_DREDNAW})",
    "baseBST": 284,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drednaw",
    "parsedTypes": [
      "WATER",
      "ROCK"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "SHELL_ARMOR",
      "SWIFT_SWIM"
    ],
    "id": "SPECIES_DREDNAW",
    "family": "P_FAMILY_CHEWTLE",
    "baseHP": 90,
    "baseAttack": 115,
    "baseDefense": 90,
    "baseSpeed": 74,
    "baseSpAttack": 48,
    "baseSpDefense": 68,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ROCK)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_SHELL_ARMOR, ABILITY_SWIFT_SWIM }",
    "speciesName": "_(\"Drednaw\")",
    "natDexNum": "NATIONAL_DEX_DREDNAW",
    "levelUpLearnset": "sDrednawLevelUpLearnset",
    "teachableLearnset": "sDrednawTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Yamper",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "BALL_FETCH",
      "NONE",
      "RATTLED"
    ],
    "id": "SPECIES_YAMPER",
    "family": "P_FAMILY_YAMPER",
    "baseHP": 59,
    "baseAttack": 45,
    "baseDefense": 50,
    "baseSpeed": 26,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_BALL_FETCH, ABILITY_NONE, ABILITY_RATTLED }",
    "speciesName": "_(\"Yamper\")",
    "natDexNum": "NATIONAL_DEX_YAMPER",
    "levelUpLearnset": "sYamperLevelUpLearnset",
    "teachableLearnset": "sYamperTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_BOLTUND})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Boltund",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STRONG_JAW",
      "NONE",
      "COMPETITIVE"
    ],
    "id": "SPECIES_BOLTUND",
    "family": "P_FAMILY_YAMPER",
    "baseHP": 69,
    "baseAttack": 90,
    "baseDefense": 60,
    "baseSpeed": 121,
    "baseSpAttack": 90,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STRONG_JAW, ABILITY_NONE, ABILITY_COMPETITIVE }",
    "speciesName": "_(\"Boltund\")",
    "natDexNum": "NATIONAL_DEX_BOLTUND",
    "levelUpLearnset": "sBoltundLevelUpLearnset",
    "teachableLearnset": "sBoltundTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rolycoly",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "STEAM_ENGINE",
      "HEATPROOF",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_ROLYCOLY",
    "family": "P_FAMILY_ROLYCOLY",
    "baseHP": 30,
    "baseAttack": 40,
    "baseDefense": 50,
    "baseSpeed": 30,
    "baseSpAttack": 40,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_STEAM_ENGINE, ABILITY_HEATPROOF, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Rolycoly\")",
    "natDexNum": "NATIONAL_DEX_ROLYCOLY",
    "levelUpLearnset": "sRolycolyLevelUpLearnset",
    "teachableLearnset": "sRolycolyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_CARKOL})",
    "baseBST": 240,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Carkol",
    "parsedTypes": [
      "ROCK",
      "FIRE"
    ],
    "parsedAbilities": [
      "STEAM_ENGINE",
      "FLAME_BODY",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_CARKOL",
    "family": "P_FAMILY_ROLYCOLY",
    "baseHP": 80,
    "baseAttack": 60,
    "baseDefense": 90,
    "baseSpeed": 50,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FIRE)",
    "abilities": "{ ABILITY_STEAM_ENGINE, ABILITY_FLAME_BODY, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Carkol\")",
    "natDexNum": "NATIONAL_DEX_CARKOL",
    "levelUpLearnset": "sCarkolLevelUpLearnset",
    "teachableLearnset": "sCarkolTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_COALOSSAL})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Coalossal",
    "parsedTypes": [
      "ROCK",
      "FIRE"
    ],
    "parsedAbilities": [
      "STEAM_ENGINE",
      "FLAME_BODY",
      "FLASH_FIRE"
    ],
    "id": "SPECIES_COALOSSAL",
    "family": "P_FAMILY_ROLYCOLY",
    "baseHP": 110,
    "baseAttack": 80,
    "baseDefense": 120,
    "baseSpeed": 30,
    "baseSpAttack": 80,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_FIRE)",
    "abilities": "{ ABILITY_STEAM_ENGINE, ABILITY_FLAME_BODY, ABILITY_FLASH_FIRE }",
    "speciesName": "_(\"Coalossal\")",
    "natDexNum": "NATIONAL_DEX_COALOSSAL",
    "levelUpLearnset": "sCoalossalLevelUpLearnset",
    "teachableLearnset": "sCoalossalTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Applin",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "RIPEN",
      "GLUTTONY",
      "BULLETPROOF"
    ],
    "id": "SPECIES_APPLIN",
    "family": "P_FAMILY_APPLIN",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 80,
    "baseSpeed": 20,
    "baseSpAttack": 40,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_RIPEN, ABILITY_GLUTTONY, ABILITY_BULLETPROOF }",
    "speciesName": "_(\"Applin\")",
    "natDexNum": "NATIONAL_DEX_APPLIN",
    "levelUpLearnset": "sApplinLevelUpLearnset",
    "teachableLearnset": "sApplinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_TART_APPLE, SPECIES_FLAPPLE}",
    "baseBST": 260,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flapple",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "RIPEN",
      "GLUTTONY",
      "HUSTLE"
    ],
    "id": "SPECIES_FLAPPLE",
    "family": "P_FAMILY_APPLIN",
    "baseHP": 70,
    "baseAttack": 110,
    "baseDefense": 80,
    "baseSpeed": 70,
    "baseSpAttack": 95,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_RIPEN, ABILITY_GLUTTONY, ABILITY_HUSTLE }",
    "speciesName": "_(\"Flapple\")",
    "natDexNum": "NATIONAL_DEX_FLAPPLE",
    "levelUpLearnset": "sFlappleLevelUpLearnset",
    "teachableLearnset": "sFlappleTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Appletun",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "RIPEN",
      "GLUTTONY",
      "THICK_FAT"
    ],
    "id": "SPECIES_APPLETUN",
    "family": "P_FAMILY_APPLIN",
    "baseHP": 110,
    "baseAttack": 85,
    "baseDefense": 80,
    "baseSpeed": 30,
    "baseSpAttack": 100,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_RIPEN, ABILITY_GLUTTONY, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Appletun\")",
    "natDexNum": "NATIONAL_DEX_APPLETUN",
    "levelUpLearnset": "sAppletunLevelUpLearnset",
    "teachableLearnset": "sAppletunTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dipplin",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "SUPERSWEET_SYRUP",
      "GLUTTONY",
      "STICKY_HOLD"
    ],
    "id": "SPECIES_DIPPLIN",
    "family": "P_FAMILY_APPLIN",
    "baseHP": 80,
    "baseAttack": 80,
    "baseDefense": 110,
    "baseSpeed": 40,
    "baseSpAttack": 95,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_SUPERSWEET_SYRUP, ABILITY_GLUTTONY, ABILITY_STICKY_HOLD }",
    "speciesName": "_(\"Dipplin\")",
    "natDexNum": "NATIONAL_DEX_DIPPLIN",
    "levelUpLearnset": "sDipplinLevelUpLearnset",
    "teachableLearnset": "sDipplinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_HYDRAPPLE, CONDITIONS({IF_KNOWS_MOVE, MOVE_DRAGON_CHEER})})",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hydrapple",
    "parsedTypes": [
      "GRASS",
      "DRAGON"
    ],
    "parsedAbilities": [
      "SUPERSWEET_SYRUP",
      "REGENERATOR",
      "STICKY_HOLD"
    ],
    "id": "SPECIES_HYDRAPPLE",
    "family": "P_FAMILY_APPLIN",
    "baseHP": 106,
    "baseAttack": 80,
    "baseDefense": 110,
    "baseSpeed": 44,
    "baseSpAttack": 120,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DRAGON)",
    "abilities": "{ ABILITY_SUPERSWEET_SYRUP, ABILITY_REGENERATOR, ABILITY_STICKY_HOLD }",
    "speciesName": "_(\"Hydrapple\")",
    "natDexNum": "NATIONAL_DEX_HYDRAPPLE",
    "levelUpLearnset": "sHydrappleLevelUpLearnset",
    "teachableLearnset": "sHydrappleTeachableLearnset",
    "baseBST": 540,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Silicobra",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_SPIT",
      "SHED_SKIN",
      "SAND_VEIL"
    ],
    "id": "SPECIES_SILICOBRA",
    "family": "P_FAMILY_SILICOBRA",
    "baseHP": 52,
    "baseAttack": 57,
    "baseDefense": 75,
    "baseSpeed": 46,
    "baseSpAttack": 35,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_SPIT, ABILITY_SHED_SKIN, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Silicobra\")",
    "natDexNum": "NATIONAL_DEX_SILICOBRA",
    "levelUpLearnset": "sSilicobraLevelUpLearnset",
    "teachableLearnset": "sSilicobraTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SANDACONDA})",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandaconda",
    "parsedTypes": [
      "GROUND"
    ],
    "parsedAbilities": [
      "SAND_SPIT",
      "SHED_SKIN",
      "SAND_VEIL"
    ],
    "id": "SPECIES_SANDACONDA",
    "family": "P_FAMILY_SILICOBRA",
    "baseHP": 72,
    "baseAttack": 107,
    "baseDefense": 125,
    "baseSpeed": 71,
    "baseSpAttack": 65,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GROUND)",
    "abilities": "{ ABILITY_SAND_SPIT, ABILITY_SHED_SKIN, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Sandaconda\")",
    "natDexNum": "NATIONAL_DEX_SANDACONDA",
    "levelUpLearnset": "sSandacondaLevelUpLearnset",
    "teachableLearnset": "sSandacondaTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cramorant",
    "parsedTypes": [
      "FLYING",
      "WATER"
    ],
    "parsedAbilities": [
      "GULP_MISSILE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CRAMORANT",
    "family": "P_FAMILY_CRAMORANT",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 55,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_WATER)",
    "abilities": "{ ABILITY_GULP_MISSILE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cramorant\")",
    "natDexNum": "NATIONAL_DEX_CRAMORANT",
    "levelUpLearnset": "sCramorantLevelUpLearnset",
    "teachableLearnset": "sCramorantTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cramorant  Gulping",
    "parsedTypes": [
      "FLYING",
      "WATER"
    ],
    "parsedAbilities": [
      "GULP_MISSILE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CRAMORANT_GULPING",
    "family": "P_FAMILY_CRAMORANT",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 55,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_WATER)",
    "abilities": "{ ABILITY_GULP_MISSILE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cramorant\")",
    "natDexNum": "NATIONAL_DEX_CRAMORANT",
    "levelUpLearnset": "sCramorantLevelUpLearnset",
    "teachableLearnset": "sCramorantTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cramorant  Gorging",
    "parsedTypes": [
      "FLYING",
      "WATER"
    ],
    "parsedAbilities": [
      "GULP_MISSILE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CRAMORANT_GORGING",
    "family": "P_FAMILY_CRAMORANT",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 55,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_WATER)",
    "abilities": "{ ABILITY_GULP_MISSILE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Cramorant\")",
    "natDexNum": "NATIONAL_DEX_CRAMORANT",
    "levelUpLearnset": "sCramorantLevelUpLearnset",
    "teachableLearnset": "sCramorantTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arrokuda",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "PROPELLER_TAIL"
    ],
    "id": "SPECIES_ARROKUDA",
    "family": "P_FAMILY_ARROKUDA",
    "baseHP": 41,
    "baseAttack": 63,
    "baseDefense": 40,
    "baseSpeed": 66,
    "baseSpAttack": 40,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_PROPELLER_TAIL }",
    "speciesName": "_(\"Arrokuda\")",
    "natDexNum": "NATIONAL_DEX_ARROKUDA",
    "levelUpLearnset": "sArrokudaLevelUpLearnset",
    "teachableLearnset": "sArrokudaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_BARRASKEWDA})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Barraskewda",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "SWIFT_SWIM",
      "NONE",
      "PROPELLER_TAIL"
    ],
    "id": "SPECIES_BARRASKEWDA",
    "family": "P_FAMILY_ARROKUDA",
    "baseHP": 61,
    "baseAttack": 123,
    "baseDefense": 60,
    "baseSpeed": 136,
    "baseSpAttack": 60,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_SWIFT_SWIM, ABILITY_NONE, ABILITY_PROPELLER_TAIL }",
    "speciesName": "_(\"Barraskewda\")",
    "natDexNum": "NATIONAL_DEX_BARRASKEWDA",
    "levelUpLearnset": "sBarraskewdaLevelUpLearnset",
    "teachableLearnset": "sBarraskewdaTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toxel",
    "parsedTypes": [
      "ELECTRIC",
      "POISON"
    ],
    "parsedAbilities": [
      "RATTLED",
      "STATIC",
      "KLUTZ"
    ],
    "id": "SPECIES_TOXEL",
    "family": "P_FAMILY_TOXEL",
    "baseHP": 40,
    "baseAttack": 38,
    "baseDefense": 35,
    "baseSpeed": 40,
    "baseSpAttack": 54,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_POISON)",
    "abilities": "{ ABILITY_RATTLED, ABILITY_STATIC, ABILITY_KLUTZ }",
    "speciesName": "_(\"Toxel\")",
    "natDexNum": "NATIONAL_DEX_TOXEL",
    "levelUpLearnset": "sToxelLevelUpLearnset",
    "teachableLearnset": "sToxelTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_TOXTRICITY_AMPED, CONDITIONS({IF_AMPED_NATURE})}",
    "baseBST": 242,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toxtricity  Amped",
    "parsedTypes": [
      "ELECTRIC",
      "POISON"
    ],
    "parsedAbilities": [
      "PUNK_ROCK",
      "PLUS",
      "TECHNICIAN"
    ],
    "id": "SPECIES_TOXTRICITY_AMPED",
    "family": "P_FAMILY_TOXEL",
    "baseHP": 75,
    "baseAttack": 98,
    "baseDefense": 70,
    "baseSpeed": 75,
    "baseSpAttack": 114,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_POISON)",
    "abilities": "{ ABILITY_PUNK_ROCK, ABILITY_PLUS, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Toxtricity\")",
    "natDexNum": "NATIONAL_DEX_TOXTRICITY",
    "levelUpLearnset": "sToxtricityAmpedLevelUpLearnset",
    "teachableLearnset": "sToxtricityAmpedTeachableLearnset",
    "baseBST": 502,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toxtricity  Low  Key",
    "parsedTypes": [
      "ELECTRIC",
      "POISON"
    ],
    "parsedAbilities": [
      "PUNK_ROCK",
      "MINUS",
      "TECHNICIAN"
    ],
    "id": "SPECIES_TOXTRICITY_LOW_KEY",
    "family": "P_FAMILY_TOXEL",
    "baseHP": 75,
    "baseAttack": 98,
    "baseDefense": 70,
    "baseSpeed": 75,
    "baseSpAttack": 114,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_POISON)",
    "abilities": "{ ABILITY_PUNK_ROCK, ABILITY_MINUS, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Toxtricity\")",
    "natDexNum": "NATIONAL_DEX_TOXTRICITY",
    "levelUpLearnset": "sToxtricityLowKeyLevelUpLearnset",
    "teachableLearnset": "sToxtricityLowKeyTeachableLearnset",
    "baseBST": 502,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sizzlipede",
    "parsedTypes": [
      "FIRE",
      "BUG"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "WHITE_SMOKE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_SIZZLIPEDE",
    "family": "P_FAMILY_SIZZLIPEDE",
    "baseHP": 50,
    "baseAttack": 65,
    "baseDefense": 45,
    "baseSpeed": 45,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_BUG)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_WHITE_SMOKE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Sizzlipede\")",
    "natDexNum": "NATIONAL_DEX_SIZZLIPEDE",
    "levelUpLearnset": "sSizzlipedeLevelUpLearnset",
    "teachableLearnset": "sSizzlipedeTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_CENTISKORCH})",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Centiskorch",
    "parsedTypes": [
      "FIRE",
      "BUG"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "WHITE_SMOKE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_CENTISKORCH",
    "family": "P_FAMILY_SIZZLIPEDE",
    "baseHP": 100,
    "baseAttack": 115,
    "baseDefense": 65,
    "baseSpeed": 65,
    "baseSpAttack": 90,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_BUG)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_WHITE_SMOKE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Centiskorch\")",
    "natDexNum": "NATIONAL_DEX_CENTISKORCH",
    "levelUpLearnset": "sCentiskorchLevelUpLearnset",
    "teachableLearnset": "sCentiskorchTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Clobbopus",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "LIMBER",
      "NONE",
      "TECHNICIAN"
    ],
    "id": "SPECIES_CLOBBOPUS",
    "family": "P_FAMILY_CLOBBOPUS",
    "baseHP": 50,
    "baseAttack": 68,
    "baseDefense": 60,
    "baseSpeed": 32,
    "baseSpAttack": 50,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_NONE, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Clobbopus\")",
    "natDexNum": "NATIONAL_DEX_CLOBBOPUS",
    "levelUpLearnset": "sClobbopusLevelUpLearnset",
    "teachableLearnset": "sClobbopusTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_GRAPPLOCT, CONDITIONS({IF_KNOWS_MOVE, MOVE_TAUNT})})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grapploct",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "LIMBER",
      "NONE",
      "TECHNICIAN"
    ],
    "id": "SPECIES_GRAPPLOCT",
    "family": "P_FAMILY_CLOBBOPUS",
    "baseHP": 80,
    "baseAttack": 118,
    "baseDefense": 90,
    "baseSpeed": 42,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_LIMBER, ABILITY_NONE, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Grapploct\")",
    "natDexNum": "NATIONAL_DEX_GRAPPLOCT",
    "levelUpLearnset": "sGrapploctLevelUpLearnset",
    "teachableLearnset": "sGrapploctTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sinistea  Phony",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "WEAK_ARMOR",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_SINISTEA_PHONY",
    "family": "P_FAMILY_SINISTEA",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 74,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_WEAK_ARMOR, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Sinistea\")",
    "natDexNum": "NATIONAL_DEX_SINISTEA",
    "levelUpLearnset": "sSinisteaLevelUpLearnset",
    "teachableLearnset": "sSinisteaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_CRACKED_POT, SPECIES_POLTEAGEIST_PHONY})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sinistea  Antique",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "WEAK_ARMOR",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_SINISTEA_ANTIQUE",
    "family": "P_FAMILY_SINISTEA",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 74,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_WEAK_ARMOR, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Sinistea\")",
    "natDexNum": "NATIONAL_DEX_SINISTEA",
    "levelUpLearnset": "sSinisteaLevelUpLearnset",
    "teachableLearnset": "sSinisteaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_CHIPPED_POT, SPECIES_POLTEAGEIST_ANTIQUE})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Polteageist  Phony",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "WEAK_ARMOR",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_POLTEAGEIST_PHONY",
    "family": "P_FAMILY_SINISTEA",
    "baseHP": 60,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 70,
    "baseSpAttack": 134,
    "baseSpDefense": 114,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_WEAK_ARMOR, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Polteageist\")",
    "natDexNum": "NATIONAL_DEX_POLTEAGEIST",
    "levelUpLearnset": "sPolteageistLevelUpLearnset",
    "teachableLearnset": "sPolteageistTeachableLearnset",
    "baseBST": 508,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Polteageist  Antique",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "WEAK_ARMOR",
      "NONE",
      "CURSED_BODY"
    ],
    "id": "SPECIES_POLTEAGEIST_ANTIQUE",
    "family": "P_FAMILY_SINISTEA",
    "baseHP": 60,
    "baseAttack": 65,
    "baseDefense": 65,
    "baseSpeed": 70,
    "baseSpAttack": 134,
    "baseSpDefense": 114,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_WEAK_ARMOR, ABILITY_NONE, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Polteageist\")",
    "natDexNum": "NATIONAL_DEX_POLTEAGEIST",
    "levelUpLearnset": "sPolteageistLevelUpLearnset",
    "teachableLearnset": "sPolteageistTeachableLearnset",
    "baseBST": 508,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hatenna",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "HEALER",
      "ANTICIPATION",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_HATENNA",
    "family": "P_FAMILY_HATENNA",
    "baseHP": 42,
    "baseAttack": 30,
    "baseDefense": 45,
    "baseSpeed": 39,
    "baseSpAttack": 56,
    "baseSpDefense": 53,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_HEALER, ABILITY_ANTICIPATION, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Hatenna\")",
    "natDexNum": "NATIONAL_DEX_HATENNA",
    "levelUpLearnset": "sHatennaLevelUpLearnset",
    "teachableLearnset": "sHatennaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_HATTREM})",
    "baseBST": 265,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hattrem",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "HEALER",
      "ANTICIPATION",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_HATTREM",
    "family": "P_FAMILY_HATENNA",
    "baseHP": 57,
    "baseAttack": 40,
    "baseDefense": 65,
    "baseSpeed": 49,
    "baseSpAttack": 86,
    "baseSpDefense": 73,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_HEALER, ABILITY_ANTICIPATION, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Hattrem\")",
    "natDexNum": "NATIONAL_DEX_HATTREM",
    "levelUpLearnset": "sHattremLevelUpLearnset",
    "teachableLearnset": "sHattremTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_HATTERENE})",
    "baseBST": 370,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Hatterene",
    "parsedTypes": [
      "PSYCHIC",
      "FAIRY"
    ],
    "parsedAbilities": [
      "HEALER",
      "ANTICIPATION",
      "MAGIC_BOUNCE"
    ],
    "id": "SPECIES_HATTERENE",
    "family": "P_FAMILY_HATENNA",
    "baseHP": 57,
    "baseAttack": 90,
    "baseDefense": 95,
    "baseSpeed": 29,
    "baseSpAttack": 136,
    "baseSpDefense": 103,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_FAIRY)",
    "abilities": "{ ABILITY_HEALER, ABILITY_ANTICIPATION, ABILITY_MAGIC_BOUNCE }",
    "speciesName": "_(\"Hatterene\")",
    "natDexNum": "NATIONAL_DEX_HATTERENE",
    "levelUpLearnset": "sHattereneLevelUpLearnset",
    "teachableLearnset": "sHattereneTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Impidimp",
    "parsedTypes": [
      "DARK",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "FRISK",
      "PICKPOCKET"
    ],
    "id": "SPECIES_IMPIDIMP",
    "family": "P_FAMILY_IMPIDIMP",
    "baseHP": 45,
    "baseAttack": 45,
    "baseDefense": 30,
    "baseSpeed": 50,
    "baseSpAttack": 55,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_FRISK, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Impidimp\")",
    "natDexNum": "NATIONAL_DEX_IMPIDIMP",
    "levelUpLearnset": "sImpidimpLevelUpLearnset",
    "teachableLearnset": "sImpidimpTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 32, SPECIES_MORGREM})",
    "baseBST": 265,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Morgrem",
    "parsedTypes": [
      "DARK",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "FRISK",
      "PICKPOCKET"
    ],
    "id": "SPECIES_MORGREM",
    "family": "P_FAMILY_IMPIDIMP",
    "baseHP": 65,
    "baseAttack": 60,
    "baseDefense": 45,
    "baseSpeed": 70,
    "baseSpAttack": 75,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_FRISK, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Morgrem\")",
    "natDexNum": "NATIONAL_DEX_MORGREM",
    "levelUpLearnset": "sMorgremLevelUpLearnset",
    "teachableLearnset": "sMorgremTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 42, SPECIES_GRIMMSNARL})",
    "baseBST": 370,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grimmsnarl",
    "parsedTypes": [
      "DARK",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PRANKSTER",
      "FRISK",
      "PICKPOCKET"
    ],
    "id": "SPECIES_GRIMMSNARL",
    "family": "P_FAMILY_IMPIDIMP",
    "baseHP": 95,
    "baseAttack": 120,
    "baseDefense": 65,
    "baseSpeed": 60,
    "baseSpAttack": 95,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PRANKSTER, ABILITY_FRISK, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Grimmsnarl\")",
    "natDexNum": "NATIONAL_DEX_GRIMMSNARL",
    "levelUpLearnset": "sGrimmsnarlLevelUpLearnset",
    "teachableLearnset": "sGrimmsnarlTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Falinks",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "BATTLE_ARMOR",
      "NONE",
      "DEFIANT"
    ],
    "id": "SPECIES_FALINKS",
    "family": "P_FAMILY_FALINKS",
    "baseHP": 65,
    "baseAttack": 100,
    "baseDefense": 100,
    "baseSpeed": 75,
    "baseSpAttack": 70,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_BATTLE_ARMOR, ABILITY_NONE, ABILITY_DEFIANT }",
    "speciesName": "_(\"Falinks\")",
    "natDexNum": "NATIONAL_DEX_FALINKS",
    "levelUpLearnset": "sFalinksLevelUpLearnset",
    "teachableLearnset": "sFalinksTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pincurchin",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "LIGHTNING_ROD",
      "NONE",
      "ELECTRIC_SURGE"
    ],
    "id": "SPECIES_PINCURCHIN",
    "family": "P_FAMILY_PINCURCHIN",
    "baseHP": 48,
    "baseAttack": 101,
    "baseDefense": 95,
    "baseSpeed": 15,
    "baseSpAttack": 91,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_LIGHTNING_ROD, ABILITY_NONE, ABILITY_ELECTRIC_SURGE }",
    "speciesName": "_(\"Pincurchin\")",
    "natDexNum": "NATIONAL_DEX_PINCURCHIN",
    "levelUpLearnset": "sPincurchinLevelUpLearnset",
    "teachableLearnset": "sPincurchinTeachableLearnset",
    "baseBST": 435,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Snom",
    "parsedTypes": [
      "ICE",
      "BUG"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "ICE_SCALES"
    ],
    "id": "SPECIES_SNOM",
    "family": "P_FAMILY_SNOM",
    "baseHP": 30,
    "baseAttack": 25,
    "baseDefense": 35,
    "baseSpeed": 20,
    "baseSpAttack": 45,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_ICE, TYPE_BUG)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_ICE_SCALES }",
    "speciesName": "_(\"Snom\")",
    "natDexNum": "NATIONAL_DEX_SNOM",
    "levelUpLearnset": "sSnomLevelUpLearnset",
    "teachableLearnset": "sSnomTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_FROSMOTH, CONDITIONS({IF_MIN_FRIENDSHIP, FRIENDSHIP_EVO_THRESHOLD},{IF_TIME, TIME_NIGHT})})",
    "baseBST": 185,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Frosmoth",
    "parsedTypes": [
      "ICE",
      "BUG"
    ],
    "parsedAbilities": [
      "SHIELD_DUST",
      "NONE",
      "ICE_SCALES"
    ],
    "id": "SPECIES_FROSMOTH",
    "family": "P_FAMILY_SNOM",
    "baseHP": 70,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 65,
    "baseSpAttack": 125,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ICE, TYPE_BUG)",
    "abilities": "{ ABILITY_SHIELD_DUST, ABILITY_NONE, ABILITY_ICE_SCALES }",
    "speciesName": "_(\"Frosmoth\")",
    "natDexNum": "NATIONAL_DEX_FROSMOTH",
    "levelUpLearnset": "sFrosmothLevelUpLearnset",
    "teachableLearnset": "sFrosmothTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Stonjourner",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "POWER_SPOT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_STONJOURNER",
    "family": "P_FAMILY_STONJOURNER",
    "baseHP": 100,
    "baseAttack": 125,
    "baseDefense": 135,
    "baseSpeed": 70,
    "baseSpAttack": 20,
    "baseSpDefense": 20,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_POWER_SPOT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Stonjourner\")",
    "natDexNum": "NATIONAL_DEX_STONJOURNER",
    "levelUpLearnset": "sStonjournerLevelUpLearnset",
    "teachableLearnset": "sStonjournerTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eiscue  Ice",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "ICE_FACE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_EISCUE_ICE",
    "family": "P_FAMILY_EISCUE",
    "baseHP": 75,
    "baseAttack": 80,
    "baseDefense": 110,
    "baseSpeed": 50,
    "baseSpAttack": 65,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_ICE_FACE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Eiscue\")",
    "natDexNum": "NATIONAL_DEX_EISCUE",
    "levelUpLearnset": "sEiscueLevelUpLearnset",
    "teachableLearnset": "sEiscueTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eiscue  Noice",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "ICE_FACE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_EISCUE_NOICE",
    "family": "P_FAMILY_EISCUE",
    "baseHP": 75,
    "baseAttack": 80,
    "baseDefense": 70,
    "baseSpeed": 130,
    "baseSpAttack": 65,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_ICE_FACE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Eiscue\")",
    "natDexNum": "NATIONAL_DEX_EISCUE",
    "levelUpLearnset": "sEiscueLevelUpLearnset",
    "teachableLearnset": "sEiscueTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Indeedee  M",
    "parsedTypes": [
      "PSYCHIC",
      "NORMAL"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "SYNCHRONIZE",
      "PSYCHIC_SURGE"
    ],
    "id": "SPECIES_INDEEDEE_M",
    "family": "P_FAMILY_INDEEDEE",
    "baseHP": 60,
    "baseAttack": 65,
    "baseDefense": 55,
    "baseSpeed": 95,
    "baseSpAttack": 105,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_NORMAL)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_SYNCHRONIZE, ABILITY_PSYCHIC_SURGE }",
    "speciesName": "_(\"Indeedee\")",
    "natDexNum": "NATIONAL_DEX_INDEEDEE",
    "levelUpLearnset": "sIndeedeeMLevelUpLearnset",
    "teachableLearnset": "sIndeedeeMTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Indeedee  F",
    "parsedTypes": [
      "PSYCHIC",
      "NORMAL"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "SYNCHRONIZE",
      "PSYCHIC_SURGE"
    ],
    "id": "SPECIES_INDEEDEE_F",
    "family": "P_FAMILY_INDEEDEE",
    "baseHP": 70,
    "baseAttack": 55,
    "baseDefense": 65,
    "baseSpeed": 85,
    "baseSpAttack": 95,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_NORMAL)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_SYNCHRONIZE, ABILITY_PSYCHIC_SURGE }",
    "speciesName": "_(\"Indeedee\")",
    "natDexNum": "NATIONAL_DEX_INDEEDEE",
    "levelUpLearnset": "sIndeedeeFLevelUpLearnset",
    "teachableLearnset": "sIndeedeeFTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Morpeko  Full  Belly",
    "parsedTypes": [
      "ELECTRIC",
      "DARK"
    ],
    "parsedAbilities": [
      "HUNGER_SWITCH",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MORPEKO_FULL_BELLY",
    "family": "P_FAMILY_MORPEKO",
    "baseHP": 58,
    "baseAttack": 95,
    "baseDefense": 58,
    "baseSpeed": 97,
    "baseSpAttack": 70,
    "baseSpDefense": 58,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_DARK)",
    "abilities": "{ ABILITY_HUNGER_SWITCH, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Morpeko\")",
    "natDexNum": "NATIONAL_DEX_MORPEKO",
    "levelUpLearnset": "sMorpekoLevelUpLearnset",
    "teachableLearnset": "sMorpekoTeachableLearnset",
    "baseBST": 436,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Morpeko  Hangry",
    "parsedTypes": [
      "ELECTRIC",
      "DARK"
    ],
    "parsedAbilities": [
      "HUNGER_SWITCH",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MORPEKO_HANGRY",
    "family": "P_FAMILY_MORPEKO",
    "baseHP": 58,
    "baseAttack": 95,
    "baseDefense": 58,
    "baseSpeed": 97,
    "baseSpAttack": 70,
    "baseSpDefense": 58,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_DARK)",
    "abilities": "{ ABILITY_HUNGER_SWITCH, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Morpeko\")",
    "natDexNum": "NATIONAL_DEX_MORPEKO",
    "levelUpLearnset": "sMorpekoLevelUpLearnset",
    "teachableLearnset": "sMorpekoTeachableLearnset",
    "baseBST": 436,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cufant",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "SHEER_FORCE",
      "NONE",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_CUFANT",
    "family": "P_FAMILY_CUFANT",
    "baseHP": 72,
    "baseAttack": 80,
    "baseDefense": 49,
    "baseSpeed": 40,
    "baseSpAttack": 40,
    "baseSpDefense": 49,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_SHEER_FORCE, ABILITY_NONE, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Cufant\")",
    "natDexNum": "NATIONAL_DEX_CUFANT",
    "levelUpLearnset": "sCufantLevelUpLearnset",
    "teachableLearnset": "sCufantTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 34, SPECIES_COPPERAJAH})",
    "baseBST": 330,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Copperajah",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "SHEER_FORCE",
      "NONE",
      "HEAVY_METAL"
    ],
    "id": "SPECIES_COPPERAJAH",
    "family": "P_FAMILY_CUFANT",
    "baseHP": 122,
    "baseAttack": 130,
    "baseDefense": 69,
    "baseSpeed": 30,
    "baseSpAttack": 80,
    "baseSpDefense": 69,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_SHEER_FORCE, ABILITY_NONE, ABILITY_HEAVY_METAL }",
    "speciesName": "_(\"Copperajah\")",
    "natDexNum": "NATIONAL_DEX_COPPERAJAH",
    "levelUpLearnset": "sCopperajahLevelUpLearnset",
    "teachableLearnset": "sCopperajahTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dracozolt",
    "parsedTypes": [
      "ELECTRIC",
      "DRAGON"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "HUSTLE",
      "SAND_RUSH"
    ],
    "id": "SPECIES_DRACOZOLT",
    "family": "P_FAMILY_DRACOZOLT",
    "baseHP": 90,
    "baseAttack": 100,
    "baseDefense": 90,
    "baseSpeed": 75,
    "baseSpAttack": 80,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_DRAGON)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_HUSTLE, ABILITY_SAND_RUSH }",
    "speciesName": "_(\"Dracozolt\")",
    "natDexNum": "NATIONAL_DEX_DRACOZOLT",
    "levelUpLearnset": "sDracozoltLevelUpLearnset",
    "teachableLearnset": "sDracozoltTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arctozolt",
    "parsedTypes": [
      "ELECTRIC",
      "ICE"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "STATIC",
      "SLUSH_RUSH"
    ],
    "id": "SPECIES_ARCTOZOLT",
    "family": "P_FAMILY_ARCTOZOLT",
    "baseHP": 90,
    "baseAttack": 100,
    "baseDefense": 90,
    "baseSpeed": 55,
    "baseSpAttack": 90,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_ICE)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_STATIC, ABILITY_SLUSH_RUSH }",
    "speciesName": "_(\"Arctozolt\")",
    "natDexNum": "NATIONAL_DEX_ARCTOZOLT",
    "levelUpLearnset": "sArctozoltLevelUpLearnset",
    "teachableLearnset": "sArctozoltTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dracovish",
    "parsedTypes": [
      "WATER",
      "DRAGON"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "STRONG_JAW",
      "SAND_RUSH"
    ],
    "id": "SPECIES_DRACOVISH",
    "family": "P_FAMILY_DRACOVISH",
    "baseHP": 90,
    "baseAttack": 90,
    "baseDefense": 100,
    "baseSpeed": 75,
    "baseSpAttack": 70,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DRAGON)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_STRONG_JAW, ABILITY_SAND_RUSH }",
    "speciesName": "_(\"Dracovish\")",
    "natDexNum": "NATIONAL_DEX_DRACOVISH",
    "levelUpLearnset": "sDracovishLevelUpLearnset",
    "teachableLearnset": "sDracovishTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arctovish",
    "parsedTypes": [
      "WATER",
      "ICE"
    ],
    "parsedAbilities": [
      "WATER_ABSORB",
      "ICE_BODY",
      "SLUSH_RUSH"
    ],
    "id": "SPECIES_ARCTOVISH",
    "family": "P_FAMILY_ARCTOVISH",
    "baseHP": 90,
    "baseAttack": 90,
    "baseDefense": 100,
    "baseSpeed": 55,
    "baseSpAttack": 80,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_WATER, TYPE_ICE)",
    "abilities": "{ ABILITY_WATER_ABSORB, ABILITY_ICE_BODY, ABILITY_SLUSH_RUSH }",
    "speciesName": "_(\"Arctovish\")",
    "natDexNum": "NATIONAL_DEX_ARCTOVISH",
    "levelUpLearnset": "sArctovishLevelUpLearnset",
    "teachableLearnset": "sArctovishTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Duraludon",
    "parsedTypes": [
      "STEEL",
      "DRAGON"
    ],
    "parsedAbilities": [
      "LIGHT_METAL",
      "HEAVY_METAL",
      "STALWART"
    ],
    "id": "SPECIES_DURALUDON",
    "family": "P_FAMILY_DURALUDON",
    "baseHP": 70,
    "baseAttack": 95,
    "baseDefense": 115,
    "baseSpeed": 85,
    "baseSpAttack": 120,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_DRAGON)",
    "abilities": "{ ABILITY_LIGHT_METAL, ABILITY_HEAVY_METAL, ABILITY_STALWART }",
    "speciesName": "_(\"Duraludon\")",
    "natDexNum": "NATIONAL_DEX_DURALUDON",
    "levelUpLearnset": "sDuraludonLevelUpLearnset",
    "teachableLearnset": "sDuraludonTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_METAL_ALLOY, SPECIES_ARCHALUDON})",
    "baseBST": 535,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Archaludon",
    "parsedTypes": [
      "STEEL",
      "DRAGON"
    ],
    "parsedAbilities": [
      "STAMINA",
      "STURDY",
      "STALWART"
    ],
    "id": "SPECIES_ARCHALUDON",
    "family": "P_FAMILY_DURALUDON",
    "baseHP": 90,
    "baseAttack": 105,
    "baseDefense": 130,
    "baseSpeed": 85,
    "baseSpAttack": 125,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_DRAGON)",
    "abilities": "{ ABILITY_STAMINA, ABILITY_STURDY, ABILITY_STALWART }",
    "speciesName": "_(\"Archaludon\")",
    "natDexNum": "NATIONAL_DEX_ARCHALUDON",
    "levelUpLearnset": "sArchaludonLevelUpLearnset",
    "teachableLearnset": "sArchaludonTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dreepy",
    "parsedTypes": [
      "DRAGON",
      "GHOST"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "INFILTRATOR",
      "CURSED_BODY"
    ],
    "id": "SPECIES_DREEPY",
    "family": "P_FAMILY_DREEPY",
    "baseHP": 28,
    "baseAttack": 60,
    "baseDefense": 30,
    "baseSpeed": 82,
    "baseSpAttack": 40,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GHOST)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_INFILTRATOR, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Dreepy\")",
    "natDexNum": "NATIONAL_DEX_DREEPY",
    "levelUpLearnset": "sDreepyLevelUpLearnset",
    "teachableLearnset": "sDreepyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 50, SPECIES_DRAKLOAK})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Drakloak",
    "parsedTypes": [
      "DRAGON",
      "GHOST"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "INFILTRATOR",
      "CURSED_BODY"
    ],
    "id": "SPECIES_DRAKLOAK",
    "family": "P_FAMILY_DREEPY",
    "baseHP": 68,
    "baseAttack": 80,
    "baseDefense": 50,
    "baseSpeed": 102,
    "baseSpAttack": 60,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GHOST)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_INFILTRATOR, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Drakloak\")",
    "natDexNum": "NATIONAL_DEX_DRAKLOAK",
    "levelUpLearnset": "sDrakloakLevelUpLearnset",
    "teachableLearnset": "sDrakloakTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 60, SPECIES_DRAGAPULT})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dragapult",
    "parsedTypes": [
      "DRAGON",
      "GHOST"
    ],
    "parsedAbilities": [
      "CLEAR_BODY",
      "INFILTRATOR",
      "CURSED_BODY"
    ],
    "id": "SPECIES_DRAGAPULT",
    "family": "P_FAMILY_DREEPY",
    "baseHP": 88,
    "baseAttack": 120,
    "baseDefense": 75,
    "baseSpeed": 142,
    "baseSpAttack": 100,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_GHOST)",
    "abilities": "{ ABILITY_CLEAR_BODY, ABILITY_INFILTRATOR, ABILITY_CURSED_BODY }",
    "speciesName": "_(\"Dragapult\")",
    "natDexNum": "NATIONAL_DEX_DRAGAPULT",
    "levelUpLearnset": "sDragapultLevelUpLearnset",
    "teachableLearnset": "sDragapultTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zacian  Hero",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "INTREPID_SWORD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZACIAN_HERO",
    "family": "P_FAMILY_ZACIAN",
    "baseHP": 92,
    "baseAttack": 120,
    "baseDefense": 115,
    "baseSpeed": 138,
    "baseSpAttack": 80,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_INTREPID_SWORD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zacian\")",
    "natDexNum": "NATIONAL_DEX_ZACIAN",
    "levelUpLearnset": "sZacianLevelUpLearnset",
    "teachableLearnset": "sZacianTeachableLearnset",
    "baseBST": 660,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zacian  Crowned",
    "parsedTypes": [
      "FAIRY",
      "STEEL"
    ],
    "parsedAbilities": [
      "INTREPID_SWORD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZACIAN_CROWNED",
    "family": "P_FAMILY_ZACIAN",
    "baseHP": 92,
    "baseAttack": 150,
    "baseDefense": 115,
    "baseSpeed": 148,
    "baseSpAttack": 80,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_STEEL)",
    "abilities": "{ ABILITY_INTREPID_SWORD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zacian\")",
    "natDexNum": "NATIONAL_DEX_ZACIAN",
    "levelUpLearnset": "sZacianLevelUpLearnset",
    "teachableLearnset": "sZacianTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zamazenta  Hero",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "DAUNTLESS_SHIELD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZAMAZENTA_HERO",
    "family": "P_FAMILY_ZAMAZENTA",
    "baseHP": 92,
    "baseAttack": 120,
    "baseDefense": 115,
    "baseSpeed": 138,
    "baseSpAttack": 80,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_DAUNTLESS_SHIELD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zamazenta\")",
    "natDexNum": "NATIONAL_DEX_ZAMAZENTA",
    "levelUpLearnset": "sZamazentaLevelUpLearnset",
    "teachableLearnset": "sZamazentaTeachableLearnset",
    "baseBST": 660,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zamazenta  Crowned",
    "parsedTypes": [
      "FIGHTING",
      "STEEL"
    ],
    "parsedAbilities": [
      "DAUNTLESS_SHIELD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZAMAZENTA_CROWNED",
    "family": "P_FAMILY_ZAMAZENTA",
    "baseHP": 92,
    "baseAttack": 120,
    "baseDefense": 140,
    "baseSpeed": 128,
    "baseSpAttack": 80,
    "baseSpDefense": 140,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_STEEL)",
    "abilities": "{ ABILITY_DAUNTLESS_SHIELD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zamazenta\")",
    "natDexNum": "NATIONAL_DEX_ZAMAZENTA",
    "levelUpLearnset": "sZamazentaLevelUpLearnset",
    "teachableLearnset": "sZamazentaTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eternatus",
    "parsedTypes": [
      "POISON",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ETERNATUS",
    "family": "P_FAMILY_ETERNATUS",
    "baseHP": 140,
    "baseAttack": 85,
    "baseDefense": 95,
    "baseSpeed": 130,
    "baseSpAttack": 145,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Eternatus\")",
    "natDexNum": "NATIONAL_DEX_ETERNATUS",
    "levelUpLearnset": "sEternatusLevelUpLearnset",
    "teachableLearnset": "sEternatusTeachableLearnset",
    "baseBST": 690,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Eternatus  Eternamax",
    "parsedTypes": [
      "POISON",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PRESSURE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ETERNATUS_ETERNAMAX",
    "family": "P_FAMILY_ETERNATUS",
    "baseHP": 255,
    "baseAttack": 115,
    "baseDefense": 250,
    "baseSpeed": 130,
    "baseSpAttack": 125,
    "baseSpDefense": 250,
    "types": "MON_TYPES(TYPE_POISON, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PRESSURE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Eternatus\")",
    "natDexNum": "NATIONAL_DEX_ETERNATUS",
    "levelUpLearnset": "sEternatusLevelUpLearnset",
    "teachableLearnset": "sEternatusTeachableLearnset",
    "baseBST": 1125,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kubfu",
    "parsedTypes": [
      "FIGHTING"
    ],
    "parsedAbilities": [
      "INNER_FOCUS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KUBFU",
    "family": "P_FAMILY_KUBFU",
    "baseHP": 60,
    "baseAttack": 90,
    "baseDefense": 60,
    "baseSpeed": 72,
    "baseSpAttack": 53,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_FIGHTING)",
    "abilities": "{ ABILITY_INNER_FOCUS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Kubfu\")",
    "natDexNum": "NATIONAL_DEX_KUBFU",
    "levelUpLearnset": "sKubfuLevelUpLearnset",
    "teachableLearnset": "sKubfuTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_SCRIPT_TRIGGER, 0, SPECIES_URSHIFU_SINGLE_STRIKE}",
    "baseBST": 385,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Urshifu  Single  Strike",
    "parsedTypes": [
      "FIGHTING",
      "DARK"
    ],
    "parsedAbilities": [
      "UNSEEN_FIST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_URSHIFU_SINGLE_STRIKE",
    "family": "P_FAMILY_KUBFU",
    "baseHP": 100,
    "baseAttack": 130,
    "baseDefense": 100,
    "baseSpeed": 97,
    "baseSpAttack": 63,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_DARK)",
    "abilities": "{ ABILITY_UNSEEN_FIST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Urshifu\")",
    "natDexNum": "NATIONAL_DEX_URSHIFU",
    "levelUpLearnset": "sUrshifuSingleStrikeLevelUpLearnset",
    "teachableLearnset": "sUrshifuSingleStrikeTeachableLearnset",
    "baseBST": 550,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Urshifu  Rapid  Strike",
    "parsedTypes": [
      "FIGHTING",
      "WATER"
    ],
    "parsedAbilities": [
      "UNSEEN_FIST",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_URSHIFU_RAPID_STRIKE",
    "family": "P_FAMILY_KUBFU",
    "baseHP": 100,
    "baseAttack": 130,
    "baseDefense": 100,
    "baseSpeed": 97,
    "baseSpAttack": 63,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_WATER)",
    "abilities": "{ ABILITY_UNSEEN_FIST, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Urshifu\")",
    "natDexNum": "NATIONAL_DEX_URSHIFU",
    "levelUpLearnset": "sUrshifuRapidStrikeLevelUpLearnset",
    "teachableLearnset": "sUrshifuRapidStrikeTeachableLearnset",
    "baseBST": 550,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zarude",
    "parsedTypes": [
      "DARK",
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZARUDE",
    "family": "P_FAMILY_ZARUDE",
    "baseHP": 105,
    "baseAttack": 120,
    "baseDefense": 105,
    "baseSpeed": 105,
    "baseSpAttack": 70,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DARK, TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zarude\")",
    "natDexNum": "NATIONAL_DEX_ZARUDE",
    "levelUpLearnset": "sZarudeLevelUpLearnset",
    "teachableLearnset": "sZarudeTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Zarude  Dada",
    "parsedTypes": [
      "DARK",
      "GRASS"
    ],
    "parsedAbilities": [
      "LEAF_GUARD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ZARUDE_DADA",
    "family": "P_FAMILY_ZARUDE",
    "baseHP": 105,
    "baseAttack": 120,
    "baseDefense": 105,
    "baseSpeed": 105,
    "baseSpAttack": 70,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DARK, TYPE_GRASS)",
    "abilities": "{ ABILITY_LEAF_GUARD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Zarude\")",
    "natDexNum": "NATIONAL_DEX_ZARUDE",
    "levelUpLearnset": "sZarudeLevelUpLearnset",
    "teachableLearnset": "sZarudeTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Regieleki",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "TRANSISTOR",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_REGIELEKI",
    "family": "P_FAMILY_REGIELEKI",
    "baseHP": 80,
    "baseAttack": 100,
    "baseDefense": 50,
    "baseSpeed": 200,
    "baseSpAttack": 100,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_TRANSISTOR, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Regieleki\")",
    "natDexNum": "NATIONAL_DEX_REGIELEKI",
    "levelUpLearnset": "sRegielekiLevelUpLearnset",
    "teachableLearnset": "sRegielekiTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Regidrago",
    "parsedTypes": [
      "DRAGON"
    ],
    "parsedAbilities": [
      "DRAGONS_MAW",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_REGIDRAGO",
    "family": "P_FAMILY_REGIDRAGO",
    "baseHP": 200,
    "baseAttack": 100,
    "baseDefense": 50,
    "baseSpeed": 80,
    "baseSpAttack": 100,
    "baseSpDefense": 50,
    "types": "MON_TYPES(TYPE_DRAGON)",
    "abilities": "{ ABILITY_DRAGONS_MAW, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Regidrago\")",
    "natDexNum": "NATIONAL_DEX_REGIDRAGO",
    "levelUpLearnset": "sRegidragoLevelUpLearnset",
    "teachableLearnset": "sRegidragoTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glastrier",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "CHILLING_NEIGH",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GLASTRIER",
    "family": "P_FAMILY_GLASTRIER",
    "baseHP": 100,
    "baseAttack": 145,
    "baseDefense": 130,
    "baseSpeed": 30,
    "baseSpAttack": 65,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_CHILLING_NEIGH, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Glastrier\")",
    "natDexNum": "NATIONAL_DEX_GLASTRIER",
    "levelUpLearnset": "sGlastrierLevelUpLearnset",
    "teachableLearnset": "sGlastrierTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spectrier",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "GRIM_NEIGH",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SPECTRIER",
    "family": "P_FAMILY_SPECTRIER",
    "baseHP": 100,
    "baseAttack": 65,
    "baseDefense": 60,
    "baseSpeed": 130,
    "baseSpAttack": 145,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_GRIM_NEIGH, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Spectrier\")",
    "natDexNum": "NATIONAL_DEX_SPECTRIER",
    "levelUpLearnset": "sSpectrierLevelUpLearnset",
    "teachableLearnset": "sSpectrierTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Calyrex",
    "parsedTypes": [
      "PSYCHIC",
      "GRASS"
    ],
    "parsedAbilities": [
      "UNNERVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CALYREX",
    "family": "P_FAMILY_CALYREX",
    "baseHP": 100,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 80,
    "baseSpAttack": 80,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_GRASS)",
    "abilities": "{ ABILITY_UNNERVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Calyrex\")",
    "natDexNum": "NATIONAL_DEX_CALYREX",
    "levelUpLearnset": "sCalyrexLevelUpLearnset",
    "teachableLearnset": "sCalyrexTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Calyrex  Ice",
    "parsedTypes": [
      "PSYCHIC",
      "ICE"
    ],
    "parsedAbilities": [
      "AS_ONE_ICE_RIDER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CALYREX_ICE",
    "family": "P_FAMILY_CALYREX",
    "baseHP": 100,
    "baseAttack": 165,
    "baseDefense": 150,
    "baseSpeed": 50,
    "baseSpAttack": 85,
    "baseSpDefense": 130,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_ICE)",
    "abilities": "{ ABILITY_AS_ONE_ICE_RIDER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Calyrex\")",
    "natDexNum": "NATIONAL_DEX_CALYREX",
    "levelUpLearnset": "sCalyrexIceLevelUpLearnset",
    "teachableLearnset": "sCalyrexIceTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Calyrex  Shadow",
    "parsedTypes": [
      "PSYCHIC",
      "GHOST"
    ],
    "parsedAbilities": [
      "AS_ONE_SHADOW_RIDER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CALYREX_SHADOW",
    "family": "P_FAMILY_CALYREX",
    "baseHP": 100,
    "baseAttack": 85,
    "baseDefense": 80,
    "baseSpeed": 150,
    "baseSpAttack": 165,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_PSYCHIC, TYPE_GHOST)",
    "abilities": "{ ABILITY_AS_ONE_SHADOW_RIDER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Calyrex\")",
    "natDexNum": "NATIONAL_DEX_CALYREX",
    "levelUpLearnset": "sCalyrexShadowLevelUpLearnset",
    "teachableLearnset": "sCalyrexShadowTeachableLearnset",
    "baseBST": 680,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Enamorus  Incarnate",
    "parsedTypes": [
      "FAIRY",
      "FLYING"
    ],
    "parsedAbilities": [
      "CUTE_CHARM",
      "NONE",
      "CONTRARY"
    ],
    "id": "SPECIES_ENAMORUS_INCARNATE",
    "family": "P_FAMILY_ENAMORUS",
    "baseHP": 74,
    "baseAttack": 115,
    "baseDefense": 70,
    "baseSpeed": 106,
    "baseSpAttack": 135,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_FLYING)",
    "abilities": "{ ABILITY_CUTE_CHARM, ABILITY_NONE, ABILITY_CONTRARY }",
    "speciesName": "_(\"Enamorus\")",
    "natDexNum": "NATIONAL_DEX_ENAMORUS",
    "levelUpLearnset": "sEnamorusLevelUpLearnset",
    "teachableLearnset": "sEnamorusTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Enamorus  Therian",
    "parsedTypes": [
      "FAIRY",
      "FLYING"
    ],
    "parsedAbilities": [
      "OVERCOAT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ENAMORUS_THERIAN",
    "family": "P_FAMILY_ENAMORUS",
    "baseHP": 74,
    "baseAttack": 115,
    "baseDefense": 110,
    "baseSpeed": 46,
    "baseSpAttack": 135,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_FLYING)",
    "abilities": "{ ABILITY_OVERCOAT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Enamorus\")",
    "natDexNum": "NATIONAL_DEX_ENAMORUS",
    "levelUpLearnset": "sEnamorusLevelUpLearnset",
    "teachableLearnset": "sEnamorusTeachableLearnset",
    "baseBST": 580,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sprigatito",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "PROTEAN"
    ],
    "id": "SPECIES_SPRIGATITO",
    "family": "P_FAMILY_SPRIGATITO",
    "baseHP": 40,
    "baseAttack": 61,
    "baseDefense": 54,
    "baseSpeed": 65,
    "baseSpAttack": 45,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_PROTEAN }",
    "speciesName": "_(\"Sprigatito\")",
    "natDexNum": "NATIONAL_DEX_SPRIGATITO",
    "levelUpLearnset": "sSprigatitoLevelUpLearnset",
    "teachableLearnset": "sSprigatitoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_FLORAGATO})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Floragato",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "PROTEAN"
    ],
    "id": "SPECIES_FLORAGATO",
    "family": "P_FAMILY_SPRIGATITO",
    "baseHP": 61,
    "baseAttack": 80,
    "baseDefense": 63,
    "baseSpeed": 83,
    "baseSpAttack": 60,
    "baseSpDefense": 63,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_PROTEAN }",
    "speciesName": "_(\"Floragato\")",
    "natDexNum": "NATIONAL_DEX_FLORAGATO",
    "levelUpLearnset": "sFloragatoLevelUpLearnset",
    "teachableLearnset": "sFloragatoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_MEOWSCARADA})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Meowscarada",
    "parsedTypes": [
      "GRASS",
      "DARK"
    ],
    "parsedAbilities": [
      "OVERGROW",
      "NONE",
      "PROTEAN"
    ],
    "id": "SPECIES_MEOWSCARADA",
    "family": "P_FAMILY_SPRIGATITO",
    "baseHP": 76,
    "baseAttack": 110,
    "baseDefense": 70,
    "baseSpeed": 123,
    "baseSpAttack": 81,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DARK)",
    "abilities": "{ ABILITY_OVERGROW, ABILITY_NONE, ABILITY_PROTEAN }",
    "speciesName": "_(\"Meowscarada\")",
    "natDexNum": "NATIONAL_DEX_MEOWSCARADA",
    "levelUpLearnset": "sMeowscaradaLevelUpLearnset",
    "teachableLearnset": "sMeowscaradaTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fuecoco",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "UNAWARE"
    ],
    "id": "SPECIES_FUECOCO",
    "family": "P_FAMILY_FUECOCO",
    "baseHP": 67,
    "baseAttack": 45,
    "baseDefense": 59,
    "baseSpeed": 36,
    "baseSpAttack": 63,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_UNAWARE }",
    "speciesName": "_(\"Fuecoco\")",
    "natDexNum": "NATIONAL_DEX_FUECOCO",
    "levelUpLearnset": "sFuecocoLevelUpLearnset",
    "teachableLearnset": "sFuecocoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_CROCALOR})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Crocalor",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "UNAWARE"
    ],
    "id": "SPECIES_CROCALOR",
    "family": "P_FAMILY_FUECOCO",
    "baseHP": 81,
    "baseAttack": 55,
    "baseDefense": 78,
    "baseSpeed": 49,
    "baseSpAttack": 90,
    "baseSpDefense": 58,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_UNAWARE }",
    "speciesName": "_(\"Crocalor\")",
    "natDexNum": "NATIONAL_DEX_CROCALOR",
    "levelUpLearnset": "sCrocalorLevelUpLearnset",
    "teachableLearnset": "sCrocalorTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_SKELEDIRGE})",
    "baseBST": 411,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Skeledirge",
    "parsedTypes": [
      "FIRE",
      "GHOST"
    ],
    "parsedAbilities": [
      "BLAZE",
      "NONE",
      "UNAWARE"
    ],
    "id": "SPECIES_SKELEDIRGE",
    "family": "P_FAMILY_FUECOCO",
    "baseHP": 104,
    "baseAttack": 75,
    "baseDefense": 100,
    "baseSpeed": 66,
    "baseSpAttack": 110,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GHOST)",
    "abilities": "{ ABILITY_BLAZE, ABILITY_NONE, ABILITY_UNAWARE }",
    "speciesName": "_(\"Skeledirge\")",
    "natDexNum": "NATIONAL_DEX_SKELEDIRGE",
    "levelUpLearnset": "sSkeledirgeLevelUpLearnset",
    "teachableLearnset": "sSkeledirgeTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Quaxly",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_QUAXLY",
    "family": "P_FAMILY_QUAXLY",
    "baseHP": 55,
    "baseAttack": 65,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Quaxly\")",
    "natDexNum": "NATIONAL_DEX_QUAXLY",
    "levelUpLearnset": "sQuaxlyLevelUpLearnset",
    "teachableLearnset": "sQuaxlyTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 16, SPECIES_QUAXWELL})",
    "baseBST": 310,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Quaxwell",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_QUAXWELL",
    "family": "P_FAMILY_QUAXLY",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 65,
    "baseSpeed": 65,
    "baseSpAttack": 65,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Quaxwell\")",
    "natDexNum": "NATIONAL_DEX_QUAXWELL",
    "levelUpLearnset": "sQuaxwellLevelUpLearnset",
    "teachableLearnset": "sQuaxwellTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 36, SPECIES_QUAQUAVAL})",
    "baseBST": 410,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Quaquaval",
    "parsedTypes": [
      "WATER",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "TORRENT",
      "NONE",
      "MOXIE"
    ],
    "id": "SPECIES_QUAQUAVAL",
    "family": "P_FAMILY_QUAXLY",
    "baseHP": 85,
    "baseAttack": 120,
    "baseDefense": 80,
    "baseSpeed": 85,
    "baseSpAttack": 85,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_WATER, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_TORRENT, ABILITY_NONE, ABILITY_MOXIE }",
    "speciesName": "_(\"Quaquaval\")",
    "natDexNum": "NATIONAL_DEX_QUAQUAVAL",
    "levelUpLearnset": "sQuaquavalLevelUpLearnset",
    "teachableLearnset": "sQuaquavalTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lechonk",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "AROMA_VEIL",
      "GLUTTONY",
      "THICK_FAT"
    ],
    "id": "SPECIES_LECHONK",
    "family": "P_FAMILY_LECHONK",
    "baseHP": 54,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 35,
    "baseSpAttack": 35,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_AROMA_VEIL, ABILITY_GLUTTONY, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Lechonk\")",
    "natDexNum": "NATIONAL_DEX_LECHONK",
    "levelUpLearnset": "sLechonkLevelUpLearnset",
    "teachableLearnset": "sLechonkTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_OINKOLOGNE_M, CONDITIONS({IF_GENDER, MON_MALE})}",
    "baseBST": 254,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oinkologne  M",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "LINGERING_AROMA",
      "GLUTTONY",
      "THICK_FAT"
    ],
    "id": "SPECIES_OINKOLOGNE_M",
    "family": "P_FAMILY_LECHONK",
    "baseHP": 110,
    "baseAttack": 100,
    "baseDefense": 75,
    "baseSpeed": 65,
    "baseSpAttack": 59,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_LINGERING_AROMA, ABILITY_GLUTTONY, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Oinkologne\")",
    "natDexNum": "NATIONAL_DEX_OINKOLOGNE",
    "levelUpLearnset": "sOinkologneMLevelUpLearnset",
    "teachableLearnset": "sOinkologneTeachableLearnset",
    "baseBST": 489,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Oinkologne  F",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "AROMA_VEIL",
      "GLUTTONY",
      "THICK_FAT"
    ],
    "id": "SPECIES_OINKOLOGNE_F",
    "family": "P_FAMILY_LECHONK",
    "baseHP": 115,
    "baseAttack": 90,
    "baseDefense": 70,
    "baseSpeed": 65,
    "baseSpAttack": 59,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_AROMA_VEIL, ABILITY_GLUTTONY, ABILITY_THICK_FAT }",
    "speciesName": "_(\"Oinkologne\")",
    "natDexNum": "NATIONAL_DEX_OINKOLOGNE",
    "levelUpLearnset": "sOinkologneFLevelUpLearnset",
    "teachableLearnset": "sOinkologneTeachableLearnset",
    "baseBST": 489,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tarountula",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "STAKEOUT"
    ],
    "id": "SPECIES_TAROUNTULA",
    "family": "P_FAMILY_TAROUNTULA",
    "baseHP": 35,
    "baseAttack": 41,
    "baseDefense": 45,
    "baseSpeed": 20,
    "baseSpAttack": 29,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_STAKEOUT }",
    "speciesName": "_(\"Tarountula\")",
    "natDexNum": "NATIONAL_DEX_TAROUNTULA",
    "levelUpLearnset": "sTarountulaLevelUpLearnset",
    "teachableLearnset": "sTarountulaTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 15, SPECIES_SPIDOPS})",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Spidops",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "INSOMNIA",
      "NONE",
      "STAKEOUT"
    ],
    "id": "SPECIES_SPIDOPS",
    "family": "P_FAMILY_TAROUNTULA",
    "baseHP": 60,
    "baseAttack": 79,
    "baseDefense": 92,
    "baseSpeed": 35,
    "baseSpAttack": 52,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_INSOMNIA, ABILITY_NONE, ABILITY_STAKEOUT }",
    "speciesName": "_(\"Spidops\")",
    "natDexNum": "NATIONAL_DEX_SPIDOPS",
    "levelUpLearnset": "sSpidopsLevelUpLearnset",
    "teachableLearnset": "sSpidopsTeachableLearnset",
    "baseBST": 404,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nymble",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "TINTED_LENS"
    ],
    "id": "SPECIES_NYMBLE",
    "family": "P_FAMILY_NYMBLE",
    "baseHP": 33,
    "baseAttack": 46,
    "baseDefense": 40,
    "baseSpeed": 45,
    "baseSpAttack": 21,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Nymble\")",
    "natDexNum": "NATIONAL_DEX_NYMBLE",
    "levelUpLearnset": "sNymbleLevelUpLearnset",
    "teachableLearnset": "sNymbleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_LOKIX})",
    "baseBST": 210,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Lokix",
    "parsedTypes": [
      "BUG",
      "DARK"
    ],
    "parsedAbilities": [
      "SWARM",
      "NONE",
      "TINTED_LENS"
    ],
    "id": "SPECIES_LOKIX",
    "family": "P_FAMILY_NYMBLE",
    "baseHP": 71,
    "baseAttack": 102,
    "baseDefense": 78,
    "baseSpeed": 92,
    "baseSpAttack": 52,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_BUG, TYPE_DARK)",
    "abilities": "{ ABILITY_SWARM, ABILITY_NONE, ABILITY_TINTED_LENS }",
    "speciesName": "_(\"Lokix\")",
    "natDexNum": "NATIONAL_DEX_LOKIX",
    "levelUpLearnset": "sLokixLevelUpLearnset",
    "teachableLearnset": "sLokixTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pawmi",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "STATIC",
      "NATURAL_CURE",
      "IRON_FIST"
    ],
    "id": "SPECIES_PAWMI",
    "family": "P_FAMILY_PAWMI",
    "baseHP": 45,
    "baseAttack": 50,
    "baseDefense": 20,
    "baseSpeed": 60,
    "baseSpAttack": 40,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_STATIC, ABILITY_NATURAL_CURE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Pawmi\")",
    "natDexNum": "NATIONAL_DEX_PAWMI",
    "levelUpLearnset": "sPawmiLevelUpLearnset",
    "teachableLearnset": "sPawmiTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 18, SPECIES_PAWMO})",
    "baseBST": 240,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pawmo",
    "parsedTypes": [
      "ELECTRIC",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "NATURAL_CURE",
      "IRON_FIST"
    ],
    "id": "SPECIES_PAWMO",
    "family": "P_FAMILY_PAWMI",
    "baseHP": 60,
    "baseAttack": 75,
    "baseDefense": 40,
    "baseSpeed": 85,
    "baseSpAttack": 50,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_NATURAL_CURE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Pawmo\")",
    "natDexNum": "NATIONAL_DEX_PAWMO",
    "levelUpLearnset": "sPawmoLevelUpLearnset",
    "teachableLearnset": "sPawmoTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_PAWMOT, CONDITIONS({IF_MIN_OVERWORLD_STEPS, 1000})})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pawmot",
    "parsedTypes": [
      "ELECTRIC",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "VOLT_ABSORB",
      "NATURAL_CURE",
      "IRON_FIST"
    ],
    "id": "SPECIES_PAWMOT",
    "family": "P_FAMILY_PAWMI",
    "baseHP": 70,
    "baseAttack": 115,
    "baseDefense": 70,
    "baseSpeed": 105,
    "baseSpAttack": 70,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_VOLT_ABSORB, ABILITY_NATURAL_CURE, ABILITY_IRON_FIST }",
    "speciesName": "_(\"Pawmot\")",
    "natDexNum": "NATIONAL_DEX_PAWMOT",
    "levelUpLearnset": "sPawmotLevelUpLearnset",
    "teachableLearnset": "sPawmotTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tandemaus",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "PICKUP",
      "OWN_TEMPO"
    ],
    "id": "SPECIES_TANDEMAUS",
    "family": "P_FAMILY_TANDEMAUS",
    "baseHP": 50,
    "baseAttack": 50,
    "baseDefense": 45,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_PICKUP, ABILITY_OWN_TEMPO }",
    "speciesName": "_(\"Tandemaus\")",
    "natDexNum": "NATIONAL_DEX_TANDEMAUS",
    "levelUpLearnset": "sTandemausLevelUpLearnset",
    "teachableLearnset": "sTandemausTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL_BATTLE_ONLY, 25, SPECIES_MAUSHOLD_FOUR, CONDITIONS({IF_PID_MODULO_100_GT, 0})}",
    "baseBST": 305,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Maushold  Three",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "FRIEND_GUARD",
      "CHEEK_POUCH",
      "TECHNICIAN"
    ],
    "id": "SPECIES_MAUSHOLD_THREE",
    "family": "P_FAMILY_TANDEMAUS",
    "baseHP": 74,
    "baseAttack": 75,
    "baseDefense": 70,
    "baseSpeed": 111,
    "baseSpAttack": 65,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_FRIEND_GUARD, ABILITY_CHEEK_POUCH, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Maushold\")",
    "natDexNum": "NATIONAL_DEX_MAUSHOLD",
    "levelUpLearnset": "sMausholdLevelUpLearnset",
    "teachableLearnset": "sMausholdTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Maushold  Four",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "FRIEND_GUARD",
      "CHEEK_POUCH",
      "TECHNICIAN"
    ],
    "id": "SPECIES_MAUSHOLD_FOUR",
    "family": "P_FAMILY_TANDEMAUS",
    "baseHP": 74,
    "baseAttack": 75,
    "baseDefense": 70,
    "baseSpeed": 111,
    "baseSpAttack": 65,
    "baseSpDefense": 75,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_FRIEND_GUARD, ABILITY_CHEEK_POUCH, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Maushold\")",
    "natDexNum": "NATIONAL_DEX_MAUSHOLD",
    "levelUpLearnset": "sMausholdLevelUpLearnset",
    "teachableLearnset": "sMausholdTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fidough",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "NONE",
      "KLUTZ"
    ],
    "id": "SPECIES_FIDOUGH",
    "family": "P_FAMILY_FIDOUGH",
    "baseHP": 37,
    "baseAttack": 55,
    "baseDefense": 70,
    "baseSpeed": 65,
    "baseSpAttack": 30,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_NONE, ABILITY_KLUTZ }",
    "speciesName": "_(\"Fidough\")",
    "natDexNum": "NATIONAL_DEX_FIDOUGH",
    "levelUpLearnset": "sFidoughLevelUpLearnset",
    "teachableLearnset": "sFidoughTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_DACHSBUN})",
    "baseBST": 312,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dachsbun",
    "parsedTypes": [
      "FAIRY"
    ],
    "parsedAbilities": [
      "WELL_BAKED_BODY",
      "NONE",
      "AROMA_VEIL"
    ],
    "id": "SPECIES_DACHSBUN",
    "family": "P_FAMILY_FIDOUGH",
    "baseHP": 57,
    "baseAttack": 80,
    "baseDefense": 115,
    "baseSpeed": 95,
    "baseSpAttack": 50,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FAIRY)",
    "abilities": "{ ABILITY_WELL_BAKED_BODY, ABILITY_NONE, ABILITY_AROMA_VEIL }",
    "speciesName": "_(\"Dachsbun\")",
    "natDexNum": "NATIONAL_DEX_DACHSBUN",
    "levelUpLearnset": "sDachsbunLevelUpLearnset",
    "teachableLearnset": "sDachsbunTeachableLearnset",
    "baseBST": 477,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Smoliv",
    "parsedTypes": [
      "GRASS",
      "NORMAL"
    ],
    "parsedAbilities": [
      "EARLY_BIRD",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_SMOLIV",
    "family": "P_FAMILY_SMOLIV",
    "baseHP": 41,
    "baseAttack": 35,
    "baseDefense": 45,
    "baseSpeed": 30,
    "baseSpAttack": 58,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_NORMAL)",
    "abilities": "{ ABILITY_EARLY_BIRD, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Smoliv\")",
    "natDexNum": "NATIONAL_DEX_SMOLIV",
    "levelUpLearnset": "sSmolivLevelUpLearnset",
    "teachableLearnset": "sSmolivTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_DOLLIV})",
    "baseBST": 260,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dolliv",
    "parsedTypes": [
      "GRASS",
      "NORMAL"
    ],
    "parsedAbilities": [
      "EARLY_BIRD",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_DOLLIV",
    "family": "P_FAMILY_SMOLIV",
    "baseHP": 52,
    "baseAttack": 53,
    "baseDefense": 60,
    "baseSpeed": 33,
    "baseSpAttack": 78,
    "baseSpDefense": 78,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_NORMAL)",
    "abilities": "{ ABILITY_EARLY_BIRD, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Dolliv\")",
    "natDexNum": "NATIONAL_DEX_DOLLIV",
    "levelUpLearnset": "sDollivLevelUpLearnset",
    "teachableLearnset": "sDollivTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_ARBOLIVA})",
    "baseBST": 354,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arboliva",
    "parsedTypes": [
      "GRASS",
      "NORMAL"
    ],
    "parsedAbilities": [
      "SEED_SOWER",
      "NONE",
      "HARVEST"
    ],
    "id": "SPECIES_ARBOLIVA",
    "family": "P_FAMILY_SMOLIV",
    "baseHP": 78,
    "baseAttack": 69,
    "baseDefense": 90,
    "baseSpeed": 39,
    "baseSpAttack": 125,
    "baseSpDefense": 109,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_NORMAL)",
    "abilities": "{ ABILITY_SEED_SOWER, ABILITY_NONE, ABILITY_HARVEST }",
    "speciesName": "_(\"Arboliva\")",
    "natDexNum": "NATIONAL_DEX_ARBOLIVA",
    "levelUpLearnset": "sArbolivaLevelUpLearnset",
    "teachableLearnset": "sArbolivaTeachableLearnset",
    "baseBST": 510,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Squawkabilly  Green",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "HUSTLE",
      "GUTS"
    ],
    "id": "SPECIES_SQUAWKABILLY_GREEN",
    "family": "P_FAMILY_SQUAWKABILLY",
    "baseHP": 82,
    "baseAttack": 96,
    "baseDefense": 51,
    "baseSpeed": 92,
    "baseSpAttack": 45,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_HUSTLE, ABILITY_GUTS }",
    "speciesName": "_(\"Squawkabilly\")",
    "natDexNum": "NATIONAL_DEX_SQUAWKABILLY",
    "levelUpLearnset": "sSquawkabillyLevelUpLearnset",
    "teachableLearnset": "sSquawkabillyTeachableLearnset",
    "baseBST": 417,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Squawkabilly  Blue",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "HUSTLE",
      "GUTS"
    ],
    "id": "SPECIES_SQUAWKABILLY_BLUE",
    "family": "P_FAMILY_SQUAWKABILLY",
    "baseHP": 82,
    "baseAttack": 96,
    "baseDefense": 51,
    "baseSpeed": 92,
    "baseSpAttack": 45,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_HUSTLE, ABILITY_GUTS }",
    "speciesName": "_(\"Squawkabilly\")",
    "natDexNum": "NATIONAL_DEX_SQUAWKABILLY",
    "levelUpLearnset": "sSquawkabillyLevelUpLearnset",
    "teachableLearnset": "sSquawkabillyTeachableLearnset",
    "baseBST": 417,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Squawkabilly  Yellow",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "HUSTLE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_SQUAWKABILLY_YELLOW",
    "family": "P_FAMILY_SQUAWKABILLY",
    "baseHP": 82,
    "baseAttack": 96,
    "baseDefense": 51,
    "baseSpeed": 92,
    "baseSpAttack": 45,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_HUSTLE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Squawkabilly\")",
    "natDexNum": "NATIONAL_DEX_SQUAWKABILLY",
    "levelUpLearnset": "sSquawkabillyLevelUpLearnset",
    "teachableLearnset": "sSquawkabillyTeachableLearnset",
    "baseBST": 417,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Squawkabilly  White",
    "parsedTypes": [
      "NORMAL",
      "FLYING"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "HUSTLE",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_SQUAWKABILLY_WHITE",
    "family": "P_FAMILY_SQUAWKABILLY",
    "baseHP": 82,
    "baseAttack": 96,
    "baseDefense": 51,
    "baseSpeed": 92,
    "baseSpAttack": 45,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_NORMAL, TYPE_FLYING)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_HUSTLE, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Squawkabilly\")",
    "natDexNum": "NATIONAL_DEX_SQUAWKABILLY",
    "levelUpLearnset": "sSquawkabillyLevelUpLearnset",
    "teachableLearnset": "sSquawkabillyTeachableLearnset",
    "baseBST": 417,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Nacli",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "PURIFYING_SALT",
      "STURDY",
      "CLEAR_BODY"
    ],
    "id": "SPECIES_NACLI",
    "family": "P_FAMILY_NACLI",
    "baseHP": 55,
    "baseAttack": 55,
    "baseDefense": 75,
    "baseSpeed": 25,
    "baseSpAttack": 35,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_PURIFYING_SALT, ABILITY_STURDY, ABILITY_CLEAR_BODY }",
    "speciesName": "_(\"Nacli\")",
    "natDexNum": "NATIONAL_DEX_NACLI",
    "levelUpLearnset": "sNacliLevelUpLearnset",
    "teachableLearnset": "sNacliTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_NACLSTACK})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Naclstack",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "PURIFYING_SALT",
      "STURDY",
      "CLEAR_BODY"
    ],
    "id": "SPECIES_NACLSTACK",
    "family": "P_FAMILY_NACLI",
    "baseHP": 60,
    "baseAttack": 60,
    "baseDefense": 100,
    "baseSpeed": 35,
    "baseSpAttack": 35,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_PURIFYING_SALT, ABILITY_STURDY, ABILITY_CLEAR_BODY }",
    "speciesName": "_(\"Naclstack\")",
    "natDexNum": "NATIONAL_DEX_NACLSTACK",
    "levelUpLearnset": "sNaclstackLevelUpLearnset",
    "teachableLearnset": "sNaclstackTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_GARGANACL})",
    "baseBST": 355,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Garganacl",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "PURIFYING_SALT",
      "STURDY",
      "CLEAR_BODY"
    ],
    "id": "SPECIES_GARGANACL",
    "family": "P_FAMILY_NACLI",
    "baseHP": 100,
    "baseAttack": 100,
    "baseDefense": 130,
    "baseSpeed": 35,
    "baseSpAttack": 45,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_PURIFYING_SALT, ABILITY_STURDY, ABILITY_CLEAR_BODY }",
    "speciesName": "_(\"Garganacl\")",
    "natDexNum": "NATIONAL_DEX_GARGANACL",
    "levelUpLearnset": "sGarganaclLevelUpLearnset",
    "teachableLearnset": "sGarganaclTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Charcadet",
    "parsedTypes": [
      "FIRE"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "NONE",
      "FLAME_BODY"
    ],
    "id": "SPECIES_CHARCADET",
    "family": "P_FAMILY_CHARCADET",
    "baseHP": 40,
    "baseAttack": 50,
    "baseDefense": 40,
    "baseSpeed": 35,
    "baseSpAttack": 50,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_FIRE)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_NONE, ABILITY_FLAME_BODY }",
    "speciesName": "_(\"Charcadet\")",
    "natDexNum": "NATIONAL_DEX_CHARCADET",
    "levelUpLearnset": "sCharcadetLevelUpLearnset",
    "teachableLearnset": "sCharcadetTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_AUSPICIOUS_ARMOR, SPECIES_ARMAROUGE}",
    "baseBST": 255,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Armarouge",
    "parsedTypes": [
      "FIRE",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "NONE",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_ARMAROUGE",
    "family": "P_FAMILY_CHARCADET",
    "baseHP": 85,
    "baseAttack": 60,
    "baseDefense": 100,
    "baseSpeed": 75,
    "baseSpAttack": 125,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_NONE, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Armarouge\")",
    "natDexNum": "NATIONAL_DEX_ARMAROUGE",
    "levelUpLearnset": "sArmarougeLevelUpLearnset",
    "teachableLearnset": "sArmarougeTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ceruledge",
    "parsedTypes": [
      "FIRE",
      "GHOST"
    ],
    "parsedAbilities": [
      "FLASH_FIRE",
      "NONE",
      "WEAK_ARMOR"
    ],
    "id": "SPECIES_CERULEDGE",
    "family": "P_FAMILY_CHARCADET",
    "baseHP": 75,
    "baseAttack": 125,
    "baseDefense": 80,
    "baseSpeed": 85,
    "baseSpAttack": 60,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_GHOST)",
    "abilities": "{ ABILITY_FLASH_FIRE, ABILITY_NONE, ABILITY_WEAK_ARMOR }",
    "speciesName": "_(\"Ceruledge\")",
    "natDexNum": "NATIONAL_DEX_CERULEDGE",
    "levelUpLearnset": "sCeruledgeLevelUpLearnset",
    "teachableLearnset": "sCeruledgeTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tadbulb",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "OWN_TEMPO",
      "STATIC",
      "DAMP"
    ],
    "id": "SPECIES_TADBULB",
    "family": "P_FAMILY_TADBULB",
    "baseHP": 61,
    "baseAttack": 31,
    "baseDefense": 41,
    "baseSpeed": 45,
    "baseSpAttack": 59,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_OWN_TEMPO, ABILITY_STATIC, ABILITY_DAMP }",
    "speciesName": "_(\"Tadbulb\")",
    "natDexNum": "NATIONAL_DEX_TADBULB",
    "levelUpLearnset": "sTadbulbLevelUpLearnset",
    "teachableLearnset": "sTadbulbTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_THUNDER_STONE, SPECIES_BELLIBOLT})",
    "baseBST": 272,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bellibolt",
    "parsedTypes": [
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "ELECTROMORPHOSIS",
      "STATIC",
      "DAMP"
    ],
    "id": "SPECIES_BELLIBOLT",
    "family": "P_FAMILY_TADBULB",
    "baseHP": 109,
    "baseAttack": 64,
    "baseDefense": 91,
    "baseSpeed": 45,
    "baseSpAttack": 103,
    "baseSpDefense": 83,
    "types": "MON_TYPES(TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_ELECTROMORPHOSIS, ABILITY_STATIC, ABILITY_DAMP }",
    "speciesName": "_(\"Bellibolt\")",
    "natDexNum": "NATIONAL_DEX_BELLIBOLT",
    "levelUpLearnset": "sBelliboltLevelUpLearnset",
    "teachableLearnset": "sBelliboltTeachableLearnset",
    "baseBST": 495,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wattrel",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "WIND_POWER",
      "VOLT_ABSORB",
      "COMPETITIVE"
    ],
    "id": "SPECIES_WATTREL",
    "family": "P_FAMILY_WATTREL",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 35,
    "baseSpeed": 70,
    "baseSpAttack": 55,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_WIND_POWER, ABILITY_VOLT_ABSORB, ABILITY_COMPETITIVE }",
    "speciesName": "_(\"Wattrel\")",
    "natDexNum": "NATIONAL_DEX_WATTREL",
    "levelUpLearnset": "sWattrelLevelUpLearnset",
    "teachableLearnset": "sWattrelTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 25, SPECIES_KILOWATTREL})",
    "baseBST": 280,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Kilowattrel",
    "parsedTypes": [
      "ELECTRIC",
      "FLYING"
    ],
    "parsedAbilities": [
      "WIND_POWER",
      "VOLT_ABSORB",
      "COMPETITIVE"
    ],
    "id": "SPECIES_KILOWATTREL",
    "family": "P_FAMILY_WATTREL",
    "baseHP": 70,
    "baseAttack": 70,
    "baseDefense": 60,
    "baseSpeed": 125,
    "baseSpAttack": 105,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_FLYING)",
    "abilities": "{ ABILITY_WIND_POWER, ABILITY_VOLT_ABSORB, ABILITY_COMPETITIVE }",
    "speciesName": "_(\"Kilowattrel\")",
    "natDexNum": "NATIONAL_DEX_KILOWATTREL",
    "levelUpLearnset": "sKilowattrelLevelUpLearnset",
    "teachableLearnset": "sKilowattrelTeachableLearnset",
    "baseBST": 490,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Maschiff",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "RUN_AWAY",
      "STAKEOUT"
    ],
    "id": "SPECIES_MASCHIFF",
    "family": "P_FAMILY_MASCHIFF",
    "baseHP": 60,
    "baseAttack": 78,
    "baseDefense": 60,
    "baseSpeed": 51,
    "baseSpAttack": 40,
    "baseSpDefense": 51,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_RUN_AWAY, ABILITY_STAKEOUT }",
    "speciesName": "_(\"Maschiff\")",
    "natDexNum": "NATIONAL_DEX_MASCHIFF",
    "levelUpLearnset": "sMaschiffLevelUpLearnset",
    "teachableLearnset": "sMaschiffTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_MABOSSTIFF})",
    "baseBST": 340,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Mabosstiff",
    "parsedTypes": [
      "DARK"
    ],
    "parsedAbilities": [
      "INTIMIDATE",
      "GUARD_DOG",
      "STAKEOUT"
    ],
    "id": "SPECIES_MABOSSTIFF",
    "family": "P_FAMILY_MASCHIFF",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 90,
    "baseSpeed": 85,
    "baseSpAttack": 60,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_DARK)",
    "abilities": "{ ABILITY_INTIMIDATE, ABILITY_GUARD_DOG, ABILITY_STAKEOUT }",
    "speciesName": "_(\"Mabosstiff\")",
    "natDexNum": "NATIONAL_DEX_MABOSSTIFF",
    "levelUpLearnset": "sMabosstiffLevelUpLearnset",
    "teachableLearnset": "sMabosstiffTeachableLearnset",
    "baseBST": 505,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Shroodle",
    "parsedTypes": [
      "POISON",
      "NORMAL"
    ],
    "parsedAbilities": [
      "UNBURDEN",
      "PICKPOCKET",
      "PRANKSTER"
    ],
    "id": "SPECIES_SHROODLE",
    "family": "P_FAMILY_SHROODLE",
    "baseHP": 40,
    "baseAttack": 65,
    "baseDefense": 35,
    "baseSpeed": 75,
    "baseSpAttack": 40,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_POISON, TYPE_NORMAL)",
    "abilities": "{ ABILITY_UNBURDEN, ABILITY_PICKPOCKET, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Shroodle\")",
    "natDexNum": "NATIONAL_DEX_SHROODLE",
    "levelUpLearnset": "sShroodleLevelUpLearnset",
    "teachableLearnset": "sShroodleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 28, SPECIES_GRAFAIAI})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Grafaiai",
    "parsedTypes": [
      "POISON",
      "NORMAL"
    ],
    "parsedAbilities": [
      "UNBURDEN",
      "POISON_TOUCH",
      "PRANKSTER"
    ],
    "id": "SPECIES_GRAFAIAI",
    "family": "P_FAMILY_SHROODLE",
    "baseHP": 63,
    "baseAttack": 95,
    "baseDefense": 65,
    "baseSpeed": 110,
    "baseSpAttack": 80,
    "baseSpDefense": 72,
    "types": "MON_TYPES(TYPE_POISON, TYPE_NORMAL)",
    "abilities": "{ ABILITY_UNBURDEN, ABILITY_POISON_TOUCH, ABILITY_PRANKSTER }",
    "speciesName": "_(\"Grafaiai\")",
    "natDexNum": "NATIONAL_DEX_GRAFAIAI",
    "levelUpLearnset": "sGrafaiaiLevelUpLearnset",
    "teachableLearnset": "sGrafaiaiTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bramblin",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "WIND_RIDER",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_BRAMBLIN",
    "family": "P_FAMILY_BRAMBLIN",
    "baseHP": 40,
    "baseAttack": 65,
    "baseDefense": 30,
    "baseSpeed": 60,
    "baseSpAttack": 45,
    "baseSpDefense": 35,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_WIND_RIDER, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Bramblin\")",
    "natDexNum": "NATIONAL_DEX_BRAMBLIN",
    "levelUpLearnset": "sBramblinLevelUpLearnset",
    "teachableLearnset": "sBramblinTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_BRAMBLEGHAST, CONDITIONS({IF_MIN_OVERWORLD_STEPS, 1000})})",
    "baseBST": 275,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Brambleghast",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "WIND_RIDER",
      "NONE",
      "INFILTRATOR"
    ],
    "id": "SPECIES_BRAMBLEGHAST",
    "family": "P_FAMILY_BRAMBLIN",
    "baseHP": 55,
    "baseAttack": 115,
    "baseDefense": 70,
    "baseSpeed": 90,
    "baseSpAttack": 80,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_WIND_RIDER, ABILITY_NONE, ABILITY_INFILTRATOR }",
    "speciesName": "_(\"Brambleghast\")",
    "natDexNum": "NATIONAL_DEX_BRAMBLEGHAST",
    "levelUpLearnset": "sBrambleghastLevelUpLearnset",
    "teachableLearnset": "sBrambleghastTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toedscool",
    "parsedTypes": [
      "GROUND",
      "GRASS"
    ],
    "parsedAbilities": [
      "MYCELIUM_MIGHT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TOEDSCOOL",
    "family": "P_FAMILY_TOEDSCOOL",
    "baseHP": 40,
    "baseAttack": 40,
    "baseDefense": 35,
    "baseSpeed": 70,
    "baseSpAttack": 50,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_GRASS)",
    "abilities": "{ ABILITY_MYCELIUM_MIGHT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Toedscool\")",
    "natDexNum": "NATIONAL_DEX_TOEDSCOOL",
    "levelUpLearnset": "sToedscoolLevelUpLearnset",
    "teachableLearnset": "sToedscoolTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_TOEDSCRUEL})",
    "baseBST": 335,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Toedscruel",
    "parsedTypes": [
      "GROUND",
      "GRASS"
    ],
    "parsedAbilities": [
      "MYCELIUM_MIGHT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TOEDSCRUEL",
    "family": "P_FAMILY_TOEDSCOOL",
    "baseHP": 80,
    "baseAttack": 70,
    "baseDefense": 65,
    "baseSpeed": 100,
    "baseSpAttack": 80,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_GRASS)",
    "abilities": "{ ABILITY_MYCELIUM_MIGHT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Toedscruel\")",
    "natDexNum": "NATIONAL_DEX_TOEDSCRUEL",
    "levelUpLearnset": "sToedscruelLevelUpLearnset",
    "teachableLearnset": "sToedscruelTeachableLearnset",
    "baseBST": 515,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Klawf",
    "parsedTypes": [
      "ROCK"
    ],
    "parsedAbilities": [
      "ANGER_SHELL",
      "SHELL_ARMOR",
      "REGENERATOR"
    ],
    "id": "SPECIES_KLAWF",
    "family": "P_FAMILY_KLAWF",
    "baseHP": 70,
    "baseAttack": 100,
    "baseDefense": 115,
    "baseSpeed": 75,
    "baseSpAttack": 35,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ROCK)",
    "abilities": "{ ABILITY_ANGER_SHELL, ABILITY_SHELL_ARMOR, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Klawf\")",
    "natDexNum": "NATIONAL_DEX_KLAWF",
    "levelUpLearnset": "sKlawfLevelUpLearnset",
    "teachableLearnset": "sKlawfTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Capsakid",
    "parsedTypes": [
      "GRASS"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "INSOMNIA",
      "KLUTZ"
    ],
    "id": "SPECIES_CAPSAKID",
    "family": "P_FAMILY_CAPSAKID",
    "baseHP": 50,
    "baseAttack": 62,
    "baseDefense": 40,
    "baseSpeed": 50,
    "baseSpAttack": 62,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_GRASS)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_INSOMNIA, ABILITY_KLUTZ }",
    "speciesName": "_(\"Capsakid\")",
    "natDexNum": "NATIONAL_DEX_CAPSAKID",
    "levelUpLearnset": "sCapsakidLevelUpLearnset",
    "teachableLearnset": "sCapsakidTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_FIRE_STONE, SPECIES_SCOVILLAIN})",
    "baseBST": 304,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scovillain",
    "parsedTypes": [
      "GRASS",
      "FIRE"
    ],
    "parsedAbilities": [
      "CHLOROPHYLL",
      "INSOMNIA",
      "MOODY"
    ],
    "id": "SPECIES_SCOVILLAIN",
    "family": "P_FAMILY_CAPSAKID",
    "baseHP": 65,
    "baseAttack": 108,
    "baseDefense": 65,
    "baseSpeed": 75,
    "baseSpAttack": 108,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_FIRE)",
    "abilities": "{ ABILITY_CHLOROPHYLL, ABILITY_INSOMNIA, ABILITY_MOODY }",
    "speciesName": "_(\"Scovillain\")",
    "natDexNum": "NATIONAL_DEX_SCOVILLAIN",
    "levelUpLearnset": "sScovillainLevelUpLearnset",
    "teachableLearnset": "sScovillainTeachableLearnset",
    "baseBST": 486,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rellor",
    "parsedTypes": [
      "BUG"
    ],
    "parsedAbilities": [
      "COMPOUND_EYES",
      "NONE",
      "SHED_SKIN"
    ],
    "id": "SPECIES_RELLOR",
    "family": "P_FAMILY_RELLOR",
    "baseHP": 41,
    "baseAttack": 50,
    "baseDefense": 60,
    "baseSpeed": 30,
    "baseSpAttack": 31,
    "baseSpDefense": 58,
    "types": "MON_TYPES(TYPE_BUG)",
    "abilities": "{ ABILITY_COMPOUND_EYES, ABILITY_NONE, ABILITY_SHED_SKIN }",
    "speciesName": "_(\"Rellor\")",
    "natDexNum": "NATIONAL_DEX_RELLOR",
    "levelUpLearnset": "sRellorLevelUpLearnset",
    "teachableLearnset": "sRellorTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_RABSCA, CONDITIONS({IF_MIN_OVERWORLD_STEPS, 1000})})",
    "baseBST": 270,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Rabsca",
    "parsedTypes": [
      "BUG",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "SYNCHRONIZE",
      "NONE",
      "TELEPATHY"
    ],
    "id": "SPECIES_RABSCA",
    "family": "P_FAMILY_RELLOR",
    "baseHP": 75,
    "baseAttack": 50,
    "baseDefense": 85,
    "baseSpeed": 45,
    "baseSpAttack": 115,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_BUG, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_SYNCHRONIZE, ABILITY_NONE, ABILITY_TELEPATHY }",
    "speciesName": "_(\"Rabsca\")",
    "natDexNum": "NATIONAL_DEX_RABSCA",
    "levelUpLearnset": "sRabscaLevelUpLearnset",
    "teachableLearnset": "sRabscaTeachableLearnset",
    "baseBST": 470,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flittle",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "ANTICIPATION",
      "FRISK",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_FLITTLE",
    "family": "P_FAMILY_FLITTLE",
    "baseHP": 30,
    "baseAttack": 35,
    "baseDefense": 30,
    "baseSpeed": 75,
    "baseSpAttack": 55,
    "baseSpDefense": 30,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_ANTICIPATION, ABILITY_FRISK, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Flittle\")",
    "natDexNum": "NATIONAL_DEX_FLITTLE",
    "levelUpLearnset": "sFlittleLevelUpLearnset",
    "teachableLearnset": "sFlittleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_ESPATHRA})",
    "baseBST": 255,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Espathra",
    "parsedTypes": [
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "OPPORTUNIST",
      "FRISK",
      "SPEED_BOOST"
    ],
    "id": "SPECIES_ESPATHRA",
    "family": "P_FAMILY_FLITTLE",
    "baseHP": 95,
    "baseAttack": 60,
    "baseDefense": 60,
    "baseSpeed": 105,
    "baseSpAttack": 101,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_OPPORTUNIST, ABILITY_FRISK, ABILITY_SPEED_BOOST }",
    "speciesName": "_(\"Espathra\")",
    "natDexNum": "NATIONAL_DEX_ESPATHRA",
    "levelUpLearnset": "sEspathraLevelUpLearnset",
    "teachableLearnset": "sEspathraTeachableLearnset",
    "baseBST": 481,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tinkatink",
    "parsedTypes": [
      "FAIRY",
      "STEEL"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "OWN_TEMPO",
      "PICKPOCKET"
    ],
    "id": "SPECIES_TINKATINK",
    "family": "P_FAMILY_TINKATINK",
    "baseHP": 50,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 58,
    "baseSpAttack": 35,
    "baseSpDefense": 64,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_STEEL)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_OWN_TEMPO, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Tinkatink\")",
    "natDexNum": "NATIONAL_DEX_TINKATINK",
    "levelUpLearnset": "sTinkatinkLevelUpLearnset",
    "teachableLearnset": "sTinkatinkTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 24, SPECIES_TINKATUFF})",
    "baseBST": 297,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tinkatuff",
    "parsedTypes": [
      "FAIRY",
      "STEEL"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "OWN_TEMPO",
      "PICKPOCKET"
    ],
    "id": "SPECIES_TINKATUFF",
    "family": "P_FAMILY_TINKATINK",
    "baseHP": 65,
    "baseAttack": 55,
    "baseDefense": 55,
    "baseSpeed": 78,
    "baseSpAttack": 45,
    "baseSpDefense": 82,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_STEEL)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_OWN_TEMPO, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Tinkatuff\")",
    "natDexNum": "NATIONAL_DEX_TINKATUFF",
    "levelUpLearnset": "sTinkatuffLevelUpLearnset",
    "teachableLearnset": "sTinkatuffTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_TINKATON})",
    "baseBST": 380,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tinkaton",
    "parsedTypes": [
      "FAIRY",
      "STEEL"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "OWN_TEMPO",
      "PICKPOCKET"
    ],
    "id": "SPECIES_TINKATON",
    "family": "P_FAMILY_TINKATINK",
    "baseHP": 85,
    "baseAttack": 75,
    "baseDefense": 77,
    "baseSpeed": 94,
    "baseSpAttack": 70,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_STEEL)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_OWN_TEMPO, ABILITY_PICKPOCKET }",
    "speciesName": "_(\"Tinkaton\")",
    "natDexNum": "NATIONAL_DEX_TINKATON",
    "levelUpLearnset": "sTinkatonLevelUpLearnset",
    "teachableLearnset": "sTinkatonTeachableLearnset",
    "baseBST": 506,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wiglett",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "GOOEY",
      "RATTLED",
      "SAND_VEIL"
    ],
    "id": "SPECIES_WIGLETT",
    "family": "P_FAMILY_WIGLETT",
    "baseHP": 10,
    "baseAttack": 55,
    "baseDefense": 25,
    "baseSpeed": 95,
    "baseSpAttack": 35,
    "baseSpDefense": 25,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_GOOEY, ABILITY_RATTLED, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Wiglett\")",
    "natDexNum": "NATIONAL_DEX_WIGLETT",
    "levelUpLearnset": "sWiglettLevelUpLearnset",
    "teachableLearnset": "sWiglettTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 26, SPECIES_WUGTRIO})",
    "baseBST": 245,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wugtrio",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "GOOEY",
      "RATTLED",
      "SAND_VEIL"
    ],
    "id": "SPECIES_WUGTRIO",
    "family": "P_FAMILY_WIGLETT",
    "baseHP": 35,
    "baseAttack": 100,
    "baseDefense": 50,
    "baseSpeed": 120,
    "baseSpAttack": 50,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_GOOEY, ABILITY_RATTLED, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Wugtrio\")",
    "natDexNum": "NATIONAL_DEX_WUGTRIO",
    "levelUpLearnset": "sWugtrioLevelUpLearnset",
    "teachableLearnset": "sWugtrioTeachableLearnset",
    "baseBST": 425,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Bombirdier",
    "parsedTypes": [
      "FLYING",
      "DARK"
    ],
    "parsedAbilities": [
      "BIG_PECKS",
      "KEEN_EYE",
      "ROCKY_PAYLOAD"
    ],
    "id": "SPECIES_BOMBIRDIER",
    "family": "P_FAMILY_BOMBIRDIER",
    "baseHP": 70,
    "baseAttack": 103,
    "baseDefense": 85,
    "baseSpeed": 82,
    "baseSpAttack": 60,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_DARK)",
    "abilities": "{ ABILITY_BIG_PECKS, ABILITY_KEEN_EYE, ABILITY_ROCKY_PAYLOAD }",
    "speciesName": "_(\"Bombirdier\")",
    "natDexNum": "NATIONAL_DEX_BOMBIRDIER",
    "levelUpLearnset": "sBombirdierLevelUpLearnset",
    "teachableLearnset": "sBombirdierTeachableLearnset",
    "baseBST": 485,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Finizen",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "WATER_VEIL",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_FINIZEN",
    "family": "P_FAMILY_FINIZEN",
    "baseHP": 70,
    "baseAttack": 45,
    "baseDefense": 40,
    "baseSpeed": 75,
    "baseSpAttack": 45,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_WATER_VEIL, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Finizen\")",
    "natDexNum": "NATIONAL_DEX_FINIZEN",
    "levelUpLearnset": "sFinizenLevelUpLearnset",
    "teachableLearnset": "sFinizenTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 38, SPECIES_PALAFIN_ZERO})",
    "baseBST": 315,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Palafin  Zero",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "ZERO_TO_HERO",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PALAFIN_ZERO",
    "family": "P_FAMILY_FINIZEN",
    "baseHP": 100,
    "baseAttack": 70,
    "baseDefense": 72,
    "baseSpeed": 100,
    "baseSpAttack": 53,
    "baseSpDefense": 62,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_ZERO_TO_HERO, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Palafin\")",
    "natDexNum": "NATIONAL_DEX_PALAFIN",
    "levelUpLearnset": "sPalafinLevelUpLearnset",
    "teachableLearnset": "sPalafinTeachableLearnset",
    "baseBST": 457,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Palafin  Hero",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "ZERO_TO_HERO",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PALAFIN_HERO",
    "family": "P_FAMILY_FINIZEN",
    "baseHP": 100,
    "baseAttack": 160,
    "baseDefense": 97,
    "baseSpeed": 100,
    "baseSpAttack": 106,
    "baseSpDefense": 87,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_ZERO_TO_HERO, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Palafin\")",
    "natDexNum": "NATIONAL_DEX_PALAFIN",
    "levelUpLearnset": "sPalafinLevelUpLearnset",
    "teachableLearnset": "sPalafinTeachableLearnset",
    "baseBST": 650,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Varoom",
    "parsedTypes": [
      "STEEL",
      "POISON"
    ],
    "parsedAbilities": [
      "OVERCOAT",
      "NONE",
      "SLOW_START"
    ],
    "id": "SPECIES_VAROOM",
    "family": "P_FAMILY_VAROOM",
    "baseHP": 45,
    "baseAttack": 70,
    "baseDefense": 63,
    "baseSpeed": 47,
    "baseSpAttack": 30,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_POISON)",
    "abilities": "{ ABILITY_OVERCOAT, ABILITY_NONE, ABILITY_SLOW_START }",
    "speciesName": "_(\"Varoom\")",
    "natDexNum": "NATIONAL_DEX_VAROOM",
    "levelUpLearnset": "sVaroomLevelUpLearnset",
    "teachableLearnset": "sVaroomTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 40, SPECIES_REVAVROOM})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Revavroom",
    "parsedTypes": [
      "STEEL",
      "POISON"
    ],
    "parsedAbilities": [
      "OVERCOAT",
      "NONE",
      "FILTER"
    ],
    "id": "SPECIES_REVAVROOM",
    "family": "P_FAMILY_VAROOM",
    "baseHP": 80,
    "baseAttack": 119,
    "baseDefense": 90,
    "baseSpeed": 90,
    "baseSpAttack": 54,
    "baseSpDefense": 67,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_POISON)",
    "abilities": "{ ABILITY_OVERCOAT, ABILITY_NONE, ABILITY_FILTER }",
    "speciesName": "_(\"Revavroom\")",
    "natDexNum": "NATIONAL_DEX_REVAVROOM",
    "levelUpLearnset": "sRevavroomLevelUpLearnset",
    "teachableLearnset": "sRevavroomTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cyclizar",
    "parsedTypes": [
      "DRAGON",
      "NORMAL"
    ],
    "parsedAbilities": [
      "SHED_SKIN",
      "NONE",
      "REGENERATOR"
    ],
    "id": "SPECIES_CYCLIZAR",
    "family": "P_FAMILY_CYCLIZAR",
    "baseHP": 70,
    "baseAttack": 95,
    "baseDefense": 65,
    "baseSpeed": 121,
    "baseSpAttack": 85,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_NORMAL)",
    "abilities": "{ ABILITY_SHED_SKIN, ABILITY_NONE, ABILITY_REGENERATOR }",
    "speciesName": "_(\"Cyclizar\")",
    "natDexNum": "NATIONAL_DEX_CYCLIZAR",
    "levelUpLearnset": "sCyclizarLevelUpLearnset",
    "teachableLearnset": "sCyclizarTeachableLearnset",
    "baseBST": 501,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Orthworm",
    "parsedTypes": [
      "STEEL"
    ],
    "parsedAbilities": [
      "EARTH_EATER",
      "NONE",
      "SAND_VEIL"
    ],
    "id": "SPECIES_ORTHWORM",
    "family": "P_FAMILY_ORTHWORM",
    "baseHP": 70,
    "baseAttack": 85,
    "baseDefense": 145,
    "baseSpeed": 65,
    "baseSpAttack": 60,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_STEEL)",
    "abilities": "{ ABILITY_EARTH_EATER, ABILITY_NONE, ABILITY_SAND_VEIL }",
    "speciesName": "_(\"Orthworm\")",
    "natDexNum": "NATIONAL_DEX_ORTHWORM",
    "levelUpLearnset": "sOrthwormLevelUpLearnset",
    "teachableLearnset": "sOrthwormTeachableLearnset",
    "baseBST": 480,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glimmet",
    "parsedTypes": [
      "ROCK",
      "POISON"
    ],
    "parsedAbilities": [
      "TOXIC_DEBRIS",
      "NONE",
      "CORROSION"
    ],
    "id": "SPECIES_GLIMMET",
    "family": "P_FAMILY_GLIMMET",
    "baseHP": 48,
    "baseAttack": 35,
    "baseDefense": 42,
    "baseSpeed": 60,
    "baseSpAttack": 105,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_POISON)",
    "abilities": "{ ABILITY_TOXIC_DEBRIS, ABILITY_NONE, ABILITY_CORROSION }",
    "speciesName": "_(\"Glimmet\")",
    "natDexNum": "NATIONAL_DEX_GLIMMET",
    "levelUpLearnset": "sGlimmetLevelUpLearnset",
    "teachableLearnset": "sGlimmetTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_GLIMMORA})",
    "baseBST": 350,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Glimmora",
    "parsedTypes": [
      "ROCK",
      "POISON"
    ],
    "parsedAbilities": [
      "TOXIC_DEBRIS",
      "NONE",
      "CORROSION"
    ],
    "id": "SPECIES_GLIMMORA",
    "family": "P_FAMILY_GLIMMET",
    "baseHP": 83,
    "baseAttack": 55,
    "baseDefense": 90,
    "baseSpeed": 86,
    "baseSpAttack": 130,
    "baseSpDefense": 81,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_POISON)",
    "abilities": "{ ABILITY_TOXIC_DEBRIS, ABILITY_NONE, ABILITY_CORROSION }",
    "speciesName": "_(\"Glimmora\")",
    "natDexNum": "NATIONAL_DEX_GLIMMORA",
    "levelUpLearnset": "sGlimmoraLevelUpLearnset",
    "teachableLearnset": "sGlimmoraTeachableLearnset",
    "baseBST": 525,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Greavard",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "PICKUP",
      "NONE",
      "FLUFFY"
    ],
    "id": "SPECIES_GREAVARD",
    "family": "P_FAMILY_GREAVARD",
    "baseHP": 50,
    "baseAttack": 61,
    "baseDefense": 60,
    "baseSpeed": 34,
    "baseSpAttack": 30,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_PICKUP, ABILITY_NONE, ABILITY_FLUFFY }",
    "speciesName": "_(\"Greavard\")",
    "natDexNum": "NATIONAL_DEX_GREAVARD",
    "levelUpLearnset": "sGreavardLevelUpLearnset",
    "teachableLearnset": "sGreavardTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 30, SPECIES_HOUNDSTONE, CONDITIONS({IF_TIME, TIME_NIGHT})})",
    "baseBST": 290,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Houndstone",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "SAND_RUSH",
      "NONE",
      "FLUFFY"
    ],
    "id": "SPECIES_HOUNDSTONE",
    "family": "P_FAMILY_GREAVARD",
    "baseHP": 72,
    "baseAttack": 101,
    "baseDefense": 100,
    "baseSpeed": 68,
    "baseSpAttack": 50,
    "baseSpDefense": 97,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_SAND_RUSH, ABILITY_NONE, ABILITY_FLUFFY }",
    "speciesName": "_(\"Houndstone\")",
    "natDexNum": "NATIONAL_DEX_HOUNDSTONE",
    "levelUpLearnset": "sHoundstoneLevelUpLearnset",
    "teachableLearnset": "sHoundstoneTeachableLearnset",
    "baseBST": 488,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flamigo",
    "parsedTypes": [
      "FLYING",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "SCRAPPY",
      "TANGLED_FEET",
      "COSTAR"
    ],
    "id": "SPECIES_FLAMIGO",
    "family": "P_FAMILY_FLAMIGO",
    "baseHP": 82,
    "baseAttack": 115,
    "baseDefense": 74,
    "baseSpeed": 90,
    "baseSpAttack": 75,
    "baseSpDefense": 64,
    "types": "MON_TYPES(TYPE_FLYING, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_SCRAPPY, ABILITY_TANGLED_FEET, ABILITY_COSTAR }",
    "speciesName": "_(\"Flamigo\")",
    "natDexNum": "NATIONAL_DEX_FLAMIGO",
    "levelUpLearnset": "sFlamigoLevelUpLearnset",
    "teachableLearnset": "sFlamigoTeachableLearnset",
    "baseBST": 500,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cetoddle",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "SNOW_CLOAK",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_CETODDLE",
    "family": "P_FAMILY_CETODDLE",
    "baseHP": 108,
    "baseAttack": 68,
    "baseDefense": 45,
    "baseSpeed": 43,
    "baseSpAttack": 30,
    "baseSpDefense": 40,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_SNOW_CLOAK, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Cetoddle\")",
    "natDexNum": "NATIONAL_DEX_CETODDLE",
    "levelUpLearnset": "sCetoddleLevelUpLearnset",
    "teachableLearnset": "sCetoddleTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_ICE_STONE, SPECIES_CETITAN})",
    "baseBST": 334,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Cetitan",
    "parsedTypes": [
      "ICE"
    ],
    "parsedAbilities": [
      "THICK_FAT",
      "SLUSH_RUSH",
      "SHEER_FORCE"
    ],
    "id": "SPECIES_CETITAN",
    "family": "P_FAMILY_CETODDLE",
    "baseHP": 170,
    "baseAttack": 113,
    "baseDefense": 65,
    "baseSpeed": 73,
    "baseSpAttack": 45,
    "baseSpDefense": 55,
    "types": "MON_TYPES(TYPE_ICE)",
    "abilities": "{ ABILITY_THICK_FAT, ABILITY_SLUSH_RUSH, ABILITY_SHEER_FORCE }",
    "speciesName": "_(\"Cetitan\")",
    "natDexNum": "NATIONAL_DEX_CETITAN",
    "levelUpLearnset": "sCetitanLevelUpLearnset",
    "teachableLearnset": "sCetitanTeachableLearnset",
    "baseBST": 521,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Veluza",
    "parsedTypes": [
      "WATER",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "MOLD_BREAKER",
      "NONE",
      "SHARPNESS"
    ],
    "id": "SPECIES_VELUZA",
    "family": "P_FAMILY_VELUZA",
    "baseHP": 90,
    "baseAttack": 102,
    "baseDefense": 73,
    "baseSpeed": 70,
    "baseSpAttack": 78,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_MOLD_BREAKER, ABILITY_NONE, ABILITY_SHARPNESS }",
    "speciesName": "_(\"Veluza\")",
    "natDexNum": "NATIONAL_DEX_VELUZA",
    "levelUpLearnset": "sVeluzaLevelUpLearnset",
    "teachableLearnset": "sVeluzaTeachableLearnset",
    "baseBST": 478,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Dondozo",
    "parsedTypes": [
      "WATER"
    ],
    "parsedAbilities": [
      "UNAWARE",
      "OBLIVIOUS",
      "WATER_VEIL"
    ],
    "id": "SPECIES_DONDOZO",
    "family": "P_FAMILY_DONDOZO",
    "baseHP": 150,
    "baseAttack": 100,
    "baseDefense": 115,
    "baseSpeed": 35,
    "baseSpAttack": 65,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_WATER)",
    "abilities": "{ ABILITY_UNAWARE, ABILITY_OBLIVIOUS, ABILITY_WATER_VEIL }",
    "speciesName": "_(\"Dondozo\")",
    "natDexNum": "NATIONAL_DEX_DONDOZO",
    "levelUpLearnset": "sDondozoLevelUpLearnset",
    "teachableLearnset": "sDondozoTeachableLearnset",
    "baseBST": 530,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tatsugiri  Curly",
    "parsedTypes": [
      "DRAGON",
      "WATER"
    ],
    "parsedAbilities": [
      "COMMANDER",
      "NONE",
      "STORM_DRAIN"
    ],
    "id": "SPECIES_TATSUGIRI_CURLY",
    "family": "P_FAMILY_TATSUGIRI",
    "baseHP": 68,
    "baseAttack": 50,
    "baseDefense": 60,
    "baseSpeed": 82,
    "baseSpAttack": 120,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_WATER)",
    "abilities": "{ ABILITY_COMMANDER, ABILITY_NONE, ABILITY_STORM_DRAIN }",
    "speciesName": "_(\"Tatsugiri\")",
    "natDexNum": "NATIONAL_DEX_TATSUGIRI",
    "levelUpLearnset": "sTatsugiriLevelUpLearnset",
    "teachableLearnset": "sTatsugiriTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tatsugiri  Droopy",
    "parsedTypes": [
      "DRAGON",
      "WATER"
    ],
    "parsedAbilities": [
      "COMMANDER",
      "NONE",
      "STORM_DRAIN"
    ],
    "id": "SPECIES_TATSUGIRI_DROOPY",
    "family": "P_FAMILY_TATSUGIRI",
    "baseHP": 68,
    "baseAttack": 50,
    "baseDefense": 60,
    "baseSpeed": 82,
    "baseSpAttack": 120,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_WATER)",
    "abilities": "{ ABILITY_COMMANDER, ABILITY_NONE, ABILITY_STORM_DRAIN }",
    "speciesName": "_(\"Tatsugiri\")",
    "natDexNum": "NATIONAL_DEX_TATSUGIRI",
    "levelUpLearnset": "sTatsugiriLevelUpLearnset",
    "teachableLearnset": "sTatsugiriTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Tatsugiri  Stretchy",
    "parsedTypes": [
      "DRAGON",
      "WATER"
    ],
    "parsedAbilities": [
      "COMMANDER",
      "NONE",
      "STORM_DRAIN"
    ],
    "id": "SPECIES_TATSUGIRI_STRETCHY",
    "family": "P_FAMILY_TATSUGIRI",
    "baseHP": 68,
    "baseAttack": 50,
    "baseDefense": 60,
    "baseSpeed": 82,
    "baseSpAttack": 120,
    "baseSpDefense": 95,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_WATER)",
    "abilities": "{ ABILITY_COMMANDER, ABILITY_NONE, ABILITY_STORM_DRAIN }",
    "speciesName": "_(\"Tatsugiri\")",
    "natDexNum": "NATIONAL_DEX_TATSUGIRI",
    "levelUpLearnset": "sTatsugiriLevelUpLearnset",
    "teachableLearnset": "sTatsugiriTeachableLearnset",
    "baseBST": 475,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Great  Tusk",
    "parsedTypes": [
      "GROUND",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GREAT_TUSK",
    "family": "P_FAMILY_GREAT_TUSK",
    "baseHP": 115,
    "baseAttack": 131,
    "baseDefense": 131,
    "baseSpeed": 87,
    "baseSpAttack": 53,
    "baseSpDefense": 53,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Great Tusk\")",
    "natDexNum": "NATIONAL_DEX_GREAT_TUSK",
    "levelUpLearnset": "sGreatTuskLevelUpLearnset",
    "teachableLearnset": "sGreatTuskTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Scream  Tail",
    "parsedTypes": [
      "FAIRY",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SCREAM_TAIL",
    "family": "P_FAMILY_SCREAM_TAIL",
    "baseHP": 115,
    "baseAttack": 65,
    "baseDefense": 99,
    "baseSpeed": 111,
    "baseSpAttack": 65,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Scream Tail\")",
    "natDexNum": "NATIONAL_DEX_SCREAM_TAIL",
    "levelUpLearnset": "sScreamTailLevelUpLearnset",
    "teachableLearnset": "sScreamTailTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Brute  Bonnet",
    "parsedTypes": [
      "GRASS",
      "DARK"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_BRUTE_BONNET",
    "family": "P_FAMILY_BRUTE_BONNET",
    "baseHP": 111,
    "baseAttack": 127,
    "baseDefense": 99,
    "baseSpeed": 55,
    "baseSpAttack": 79,
    "baseSpDefense": 99,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_DARK)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Brute Bonnet\")",
    "natDexNum": "NATIONAL_DEX_BRUTE_BONNET",
    "levelUpLearnset": "sBruteBonnetLevelUpLearnset",
    "teachableLearnset": "sBruteBonnetTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Flutter  Mane",
    "parsedTypes": [
      "GHOST",
      "FAIRY"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_FLUTTER_MANE",
    "family": "P_FAMILY_FLUTTER_MANE",
    "baseHP": 55,
    "baseAttack": 55,
    "baseDefense": 55,
    "baseSpeed": 135,
    "baseSpAttack": 135,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_GHOST, TYPE_FAIRY)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Flutter Mane\")",
    "natDexNum": "NATIONAL_DEX_FLUTTER_MANE",
    "levelUpLearnset": "sFlutterManeLevelUpLearnset",
    "teachableLearnset": "sFlutterManeTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Slither  Wing",
    "parsedTypes": [
      "BUG",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SLITHER_WING",
    "family": "P_FAMILY_SLITHER_WING",
    "baseHP": 85,
    "baseAttack": 135,
    "baseDefense": 79,
    "baseSpeed": 81,
    "baseSpAttack": 85,
    "baseSpDefense": 105,
    "types": "MON_TYPES(TYPE_BUG, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Slither Wing\")",
    "natDexNum": "NATIONAL_DEX_SLITHER_WING",
    "levelUpLearnset": "sSlitherWingLevelUpLearnset",
    "teachableLearnset": "sSlitherWingTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sandy  Shocks",
    "parsedTypes": [
      "ELECTRIC",
      "GROUND"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_SANDY_SHOCKS",
    "family": "P_FAMILY_SANDY_SHOCKS",
    "baseHP": 85,
    "baseAttack": 81,
    "baseDefense": 97,
    "baseSpeed": 101,
    "baseSpAttack": 121,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_GROUND)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Sandy Shocks\")",
    "natDexNum": "NATIONAL_DEX_SANDY_SHOCKS",
    "levelUpLearnset": "sSandyShocksLevelUpLearnset",
    "teachableLearnset": "sSandyShocksTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Treads",
    "parsedTypes": [
      "GROUND",
      "STEEL"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_TREADS",
    "family": "P_FAMILY_IRON_TREADS",
    "baseHP": 90,
    "baseAttack": 112,
    "baseDefense": 120,
    "baseSpeed": 106,
    "baseSpAttack": 72,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GROUND, TYPE_STEEL)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Treads\")",
    "natDexNum": "NATIONAL_DEX_IRON_TREADS",
    "levelUpLearnset": "sIronTreadsLevelUpLearnset",
    "teachableLearnset": "sIronTreadsTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Bundle",
    "parsedTypes": [
      "ICE",
      "WATER"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_BUNDLE",
    "family": "P_FAMILY_IRON_BUNDLE",
    "baseHP": 56,
    "baseAttack": 80,
    "baseDefense": 114,
    "baseSpeed": 136,
    "baseSpAttack": 124,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_ICE, TYPE_WATER)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Bundle\")",
    "natDexNum": "NATIONAL_DEX_IRON_BUNDLE",
    "levelUpLearnset": "sIronBundleLevelUpLearnset",
    "teachableLearnset": "sIronBundleTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Hands",
    "parsedTypes": [
      "FIGHTING",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_HANDS",
    "family": "P_FAMILY_IRON_HANDS",
    "baseHP": 154,
    "baseAttack": 140,
    "baseDefense": 108,
    "baseSpeed": 50,
    "baseSpAttack": 50,
    "baseSpDefense": 68,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Hands\")",
    "natDexNum": "NATIONAL_DEX_IRON_HANDS",
    "levelUpLearnset": "sIronHandsLevelUpLearnset",
    "teachableLearnset": "sIronHandsTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Jugulis",
    "parsedTypes": [
      "DARK",
      "FLYING"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_JUGULIS",
    "family": "P_FAMILY_IRON_JUGULIS",
    "baseHP": 94,
    "baseAttack": 80,
    "baseDefense": 86,
    "baseSpeed": 108,
    "baseSpAttack": 122,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FLYING)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Jugulis\")",
    "natDexNum": "NATIONAL_DEX_IRON_JUGULIS",
    "levelUpLearnset": "sIronJugulisLevelUpLearnset",
    "teachableLearnset": "sIronJugulisTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Moth",
    "parsedTypes": [
      "FIRE",
      "POISON"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_MOTH",
    "family": "P_FAMILY_IRON_MOTH",
    "baseHP": 80,
    "baseAttack": 70,
    "baseDefense": 60,
    "baseSpeed": 110,
    "baseSpAttack": 140,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_POISON)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Moth\")",
    "natDexNum": "NATIONAL_DEX_IRON_MOTH",
    "levelUpLearnset": "sIronMothLevelUpLearnset",
    "teachableLearnset": "sIronMothTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Thorns",
    "parsedTypes": [
      "ROCK",
      "ELECTRIC"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_THORNS",
    "family": "P_FAMILY_IRON_THORNS",
    "baseHP": 100,
    "baseAttack": 134,
    "baseDefense": 110,
    "baseSpeed": 72,
    "baseSpAttack": 70,
    "baseSpDefense": 84,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_ELECTRIC)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Thorns\")",
    "natDexNum": "NATIONAL_DEX_IRON_THORNS",
    "levelUpLearnset": "sIronThornsLevelUpLearnset",
    "teachableLearnset": "sIronThornsTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Frigibax",
    "parsedTypes": [
      "DRAGON",
      "ICE"
    ],
    "parsedAbilities": [
      "THERMAL_EXCHANGE",
      "NONE",
      "ICE_BODY"
    ],
    "id": "SPECIES_FRIGIBAX",
    "family": "P_FAMILY_FRIGIBAX",
    "baseHP": 65,
    "baseAttack": 75,
    "baseDefense": 45,
    "baseSpeed": 55,
    "baseSpAttack": 35,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ICE)",
    "abilities": "{ ABILITY_THERMAL_EXCHANGE, ABILITY_NONE, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Frigibax\")",
    "natDexNum": "NATIONAL_DEX_FRIGIBAX",
    "levelUpLearnset": "sFrigibaxLevelUpLearnset",
    "teachableLearnset": "sFrigibaxTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 35, SPECIES_ARCTIBAX})",
    "baseBST": 320,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Arctibax",
    "parsedTypes": [
      "DRAGON",
      "ICE"
    ],
    "parsedAbilities": [
      "THERMAL_EXCHANGE",
      "NONE",
      "ICE_BODY"
    ],
    "id": "SPECIES_ARCTIBAX",
    "family": "P_FAMILY_FRIGIBAX",
    "baseHP": 90,
    "baseAttack": 95,
    "baseDefense": 66,
    "baseSpeed": 62,
    "baseSpAttack": 45,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ICE)",
    "abilities": "{ ABILITY_THERMAL_EXCHANGE, ABILITY_NONE, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Arctibax\")",
    "natDexNum": "NATIONAL_DEX_ARCTIBAX",
    "levelUpLearnset": "sArctibaxLevelUpLearnset",
    "teachableLearnset": "sArctibaxTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 54, SPECIES_BAXCALIBUR})",
    "baseBST": 423,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Baxcalibur",
    "parsedTypes": [
      "DRAGON",
      "ICE"
    ],
    "parsedAbilities": [
      "THERMAL_EXCHANGE",
      "NONE",
      "ICE_BODY"
    ],
    "id": "SPECIES_BAXCALIBUR",
    "family": "P_FAMILY_FRIGIBAX",
    "baseHP": 115,
    "baseAttack": 145,
    "baseDefense": 92,
    "baseSpeed": 87,
    "baseSpAttack": 75,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_ICE)",
    "abilities": "{ ABILITY_THERMAL_EXCHANGE, ABILITY_NONE, ABILITY_ICE_BODY }",
    "speciesName": "_(\"Baxcalibur\")",
    "natDexNum": "NATIONAL_DEX_BAXCALIBUR",
    "levelUpLearnset": "sBaxcaliburLevelUpLearnset",
    "teachableLearnset": "sBaxcaliburTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gimmighoul  Chest",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "RATTLED",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GIMMIGHOUL_CHEST",
    "family": "P_FAMILY_GIMMIGHOUL",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 70,
    "baseSpeed": 10,
    "baseSpAttack": 75,
    "baseSpDefense": 70,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_RATTLED, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Gimmighoul\")",
    "natDexNum": "NATIONAL_DEX_GIMMIGHOUL",
    "levelUpLearnset": "sGimmighoulLevelUpLearnset",
    "teachableLearnset": "sGimmighoulTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_GHOLDENGO, CONDITIONS({IF_BAG_ITEM_COUNT, ITEM_GIMMIGHOUL_COIN, 999})})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gimmighoul  Roaming",
    "parsedTypes": [
      "GHOST"
    ],
    "parsedAbilities": [
      "RUN_AWAY",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GIMMIGHOUL_ROAMING",
    "family": "P_FAMILY_GIMMIGHOUL",
    "baseHP": 45,
    "baseAttack": 30,
    "baseDefense": 25,
    "baseSpeed": 80,
    "baseSpAttack": 75,
    "baseSpDefense": 45,
    "types": "MON_TYPES(TYPE_GHOST)",
    "abilities": "{ ABILITY_RUN_AWAY, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Gimmighoul\")",
    "natDexNum": "NATIONAL_DEX_GIMMIGHOUL",
    "levelUpLearnset": "sGimmighoulLevelUpLearnset",
    "teachableLearnset": "sGimmighoulTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_LEVEL, 0, SPECIES_GHOLDENGO, CONDITIONS({IF_BAG_ITEM_COUNT, ITEM_GIMMIGHOUL_COIN, 999})})",
    "baseBST": 300,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gholdengo",
    "parsedTypes": [
      "STEEL",
      "GHOST"
    ],
    "parsedAbilities": [
      "GOOD_AS_GOLD",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GHOLDENGO",
    "family": "P_FAMILY_GIMMIGHOUL",
    "baseHP": 87,
    "baseAttack": 60,
    "baseDefense": 95,
    "baseSpeed": 84,
    "baseSpAttack": 133,
    "baseSpDefense": 91,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_GHOST)",
    "abilities": "{ ABILITY_GOOD_AS_GOLD, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Gholdengo\")",
    "natDexNum": "NATIONAL_DEX_GHOLDENGO",
    "levelUpLearnset": "sGholdengoLevelUpLearnset",
    "teachableLearnset": "sGholdengoTeachableLearnset",
    "baseBST": 550,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Wo  Chien",
    "parsedTypes": [
      "DARK",
      "GRASS"
    ],
    "parsedAbilities": [
      "TABLETS_OF_RUIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_WO_CHIEN",
    "family": "P_FAMILY_WO_CHIEN",
    "baseHP": 85,
    "baseAttack": 85,
    "baseDefense": 100,
    "baseSpeed": 70,
    "baseSpAttack": 95,
    "baseSpDefense": 135,
    "types": "MON_TYPES(TYPE_DARK, TYPE_GRASS)",
    "abilities": "{ ABILITY_TABLETS_OF_RUIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Wo-Chien\")",
    "natDexNum": "NATIONAL_DEX_WO_CHIEN",
    "levelUpLearnset": "sWoChienLevelUpLearnset",
    "teachableLearnset": "sWoChienTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chien  Pao",
    "parsedTypes": [
      "DARK",
      "ICE"
    ],
    "parsedAbilities": [
      "SWORD_OF_RUIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHIEN_PAO",
    "family": "P_FAMILY_CHIEN_PAO",
    "baseHP": 80,
    "baseAttack": 120,
    "baseDefense": 80,
    "baseSpeed": 135,
    "baseSpAttack": 90,
    "baseSpDefense": 65,
    "types": "MON_TYPES(TYPE_DARK, TYPE_ICE)",
    "abilities": "{ ABILITY_SWORD_OF_RUIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Chien-Pao\")",
    "natDexNum": "NATIONAL_DEX_CHIEN_PAO",
    "levelUpLearnset": "sChienPaoLevelUpLearnset",
    "teachableLearnset": "sChienPaoTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Ting  Lu",
    "parsedTypes": [
      "DARK",
      "GROUND"
    ],
    "parsedAbilities": [
      "VESSEL_OF_RUIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TING_LU",
    "family": "P_FAMILY_TING_LU",
    "baseHP": 155,
    "baseAttack": 110,
    "baseDefense": 125,
    "baseSpeed": 45,
    "baseSpAttack": 55,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_DARK, TYPE_GROUND)",
    "abilities": "{ ABILITY_VESSEL_OF_RUIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Ting-Lu\")",
    "natDexNum": "NATIONAL_DEX_TING_LU",
    "levelUpLearnset": "sTingLuLevelUpLearnset",
    "teachableLearnset": "sTingLuTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Chi  Yu",
    "parsedTypes": [
      "DARK",
      "FIRE"
    ],
    "parsedAbilities": [
      "BEADS_OF_RUIN",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_CHI_YU",
    "family": "P_FAMILY_CHI_YU",
    "baseHP": 55,
    "baseAttack": 80,
    "baseDefense": 80,
    "baseSpeed": 100,
    "baseSpAttack": 135,
    "baseSpDefense": 120,
    "types": "MON_TYPES(TYPE_DARK, TYPE_FIRE)",
    "abilities": "{ ABILITY_BEADS_OF_RUIN, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Chi-Yu\")",
    "natDexNum": "NATIONAL_DEX_CHI_YU",
    "levelUpLearnset": "sChiYuLevelUpLearnset",
    "teachableLearnset": "sChiYuTeachableLearnset",
    "baseBST": 570,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Roaring  Moon",
    "parsedTypes": [
      "DRAGON",
      "DARK"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_ROARING_MOON",
    "family": "P_FAMILY_ROARING_MOON",
    "baseHP": 105,
    "baseAttack": 139,
    "baseDefense": 71,
    "baseSpeed": 119,
    "baseSpAttack": 55,
    "baseSpDefense": 101,
    "types": "MON_TYPES(TYPE_DRAGON, TYPE_DARK)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Roaring Moon\")",
    "natDexNum": "NATIONAL_DEX_ROARING_MOON",
    "levelUpLearnset": "sRoaringMoonLevelUpLearnset",
    "teachableLearnset": "sRoaringMoonTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Valiant",
    "parsedTypes": [
      "FAIRY",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_VALIANT",
    "family": "P_FAMILY_IRON_VALIANT",
    "baseHP": 74,
    "baseAttack": 130,
    "baseDefense": 90,
    "baseSpeed": 116,
    "baseSpAttack": 120,
    "baseSpDefense": 60,
    "types": "MON_TYPES(TYPE_FAIRY, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Valiant\")",
    "natDexNum": "NATIONAL_DEX_IRON_VALIANT",
    "levelUpLearnset": "sIronValiantLevelUpLearnset",
    "teachableLearnset": "sIronValiantTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Koraidon",
    "parsedTypes": [
      "FIGHTING",
      "DRAGON"
    ],
    "parsedAbilities": [
      "ORICHALCUM_PULSE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_KORAIDON",
    "family": "P_FAMILY_KORAIDON",
    "baseHP": 100,
    "baseAttack": 135,
    "baseDefense": 115,
    "baseSpeed": 135,
    "baseSpAttack": 85,
    "baseSpDefense": 100,
    "types": "MON_TYPES(TYPE_FIGHTING, TYPE_DRAGON)",
    "abilities": "{ ABILITY_ORICHALCUM_PULSE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Koraidon\")",
    "natDexNum": "NATIONAL_DEX_KORAIDON",
    "levelUpLearnset": "sKoraidonLevelUpLearnset",
    "teachableLearnset": "sKoraidonTeachableLearnset",
    "baseBST": 670,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Miraidon",
    "parsedTypes": [
      "ELECTRIC",
      "DRAGON"
    ],
    "parsedAbilities": [
      "HADRON_ENGINE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_MIRAIDON",
    "family": "P_FAMILY_MIRAIDON",
    "baseHP": 100,
    "baseAttack": 85,
    "baseDefense": 100,
    "baseSpeed": 135,
    "baseSpAttack": 135,
    "baseSpDefense": 115,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_DRAGON)",
    "abilities": "{ ABILITY_HADRON_ENGINE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Miraidon\")",
    "natDexNum": "NATIONAL_DEX_MIRAIDON",
    "levelUpLearnset": "sMiraidonLevelUpLearnset",
    "teachableLearnset": "sMiraidonTeachableLearnset",
    "baseBST": 670,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Walking  Wake",
    "parsedTypes": [
      "WATER",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_WALKING_WAKE",
    "family": "P_FAMILY_WALKING_WAKE",
    "baseHP": 99,
    "baseAttack": 83,
    "baseDefense": 91,
    "baseSpeed": 109,
    "baseSpAttack": 125,
    "baseSpDefense": 83,
    "types": "MON_TYPES(TYPE_WATER, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Walking Wake\")",
    "natDexNum": "NATIONAL_DEX_WALKING_WAKE",
    "levelUpLearnset": "sWalkingWakeLevelUpLearnset",
    "teachableLearnset": "sWalkingWakeTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Leaves",
    "parsedTypes": [
      "GRASS",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_LEAVES",
    "family": "P_FAMILY_IRON_LEAVES",
    "baseHP": 90,
    "baseAttack": 130,
    "baseDefense": 88,
    "baseSpeed": 104,
    "baseSpAttack": 70,
    "baseSpDefense": 108,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Leaves\")",
    "natDexNum": "NATIONAL_DEX_IRON_LEAVES",
    "levelUpLearnset": "sIronLeavesLevelUpLearnset",
    "teachableLearnset": "sIronLeavesTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poltchageist  Counterfeit",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "HOSPITALITY",
      "NONE",
      "HEATPROOF"
    ],
    "id": "SPECIES_POLTCHAGEIST_COUNTERFEIT",
    "family": "P_FAMILY_POLTCHAGEIST",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 74,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_HOSPITALITY, ABILITY_NONE, ABILITY_HEATPROOF }",
    "speciesName": "_(\"Poltchageist\")",
    "natDexNum": "NATIONAL_DEX_POLTCHAGEIST",
    "levelUpLearnset": "sPoltchageistLevelUpLearnset",
    "teachableLearnset": "sPoltchageistTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_UNREMARKABLE_TEACUP, SPECIES_SINISTCHA_UNREMARKABLE})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Poltchageist  Artisan",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "HOSPITALITY",
      "NONE",
      "HEATPROOF"
    ],
    "id": "SPECIES_POLTCHAGEIST_ARTISAN",
    "family": "P_FAMILY_POLTCHAGEIST",
    "baseHP": 40,
    "baseAttack": 45,
    "baseDefense": 45,
    "baseSpeed": 50,
    "baseSpAttack": 74,
    "baseSpDefense": 54,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_HOSPITALITY, ABILITY_NONE, ABILITY_HEATPROOF }",
    "speciesName": "_(\"Poltchageist\")",
    "natDexNum": "NATIONAL_DEX_POLTCHAGEIST",
    "levelUpLearnset": "sPoltchageistLevelUpLearnset",
    "teachableLearnset": "sPoltchageistTeachableLearnset",
    "evolutions": "EVOLUTION({EVO_ITEM, ITEM_MASTERPIECE_TEACUP, SPECIES_SINISTCHA_MASTERPIECE})",
    "baseBST": 308,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sinistcha  Unremarkable",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "HOSPITALITY",
      "NONE",
      "HEATPROOF"
    ],
    "id": "SPECIES_SINISTCHA_UNREMARKABLE",
    "family": "P_FAMILY_POLTCHAGEIST",
    "baseHP": 71,
    "baseAttack": 60,
    "baseDefense": 106,
    "baseSpeed": 70,
    "baseSpAttack": 121,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_HOSPITALITY, ABILITY_NONE, ABILITY_HEATPROOF }",
    "speciesName": "_(\"Sinistcha\")",
    "natDexNum": "NATIONAL_DEX_SINISTCHA",
    "levelUpLearnset": "sSinistchaLevelUpLearnset",
    "teachableLearnset": "sSinistchaTeachableLearnset",
    "baseBST": 508,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Sinistcha  Masterpiece",
    "parsedTypes": [
      "GRASS",
      "GHOST"
    ],
    "parsedAbilities": [
      "HOSPITALITY",
      "NONE",
      "HEATPROOF"
    ],
    "id": "SPECIES_SINISTCHA_MASTERPIECE",
    "family": "P_FAMILY_POLTCHAGEIST",
    "baseHP": 71,
    "baseAttack": 60,
    "baseDefense": 106,
    "baseSpeed": 70,
    "baseSpAttack": 121,
    "baseSpDefense": 80,
    "types": "MON_TYPES(TYPE_GRASS, TYPE_GHOST)",
    "abilities": "{ ABILITY_HOSPITALITY, ABILITY_NONE, ABILITY_HEATPROOF }",
    "speciesName": "_(\"Sinistcha\")",
    "natDexNum": "NATIONAL_DEX_SINISTCHA",
    "levelUpLearnset": "sSinistchaLevelUpLearnset",
    "teachableLearnset": "sSinistchaTeachableLearnset",
    "baseBST": 508,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Okidogi",
    "parsedTypes": [
      "POISON",
      "FIGHTING"
    ],
    "parsedAbilities": [
      "TOXIC_CHAIN",
      "NONE",
      "GUARD_DOG"
    ],
    "id": "SPECIES_OKIDOGI",
    "family": "P_FAMILY_OKIDOGI",
    "baseHP": 88,
    "baseAttack": 128,
    "baseDefense": 115,
    "baseSpeed": 80,
    "baseSpAttack": 58,
    "baseSpDefense": 86,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FIGHTING)",
    "abilities": "{ ABILITY_TOXIC_CHAIN, ABILITY_NONE, ABILITY_GUARD_DOG }",
    "speciesName": "_(\"Okidogi\")",
    "natDexNum": "NATIONAL_DEX_OKIDOGI",
    "levelUpLearnset": "sOkidogiLevelUpLearnset",
    "teachableLearnset": "sOkidogiTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Munkidori",
    "parsedTypes": [
      "POISON",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "TOXIC_CHAIN",
      "NONE",
      "FRISK"
    ],
    "id": "SPECIES_MUNKIDORI",
    "family": "P_FAMILY_MUNKIDORI",
    "baseHP": 88,
    "baseAttack": 75,
    "baseDefense": 66,
    "baseSpeed": 106,
    "baseSpAttack": 130,
    "baseSpDefense": 90,
    "types": "MON_TYPES(TYPE_POISON, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_TOXIC_CHAIN, ABILITY_NONE, ABILITY_FRISK }",
    "speciesName": "_(\"Munkidori\")",
    "natDexNum": "NATIONAL_DEX_MUNKIDORI",
    "levelUpLearnset": "sMunkidoriLevelUpLearnset",
    "teachableLearnset": "sMunkidoriTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Fezandipiti",
    "parsedTypes": [
      "POISON",
      "FAIRY"
    ],
    "parsedAbilities": [
      "TOXIC_CHAIN",
      "NONE",
      "TECHNICIAN"
    ],
    "id": "SPECIES_FEZANDIPITI",
    "family": "P_FAMILY_FEZANDIPITI",
    "baseHP": 88,
    "baseAttack": 91,
    "baseDefense": 82,
    "baseSpeed": 99,
    "baseSpAttack": 70,
    "baseSpDefense": 125,
    "types": "MON_TYPES(TYPE_POISON, TYPE_FAIRY)",
    "abilities": "{ ABILITY_TOXIC_CHAIN, ABILITY_NONE, ABILITY_TECHNICIAN }",
    "speciesName": "_(\"Fezandipiti\")",
    "natDexNum": "NATIONAL_DEX_FEZANDIPITI",
    "levelUpLearnset": "sFezandipitiLevelUpLearnset",
    "teachableLearnset": "sFezandipitiTeachableLearnset",
    "baseBST": 555,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Gouging  Fire",
    "parsedTypes": [
      "FIRE",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_GOUGING_FIRE",
    "family": "P_FAMILY_GOUGING_FIRE",
    "baseHP": 105,
    "baseAttack": 115,
    "baseDefense": 121,
    "baseSpeed": 91,
    "baseSpAttack": 65,
    "baseSpDefense": 93,
    "types": "MON_TYPES(TYPE_FIRE, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Gouging Fire\")",
    "natDexNum": "NATIONAL_DEX_GOUGING_FIRE",
    "levelUpLearnset": "sGougingFireLevelUpLearnset",
    "teachableLearnset": "sGougingFireTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Raging  Bolt",
    "parsedTypes": [
      "ELECTRIC",
      "DRAGON"
    ],
    "parsedAbilities": [
      "PROTOSYNTHESIS",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_RAGING_BOLT",
    "family": "P_FAMILY_RAGING_BOLT",
    "baseHP": 125,
    "baseAttack": 73,
    "baseDefense": 91,
    "baseSpeed": 75,
    "baseSpAttack": 137,
    "baseSpDefense": 89,
    "types": "MON_TYPES(TYPE_ELECTRIC, TYPE_DRAGON)",
    "abilities": "{ ABILITY_PROTOSYNTHESIS, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Raging Bolt\")",
    "natDexNum": "NATIONAL_DEX_RAGING_BOLT",
    "levelUpLearnset": "sRagingBoltLevelUpLearnset",
    "teachableLearnset": "sRagingBoltTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Boulder",
    "parsedTypes": [
      "ROCK",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_BOULDER",
    "family": "P_FAMILY_IRON_BOULDER",
    "baseHP": 90,
    "baseAttack": 120,
    "baseDefense": 80,
    "baseSpeed": 124,
    "baseSpAttack": 68,
    "baseSpDefense": 108,
    "types": "MON_TYPES(TYPE_ROCK, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Boulder\")",
    "natDexNum": "NATIONAL_DEX_IRON_BOULDER",
    "levelUpLearnset": "sIronBoulderLevelUpLearnset",
    "teachableLearnset": "sIronBoulderTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Iron  Crown",
    "parsedTypes": [
      "STEEL",
      "PSYCHIC"
    ],
    "parsedAbilities": [
      "QUARK_DRIVE",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_IRON_CROWN",
    "family": "P_FAMILY_IRON_CROWN",
    "baseHP": 90,
    "baseAttack": 72,
    "baseDefense": 100,
    "baseSpeed": 98,
    "baseSpAttack": 122,
    "baseSpDefense": 108,
    "types": "MON_TYPES(TYPE_STEEL, TYPE_PSYCHIC)",
    "abilities": "{ ABILITY_QUARK_DRIVE, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Iron Crown\")",
    "natDexNum": "NATIONAL_DEX_IRON_CROWN",
    "levelUpLearnset": "sIronCrownLevelUpLearnset",
    "teachableLearnset": "sIronCrownTeachableLearnset",
    "baseBST": 590,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Terapagos  Normal",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TERA_SHIFT",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TERAPAGOS_NORMAL",
    "family": "P_FAMILY_TERAPAGOS",
    "baseHP": 90,
    "baseAttack": 65,
    "baseDefense": 85,
    "baseSpeed": 60,
    "baseSpAttack": 65,
    "baseSpDefense": 85,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TERA_SHIFT, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Terapagos\")",
    "natDexNum": "NATIONAL_DEX_TERAPAGOS",
    "levelUpLearnset": "sTerapagosLevelUpLearnset",
    "teachableLearnset": "sTerapagosTeachableLearnset",
    "baseBST": 450,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Terapagos  Terastal",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TERA_SHELL",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TERAPAGOS_TERASTAL",
    "family": "P_FAMILY_TERAPAGOS",
    "baseHP": 95,
    "baseAttack": 95,
    "baseDefense": 110,
    "baseSpeed": 85,
    "baseSpAttack": 105,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TERA_SHELL, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Terapagos\")",
    "natDexNum": "NATIONAL_DEX_TERAPAGOS",
    "levelUpLearnset": "sTerapagosLevelUpLearnset",
    "teachableLearnset": "sTerapagosTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Terapagos  Stellar",
    "parsedTypes": [
      "NORMAL"
    ],
    "parsedAbilities": [
      "TERAFORM_ZERO",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_TERAPAGOS_STELLAR",
    "family": "P_FAMILY_TERAPAGOS",
    "baseHP": 160,
    "baseAttack": 105,
    "baseDefense": 110,
    "baseSpeed": 85,
    "baseSpAttack": 130,
    "baseSpDefense": 110,
    "types": "MON_TYPES(TYPE_NORMAL)",
    "abilities": "{ ABILITY_TERAFORM_ZERO, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Terapagos\")",
    "natDexNum": "NATIONAL_DEX_TERAPAGOS",
    "levelUpLearnset": "sTerapagosLevelUpLearnset",
    "teachableLearnset": "sTerapagosTeachableLearnset",
    "baseBST": 700,
    "catchRate": "255",
    "expYield": "0"
  },
  {
    "name": "Pecharunt",
    "parsedTypes": [
      "POISON",
      "GHOST"
    ],
    "parsedAbilities": [
      "POISON_PUPPETEER",
      "NONE",
      "NONE"
    ],
    "id": "SPECIES_PECHARUNT",
    "family": "P_FAMILY_PECHARUNT",
    "baseHP": 88,
    "baseAttack": 88,
    "baseDefense": 160,
    "baseSpeed": 88,
    "baseSpAttack": 88,
    "baseSpDefense": 88,
    "types": "MON_TYPES(TYPE_POISON, TYPE_GHOST)",
    "abilities": "{ ABILITY_POISON_PUPPETEER, ABILITY_NONE, ABILITY_NONE }",
    "speciesName": "_(\"Pecharunt\")",
    "natDexNum": "NATIONAL_DEX_PECHARUNT",
    "levelUpLearnset": "sPecharuntLevelUpLearnset",
    "teachableLearnset": "sPecharuntTeachableLearnset",
    "baseBST": 600,
    "catchRate": "255",
    "expYield": "0"
  }
]