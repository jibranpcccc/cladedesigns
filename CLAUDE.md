# cladedesigns — HeyGen HyperFrames Workspace

This repo contains multiple HyperFrames video compositions. Each sub-directory is an independent project.

---

## ANTIGRAVITY — AI Agent Workflow

**ANTIGRAVITY** is the agent that receives a script + reference links and produces a complete, self-contained HTML video composition. The master template to reference for all new projects is `cli-short/index.html`.

### Step-by-step Workflow

1. **User gives**: a script (narration text, key points, CTAs) + zero or more links
2. **Agent fetches every link** — do not skip any. Use WebFetch on each URL.
3. **For each link, decide the visual treatment** (see table below)
4. **Build a timing map**: map each script sentence/point to a scene + duration
5. **Write the complete self-contained HTML** file following the HTML Rules section
6. **Inline GSAP** from `main-video/assets/js/gsap.min.js` — never use CDN links
7. **Verify** by reading back the output and confirming scene count + total duration

### Link Type → Visual Treatment

| Link type | What to fetch | Visual treatment |
|---|---|---|
| GitHub repo | README, star count, top languages, description | GitHub card component + stat explosion |
| Tweet / X post | Full tweet text, author, likes/RTs | Tweet card component |
| Website / landing page | Title, hero headline, key features, brand colors | Browser mockup component (scrolling screenshot feel) |
| YouTube video | Title, description, transcript if available | Video thumbnail frame + quote overlay |
| Product Hunt | Product name, tagline, upvotes, top comment | PH card with upvote badge |
| News / blog article | Headline, key quote, publication name | Article pull-quote card |
| App Store / Play Store | App name, rating, review count, screenshots | App card component |
| Any URL with data/stats | Extract the numbers | Stat explosion component |

**Decision rule**: if a link has a key number (stars, upvotes, users, revenue) → always open with a stat explosion for that number. If it has a product UI → use browser mockup. If it has social proof → use tweet card. When in doubt → browser mockup with headline overlay.

---

## Color Palette (Default — always use unless user says otherwise)

```css
--bg:      #050816;   /* deep navy — background */
--cyan:    #22D3EE;   /* electric cyan — primary accent, CTAs */
--violet:  #8B5CF6;   /* violet — secondary accent, gradients */
--amber:   #FBBF24;   /* amber — warning, numbers, highlights */
--coral:   #FB7185;   /* coral — contrast, danger, punch */
--white:   #F8FAFC;   /* near-white — body text, headlines */
--slate:   #94A3B8;   /* slate — supporting text, labels */
```

**Gradients**:
- Hero text: `linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)`
- Glow blur: `radial-gradient(ellipse 600px 400px at 50% 50%, rgba(34,211,238,.18) 0%, transparent 70%)`
- Accent line: `linear-gradient(90deg, #22D3EE, #8B5CF6, #FB7185)`

**Typography**:
- Display (headlines): `'Inter', system-ui, sans-serif` — weight 800–900
- Mono (code, terminals, stats): `'JetBrains Mono', 'Fira Code', monospace` — weight 600

---

## Scene Architecture

Every composition follows this structure:

```html
<div id="composition" data-composition-id="YOUR-ID" data-fps="60"
     data-width="1920" data-height="1080"
     style="width:1920px;height:1080px;position:relative;overflow:hidden;background:#050816">

  <!-- Background layer (always present, always visible) -->
  <canvas id="bg-canvas" ...></canvas>
  <div id="grid-overlay" ...></div>

  <!-- Scene 1 (visible at start) -->
  <div id="sc1" class="scene" data-start="0" data-duration="6" data-track-index="0">
    ...
  </div>

  <!-- All subsequent scenes (hidden at start) -->
  <div id="sc2" class="scene" data-start="6" data-duration="6" data-track-index="0">
    ...
  </div>
  <!-- ... more scenes ... -->
</div>
```

**Critical CSS for scene visibility**:
```css
.scene {
  position: absolute;
  inset: 0;
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 96px 156px;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
}
#sc1 { opacity: 1; visibility: visible; }
```

**Scene switching in GSAP** (exact pattern — no deviations):
```js
// Hide outgoing scene, show incoming
tl.to("#sc1", { autoAlpha: 0, duration: 0.3 }, 6);
tl.to("#sc2", { autoAlpha: 1, visibility: "visible", duration: 0.01 }, 6);
```

---

## HTML Requirements (Non-Negotiable)

1. **Single file, no external dependencies** — everything inline
2. **GSAP must be inlined** — copy the minified source from `main-video/assets/js/gsap.min.js` into a `<script>` tag. Never use `<script src="...">` for GSAP
3. **`paused: false`** for browser preview (user opens file directly in Chrome)
4. **Register timeline**: `window.__timelines = window.__timelines || {}; window.__timelines["YOUR-COMPOSITION-ID"] = tl;`
5. **Absolute GSAP timing** — every `tl.to/from/fromTo` call uses an absolute time as the 3rd argument. Never chain `.to().to()` without explicit times
6. **No `Math.random()`, `Date.now()`, `fetch()`, or `setTimeout()`** — must be deterministic
7. **All timed elements** must have `class="clip"`, `data-start`, `data-duration`, `data-track-index`
8. **Canvas background** — always include the animated particle/grid canvas for depth
9. **1920×1080** — fixed pixel dimensions, no responsive/fluid layout
10. **`data-composition-id`** — must match the string used in `window.__timelines[...]`

**GSAP injection pattern** (Python):
```bash
python3 -c "
content = open('index.html').read()
gsap = open('../main-video/assets/js/gsap.min.js').read()
content = content.replace('GSAP_PLACEHOLDER', gsap)
open('index.html', 'w').write(content)
print('Done. File size:', len(content), 'bytes')
"
```

---

## Component Library

Copy-paste these exact components. Adjust text, colors, and GSAP timing positions only.

### 1. Background Canvas (animated dots)

```html
<canvas id="bg-canvas" style="position:absolute;inset:0;width:1920px;height:1080px;z-index:0"></canvas>
<div id="grid-overlay" style="position:absolute;inset:0;z-index:1;background:
  linear-gradient(rgba(34,211,238,.04) 1px,transparent 1px),
  linear-gradient(90deg,rgba(34,211,238,.04) 1px,transparent 1px);
  background-size:80px 80px;width:1920px;height:1080px"></div>
<div style="position:absolute;top:30%;left:20%;width:600px;height:400px;
  background:radial-gradient(ellipse,rgba(139,92,246,.15) 0%,transparent 70%);
  z-index:2;filter:blur(40px)"></div>
```

```js
// Canvas particle animation (put in <script> before GSAP timeline)
(function(){
  var c=document.getElementById('bg-canvas');
  if(!c)return;
  var ctx=c.getContext('2d');
  c.width=1920; c.height=1080;
  var pts=[];
  for(var i=0;i<120;i++){
    pts.push({x:Math.floor(Math.random()*1920), y:Math.floor(Math.random()*1080),
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r:Math.random()*1.5+.5, a:Math.random()*.5+.1});
  }
  function draw(){
    ctx.clearRect(0,0,1920,1080);
    pts.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=1920; if(p.x>1920)p.x=0;
      if(p.y<0)p.y=1080; if(p.y>1080)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(34,211,238,'+p.a+')'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
```

**NOTE**: The canvas uses `Math.random()` for initial particle position only — this is acceptable for the background canvas because it's purely decorative and doesn't affect timeline determinism. Never use `Math.random()` in GSAP tweens or for content values.

### 2. Hero Scene (Hook)

```html
<div id="sc1" class="scene" data-start="0" data-duration="6" data-track-index="0">
  <div class="clip" data-start="0" data-duration="6" data-track-index="1">
    <p id="s1-eyebrow" style="font-family:'JetBrains Mono',monospace;font-size:18px;
      color:#22D3EE;letter-spacing:4px;text-transform:uppercase;margin:0 0 24px;opacity:0">
      > PRODUCT_LAUNCH.exe
    </p>
    <h1 id="s1-headline" style="font-family:'Inter',system-ui,sans-serif;font-size:88px;
      font-weight:900;line-height:1.0;margin:0 0 32px;
      background:linear-gradient(135deg,#22D3EE 0%,#8B5CF6 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;max-width:1100px;opacity:0">
      YOUR MAIN HEADLINE HERE
    </h1>
    <p id="s1-sub" style="font-family:'Inter',system-ui,sans-serif;font-size:28px;
      color:#94A3B8;font-weight:400;max-width:700px;line-height:1.5;
      margin:0 0 48px;opacity:0">
      Supporting subtext that explains the hook
    </p>
    <div id="s1-accent" style="width:120px;height:4px;
      background:linear-gradient(90deg,#22D3EE,#8B5CF6,#FB7185);
      border-radius:2px;opacity:0"></div>
  </div>
</div>
```

```js
// Hero scene animations
tl.fromTo("#s1-eyebrow", {opacity:0,y:20}, {opacity:1,y:0,duration:.6,ease:"power2.out"}, 0.3);
tl.fromTo("#s1-headline", {opacity:0,y:40}, {opacity:1,y:0,duration:.8,ease:"power3.out"}, 0.7);
tl.fromTo("#s1-sub",      {opacity:0,y:30}, {opacity:1,y:0,duration:.7,ease:"power2.out"}, 1.2);
tl.fromTo("#s1-accent",   {opacity:0,scaleX:0,transformOrigin:"left center"},
                           {opacity:1,scaleX:1,duration:.6,ease:"power2.out"}, 1.6);
```

### 3. Stat Explosion (for numbers)

```html
<div id="sc2" class="scene" data-start="6" data-duration="6" data-track-index="0">
  <div class="clip" data-start="6" data-duration="6" data-track-index="1">
    <p id="s2-label" style="font-family:'JetBrains Mono',monospace;font-size:20px;
      color:#94A3B8;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;opacity:0">
      STAT LABEL
    </p>
    <div id="s2-number" style="font-family:'Inter',system-ui,sans-serif;font-size:160px;
      font-weight:900;color:#FBBF24;line-height:1;margin:0 0 8px;opacity:0">
      0
    </div>
    <div id="s2-suffix" style="font-family:'JetBrains Mono',monospace;font-size:36px;
      color:#22D3EE;letter-spacing:2px;margin:0 0 40px;opacity:0">
      UNIT / CONTEXT
    </div>
    <div id="s2-glow" style="position:absolute;top:50%;left:30%;width:500px;height:500px;
      background:radial-gradient(ellipse,rgba(251,191,36,.15) 0%,transparent 70%);
      transform:translate(-50%,-50%);filter:blur(60px);z-index:-1"></div>
  </div>
</div>
```

```js
// Stat scene animations
var sn = { v: 0 };
tl.to("#sc1", { autoAlpha: 0, duration: 0.3 }, 6);
tl.to("#sc2", { autoAlpha: 1, visibility: "visible", duration: 0.01 }, 6);
tl.fromTo("#s2-label",  {opacity:0,y:20}, {opacity:1,y:0,duration:.5}, 6.2);
tl.fromTo("#s2-number", {opacity:0,scale:0.5}, {opacity:1,scale:1,duration:.6,ease:"back.out(1.7)"}, 6.4);
tl.to(sn, { v: 40000, duration: 2.2, ease: "power2.out",
  onUpdate: function() {
    var el = document.getElementById("s2-number");
    if (el) el.textContent = Math.round(sn.v).toLocaleString();
  }
}, 6.5);
tl.fromTo("#s2-suffix", {opacity:0,y:15}, {opacity:1,y:0,duration:.5}, 7.2);
```

### 4. Terminal / Code Scene

```html
<div id="sc3" class="scene" data-start="12" data-duration="9" data-track-index="0">
  <div class="clip" data-start="12" data-duration="9" data-track-index="1"
       style="display:flex;gap:80px;align-items:center;width:100%">
    <!-- Left: text block -->
    <div style="flex:1">
      <p id="s3-label" style="font-family:'JetBrains Mono',monospace;font-size:18px;
        color:#22D3EE;letter-spacing:4px;margin:0 0 20px;opacity:0">
        HOW IT WORKS
      </p>
      <h2 id="s3-title" style="font-family:'Inter',system-ui,sans-serif;font-size:56px;
        font-weight:800;color:#F8FAFC;line-height:1.1;margin:0 0 24px;opacity:0">
        Section Headline
      </h2>
      <p id="s3-body" style="font-family:'Inter',system-ui,sans-serif;font-size:24px;
        color:#94A3B8;line-height:1.6;max-width:500px;opacity:0">
        Supporting explanation text here.
      </p>
    </div>
    <!-- Right: terminal -->
    <div id="s3-terminal" style="flex:1;background:#0D1117;border:1px solid rgba(34,211,238,.2);
      border-radius:12px;padding:32px;font-family:'JetBrains Mono',monospace;
      font-size:18px;line-height:2;opacity:0">
      <div style="display:flex;gap:8px;margin-bottom:20px">
        <div style="width:12px;height:12px;border-radius:50%;background:#FB7185"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#FBBF24"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#22D3EE"></div>
      </div>
      <div style="color:#94A3B8">$ command --flag</div>
      <div style="color:#22D3EE">> output line 1</div>
      <div style="color:#22D3EE">> output line 2</div>
      <div style="color:#8B5CF6">> output line 3</div>
      <div style="color:#F8FAFC">✓ Done</div>
    </div>
  </div>
</div>
```

```js
tl.to("#sc2", { autoAlpha: 0, duration: 0.3 }, 12);
tl.to("#sc3", { autoAlpha: 1, visibility: "visible", duration: 0.01 }, 12);
tl.fromTo("#s3-label",    {opacity:0,x:-20}, {opacity:1,x:0,duration:.5}, 12.3);
tl.fromTo("#s3-title",    {opacity:0,x:-30}, {opacity:1,x:0,duration:.6,ease:"power2.out"}, 12.6);
tl.fromTo("#s3-body",     {opacity:0,x:-20}, {opacity:1,x:0,duration:.5}, 13.0);
tl.fromTo("#s3-terminal", {opacity:0,x:40},  {opacity:1,x:0,duration:.7,ease:"power2.out"}, 12.4);
```

### 5. GitHub Card

```html
<div id="github-card" style="background:#0D1117;border:1px solid rgba(34,211,238,.25);
  border-radius:16px;padding:40px;max-width:700px;opacity:0">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
    <div style="width:48px;height:48px;background:linear-gradient(135deg,#22D3EE,#8B5CF6);
      border-radius:50%"></div>
    <div>
      <div style="font-family:'Inter',sans-serif;font-size:22px;font-weight:700;color:#F8FAFC">
        org/repo-name
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#94A3B8">
        github.com
      </div>
    </div>
  </div>
  <p style="font-family:'Inter',sans-serif;font-size:18px;color:#94A3B8;margin:0 0 28px;line-height:1.5">
    Repository description from README
  </p>
  <div style="display:flex;gap:32px">
    <div style="text-align:center">
      <div style="font-family:'Inter',sans-serif;font-size:36px;font-weight:800;color:#FBBF24">
        40K+
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#94A3B8;
        letter-spacing:2px">STARS</div>
    </div>
    <div style="text-align:center">
      <div style="font-family:'Inter',sans-serif;font-size:36px;font-weight:800;color:#22D3EE">
        75
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#94A3B8;
        letter-spacing:2px">DAYS</div>
    </div>
    <div style="text-align:center">
      <div style="font-family:'Inter',sans-serif;font-size:36px;font-weight:800;color:#8B5CF6">
        Python
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#94A3B8;
        letter-spacing:2px">LANGUAGE</div>
    </div>
  </div>
</div>
```

### 6. Browser Mockup

```html
<div id="browser-mockup" style="background:#0D1117;border:1px solid rgba(34,211,238,.2);
  border-radius:16px;overflow:hidden;max-width:900px;opacity:0">
  <!-- Browser chrome -->
  <div style="background:#1a1f2e;padding:16px 24px;display:flex;align-items:center;gap:12px;
    border-bottom:1px solid rgba(255,255,255,.06)">
    <div style="display:flex;gap:8px">
      <div style="width:12px;height:12px;border-radius:50%;background:#FB7185"></div>
      <div style="width:12px;height:12px;border-radius:50%;background:#FBBF24"></div>
      <div style="width:12px;height:12px;border-radius:50%;background:#22D3EE"></div>
    </div>
    <div style="flex:1;background:#0D1117;border-radius:6px;padding:8px 16px;
      font-family:'JetBrains Mono',monospace;font-size:13px;color:#94A3B8">
      https://example.com
    </div>
  </div>
  <!-- Page content area -->
  <div style="padding:48px;background:#050816;min-height:300px">
    <h3 style="font-family:'Inter',sans-serif;font-size:40px;font-weight:800;
      color:#F8FAFC;margin:0 0 16px">
      Page Headline From Link
    </h3>
    <p style="font-family:'Inter',sans-serif;font-size:18px;color:#94A3B8;
      max-width:600px;line-height:1.6">
      Key description or feature list extracted from the URL
    </p>
  </div>
</div>
```

### 7. Tweet Card

```html
<div id="tweet-card" style="background:#0D1117;border:1px solid rgba(34,211,238,.2);
  border-radius:16px;padding:40px;max-width:680px;opacity:0">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
    <div style="width:52px;height:52px;border-radius:50%;
      background:linear-gradient(135deg,#FB7185,#8B5CF6)"></div>
    <div>
      <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:700;color:#F8FAFC">
        @username
      </div>
      <div style="font-family:'Inter',sans-serif;font-size:14px;color:#94A3B8">
        Display Name
      </div>
    </div>
    <div style="margin-left:auto;font-size:24px">𝕏</div>
  </div>
  <p style="font-family:'Inter',sans-serif;font-size:20px;color:#F8FAFC;
    line-height:1.6;margin:0 0 20px">
    "Tweet text here — key quote or social proof"
  </p>
  <div style="display:flex;gap:24px;color:#94A3B8;font-size:15px">
    <span>❤️ 1.2K</span>
    <span>🔁 847</span>
    <span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:13px">
      May 2025
    </span>
  </div>
</div>
```

### 8. End Card

```html
<div id="scN" class="scene" data-start="26" data-duration="4" data-track-index="0">
  <div class="clip" data-start="26" data-duration="4" data-track-index="1"
       style="align-items:center;text-align:center;width:100%">
    <div id="end-badge" style="width:80px;height:80px;border-radius:50%;
      background:linear-gradient(135deg,#22D3EE,#8B5CF6);
      display:flex;align-items:center;justify-content:center;
      font-size:36px;margin:0 auto 32px;opacity:0">
      ✓
    </div>
    <h2 id="end-cta" style="font-family:'Inter',sans-serif;font-size:72px;font-weight:900;
      background:linear-gradient(135deg,#22D3EE,#8B5CF6);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;margin:0 0 24px;opacity:0">
      YOUR CTA HERE
    </h2>
    <p id="end-url" style="font-family:'JetBrains Mono',monospace;font-size:28px;
      color:#94A3B8;letter-spacing:2px;opacity:0">
      github.com/org/repo
    </p>
  </div>
</div>
```

```js
tl.to("#scPrev", { autoAlpha: 0, duration: 0.3 }, 26);
tl.to("#scN",    { autoAlpha: 1, visibility: "visible", duration: 0.01 }, 26);
tl.fromTo("#end-badge", {opacity:0,scale:0}, {opacity:1,scale:1,duration:.5,ease:"back.out(2)"}, 26.3);
tl.fromTo("#end-cta",   {opacity:0,y:30},   {opacity:1,y:0,duration:.6,ease:"power3.out"}, 26.7);
tl.fromTo("#end-url",   {opacity:0,y:20},   {opacity:1,y:0,duration:.5}, 27.2);
```

---

## Animation Rules

| Purpose | Values |
|---|---|
| Scene entry (text) | `{opacity:0,y:30}` → `{opacity:1,y:0,duration:.6,ease:"power2.out"}` |
| Scene entry (element from left) | `{opacity:0,x:-30}` → `{opacity:1,x:0,duration:.6,ease:"power2.out"}` |
| Scene entry (card) | `{opacity:0,x:40}` → `{opacity:1,x:0,duration:.7,ease:"power2.out"}` |
| Number pop | `{opacity:0,scale:0.5}` → `{opacity:1,scale:1,duration:.6,ease:"back.out(1.7)"}` |
| Badge pop | `{opacity:0,scale:0}` → `{opacity:1,scale:1,duration:.5,ease:"back.out(2)"}` |
| Scene exit | `{autoAlpha:0,duration:.3}` at exact scene boundary time |
| Scene reveal | `{autoAlpha:1,visibility:"visible",duration:.01}` at exact scene boundary time |
| Stagger (list items) | `gsap.set(items,{opacity:0,x:-20}); tl.to(items,{opacity:1,x:0,duration:.4,stagger:.12}, T)` |
| Count-up number | Object tween: `var n={v:0}; tl.to(n,{v:TARGET,duration:2.2,ease:"power2.out",onUpdate:fn},T)` |
| Ken-Burns (background image) | `{scale:1.08,duration:8,ease:"none"}` — start AFTER scene entry animation ends |

**Easing cheatsheet**:
- Smooth entry: `power2.out`
- Punchy entry: `power3.out`
- Elastic pop: `back.out(1.7)` or `back.out(2)`
- Count-up: `power2.out`
- Exit: `power2.in`
- Linear drift: `none`

---

## Timing Map Template

When writing a new composition, plan the timing map first:

```
Scene 1: 0s – Xs    Hook / opening statement
Scene 2: Xs – Ys    First key stat or proof point
Scene 3: Ys – Zs    Product demo or how-it-works
Scene 4: Zs – As    Social proof / GitHub card / tweet
Scene 5: As – Bs    Second feature or comparison
Scene 6: Bs – END   End card + CTA
```

**Scene duration guide**:
- Fast hook: 4-6 seconds
- Stat explosion: 5-7 seconds (needs time for count-up animation)
- Demo/terminal: 7-10 seconds
- Social proof: 4-6 seconds
- End card: 3-5 seconds

---

## Boilerplate (copy for every new project)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>COMPOSITION TITLE</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#050816;--cyan:#22D3EE;--violet:#8B5CF6;
  --amber:#FBBF24;--coral:#FB7185;--white:#F8FAFC;--slate:#94A3B8;
}
body{background:#050816;width:1920px;height:1080px;overflow:hidden}
.scene{
  position:absolute;inset:0;width:1920px;height:1080px;
  display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
  padding:96px 156px;z-index:10;opacity:0;visibility:hidden;
}
#sc1{opacity:1;visibility:visible}
</style>
</head>
<body>
<div id="composition" data-composition-id="YOUR-ID" data-fps="60"
     data-width="1920" data-height="1080"
     style="width:1920px;height:1080px;position:relative;overflow:hidden;background:#050816">

  <!-- BACKGROUND: canvas + grid + glow -->
  <canvas id="bg-canvas" style="position:absolute;inset:0;width:1920px;height:1080px;z-index:0"></canvas>
  <div id="grid-overlay" style="position:absolute;inset:0;z-index:1;
    background:linear-gradient(rgba(34,211,238,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(34,211,238,.04) 1px,transparent 1px);
    background-size:80px 80px;width:1920px;height:1080px"></div>

  <!-- SCENES GO HERE -->
  <div id="sc1" class="scene" data-start="0" data-duration="6" data-track-index="0">
    ...
  </div>

</div>
<script>
// GSAP_PLACEHOLDER
</script>
<script>
// Canvas background
(function(){
  var c=document.getElementById('bg-canvas');
  if(!c)return;
  var ctx=c.getContext('2d');
  c.width=1920;c.height=1080;
  var pts=[];
  for(var i=0;i<120;i++)pts.push({
    x:Math.floor(Math.random()*1920),y:Math.floor(Math.random()*1080),
    vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
    r:Math.random()*1.5+.5,a:Math.random()*.5+.1
  });
  function draw(){
    ctx.clearRect(0,0,1920,1080);
    pts.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=1920;if(p.x>1920)p.x=0;
      if(p.y<0)p.y=1080;if(p.y>1080)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(34,211,238,'+p.a+')';ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// GSAP Timeline
var tl = gsap.timeline({ paused: false });
window.__timelines = window.__timelines || {};
window.__timelines["YOUR-ID"] = tl;

// --- SCENE ANIMATIONS GO HERE ---
// tl.fromTo("#sc1-headline", {opacity:0,y:40}, {opacity:1,y:0,duration:.8}, 0.5);

</script>
</body>
</html>
```

---

## Skills (load before editing any composition)

Skills are installed at `.agents/skills/`. Invoke them before writing or modifying any `.html` composition:

| Skill | Command | Use for |
|---|---|---|
| hyperframes | `/hyperframes` | Authoring scenes, GSAP timelines, captions, transitions |
| hyperframes-cli | `/hyperframes-cli` | `init`, `lint`, `inspect`, `preview`, `render` commands |
| hyperframes-media | `/hyperframes-media` | TTS narration, Whisper transcription, background removal |
| hyperframes-registry | `/hyperframes-registry` | `hyperframes add <block>` catalog installs |
| gsap | `/gsap` | GSAP animation patterns for HyperFrames |

## Projects

| Directory | Template | Description |
|---|---|---|
| `cli-short/` | custom | CLI-Anything 30s promo — master template for all new videos |
| `cli-anything/` | custom | CLI-Anything 90s full version |
| `main-video/` | warm-grain | HeyGen HyperFrames product launch video (8 scenes, 28s, 3 shader transitions) |
| `blank-starter/` | blank | Blank starting point for custom compositions |

## Dev Loop

```bash
# Preview a project (long-running — use run_in_background)
cd cli-short && npm run dev

# Lint all projects
npm run lint:all

# Lint single project
cd cli-short && npm run check

# Render
cd cli-short && npm run render

# Install / update skills
npx hyperframes skills
```

## HyperFrames Key Rules

1. Every timed element needs `data-start`, `data-duration`, `data-track-index`
2. Timed elements must have `class="clip"`
3. Timelines: `{ paused: false }` for browser preview; HyperFrames renderer uses `{ paused: true }`
4. No `Math.random()`, `Date.now()`, or network fetches in GSAP tweens — compositions must be deterministic
5. Run `npm run check` after every composition edit before considering task done

## HyperShader Transitions (14 built-in)

`domain-warp`, `ridged-burn`, `whip-pan`, `sdf-iris`, `ripple-waves`, `gravitational-lens`,
`cinematic-zoom`, `chromatic-split`, `swirl-vortex`, `thermal-distortion`,
`flash-through-white`, `cross-warp-morph`, `light-leak`, `glitch`
