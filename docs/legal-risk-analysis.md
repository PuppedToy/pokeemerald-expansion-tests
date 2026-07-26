# Legal risk analysis — Emerald Cut (informational, **not legal advice**)

> **Read this first.** I am not a lawyer and this is **not legal advice**. It is an informational risk
> assessment based on well-known copyright/trademark principles and on how Nintendo / The Pokémon Company
> (TPC) have historically enforced their rights. Outcomes are uncertain and jurisdiction-dependent. For
> anything you actually rely on — especially the GDPR items in §6 — get a short consult with a qualified
> lawyer (in Spain/EU). Nothing here makes infringement "legal"; it only ranks *realistic* exposure and
> what reduces it.
>
> **Your situation (the lens for everything below):** a **non-commercial** fan tool (no ads, no sales, no
> revenue), **EU/Spain-operated**, that generates **BPS patch files** the user applies to a Pokémon Emerald
> ROM **they already own** (the ROM stays in the user's browser, never uploaded). Built on the community
> `pokeemerald-expansion` decompilation. This is the standard "ROM-hack" posture, which is a *tolerated
> grey zone*, not a *clearly legal* activity.

## 0. The one thing to internalise

Nintendo/TPC own the copyright in the game code, art, music, text, and character designs, and the
trademarks in "Pokémon", the logos, and character names. A fan project does **not** get a licence by being
free or by using patches. What "no profit + patches + own-your-ROM" actually buys you is **lower likelihood
of being targeted** and **lower damages if you were** — not immunity.

Realistically, for a tiny non-commercial patch tool the worst-case that actually happens is a **takedown**
(a DMCA/abuse complaint to your host or domain registrar → the site goes dark), **not** a multi-million
lawsuit. Nintendo reserves lawsuits for **commercial** infringers and **ROM-distribution** sites (e.g. the
LoveROMs/LoveRETRO case, which distributed actual ROMs and settled for a reported ~$12M). You are neither —
*as long as you never distribute a ROM or their assets standalone and never monetise.*

## 1. TL;DR — realistic risk ranking

| # | Item | Realistic risk | Why | Highest-leverage action |
|---|------|----------------|-----|--------------------------|
| 1 | **Domain contains "pokemon"** | **Medium-High** | Most visible + cheapest for TPC to act on (UDRP / registrar complaint). Uses their trademark directly. | **Rename** to a name without "pokemon" (ideally without "emerald" either). |
| 2 | **GDPR / data protection** (emails, accounts) | **Medium** (and it's *your* obligation regardless of Nintendo) | EU service collecting personal data with (likely) no privacy policy / lawful basis. Independent of any IP issue. | Add a privacy policy + lawful basis + consent; you already have account deletion. |
| 3 | **Distribution / generation method** | **Low-Medium** | Patch-only is the right model; the grey areas are the transient server-side ROM build and the decomp base. | Keep patch-only + own-your-ROM; minimise/justify server ROM retention. |
| 4 | **Embedded assets in docs** (sprites, extracted dialogue, descriptions) | **Low** (pattern risk) | Sprites + game text are copyrighted reproductions. Only matters if the whole site is targeted. | Optional: reduce/placeholder sprites + verbatim game text if you want a lower profile. |
| 5 | **User-facing wording** ("build ROMs") | **Low, but easy to fix** | Don't advertise/induce infringement; frame as a tool acting on the user's own copy. | Say "generate patch files"; add disclaimers (your instinct is correct — see §5). |
| 6 | **Trademark use in UI/branding** | **Low** | Naming Pokémon factually is nominative use; logos/"official-looking" branding is not. | "Not affiliated with Nintendo" notice; no official logos. |

## 2. The domain name (`pokemon-emerald-cut.com`)

**Is it a problem? Yes — it's the single highest-leverage risk, and "da igual" is not accurate.**

- "Pokémon" is a registered trademark. A domain that contains it is the easiest, cheapest thing for TPC to
  act on: a **UDRP** complaint (WIPO) or a complaint to your **registrar/host** can transfer or kill the
  domain without a lawsuit. Trademark-in-domain is exactly the fact pattern UDRP was built for, and TPC has
  a long record of defending the mark.
- "Emerald" also evokes *Pokémon Emerald* specifically. "Emerald Cut" is a clever double meaning (a gemstone
  cut), but combined with "pokemon" in the domain it removes any ambiguity about what you're referencing.
- **Recommendation:** move to an **original name that uses neither "pokemon" nor "emerald"**. It does not
  need to be sterile — pick a coined/brandable name. This one change materially lowers your discoverability
  *and* removes the cheapest enforcement lever. Keep the old domain only as a redirect for as short a time as
  you're comfortable, or not at all.
- Practical note: you can describe *compatibility* factually in body text ("works with your Pokémon Emerald
  cartridge dump") — nominative reference is far weaker than putting the mark **in the domain/brand**.

## 3. Distribution & generation method

**The patch-only model is the correct, lower-risk one. Keep it. The grey areas are narrow but real.**

- **What's good (keep doing it):** you ship a **BPS patch** (the *difference* from a base ROM, not a ROM),
  the user supplies and keeps their **own legally-owned ROM entirely client-side** (never uploaded), and the
  patched result is produced **in the user's browser**. This is the established community posture and the
  main thing that keeps you out of "ROM distribution" territory (§0).
- **Grey area A — the transient server ROM:** your pipeline compiles a full randomised ROM on the server to
  diff it into a patch, retained ~48h. A fully-built ROM contains Nintendo's copyrighted material (via the
  decomp). It's ephemeral and never *served* to users, which is much better than distributing it — but it's
  the least-clean part. *Mitigations:* keep retention short (you do), delete on completion where possible,
  never expose a ROM download endpoint, and document that ROMs are an internal build artifact only.
- **Grey area B — the decomp base (`pokeemerald`/expansion):** disassemblies/decompilations are themselves a
  contested grey zone (reconstructed copyrighted code). The whole hack scene runs on them, but "everyone does
  it" is not a legal defence — it's a *targeting-likelihood* argument.
- **Derivative-work caveat:** a patch can still be argued to be a derivative work of the original game. The
  community norm is that patches are acceptable *because* they require the user to own the original; that norm
  is widely tolerated, not court-blessed. Requiring the user's own ROM (you do) is the key mitigation.

## 4. Language: "building ROMs" → "generating patch files"

**Your instinct is right and it is legally meaningful — adopt it everywhere.**

- Advertising that you "build ROMs" reads as offering the copyrighted end-product and can support a
  **contributory / inducement** framing (you're seen as encouraging infringement). Framing the product as a
  **tool that generates a patch the user applies to their own copy** keeps the emphasis on the user's lawful
  act on lawfully-owned property.
- **Concrete wording (use consistently in UI, docs, marketing, commits that users can see):**
  - ✅ "Generate patch files", "your patch is ready", "apply the patch to your own Emerald ROM".
  - ❌ "Build/download your ROM", "we make you a ROM", "get the game".
  - Add near any generate/download control: *"You must own a legal copy of Pokémon Emerald. Your ROM never
    leaves your device. This tool generates a patch; it does not distribute the game."*
- Note this is **framing**, not a magic phrase — it helps intent/attribution, it doesn't legalise anything.
  (It also pairs with §6's disclaimer/ToS.)

## 5. Texts, names, sprites & dialogue (page + generated docs)

- **Pokémon / move / ability names:** referring to them factually is **nominative use** — low risk. A tool
  that *names* game entities is on the strongest footing here (you can't discuss the game without naming it).
- **Sprites (pixel art):** embedding the actual sprite PNGs is **reproduction of copyrighted artwork**. Fan
  wikis do this under fair-use/tolerated-infringement, but it *is* technically infringing and it's the most
  "asset-like" thing you reproduce. *Options:* accept it as community norm (fine while low-profile), or lower
  the profile by not embedding sprites (icons/placeholders) if you ever want to minimise exposure.
- **Extracted in-game dialogue & descriptions** (e.g. boss text, move/ability descriptions): this is verbatim
  **copyrighted text**. Same posture as sprites — low individual risk, part of the overall pattern. Original
  paraphrase is lower-risk than verbatim copying where you have the choice.
- **Logos / official-looking branding / fonts:** avoid anything that implies **official affiliation or
  endorsement** (that adds a trademark *confusion* angle on top of copyright). Use your own branding.

## 6. Other realistic risks (don't overlook these — some are more likely than Nintendo)

- **GDPR / Spanish data protection (real, independent, likely the most *probable* legal obligation you're
  currently missing).** You collect emails + passwords and run an EU service, so GDPR applies. You need, at
  minimum: a **privacy policy** (what you collect, why, retention, contact), a **lawful basis** (consent
  and/or legitimate interest), **data minimisation**, a **breach process**, and the **right to erasure**
  (you already have account deletion — good; passwords are hashed — good). If you set any non-essential
  cookies/analytics you need a consent banner. A user complaint to the AEPD is a more realistic trigger than
  a Nintendo action for a small non-commercial site. **This is the item most worth a lawyer's 30 minutes.**
- **Takedown / host contingency (most likely "enforcement" shape).** Assume the realistic worst case is a
  DMCA/abuse complaint to your host (Hetzner/Oracle) or registrar → the box/domain is pulled. Be ready:
  keep backups, be able to go dark quickly, and don't tie anything irreplaceable to the current domain
  (another reason to de-risk the name in §2).
- **Terms of Service + "you must own the game" gate.** A short ToS + disclaimer ("not affiliated with /
  endorsed by Nintendo, Game Freak or The Pokémon Company"; "you must own a legal copy"; "provided as-is, no
  warranty") is standard good-faith evidence. It doesn't legalise infringement but supports intent and
  shifts framing.
- **"No profit" is a mitigator, not a shield.** Non-commercial use weakens the commercial fair-use factor in
  your favour, lowers statutory-damages exposure, and (mostly) keeps you off Nintendo's priority list — but
  infringement liability does **not** require making money. The moment there's monetisation (ads, donations
  tied to the tool, Patreon perks, selling anything), your risk profile jumps materially. Keep it strictly
  free and unmonetised.
- **Don't accept user-uploaded ROMs or host any ROM/asset library.** You already keep the ROM client-side —
  never add a feature that receives, stores, or serves ROMs or ripped assets. That is the bright line between
  "tolerated hack tool" and "ROM site."

## 7. Prioritised action checklist

1. **Rename off "pokemon"/"emerald"** — pick an original brand; the biggest single risk reduction (§2).
2. **GDPR basics** — privacy policy + lawful basis + consent (+ cookie banner if applicable); confirm with a
   lawyer (§6). You already have deletion + hashed passwords.
3. **Add a disclaimer + short ToS** — "not affiliated with Nintendo/GF/TPC", "you must own a legal copy",
   "generates a patch, does not distribute the game", "as-is, no warranty" (§4, §6).
4. **Switch all user-facing copy to "patch files"/"generate"** — never "ROM"/"build a ROM" (§4).
5. **Keep the distribution model** — patch-only, ROM client-side, no ROM/asset hosting, short server ROM
   retention (§3, §6).
6. **(Optional, profile-lowering)** reduce embedded sprites/verbatim game text if you want less surface (§5).
7. **Takedown contingency** — backups + ability to relocate/go dark; don't depend on one domain (§6).

## 8. Bottom line

Your setup is already on the *lower-risk* side of fan tooling (non-commercial, patch-based, own-your-ROM,
client-side). The realistic exposure is **a takedown, not a lawsuit** — and the two cheapest, highest-value
moves are (1) **get "pokemon"/"emerald" out of the domain/brand** and (2) **meet your GDPR obligations**,
both of which you can do without changing what the tool does. Everything else (wording, disclaimers, asset
choices) is incremental hardening. None of it is a licence — but together it keeps you quiet, quick to
recover, and squarely in the "tolerated hobbyist" band rather than the "target" band.
