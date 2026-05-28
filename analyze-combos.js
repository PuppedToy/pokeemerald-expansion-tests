const fs = require('fs');
const path = require('path');

// Load bundle
const bundlePath = './debug/run-58482498/bundle.json';
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

// Extract data from bundle
const pokedex = bundle.roms['0'].artifacts.pokedex;
const { pokes, moves, abilities, tmList } = pokedex;

// Create tmPool correctly
const tmPool = new Set(tmList.map(m => 'MOVE_' + m));

console.log('=== BUNDLE LOADED ===');
console.log(`Total Pokemon: ${Object.keys(pokes).length}`);
console.log(`Total Moves: ${moves.length}`);
console.log(`Total TMs in pool: ${tmPool.size}`);
console.log(`Total Abilities: ${Object.keys(abilities).length}`);
console.log('');

// Load rating module
const { ratePokemon } = require('./randomizer/rating');

// Find the Pokemon - search by id
const speciesWeNeed = ['SPECIES_SCEPTILE_MEGA', 'SPECIES_LUCARIO_MEGA'];
const results = {};

speciesWeNeed.forEach(speciesKey => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANALYZING: ${speciesKey}`);
  console.log('='.repeat(80));
  
  // Find pokemon by id
  let pokemon = null;
  for (const p of Object.values(pokes)) {
    if (p && p.id === speciesKey) {
      pokemon = p;
      break;
    }
  }
  
  if (!pokemon) {
    console.log(`ERROR: ${speciesKey} not found in pokedex!`);
    return;
  }
  
  console.log(`Found Pokemon: ${pokemon.id} (${pokemon.name})`);
  console.log(`Base Stats: HP=${pokemon.baseHP}, Atk=${pokemon.baseAttack}, Def=${pokemon.baseDefense}, SpA=${pokemon.baseSpAttack}, SpD=${pokemon.baseSpDefense}, Spe=${pokemon.baseSpeed}`);
  console.log(`Base BST: ${pokemon.baseBST}`);
  
  // Rate the pokemon
  console.log('\n--- CALLING ratePokemon() ---');
  const result = ratePokemon(pokemon, moves, abilities, tmPool);
  console.log('--- ratePokemon() RETURNED ---\n');
  
  // Extract and display all the data
  console.log(`Tier: ${result.tier}`);
  console.log(`Absolute Rating: ${result.absoluteRating}`);
  console.log(`Bundle Rating Value: ${pokemon.rating}`);
  console.log(`Rating Match: ${result.absoluteRating === pokemon.rating ? 'YES' : 'NO'}`);
  console.log(`BST Rating (absoluteBSTRating): ${result.absoluteBSTRating}`);
  console.log(`Role: ${result.role || 'N/A'}`);
  console.log(`Best Ability Rating: ${result.bestAbilityRating}`);
  console.log(`Moves Rating: ${result.movesRating}`);
  console.log(`Combo Bonus: ${result.comboBonus}`);
  
  console.log(`\nBest Moveset: ${JSON.stringify(result.bestMoveset)}`);
  
  // Full learnset
  const fullLearnset = pokemon.learnset ? pokemon.learnset.map(e => e.move) : [];
  console.log(`\nFull Learnset (${fullLearnset.length} moves):`);
  console.log(JSON.stringify(fullLearnset, null, 2));
  
  // Teachables
  console.log(`\nTeachables Array (${pokemon.teachables ? pokemon.teachables.length : 0} moves):`);
  console.log(JSON.stringify(pokemon.teachables || [], null, 2));
  
  // Move checks
  const setupMoves = [
    'MOVE_SWORDS_DANCE', 'MOVE_DRAGON_DANCE', 'MOVE_CALM_MIND', 
    'MOVE_QUIVER_DANCE', 'MOVE_SHELL_SMASH', 'MOVE_BULK_UP'
  ];
  const priorityMoves = [
    'MOVE_BULLET_PUNCH', 'MOVE_MACH_PUNCH', 'MOVE_AQUA_JET',
    'MOVE_SHADOW_SNEAK', 'MOVE_SUCKER_PUNCH', 'MOVE_EXTREME_SPEED',
    'MOVE_ICE_SHARD', 'MOVE_QUICK_ATTACK', 'MOVE_JET_PUNCH',
    'MOVE_FIRST_IMPRESSION', 'MOVE_FAKE_OUT', 'MOVE_VACUUM_WAVE',
    'MOVE_WATER_SHURIKEN', 'MOVE_THUNDERCLAP'
  ];
  const recoveryMoves = [
    'MOVE_RECOVER', 'MOVE_ROOST', 'MOVE_SOFT_BOILED',
    'MOVE_SLACK_OFF', 'MOVE_MILK_DRINK', 'MOVE_HEAL_ORDER',
    'MOVE_SYNTHESIS', 'MOVE_MORNING_SUN', 'MOVE_MOONLIGHT',
    'MOVE_SHORE_UP', 'MOVE_WISH', 'MOVE_DRAIN_PUNCH',
    'MOVE_GIGA_DRAIN', 'MOVE_LEECH_LIFE', 'MOVE_HORN_LEECH',
    'MOVE_DRAINING_KISS', 'MOVE_BITTER_BLADE', 'MOVE_OBLIVION_WING'
  ];
  
  const allAvailable = new Set([...fullLearnset, ...(pokemon.teachables || [])]);
  
  console.log(`\n--- MOVE AVAILABILITY CHECKS ---`);
  const hasSetup = setupMoves.filter(m => allAvailable.has(m));
  console.log(`Setup Moves (${hasSetup.length} found): ${hasSetup.length > 0 ? hasSetup.join(', ') : 'NONE'}`);
  
  const hasPriority = priorityMoves.filter(m => allAvailable.has(m));
  console.log(`Priority Moves (${hasPriority.length} found): ${hasPriority.length > 0 ? hasPriority.join(', ') : 'NONE'}`);
  
  const hasRecovery = recoveryMoves.filter(m => allAvailable.has(m));
  console.log(`Recovery Moves (${hasRecovery.length} found): ${hasRecovery.length > 0 ? hasRecovery.join(', ') : 'NONE'}`);
  
  const hasUTurn = allAvailable.has('MOVE_U_TURN');
  console.log(`U-Turn (MOVE_U_TURN): ${hasUTurn ? 'YES' : 'NO'}`);
  
  results[speciesKey] = result;
});

console.log(`\n${'='.repeat(80)}`);
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
