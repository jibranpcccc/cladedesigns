---
name: antigravity
description: Script-first, audio-first HyperFrames video production. Give a script and URLs — generates TTS audio, extracts exact word timestamps, builds every scene HTML from scratch around those words, commits and pushes. Usage: /antigravity then paste script and URLs.
---

# ANTIGRAVITY

Script in. Video out. Zero questions.

---

## STEP 1 — READ THE SCRIPT FIRST. NOTHING ELSE.

Split the script into scenes. One scene = one continuous thought.

Rules:
- 6–14 seconds per scene. Under 5s → merge. Over 14s → split.
- Target: 45–90 seconds total, 7–12 scenes.
- Opening scene: s14, s01, or s07. Closing: always s08.
- Never the same template twice in a row.

For each scene, answer: **what does this sentence need to SHOW?** That decides the template.

| Scene need | Template |
|---|---|
| One shocking number | s12 — count-up orbit |
| We are #1 / best in class | s01 — bold claim cube |
| Big stat + supporting facts | s02 — giant stat |
| 3-step process / how it works | s03 — step cards |
| Timeline / release history | s04 — timeline |
| Head-to-head, 2 models | s05 — split comparison |
| Ranking 4–6 models, one benchmark | s06 — bar chart |
| Old belief vs new truth | s07 — strikethrough reveal |
| Call to action / go try it | s08 — browser CTA |
| Real leaderboard / analytics site | s09 — analytics mockup |
| Wrong way vs right way | s10 — vague vs clear |
| One model, many integrations | s11 — hub and spoke |
| One model, many benchmark scores | s13 — benchmark dense |
| Words punching in one by one | s14 — kinetic words |

Output a scene plan table:
```
| # | VO text (exact) | Shows | Template | Est. duration |
```

---

## STEP 2 — FETCH URLS

After scene plan is done, fetch every URL the user gave.

- **YouTube**: fetch page, read title + description + transcript text. Extract claims and numbers.
- **Data sites** (artificialanalysis.ai, huggingface.co, openrouter.ai): fetch and extract every number, score, ranking. These are the only authoritative numbers — never invent any.
- **Screenshots**: real recording (browser chrome, compression) → extract exact values. Designed concept (pixel-perfect, impossible density) → extract style only, not numbers.
- **Docs / blogs**: extract feature names, version numbers, benchmark names, quotes.
- **Unreachable**: one line — what failed, what you assumed — continue.

Match extracted numbers to scenes that need them.

---

## STEP 3 — AUDIO FIRST. HTML SECOND.

Do not write a single line of HTML until this step is complete.

**Create output folder:**
```bash
mkdir -p /home/user/cladedesigns/[video-slug]/audio
```

**Pick voice from script energy:**
- Punchy / marketing → `af_sky` speed `1.1`
- Professional / data → `af_nova` speed `1.0`
- Tutorial / calm → `am_adam` speed `0.9`

**For each scene — generate audio then transcribe:**
```bash
echo "[scene VO text]" > /tmp/scene-01.txt
npx hyperframes tts /tmp/scene-01.txt --voice af_nova --speed 1.0 \
  --output /home/user/cladedesigns/[video-slug]/audio/scene-01.wav

npx hyperframes transcribe \
  /home/user/cladedesigns/[video-slug]/audio/scene-01.wav --model small.en
mv transcript.json /home/user/cladedesigns/[video-slug]/audio/scene-01.json
```

Transcript gives exact word timestamps:
```json
[
  { "text": "Qwen",     "start": 0.31, "end": 0.58 },
  { "text": "scored",   "start": 1.35, "end": 1.72 },
  { "text": "ninety",   "start": 1.85, "end": 2.20 }
]
```

**Set scene duration** = last word `end` + 0.8s hold, rounded to nearest 0.5s.

**Fallback** (if TTS fails): print `TTS unavailable — estimating` and use `wordStart = 0.3 + i × ((duration - 0.6) / wordCount)`. Never block.

---

## STEP 4 — BUILD EACH SCENE FROM SCRATCH

**The script is the director. The transcript is the editor. The template is the camera.**

For every scene:

1. **List the content elements this VO needs on screen.** Example: "Qwen 3.7 Max scored 94 on SWE-Bench" needs: model name, score number, benchmark badge, checkmark. Write this list before touching HTML.

2. **Build HTML structure around those elements.** Not around a sample file — around your list.

3. **Wire every content element to its word's timestamp** from the transcript JSON.

4. **Add the ambient layer** (grid, particles, scan line, corner brackets) on top.

5. **Write the file** to `/home/user/cladedesigns/[video-slug]/scene-01-[slug].html`

---

### Required code patterns (use these exactly)

**File skeleton:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>/* styles */</style>
</head>
<body style="margin:0;overflow:hidden;">
  <div data-composition-id="scene-01-[slug]"
       data-width="1920" data-height="1080" data-duration="[SECONDS]"
       style="position:relative;width:1920px;height:1080px;background:[BG];overflow:hidden;">
    <canvas class="mv-grid" style="position:absolute;inset:0;pointer-events:none;"></canvas>
    <!-- content elements go here -->
  </div>
  <script>
    // WORD TIMESTAMPS — scene-01
    // [word] [start]s | [word] [start]s | ...

    const root = document.querySelector('[data-composition-id="scene-01-[slug]"]');
    const ctx = (()=>{ const c=root.querySelector('.mv-grid'); c.width=1920; c.height=1080; return c.getContext('2d'); })();
    for(let x=0;x<=1920;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1080);ctx.strokeStyle='rgba([AR],[AG],[AB],0.04)';ctx.lineWidth=1;ctx.stroke();}
    for(let y=0;y<=1080;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1920,y);ctx.strokeStyle='rgba([AR],[AG],[AB],0.04)';ctx.lineWidth=1;ctx.stroke();}

    const tl = gsap.timeline({ paused: true });

    // AMBIENT — always start at 0
    tl.fromTo('.scan',{left:'-4px'},{left:'1924px',duration:9,ease:'none',repeat:-1},0);
    tl.to('.cb',{opacity:0.5,duration:1.2,repeat:-1,yoyo:true,stagger:0.3},0);

    // CONTENT — each timestamp from transcript JSON
    // tl.fromTo('.element', {from}, {to, duration:0.4}, word.start);

    window.__timelines = window.__timelines || {};
    window.__timelines["scene-01-[slug]"] = tl;
    if (!window.__hfEngine) setTimeout(()=>tl.play(),200);
  </script>
</body>
</html>
```

**Count-up number** (start = first digit word's timestamp, duration = span to last digit word):
```js
const n={v:0};
tl.to(n,{v:94,duration:0.58,ease:'power2.out',onUpdate:()=>{el.textContent=Math.round(n.v);}},1.85);
```

**Particles (dark-bg scenes):**
```html
<div class="pt" style="left:8%;top:14%;--d:3.8s;--dl:0.2s;--c:rgba([R],[G],[B],0.18)"></div>
```
```css
.pt{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--c);
    animation:ptf var(--d) var(--dl) ease-in-out infinite alternate;}
@keyframes ptf{from{transform:translateY(0)}to{transform:translateY(-14px)}}
```
Add 16–20 particles with varied hardcoded positions. Light-bg scenes (s06/s08/s09): use `rgba(85,51,221,0.08)` and reduce to 8–10.

**Simultaneous bars** (all start within 0.05s of each other):
```js
tl.to('.bar1',{width:'94%',duration:0.7,ease:'power2.out'},word.start);
tl.to('.bar2',{width:'81%',duration:0.7,ease:'power2.out'},word.start+0.05);
tl.to('.bar3',{width:'76%',duration:0.7,ease:'power2.out'},word.start+0.10);
```

**Glow loop on hero element** (starts when hero word lands):
```js
tl.to('.hero',{boxShadow:'0 0 60px rgba([R],[G],[B],0.6)',duration:1.4,repeat:-1,yoyo:true,ease:'sine.inOut'},heroWord.start);
```

---

### Color palette

| Template | Background | Accent RGB |
|---|---|---|
| s01 | `#1a1a2e` | `255,107,53` |
| s02 | `#120820` | `140,100,255` |
| s03 | `#1e2235` | `255,107,53` |
| s04 | `#0a1628` | `0,212,255` |
| s05 | `#111820` | `77,255,145` |
| s06 | `#ededf8` | `85,51,221` |
| s07 | `#0d1f0a` | `124,252,96` |
| s08 | `#f5f5ff` | `85,51,221` |
| s09 | `#f5f5f5` | `85,51,221` |
| s10 | `#0d2010` | `80,220,100` |
| s11 | `#111218` | `255,120,80` |
| s12 | `#0a0a0a` | `255,255,255` |
| s13 | `#0f0a1e` | `124,95,255` |
| s14 | `#1a0d2e` | `255,204,0` |

---

### Word-to-element rules

Every content reveal must start at its word's `start` timestamp. No round numbers unless a word lands there.

| Element | Enters at |
|---|---|
| Model / product name | First word of the name |
| Version number / chip | The version word |
| Big number (count-up) | First digit word |
| Benchmark name | First word of benchmark |
| Checkmark / stamp | The confirming verb |
| Bar chart fills | The comparison word |
| Step card | That step's verb |

Ambient elements (grid, scan, particles, corners) always start at `0`.

### Rules that never break
- Every number on screen came from a fetched URL or the script — never invented
- No `Math.random()`, `Date.now()`, or network fetches inside HTML
- Every file opens standalone in a browser — no dependencies
- No placeholder comments (`// same as above`, `/* see s01 */`)

---

## STEP 5 — index.html AND COMMIT

**index.html** at `/home/user/cladedesigns/[video-slug]/index.html`:
```html
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
</head><body style="margin:0;background:#000;overflow:hidden;">
<div data-composition-id="main" data-width="1920" data-height="1080" data-duration="[TOTAL]">
  <div class="clip" data-track-index="0" data-start="0"      data-duration="[D1]" data-transition-out="[T1]"><!-- scene-01 --></div>
  <div class="clip" data-track-index="0" data-start="[D1]"   data-duration="[D2]" data-transition-out="[T2]"><!-- scene-02 --></div>
  <!-- data-start = cumulative sum of all prior scene durations -->
</div>
<script>
  window.__timelines=window.__timelines||{};
  const tl=gsap.timeline({paused:true});
  window.__timelines["main"]=tl;
  if(!window.__hfEngine)setTimeout(()=>tl.play(),200);
</script></body></html>
```

Transitions: `flash-through-white` (peak moment) · `glitch` (disruption) · `whip-pan` (fast cut) · `chromatic-split` (data reveal) · `light-leak` (positive) · `sdf-iris` (new chapter) · `swirl-vortex` (energy switch) · `cinematic-zoom` (zoom in) · `domain-warp` (paradigm shift) · `gravitational-lens` (weight/impact) · `cross-warp-morph` (same topic, new angle) · `ripple-waves` (smooth) · `ridged-burn` (intense) · `thermal-distortion` (data heat)

**Commit:**
```bash
cd /home/user/cladedesigns
git add [video-slug]/
git commit -m "Add [video-slug] — [N] scenes [X]s word-synced"
git push -u origin $(git branch --show-current)
```

---

## DONE — print this only:

```
✓ [N] scenes | [X]s total | [voice] voice
✓ Files: [video-slug]/scene-01 … scene-N + index.html
✓ Audio: [video-slug]/audio/ ([N] wav + json)
✓ Pushed
⚠ Unverified: [any flagged numbers, or "none"]
```
