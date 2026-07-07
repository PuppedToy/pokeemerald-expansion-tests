---
id: T-068
title: Starter-extra nickname & gender assignment system
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-07
updated: 2026-07-07
target-version: 0.6.0
links: [frontend/js/data/starterNames.js]
blocked-by: []
---

# T-068 — Starter-extra nickname & gender assignment system

## Context

Add an **optional** system (default OFF) that gives baked-in nicknames — and coherent genders — to the
**"starter extra"** Pokémon a player receives at game start (`sStarterExtraMon`), and optionally to the
main starter. When off, nothing changes.

The feature spans all three pipeline layers: a frontend settings section, per-ROM bundle generation, and
the ROM maker + C engine. The maker **never randomizes** — every nickname/gender is decided in the bundle.

Design & code-path research: `~/.claude/plans/resilient-hopping-boot.md` (approved plan).

Key facts driving the design:
- Extra starters ride the **`wild` artifact** (`randomizer/writer.js:242`), always per-ROM. Main starters
  ride the shareable `starters` artifact — so naming lives on a **new per-ROM artifact** instead.
- `ScriptGiveMonParameterized` ([src/script_pokemon_util.c:356](../src/script_pokemon_util.c#L356)) forces a
  gender **only when compatible** with the species' `genderRatio`; genderless/fixed-gender species fall back
  to random creation — no infinite-loop risk, and "si procede" is automatic (Magnemite stays genderless).
- `POKEMON_NAME_LENGTH = 12`; nickname strings are untrusted bundle input that reaches C source → must be
  sanitized (`[A-Za-z0-9 ]`, ≤12) at the writer.
- `config-form.js` is a raw browser ES module (only the worker is esbuild-bundled), so the default pools are
  a sibling ES module `import`ed by it.

## Plan

1. **Research (Step 1)** — build the default multilingual name pools (done — see below).
2. **Frontend (Step 2)** — a "Nicknames" category: master toggle + include-starter + same-across-runs
   (nuzlocke/soul-link) + share-soul-link + different-per-gender + Both/Female/Male pool textareas (or one
   pool). Config key `nicknames`; forwarded by `randomizer-worker.cjs`.
3. **Bundle (Step 3)** — new pure module `randomizer/modules/starterNames.js` `buildStarterNaming(...)`:
   per sharing-group, roll a 50/50 gender coin per named slot and draw a pool-unique name (removed once
   used, regardless of gender). Attach per-ROM `rom.artifacts.starterNaming`. Validate in `bundleSchema.js`.
4. **ROM maker (Step 4)** — committed C scaffolding (arrays + accessors in `starter_choose.c`,
   `ScriptGiveMonWithGender`, `CB2_GiveStarter` applies them), writer rewrites the arrays from the bundle,
   `make.js` passes the per-ROM naming, `writerDocs.js` surfaces it.

Acceptance criteria:
- [ ] Default OFF; with the feature off, a generated bundle is byte-identical to today and the built ROM is unchanged.
- [ ] Frontend: master toggle hides/shows the box; same-across-runs hidden unless nuzlocke/soul-link;
      share-soul-link hidden unless soul-link; different-per-gender swaps tabbed pools ↔ single pool.
      Config round-trips (save/load/reset) and forwards to the worker.
- [ ] `buildStarterNaming` is deterministic per seed; names never repeat within a ROM (across genders);
      sharing groups behave per switch matrix (default / nuzlocke / soul-link); include-starter on/off honored.
- [ ] Bundle carries valid per-ROM `starterNaming`; `validateBundle` accepts it and rejects malformed/unsafe names.
- [ ] Writer produces compilable C; genderless species (e.g. Magnemite) keep their gender; the chosen main
      starter is named only when include-starter is ON.
- [ ] `cd randomizer && npm test` and `cd backend && npm test` green; `node build.js` succeeds.
- [ ] Owner manually tests a built ROM (extra starters carry the expected nicknames/genders) and confirms.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-07** — Task created. Approved plan captured. Branch `feature/T-068-starter-nicknames` off master.
- **2026-07-07** — Step 1 (research) done. Compiled a multilingual given-name set (~30 cultures) via an
  online research pass, validated (ASCII-only, ≤10 chars, globally unique, no cross-gender collisions),
  then trimmed by even-spaced sampling to exactly **300 male / 300 female / 50 unisex**. Live SSOT:
  `frontend/js/data/starterNames.js` (`STARTER_NAME_POOLS`). Full lists recorded below.
- **2026-07-07** — Design decision (user-confirmed): the main starter (1-of-3 player choice) gets **one**
  rolled gender+name applied to whichever option is picked (single C scalar, not a 3-element array).
- **2026-07-07** — Design decision: gender is always a 50/50 coin regardless of the species' natural ratio;
  the name is drawn from the coin's pool; genderless/fixed-gender species keep their real gender in-game
  (a genderless mon may carry a cross-gender-pool name — accepted per spec). Gender is shared with the name
  for a shared slot. Uniqueness scope = per sharing-group (draw without replacement, cross-gender).
- **2026-07-07** — Implemented Steps 2–4. New/changed files: `randomizer/modules/starterNames.js`
  (`buildStarterNaming` + sharing-group logic, 20 unit tests); `randomizer/generate.js`
  (`attachStarterNaming` wired into default/nuzlocke/soul-link, 6 unit tests); `backend/build/bundleSchema.js`
  (validates `starterNaming`, sanitizes names, 5 backend tests); `randomizer/starterNameWriter.js` (pure
  C-code builder + sanitizer, 10 unit tests) + `randomizer/writer.js`/`make.js` wiring; C engine —
  `src/starter_choose.c` (nickname/gender arrays + accessors), `include/starter_choose.h`,
  `src/script_pokemon_util.c`/`.h` (threaded a `nickname` param through `ScriptGiveMonParameterized`, added
  public `ScriptGiveMonWithGenderAndNickname`; nickname is set on the mon **before** placement so PC-overflow
  extras are covered too), `src/battle_setup.c` `CB2_GiveStarter`. Frontend: `frontend/js/config-form.js`
  "Starter nicknames" category, `frontend/js/data/starterNames.js` SSOT pools, worker + backend `toModuleConfig`
  forwarding, CSS, and config-form/roundtrip tests.
- **2026-07-07** — Committed (cd0c9a8), merged to master (e381b44), deployed to PRO.
- **2026-07-07** — **B-020 (critical):** the PRO box build failed — `sStarterExtraNicknames` used `_()` inside
  a `const u8 *const []` pointer array, which doesn't compile (`_()` is a brace byte-list, not a pointer).
  Broke ALL ROM builds (even feature-off, from the committed defaults); local Jest couldn't catch it (no GBA
  toolchain). Diagnosed from `backend/data/logs/*.log` on the box. Fixed by switching the extra-nickname
  entries to `COMPOUND_STRING("…")` in both `src/starter_choose.c` and `randomizer/starterNameWriter.js`;
  regression added to `starterNameWriter.test.js` (RED→GREEN). See `bugs/B-020-*`.
- **2026-07-07** — DEFERRED (follow-up): surfacing the chosen nicknames/genders in the generated viewer docs
  (`writerDocs.js` + `frontend/template.html`). It requires computing the naming BEFORE the per-ROM docs
  pass (naming is currently attached after) and untested HTML-template work; it is a viewer nicety, not part
  of the ROM behavior or the acceptance criteria. Tracked here for a future task.

## Step 1 deliverable — default name pools

Source of truth is `frontend/js/data/starterNames.js`; the lists below are the research record (immutable).

### Male-exclusive (300)

Aakash, Aatu, Abebe, Adel, Agus, Aidan, Akhil, Alasdair, Aleksei, Alfred, Alparslan, Ammar, Anatoly, Andrei, Angelos, Anon, Anton, Apostolos, Argyris, Arjun, Armen, Arun, Ashok, Aslan, Aurelien, Ayman, Bagus, Baldur, Baran, Bashir, Behnam, Bekele, Benzion, Bernhard, Bin, Boaz, Boris, Bran, Brian, Bryan, Caleb, Carsten, Cem, Chaim, Chetan, Christos, Clement, Colm, Constantin, Cristian, Cyril, Damian, Dariush, Davit, Dedi, Denis, Dev, Didier, Dinesh, Dmytro, Domhnall, Donovan, Dragan, Duncan, Eamonn, Eduardo, Efraim, Elad, Eliezer, Emad, Emir, Enrique, Erdem, Erling, Esfandiar, Euan, Ezra, Fajar, Fariborz, Farzin, Feng, Fergus, Filip, Fintan, Florian, Francisco, Fritz, Gabriel, Gareth, Gaurav, Geoffrey, Gerardo, Gerrit, Gheorghe, Gilberto, Glen, Gopal, Graham, Grzegorz, Gunther, Gyula, Haim, Halldor, Hamish, Hans, Harold, Harvey, Haytham, Helmut, Henrik, Hillel, Hooman, Horst, Hugues, Huy, Iason, Ignacio, Ilmari, Imre, Ioannis, Isaac, Ismail, Itamar, Jabari, Jacques, Jakub, Jamshid, Jaromir, Jawad, Jeremy, Jesper, Joachim, John, Jonas, Jorge, Joshua, Juan, Julen, Junho, Kabir, Kamal, Karan, Karoly, Kaveh, Kees, Kepa, Khaled, Kian, Klaus, Koldo, Kourosh, Kunal, Kyriakos, Lars, Lavi, Lennart, Leroy, Levi, Lloyd, Lorinc, Lucas, Luis, Madhav, Mahmoud, Mandla, Manolis, Marco, Mario, Martin, Masoud, Matthias, Mauricio, Mehran, Menachem, Michael, Mikel, Milos, Minjun, Mohsen, Mosi, Mukesh, Murphy, Nadav, Naftali, Naman, Nasser, Naveen, Nehemiah, Nicolae, Niklas, Nilesh, Njall, Octavian, Ofer, Ola, Oleg, Omkar, Osama, Othman, Ozan, Pankaj, Parviz, Paul, Pedro, Perry, Petr, Philip, Piet, Pooya, Preecha, Qiang, Quoc, Radoslav, Rahul, Rajesh, Raman, Ranbir, Rashid, Rayan, Regis, Remy, Richard, Risto, Roderick, Rohan, Ronald, Rostam, Rudolf, Ryan, Saeed, Salim, Samir, Sander, Santiago, Satish, Sebastian, Selim, Seppo, Serkan, Shakir, Sharad, Shimon, Shota, Sigurdur, Simon, Sipho, Sohan, Somsak, Sotirios, Stanley, Sten, Steven, Sujay, Suraj, Tadeusz, Tamas, Taras, Tarmo, Terje, Teuvo, Theodore, Thomas, Tibor, Toan, Tomas, Torin, Trevor, Tudor, Tyler, Ulrich, Uri, Vaclav, Vaino, Vano, Vasilios, Vedant, Vicente, Vikas, Vinay, Viorel, Vitor, Vladislav, Volodymyr, Walid, Wawan, Wesley, William, Wouter, Xavier, Yang, Yashar, Yaw, Yigal, Yoav, Yong, Yuri, Zakaria, Zeki, Ziyad, Zuberi

### Female-exclusive (300)

Aada, Adaeze, Adina, Agata, Ahuva, Ainhoa, Alba, Alexandra, Alina, Alva, Amara, Amina, Anahit, Ancuta, Angelika, Anika, Anjali, Anna, Annette, Anuja, Aphrodite, Arezoo, Armine, Asli, Astrid, Aune, Avani, Ayana, Ayu, Baharak, Basma, Beatriz, Berit, Bethany, Bhavana, Bjork, Boglarka, Brenda, Britt, Burcu, Candice, Carine, Carolina, Catherine, Celeste, Chana, Charlene, Chelsea, Chinara, Christine, Claudia, Colleen, Corinne, Csilla, Daisy, Danae, Danuta, Dawn, Delphine, Derya, Devorah, Diem, Dina, Dominga, Dorothy, Dunja, Ebru, Edurne, Eider, Eirlys, Elaine, Eleonora, Elin, Eliza, Ellinor, Elpida, Embla, Emily, Enni, Erzsebet, Estelle, Etelka, Eunice, Ewa, Fadia, Fariba, Fatin, Femke, Filiz, Florencia, Frances, Freja, Gabriela, Gamze, Gemma, Geraldine, Ghada, Gita, Gohar, Grace, Guadalupe, Gulden, Gwen, Hadar, Halima, Hande, Harriet, Heather, Hekla, Helle, Henna, Hilda, Homa, Hulda, Ida, Ildiko, Iman, Indira, Ingeborg, Ioanna, Irene, Iryna, Isadora, Itziar, Ivy, Jana, Jasmine, Jelena, Jimena, Joanne, Josephine, Juana, Julianna, Justine, Kaisa, Kamala, Karima, Kartika, Katerina, Katie, Kavita, Ketevan, Kinga, Klara, Kristin, Ksenia, Lakshmi, Lan, Laura, Lawan, Leila, Leontine, Lien, Liliana, Linda, Liv, Lore, Lotte, Lucia, Ludmila, Luz, Madeleine, Magda, Mahsa, Maija, Makena, Malee, Mamta, Manuela, Margaux, Mariam, Marija, Marja, Marta, Maryamu, Meena, Mei, Melati, Meltem, Meron, Micaela, Milagros, Mina, Mireille, Mitra, Mona, Mridula, Naama, Nadezhda, Nahid, Najwa, Nana, Nare, Natasha, Nazan, Neela, Neha, Nese, Ngan, Niamh, Nihal, Nina, Nita, Nong, Nuala, Oanh, Ofelia, Olivia, Orit, Outi, Paloma, Pardis, Pascale, Paz, Perihan, Phoebe, Pirjo, Poonam, Prerna, Priyanka, Quyen, Radhika, Ragnheidur, Raluca, Rania, Ratih, Rehema, Renee, Rhoda, Rita, Rodica, Rosa, Rosaura, Roya, Rupa, Sabine, Saga, Salome, Sana, Sanja, Sarah, Saroj, Segolene, Sema, Setareh, Shabnam, Shahla, Sharda, Sheila, Shirley, Shweta, Sigrid, Simisola, Siranush, Siti, Sofie, Solene, Songul, Soraya, Stavroula, Stephanie, Suha, Sumaya, Sunniva, Suvi, Sylvia, Tamar, Tanya, Tehila, Thandiwe, Therese, Tiffany, Tinatin, Tora, Trang, Tuba, Tuuli, Ulrike, Unnur, Usha, Valentina, Vanessa, Veena, Veronique, Vigdis, Violeta, Wafa, Wati, Wiebke, Xanthippe, Xiulan, Yamini, Yara, Yashoda, Yen, Yvette, Zainab, Zehra, Zofia, Zsuzsanna

### Unisex / both (50)

Adi, Akira, Alexis, An, Andy, Aoi, Ariel, Aytac, Bar, Blair, Chen, Dakota, Deniz, Dominique, Emerson, Evren, Gal, Hinata, Ilkay, Jae, Jean, Jiwoo, Jules, Kai, Kaoru, Kim, Kris, Liron, Marion, Min, Nikita, Noam, Ocean, Or, Parker, Phoenix, Reese, Riley, Robin, Rowan, Sacha, Sawyer, Shay, Skylar, Sunny, Taylor, Tsubasa, Val, Xuan, Yu

## Outcome

<!-- Filled when closing. -->
