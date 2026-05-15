import { storageGet, storageSet } from './storage.js';
import { downloadConfig, readJsonFile, extractConfig } from './session.js';

const STORAGE_KEY = 'lastConfig';

const DEFAULTS = {
    numROMs: 1,
    sharedModules: 1,
    difficulty: 'fair',
    rebalance: true,
    balanceChance: 0.2,
    allTms: false,
    seed: '',
};

/**
 * Map UI state to sharedModules integer.
 * isCoOp: false → 1
 * coOpFlags: { pokedex: always true, trainers, starters, wild }
 */
function computeSharedModules(isCoOp, flags) {
    if (!isCoOp) return 1;
    if (flags.wild)     return 5;
    if (flags.starters) return 4;
    if (flags.trainers) return 3;
    return 2; // pokedex always locked on in co-op
}

/**
 * Map sharedModules integer back to UI flags (for restore from storage).
 */
function sharedModulesToFlags(v) {
    return {
        trainers: v >= 3,
        starters: v >= 4,
        wild:     v >= 5,
    };
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
        const isCoOp = this._q('#run-coop').checked;
        const numROMs = isCoOp ? (parseInt(this._q('#numroms').value, 10) || 2) : 1;
        const flags = {
            trainers: this._q('#share-trainers').checked,
            starters: this._q('#share-starters').checked,
            wild:     this._q('#share-wild').checked,
        };
        const sharedModules = computeSharedModules(isCoOp, flags);
        const difficulty = this._q('input[name="difficulty"]:checked')?.value ?? 'fair';
        const rebalance = this._q('#rebalance').checked;
        const balanceChance = rebalance
            ? Math.round(parseInt(this._q('#balance-chance').value, 10)) / 100
            : 0.2;
        const allTms = this._q('#all-tms').checked;
        const seedRaw = this._q('#seed').value.trim();
        const seed = seedRaw === '' ? null : parseInt(seedRaw, 10);

        if (seed !== null && (isNaN(seed) || !Number.isInteger(seed))) return null;

        return { numROMs, sharedModules, difficulty, rebalance, balanceChance, allTms, seed };
    }

    /** Populate the form from a config object (e.g. from localStorage or upload). */
    setConfig(cfg) {
        const isCoOp = (cfg.numROMs ?? 1) > 1 || (cfg.sharedModules ?? 1) > 1;
        this._q('#run-solo').checked = !isCoOp;
        this._q('#run-coop').checked = isCoOp;

        if (isCoOp) {
            this._q('#numroms').value = cfg.numROMs ?? 2;
            const flags = sharedModulesToFlags(cfg.sharedModules ?? 4);
            this._q('#share-trainers').checked = flags.trainers;
            this._q('#share-starters').checked = flags.starters;
            this._q('#share-wild').checked     = flags.wild;
        }

        const diff = cfg.difficulty ?? 'fair';
        const diffInput = this._q(`input[name="difficulty"][value="${diff}"]`);
        if (diffInput) diffInput.checked = true;

        this._q('#rebalance').checked = cfg.rebalance !== false;
        this._q('#balance-chance').value = Math.round((cfg.balanceChance ?? 0.2) * 100);
        this._q('#all-tms').checked = cfg.allTms === true;
        this._q('#seed').value = cfg.seed != null ? String(cfg.seed) : '';

        this._syncUI();
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _q(sel) { return this.container.querySelector(sel); }

    _build() {
        this.container.innerHTML = `
<div class="form-section">
  <div class="section-title">Run type</div>
  <div class="radio-card-group">
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-solo" value="solo" checked>
      <div class="radio-card-body">
        <div class="radio-card-title">Solo run</div>
        <div class="radio-card-desc">Generate one ROM, just for you. All Pokémon, trainers and wild encounters are unique to this run.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-coop" value="coop">
      <div class="radio-card-body">
        <div class="radio-card-title">Co-op / Soul-Link</div>
        <div class="radio-card-desc">Generate multiple ROMs. Choose what players share so everyone faces the same world.</div>
      </div>
    </label>
  </div>

  <div id="coop-panel" class="coop-panel hidden">
    <div class="coop-numroms">
      <label for="numroms">Number of players</label>
      <input type="number" id="numroms" class="input" value="2" min="2" max="8" style="width:72px">
    </div>
    <div class="section-title" style="margin-bottom:10px">What do players share?</div>
    <div class="checkbox-row">
      <input type="checkbox" id="share-pokedex" checked disabled
        data-tooltip="Required for co-op — all players must encounter the same universe of Pokémon.">
      <div class="checkbox-info">
        <span class="checkbox-label">Same Pokémon universe</span>
        <span class="checkbox-desc">Every player's Pokédex, base stats and movesets are identical.</span>
      </div>
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="share-trainers" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same gym teams</span>
        <span class="checkbox-desc">All players fight the same randomized gym leaders and rivals.</span>
      </div>
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="share-starters" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same starter choices</span>
        <span class="checkbox-desc">Everyone picks from the same randomized starter pool — standard soul-link.</span>
      </div>
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="share-wild">
      <div class="checkbox-info">
        <span class="checkbox-label">Identical wild routes</span>
        <span class="checkbox-desc">Every route holds the same species for all players — strict soul-link variant.</span>
      </div>
    </div>
  </div>
</div>

<hr class="divider">

<div class="form-section">
  <div class="section-title">Difficulty</div>
  <div class="difficulty-group">
    <label class="radio-card">
      <input type="radio" name="difficulty" value="easy">
      <div class="radio-card-body">
        <div class="radio-card-title">Easy</div>
        <div class="radio-card-desc">Trainers use weaker teams.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="difficulty" value="fair" checked>
      <div class="radio-card-body">
        <div class="radio-card-title">Fair</div>
        <div class="radio-card-desc">Balanced challenge.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="difficulty" value="hard">
      <div class="radio-card-body">
        <div class="radio-card-title">Hard</div>
        <div class="radio-card-desc">Trainers use stronger teams.</div>
      </div>
    </label>
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

    <div class="toggle-wrap">
      <div>
        <div class="toggle-label">All TMs available</div>
        <div class="toggle-desc">Treat all teachable moves as available via TM (ignores actual TM pool).</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="all-tms">
        <span class="toggle-track"></span>
      </label>
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
        const isCoOp = this._q('#run-coop').checked;
        this._q('#coop-panel').classList.toggle('hidden', !isCoOp);

        const rebalanceOn = this._q('#rebalance').checked;
        this._q('#balance-chance-row').style.display = rebalanceOn ? '' : 'none';

        const val = this._q('#balance-chance').value;
        this._q('#balance-chance-val').textContent = val + '%';
    }

    _wireEvents() {
        const onChange = () => { this._syncUI(); this._save(); };

        this._q('#run-solo').addEventListener('change', onChange);
        this._q('#run-coop').addEventListener('change', onChange);
        this._q('#numroms').addEventListener('input', onChange);
        this._q('#share-trainers').addEventListener('change', onChange);
        this._q('#share-starters').addEventListener('change', onChange);
        this._q('#share-wild').addEventListener('change', onChange);
        this.container.querySelectorAll('input[name="difficulty"]').forEach(el => el.addEventListener('change', onChange));
        this._q('#rebalance').addEventListener('change', onChange);
        this._q('#balance-chance').addEventListener('input', onChange);
        this._q('#all-tms').addEventListener('change', onChange);
        this._q('#seed').addEventListener('input', onChange);

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
