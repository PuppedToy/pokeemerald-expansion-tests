import { storageGet, storageSet } from './storage.js';
import { downloadConfig, readJsonFile, extractConfig } from './session.js';

const STORAGE_KEY = 'lastConfig';

const DEFAULTS = {
    runType: 'default',
    difficulty: 7,
    rebalance: true,
    balanceChance: 0.2,
    seed: '',
    showExactPositions: false,
};

function getDifficultyDesc(level) {
    const n = Math.abs(level - 7);
    if (level === 7) return 'In fair difficulty, trainers are expected to have access to the same quality of Pokémon the player has access to.';
    const dir = level < 7 ? 'below' : 'above';
    return `Each trainer will have ${n} Pokémon ${dir} the player's expected team quality.`;
}

export class ConfigForm {
    constructor(containerEl, { onConfigChange } = {}) {
        this.container = containerEl;
        this.onConfigChange = onConfigChange ?? (() => {});
        this._build();
        this._restore();
        this._wireEvents();
    }

    /** Returns the current validated config object, or null if invalid. */
    getConfig() {
        const runType = this._q('input[name="run-type"]:checked')?.value ?? 'default';
        const difficulty = parseInt(this._q('#difficultySlider')?.value ?? '7', 10);
        const rebalance = this._q('#rebalance').checked;
        const balanceChance = rebalance
            ? Math.round(parseInt(this._q('#balance-chance').value, 10)) / 100
            : 0.2;
        const seedRaw = this._q('#seed').value.trim();
        const seed = seedRaw === '' ? null : parseInt(seedRaw, 10);

        if (seed !== null && (isNaN(seed) || !Number.isInteger(seed))) return null;

        const showExactPositions = this._q('#show-exact-positions').checked;
        const base = { runType, difficulty, rebalance, balanceChance, seed, showExactPositions };

        if (runType === 'nuzlocke') {
            const numROMs = parseInt(this._q('#nz-numroms').value, 10) || 3;
            const shared = {
                pokedex:  this._q('#nz-share-pokedex').checked,
                trainers: this._q('#nz-share-trainers').checked,
                starters: this._q('#nz-share-starters').checked,
            };
            return { ...base, numROMs, shared };
        }

        if (runType === 'soullink') {
            const numPlayers    = parseInt(this._q('#sl-numplayers').value, 10) || 2;
            const romsPerPlayer = parseInt(this._q('#sl-roms-per-player').value, 10) || 2;
            const playerShared = {
                pokedex:  this._q('#sl-player-share-pokedex').checked,
                trainers: this._q('#sl-player-share-trainers').checked,
                starters: this._q('#sl-player-share-starters').checked,
            };
            const romShared = {
                pokedex:  this._q('#sl-rom-share-pokedex').checked,
                trainers: this._q('#sl-rom-share-trainers').checked,
                starters: this._q('#sl-rom-share-starters').checked,
            };
            return { ...base, numPlayers, romsPerPlayer, playerShared, romShared };
        }

        return base;
    }

    /** Populate the form from a config object (e.g. from localStorage or upload). */
    setConfig(cfg) {
        if (cfg.sharedModules !== undefined && cfg.runType === undefined) {
            cfg = this._convertLegacy(cfg);
        }

        const runType = cfg.runType ?? 'default';
        const radio = this._q(`input[name="run-type"][value="${runType}"]`);
        if (radio) radio.checked = true;

        const slider = this._q('#difficultySlider');
        if (slider) slider.value = cfg.difficulty ?? 7;

        this._q('#rebalance').checked = cfg.rebalance !== false;
        this._q('#balance-chance').value = Math.round((cfg.balanceChance ?? 0.2) * 100);
        this._q('#seed').value = cfg.seed != null ? String(cfg.seed) : '';
        this._q('#show-exact-positions').checked = cfg.showExactPositions === true;

        if (runType === 'nuzlocke') {
            this._q('#nz-numroms').value = cfg.numROMs ?? 3;
            const sh = cfg.shared ?? { pokedex: true, trainers: true, starters: true };
            this._q('#nz-share-pokedex').checked = sh.pokedex !== false;
            this._q('#nz-share-trainers').checked = sh.trainers !== false;
            this._q('#nz-share-starters').checked = sh.starters !== false;
        }

        if (runType === 'soullink') {
            this._q('#sl-numplayers').value = cfg.numPlayers ?? 2;
            this._q('#sl-roms-per-player').value = cfg.romsPerPlayer ?? 2;
            const ps = cfg.playerShared ?? { pokedex: true, trainers: true, starters: false };
            const rs = cfg.romShared ?? { pokedex: true, trainers: true, starters: true };
            this._q('#sl-player-share-pokedex').checked = ps.pokedex !== false;
            this._q('#sl-player-share-trainers').checked = ps.trainers !== false;
            this._q('#sl-player-share-starters').checked = ps.starters === true;
            this._q('#sl-rom-share-pokedex').checked = rs.pokedex !== false;
            this._q('#sl-rom-share-trainers').checked = rs.trainers !== false;
            this._q('#sl-rom-share-starters').checked = rs.starters !== false;
        }

        this._syncUI();
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _q(sel) { return this.container.querySelector(sel); }

    _convertLegacy(cfg) {
        const sm = cfg.sharedModules ?? 1;
        if (sm <= 1) return { runType: 'default', difficulty: cfg.difficulty, rebalance: cfg.rebalance, balanceChance: cfg.balanceChance, seed: cfg.seed };
        return {
            runType: 'nuzlocke',
            numROMs: cfg.numROMs ?? 2,
            shared: { pokedex: sm >= 2, trainers: sm >= 3, starters: sm >= 4 },
            difficulty: cfg.difficulty ?? 7,
            rebalance: cfg.rebalance !== false,
            balanceChance: cfg.balanceChance ?? 0.2,
            seed: cfg.seed ?? null,
        };
    }

    _build() {
        this.container.innerHTML = `
<div class="form-section">
  <div class="section-title">Run type</div>
  <div class="radio-card-group radio-card-group-3">
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-default" value="default" checked>
      <div class="radio-card-body">
        <div class="radio-card-title">Default</div>
        <div class="radio-card-desc">Generate one ROM just for you. All Pokémon, trainers and encounters are unique to this run.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-nuzlocke" value="nuzlocke">
      <div class="radio-card-body">
        <div class="radio-card-title">Nuzlocke</div>
        <div class="radio-card-desc">Generate multiple ROMs in the same shared world. When you lose a run, continue in the next ROM.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-soullink" value="soullink">
      <div class="radio-card-body">
        <div class="radio-card-title">Soul-Link</div>
        <div class="radio-card-desc">Share the same world with a friend. Each player gets their own set of ROMs for their nuzlocke.</div>
      </div>
    </label>
  </div>

  <div id="nuzlocke-panel" class="run-panel hidden">
    <div class="coop-numroms">
      <label for="nz-numroms">Number of ROMs</label>
      <input type="number" id="nz-numroms" class="input" value="3" min="2" max="10" style="width:72px">
    </div>
    <div class="section-title" style="margin-bottom:10px">What's shared across all ROMs?</div>
    <div class="checkbox-row">
      <input type="checkbox" id="nz-share-pokedex" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same Pokémon universe</span>
        <span class="checkbox-desc">All ROMs share the same Pokédex, base stats and movesets.</span>
      </div>
    </div>
    <div id="nz-pokedex-warning" class="warning-banner hidden">
      Games with different Pokémon universes cannot share trainer teams or starter choices.
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="nz-share-trainers" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same trainer teams &amp; rewards</span>
        <span class="checkbox-desc">All ROMs face the same randomized gym leaders, rivals and item rewards.</span>
      </div>
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="nz-share-starters" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same starters</span>
        <span class="checkbox-desc">All ROMs share the same randomized starter pool.</span>
      </div>
    </div>
  </div>

  <div id="soullink-panel" class="run-panel hidden">
    <div class="sl-subsection">
      <div class="section-title">Between players</div>
      <div class="coop-numroms">
        <label for="sl-numplayers">Number of players</label>
        <input type="number" id="sl-numplayers" class="input" value="2" min="2" max="8" style="width:72px">
      </div>
      <div class="section-title" style="font-size:10px;margin-bottom:8px;margin-top:4px">What do all players share?</div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-player-share-pokedex" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same Pokémon universe</span>
          <span class="checkbox-desc">Every player encounters the same Pokédex, base stats and movesets.</span>
        </div>
      </div>
      <div id="sl-player-pokedex-warning" class="warning-banner hidden">
        Players with different Pokémon universes cannot share trainer teams or starter choices.
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-player-share-trainers" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same trainer teams &amp; rewards</span>
          <span class="checkbox-desc">All players fight the same randomized gym leaders and rivals.</span>
        </div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-player-share-starters">
        <div class="checkbox-info">
          <span class="checkbox-label">Same starters</span>
          <span class="checkbox-desc">All players pick from the same randomized starter pool.</span>
        </div>
      </div>
    </div>

    <div class="sl-subsection">
      <div class="section-title">Within each player's runs</div>
      <div class="coop-numroms">
        <label for="sl-roms-per-player">ROMs per player</label>
        <input type="number" id="sl-roms-per-player" class="input" value="2" min="1" max="10" style="width:72px">
      </div>
      <div class="section-title" style="font-size:10px;margin-bottom:8px;margin-top:4px">What's shared across a player's ROMs?</div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-rom-share-pokedex" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same Pokémon universe</span>
          <span class="checkbox-desc">All of a player's ROMs share the same Pokédex.</span>
        </div>
      </div>
      <div id="sl-rom-pokedex-warning" class="warning-banner hidden">
        ROMs with different Pokémon universes cannot share trainer teams or starter choices.
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-rom-share-trainers" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same trainer teams &amp; rewards</span>
          <span class="checkbox-desc">All of a player's ROMs face the same gym leaders and rivals.</span>
        </div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-rom-share-starters" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same starters</span>
          <span class="checkbox-desc">All of a player's ROMs share the same randomized starter pool.</span>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="divider">

<div class="form-section">
  <div class="section-title">Difficulty</div>
  <div class="difficulty-slider-wrap">
    <input type="range" name="difficulty" id="difficultySlider" min="1" max="13" value="7" step="1">
    <div class="difficulty-ticks">
      <span>1<br><small>Easiest</small></span>
      <span>4<br><small>Easy</small></span>
      <span>7<br><small>Fair</small></span>
      <span>10<br><small>Hard</small></span>
      <span>13<br><small>Hardest</small></span>
    </div>
    <p id="difficultyDesc" class="difficulty-desc"></p>
  </div>
</div>

<hr class="divider">

<div class="form-section">
  <div class="section-title">Randomization settings</div>

  <div class="card-glass" style="display:flex;flex-direction:column;gap:20px;padding:20px">
    <div class="toggle-wrap">
      <div>
        <div class="toggle-label">Rebalance stats</div>
        <div class="toggle-desc">Randomly mutate Pokémon base stats and abilities for variety.</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="rebalance" checked>
        <span class="toggle-track"></span>
      </label>
    </div>

    <div id="balance-chance-row" class="field">
      <label for="balance-chance">Balance chance <span id="balance-chance-val" style="color:var(--accent);font-weight:700">20%</span></label>
      <div class="slider-row">
        <input type="range" id="balance-chance" class="slider" min="0" max="100" step="5" value="20">
      </div>
      <span class="field-hint">Fraction of Pokémon whose stats get mutated. 0% = no mutations, 50% = aggressive.</span>
    </div>
  </div>
</div>

<div class="form-section">
  <button type="button" class="collapsible-toggle" id="advanced-toggle" aria-expanded="false">
    <span class="arrow">▶</span>
    Advanced
  </button>
  <div class="collapsible-body hidden" id="advanced-body">
    <div class="card-glass" style="margin-top:12px;padding:20px">
      <div class="field">
        <label for="seed">Seed</label>
        <div style="display:flex;gap:10px">
          <input type="number" id="seed" class="input" placeholder="Leave blank for random" style="flex:1">
          <button type="button" class="btn btn-ghost" id="btn-randomize-seed">Roll</button>
        </div>
        <span class="field-hint">Same seed + same config = identical run every time.</span>
      </div>
      <hr class="divider" style="margin:16px 0">
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Show exact positions in teams</div>
          <div class="toggle-desc"
               title="When enabled, the docs show each Pokémon in the exact slot it occupies in-game, including lead and Illusion placement. Disabled by default to preserve in-game surprise.">
            Show each Pokémon's exact in-game position in the documentation.
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="show-exact-positions">
          <span class="toggle-track"></span>
        </label>
      </div>
    </div>
  </div>
</div>

<div class="config-actions">
  <span class="config-actions-label">Config:</span>
  <button type="button" class="btn btn-ghost" id="btn-save-config">Save</button>
  <label class="btn btn-ghost" style="cursor:pointer">
    Load
    <input type="file" accept=".json" id="upload-config" style="display:none">
  </label>
  <span id="config-saved-note" style="font-size:12px;color:var(--muted);display:none">Saved ✓</span>
</div>
`;
    }

    _restore() {
        const saved = storageGet(STORAGE_KEY, DEFAULTS);
        this.setConfig(saved);
    }

    _save() {
        const cfg = this.getConfig();
        if (!cfg) return;
        storageSet(STORAGE_KEY, cfg);
        const note = this._q('#config-saved-note');
        note.style.display = 'inline';
        clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => { note.style.display = 'none'; }, 1500);
        this.onConfigChange(cfg);
    }

    _syncUI() {
        const runType = this._q('input[name="run-type"]:checked')?.value ?? 'default';

        this._q('#nuzlocke-panel').classList.toggle('hidden', runType !== 'nuzlocke');
        this._q('#soullink-panel').classList.toggle('hidden', runType !== 'soullink');

        const rebalanceOn = this._q('#rebalance').checked;
        this._q('#balance-chance-row').style.display = rebalanceOn ? '' : 'none';
        this._q('#balance-chance-val').textContent = this._q('#balance-chance').value + '%';

        const diffLevel = parseInt(this._q('#difficultySlider')?.value ?? '7', 10);
        const descEl = this._q('#difficultyDesc');
        if (descEl) descEl.textContent = getDifficultyDesc(diffLevel);

        if (runType === 'nuzlocke') this._syncNuzlocke();
        if (runType === 'soullink') this._syncSoullink();
    }

    _syncNuzlocke() {
        const pdxOn = this._q('#nz-share-pokedex').checked;
        if (!pdxOn) {
            this._q('#nz-share-trainers').checked = false;
            this._q('#nz-share-starters').checked = false;
        }
        this._q('#nz-share-trainers').disabled = !pdxOn;
        this._q('#nz-share-starters').disabled = !pdxOn;
        this._q('#nz-pokedex-warning').classList.toggle('hidden', pdxOn);
    }

    _syncSoullink() {
        const pp = this._q('#sl-player-share-pokedex').checked;

        // Player-level pokedex dependency
        if (!pp) {
            this._q('#sl-player-share-trainers').checked = false;
            this._q('#sl-player-share-starters').checked = false;
        }
        this._q('#sl-player-share-trainers').disabled = !pp;
        this._q('#sl-player-share-starters').disabled = !pp;
        this._q('#sl-player-pokedex-warning').classList.toggle('hidden', pp);

        const pt = this._q('#sl-player-share-trainers').checked;
        const ps = this._q('#sl-player-share-starters').checked;

        const rpdEl = this._q('#sl-rom-share-pokedex');
        const rtrEl = this._q('#sl-rom-share-trainers');
        const rstEl = this._q('#sl-rom-share-starters');

        // Player-shared forces ROM-shared on and disabled
        if (pp) { rpdEl.checked = true; rpdEl.disabled = true; }
        else     { rpdEl.disabled = false; }

        if (pt) { rtrEl.checked = true; rtrEl.disabled = true; }
        else    { rtrEl.disabled = false; }

        if (ps) { rstEl.checked = true; rstEl.disabled = true; }
        else    { rstEl.disabled = false; }

        // ROM-level pokedex dependency (only for non-forced items)
        const romPdxOn = rpdEl.checked;
        if (!romPdxOn) {
            if (!pt) { rtrEl.checked = false; rtrEl.disabled = true; }
            if (!ps) { rstEl.checked = false; rstEl.disabled = true; }
        }
        this._q('#sl-rom-pokedex-warning').classList.toggle('hidden', romPdxOn);
    }

    _wireEvents() {
        const onChange = () => { this._syncUI(); this._save(); };

        this.container.querySelectorAll('input[name="run-type"]').forEach(el => el.addEventListener('change', onChange));
        this._q('#nz-numroms').addEventListener('input', onChange);
        this._q('#nz-share-pokedex').addEventListener('change', onChange);
        this._q('#nz-share-trainers').addEventListener('change', onChange);
        this._q('#nz-share-starters').addEventListener('change', onChange);
        this._q('#sl-numplayers').addEventListener('input', onChange);
        this._q('#sl-player-share-pokedex').addEventListener('change', onChange);
        this._q('#sl-player-share-trainers').addEventListener('change', onChange);
        this._q('#sl-player-share-starters').addEventListener('change', onChange);
        this._q('#sl-roms-per-player').addEventListener('input', onChange);
        this._q('#sl-rom-share-pokedex').addEventListener('change', onChange);
        this._q('#sl-rom-share-trainers').addEventListener('change', onChange);
        this._q('#sl-rom-share-starters').addEventListener('change', onChange);
        this._q('#difficultySlider').addEventListener('input', onChange);
        this._q('#rebalance').addEventListener('change', onChange);
        this._q('#balance-chance').addEventListener('input', onChange);
        this._q('#seed').addEventListener('input', onChange);
        this._q('#show-exact-positions').addEventListener('change', onChange);

        this._q('#btn-randomize-seed').addEventListener('click', () => {
            this._q('#seed').value = Math.floor(Math.random() * 0xFFFFFFFF);
            onChange();
        });

        this._q('#advanced-toggle').addEventListener('click', () => {
            const body = this._q('#advanced-body');
            const toggle = this._q('#advanced-toggle');
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            body.classList.toggle('hidden', expanded);
        });

        this._q('#btn-save-config').addEventListener('click', () => {
            const cfg = this.getConfig();
            if (cfg) downloadConfig(cfg);
        });

        this._q('#upload-config').addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const parsed = await readJsonFile(file);
                const cfg = extractConfig(parsed);
                this.setConfig(cfg);
                this._save();
            } catch (err) {
                alert('Could not load config: ' + err.message);
            }
            e.target.value = '';
        });
    }
}
