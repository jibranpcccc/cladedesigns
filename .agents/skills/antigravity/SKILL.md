---
name: antigravity
description: Fully autonomous HyperFrames video production. Give it a script and URLs — it reads every local sample template, fetches all URLs, analyzes the script, generates per-scene TTS narration, extracts exact word-level timestamps via Whisper, writes fully word-synced HTML scene files and index.html to disk, then commits and pushes. Zero back-and-forth. Usage: /antigravity — then paste your script and URLs.
---

# ANTIGRAVITY

You receive a script and a list of URLs. You produce a complete HyperFrames video — audio, HTML, index.html — committed and pushed. You make every decision. You never ask for clarification.

---

## INPUT FORMAT

After invoking this skill, the user provides:
```
[SCRIPT]
Full narration text here, written as it will be spoken.

[URLS]
https://...
https://...
```

If the user mixes them together without labels — figure it out. URLs start with `http`. Everything else is script.

---

## PHASE 0 — ORIENT (before anything else)

Read every sample template from local disk. Do not fetch from GitHub — they are already here.

```
/home/user/cladedesigns/samples/s01-bold-claim-cube.html
/home/user/cladedesigns/samples/s02-giant-stat.html
/home/user/cladedesigns/samples/s03-step-cards.html
/home/user/cladedesigns/samples/s04-timeline.html
/home/user/cladedesigns/samples/s05-split-cards.html
/home/user/cladedesigns/samples/s06-bar-chart.html
/home/user/cladedesigns/samples/s07-strikethrough-reveal.html
/home/user/cladedesigns/samples/s08-browser-mockup-cta.html
/home/user/cladedesigns/samples/s09-analytics-mockup.html
/home/user/cladedesigns/samples/s10-vague-clear.html
/home/user/cladedesigns/samples/s11-y-diagram.html
/home/user/cladedesigns/samples/s12-count-up-orbit.html
/home/user/cladedesigns/samples/s13-benchmark-dense.html
/home/user/cladedesigns/samples/s14-kinetic-words.html
```

Internalize from each: background color, accent color, every CSS class, GSAP structure, narrative purpose.

---

## PHASE 1 — RESEARCH ALL URLs

Fetch every URL the user provided. Identify each type without being told:

**YouTube URLs**
- You cannot watch — fetch the page and read title, description, auto-caption/transcript text in source
- Extract: product name, key claims, numbers, energy level, pacing

**Data sites** (artificialanalysis.ai, huggingface.co, openrouter.ai, lmarena.ai, etc.)
- Fetch the page — extract every number, score, ranking, model name
- These are authoritative — only use numbers from here, never invented

**Screenshot / image URLs**
- Analyze visually: is this a real screen recording or a designed concept?
  - Real: browser chrome, compression artifacts, normal density, standard aspect ratio
  - Concept: pixel-perfect, impossible density, photoshop crispness
- Real → extract exact values and text as ground truth
- Concept → extract visual style and density ideas only, never use its numbers as facts

**Docs / blog / announcement URLs**
- Extract: feature names, version numbers, capability claims, quotes, benchmark names

**Unreachable URL:** one line — what failed, what you assumed — then continue.

---

## PHASE 2 — ANALYZE THE SCRIPT

For every sentence or logical segment extract:
1. **Core claim** — what is being said
2. **Data needed** — numbers, names, benchmarks — match to Phase 1 findings
3. **Narrative function** — what job this segment does (see Template Table)
4. **Energy** — slow/weighty · fast/punchy · celebratory · provocative · instructional
5. **Word count** — count exactly

Group into scenes:
- One scene = one continuous visual idea, 6–14 seconds
- Under 5 seconds → merge with the closest adjacent segment on the same topic
- Over 14 seconds → split at the most logical break
- Target total: **45–90 seconds, 7–12 scenes**
- Opening scene: s14, s01, or s07 (high visual impact)
- Closing scene: always s08 (CTA)
- Never use the same template twice in a row

**Template selection:**

| Narrative function | Template |
|---|---|
| ONE shocking number (weeks, days, attempts) | s12 count-up orbit |
| #1 ranking / best in class claim | s01 bold claim cube |
| Big stat + supporting context cards | s02 giant stat |
| Here's how it works — 3-step process | s03 step cards |
| Release history / milestones over time | s04 timeline |
| Model A vs Model B (exactly 2) | s05 split comparison |
| Ranking 4–6 models on ONE benchmark | s06 bar chart |
| Everyone thinks X — actually it's Y | s07 strikethrough reveal |
| Go try it / call to action / demo | s08 browser CTA |
| Showing a real leaderboard or analytics site | s09 analytics mockup |
| Wrong way vs right way / teaching | s10 vague vs clear |
| One model works everywhere / integrations | s11 hub-and-spoke |
| One model scored across MULTIPLE benchmarks | s13 benchmark dense |
| Headline words punching in one by one | s14 kinetic words |

**s06 vs s13:** s06 = multiple models / one benchmark. s13 = one model / many benchmarks.

**Edge cases:**
- Number + context cards → s02 beats s12
- 2 models → s05, 4+ models → s06
- Teaching + specific example → s10 beats s14

---

## PHASE 3 — AUDIO + EXACT WORD TIMESTAMPS

This is the core of the sync system. Do not skip. Do not use estimated timing.

### 3a. Create output directory

Slug the video title (lowercase, hyphens). Create:
```bash
mkdir -p /home/user/cladedesigns/[video-slug]/audio
```

### 3b. Select voice

Read the overall script energy:
- High energy, punchy, marketing: `af_sky` at `--speed 1.1`
- Professional, data-focused, authoritative: `af_nova` at `--speed 1.0`
- Tutorial, instructional, calm: `am_adam` at `--speed 0.9`

### 3c. Generate TTS per scene

For each scene, write its VO segment to a temp file and generate audio:

```bash
# For each scene (example: scene 02)
echo "Qwen 3.7 Max scored ninety-four on SWE-Bench Verified." > /tmp/s02.txt
npx hyperframes tts /tmp/s02.txt --voice af_nova --speed 1.0 \
  --output /home/user/cladedesigns/[video-slug]/audio/scene-02.wav
```

One audio file per scene. This makes timestamps scene-local (start at 0.0) — no offset math.

### 3d. Transcribe each audio file

```bash
npx hyperframes transcribe \
  /home/user/cladedesigns/[video-slug]/audio/scene-02.wav \
  --model small.en
# → produces transcript.json with word-level timestamps
mv transcript.json /home/user/cladedesigns/[video-slug]/audio/scene-02.transcript.json
```

Output shape:
```json
[
  { "id": "w0", "text": "Qwen",     "start": 0.31, "end": 0.58 },
  { "id": "w1", "text": "3.7",      "start": 0.58, "end": 0.82 },
  { "id": "w2", "text": "Max",      "start": 0.82, "end": 1.10 },
  { "id": "w3", "text": "scored",   "start": 1.35, "end": 1.72 },
  { "id": "w4", "text": "ninety",   "start": 1.85, "end": 2.20 },
  { "id": "w5", "text": "four",     "start": 2.20, "end": 2.44 },
  { "id": "w6", "text": "on",       "start": 2.55, "end": 2.70 },
  { "id": "w7", "text": "SWE",      "start": 2.72, "end": 3.10 },
  { "id": "w8", "text": "Bench",    "start": 3.10, "end": 3.45 },
  { "id": "w9", "text": "Verified", "start": 3.50, "end": 4.05 }
]
```

**Set scene duration** = last word's `end` + 0.8s hold. Round up to nearest 0.5s.

### 3e. Fallback (if TTS fails)

If `npx hyperframes tts` fails (Python missing, etc.):
- Print one line: `TTS unavailable — using estimated timing`
- Compute per-word timestamps: `wordStart = 0.3 + i × ((sceneDuration - 0.6) / wordCount)`
- Continue. Never block.

---

## PHASE 4 — WRITE EVERY SCENE

For each scene, copy the matching sample's full HTML as the starting point. Replace ALL product-specific content (model names, numbers, text, colors stay the same). Wire every animation to transcript timestamps.

### File location and naming
```
/home/user/cladedesigns/[video-slug]/scene-01-[slug].html
/home/user/cladedesigns/[video-slug]/scene-02-[slug].html
...
```

### Mandatory code structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>/* all styles */</style>
</head>
<body style="margin:0;overflow:hidden;">
  <div data-composition-id="scene-02-benchmark"
       data-width="1920" data-height="1080" data-duration="[SECONDS]"
       style="position:relative;width:1920px;height:1080px;background:[BG];overflow:hidden;">
    <canvas class="mv-grid" style="position:absolute;inset:0;"></canvas>
    <!-- scene content -->
  </div>
  <script>
    // TRANSCRIPT — scene-02
    // w0 "Qwen" 0.31 | w1 "3.7" 0.58 | w2 "Max" 0.82 | w3 "scored" 1.35
    // w4 "ninety" 1.85 | w5 "four" 2.20 | w7 "SWE" 2.72 | w9 "Verified" 3.50

    const root = document.querySelector('[data-composition-id="scene-02-benchmark"]');

    // canvas grid
    const canvas = root.querySelector('.mv-grid');
    canvas.width = 1920; canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    for (let x = 0; x <= 1920; x += 80) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,1080);
      ctx.strokeStyle='rgba(ACCENT,0.04)'; ctx.lineWidth=1; ctx.stroke();
    }
    for (let y = 0; y <= 1080; y += 80) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1920,y);
      ctx.strokeStyle='rgba(ACCENT,0.04)'; ctx.lineWidth=1; ctx.stroke();
    }

    const tl = gsap.timeline({ paused: true });

    // ambient loops — always start at 0
    tl.fromTo('.scan', { left:'-4px' }, { left:'1924px', duration:9, ease:'none', repeat:-1 }, 0);
    tl.to('.cb-tl,.cb-tr,.cb-bl,.cb-br', { opacity:0.6, duration:1.2, repeat:-1, yoyo:true }, 0);

    // word-synced reveals — timestamps from transcript
    tl.fromTo('.model-name', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.4 }, 0.31);   // "Qwen"
    tl.fromTo('.version-chip', { scale:0 }, { scale:1, duration:0.3, ease:'back.out(2)' }, 0.58);  // "3.7"
    tl.to('.model-name', { textShadow:'0 0 30px rgba(ACCENT,0.8)', duration:1.2, repeat:-1, yoyo:true }, 0.82); // "Max"
    tl.fromTo('.result-panel', { x:-200, opacity:0 }, { x:0, opacity:1, duration:0.4 }, 1.35);  // "scored"
    const num = { v:0 };
    tl.to(num, { v:94, duration:0.59, ease:'power2.out',
      onUpdate: () => { numEl.textContent = Math.round(num.v); } }, 1.85);  // "ninety" → count-up
    tl.fromTo('.count-flash', { opacity:0, scale:0.5 }, { opacity:1, scale:2, duration:0.25 }, 2.20); // "four"
    tl.to('.count-flash', { opacity:0, duration:0.3 }, 2.45);
    tl.fromTo('.bench-badge', { x:300, opacity:0 }, { x:0, opacity:1, duration:0.4 }, 2.72);  // "SWE"
    tl.fromTo('.checkmark', { scale:0 }, { scale:1, duration:0.3, ease:'back.out(2)' }, 3.50); // "Verified"

    // hero glow — starts after hero word lands
    tl.to('.hero-element', { boxShadow:'0 0 60px rgba(ACCENT,0.6)', duration:1.4, repeat:-1, yoyo:true }, 0.82);

    window.__timelines = window.__timelines || {};
    window.__timelines["scene-02-benchmark"] = tl;
    if (!window.__hfEngine) setTimeout(() => tl.play(), 200);
  </script>
</body>
</html>
```

### Word-to-animation mapping rules

Every `tl.fromTo()` / `tl.to()` that reveals content **must start at a word's `start` timestamp**. No invented times.

| What appears | When it enters |
|---|---|
| Model / product name | At the first word of the name |
| Version chip / badge | At the version number word |
| Big number (count-up) | At the first digit-word; duration = span to last digit-word |
| Benchmark badge | At the first word of the benchmark name |
| Checkmark / strikethrough | At the confirming verb ("Verified", "beats", "wins") |
| Step card | At the step's action verb |
| Bar fill starts | At the data comparison word ("versus", "scored", "compared") |
| Closing CTA | At the call-to-action verb ("try", "start", "go") |
| Ambient loops (grid, scan, particles, corner pulse) | Always `0` — these never need word sync |

### Visual density — dark backgrounds (s01–s05, s07, s10–s14)

Every dark-background scene must have:
- Canvas dot/line grid (draw once, no animation)
- 16–28 particles: hardcoded `left/top` percentages, CSS float animation
- Horizontal or vertical scan line: `repeat:-1`
- 4 corner brackets: continuous opacity pulse `repeat:-1, yoyo:true`
- Top info bar: 3 sections, blinking dot, content relevant to scene
- Bottom 5-stat bar: 5 real data points from script/URLs
- 3+ continuous `repeat:-1, yoyo:true` loops (glow, pulse, float)
- Something moving in every quadrant at all times

### Visual density — light backgrounds (s06, s08, s09)

Do NOT add dark cyber elements. Keep it looking like a real website:
- Particles: `rgba(85,51,221,0.10)` — dark at very low opacity
- Scan line: subtle gradient overlay, not neon
- Corner brackets: omit or `15%` opacity
- White text: never. Always dark text on light backgrounds.

### Color palette — never change

| Template | Background | Accent |
|---|---|---|
| s01 | `#1a1a2e` | `#ff6b35` |
| s02 | `#120820` | `#8c64ff` |
| s03 | `#1e2235` | `#ff6b35` |
| s04 | `#0a1628` | `#00d4ff` |
| s05 | `#111820` | `#4dff91` / `#ffbb33` |
| s06 | `#ededf8` | `#5533dd` |
| s07 | `#0d1f0a` | `#7cfc60` |
| s08 | `#f5f5ff` | `#5533dd` |
| s09 | `#f5f5f5` | `#5533dd` |
| s10 | `#0d2010` | `#50dc64` / `#ff5050` |
| s11 | `#111218` | `#ff7850` |
| s12 | `#0a0a0a` | `#ffffff` |
| s13 | `#0f0a1e` | `#7c5fff` |
| s14 | `#1a0d2e` | `#ffcc00` |

### Data rules

- Every number on screen comes from a Phase 1 fetched URL or the script — never invented
- If a number can't be verified: write `<!-- UNVERIFIED: assumed [value] -->` inline
- Model names and benchmark names: exact spelling from source

### Code completeness

- Write every HTML/CSS/JS line in full — no `// same as above`, `/* see s01 */`, `<!-- repeat pattern -->`
- Every file opens in a browser with no other files — 100% standalone

---

## PHASE 5 — WRITE index.html

```
/home/user/cladedesigns/[video-slug]/index.html
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Video Title]</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
</head>
<body style="margin:0;background:#000;overflow:hidden;">
  <div data-composition-id="main" data-width="1920" data-height="1080"
       data-duration="[TOTAL_SECONDS]">

    <div class="clip" data-track-index="0"
         data-start="0" data-duration="[S1]" data-transition-out="[T1]">
      <!-- scene-01 content inline -->
    </div>

    <div class="clip" data-track-index="0"
         data-start="[S1]" data-duration="[S2]" data-transition-out="[T2]">
      <!-- scene-02 content inline -->
    </div>

    <!-- data-start = cumulative sum of all previous scene durations -->
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    window.__timelines["main"] = tl;
    if (!window.__hfEngine) setTimeout(() => tl.play(), 200);
  </script>
</body>
</html>
```

**Transitions between scenes:**

| Transition | Use when |
|---|---|
| `flash-through-white` | Big reveal, #1 moment, peak energy |
| `glitch` | Challenging assumption, disruption |
| `whip-pan` | Fast cut, rapid-fire facts |
| `chromatic-split` | Data-to-data, high-tech reveal |
| `cross-warp-morph` | Same topic, different angle |
| `cinematic-zoom` | Zooming into key detail |
| `light-leak` | Positive, "it works", aspirational |
| `domain-warp` | Abstract concept, paradigm shift |
| `sdf-iris` | New chapter, topic change |
| `swirl-vortex` | Energetic topic switch |
| `gravitational-lens` | Weight, impact, important moment |
| `ripple-waves` | Smooth, flowing |
| `ridged-burn` | Intense burning reveal |
| `thermal-distortion` | Benchmark intensity, data heat |

---

## PHASE 6 — COMMIT AND PUSH

```bash
cd /home/user/cladedesigns
git add [video-slug]/
git commit -m "Add [video-slug] — [N] scenes, [X]s, word-synced audio"
git push -u origin $(git branch --show-current)
```

---

## DELIVERY — what you say to the user

Print once, after everything is done:

```
ANTIGRAVITY COMPLETE
─────────────────────────────────────
Video: [Title]
Scenes: [N] | Total: [X]s
Audio: [voice] @ [speed]x
Output: /[video-slug]/

Scene breakdown:
  01 [template] [Xs] "[first 5 words of VO]..." → [transition]
  02 ...
  ...

Files written:
  ✓ scene-01-[slug].html
  ✓ scene-02-[slug].html
  ...
  ✓ index.html
  ✓ audio/ ([N] .wav + .json files)

Committed and pushed.
─────────────────────────────────────
WARNINGS: [any UNVERIFIED numbers / failed URLs]
```

Nothing else. No narration of steps. No asking for approval. The output is the deliverable.

---

## SELF-CHECK (run mentally before Phase 4)

- [ ] Every number on screen came from a fetched URL or the script
- [ ] Every `tl.to()` timestamp is from a transcript word's `start` — no invented times
- [ ] No two consecutive scenes use the same template
- [ ] Opening scene: s01, s07, s12, or s14
- [ ] Closing scene: s08
- [ ] Every dark-bg scene has grid + particles + scan + corners + top bar + bottom bar
- [ ] Light-bg scenes (s06/s08/s09) look like real websites, not sci-fi HUDs
- [ ] Every file is 100% standalone
- [ ] No placeholder comments
- [ ] Total duration: 45–90 seconds
