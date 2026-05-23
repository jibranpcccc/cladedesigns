# cladedesigns — HeyGen HyperFrames Workspace

Write HTML. Animate with GSAP. Render to MP4. Powered by [HeyGen HyperFrames](https://hyperframes.heygen.com).

## What's in here

| Project | Template | What it is |
|---|---|---|
| [`main-video/`](main-video/) | warm-grain | Full HeyGen product launch video — 8 scenes, 28s, 3 WebGL shader transitions, GSAP counters, bar charts, hero reveals |
| [`product-promo/`](product-promo/) | product-promo | Product promo starter |
| [`kinetic-type/`](kinetic-type/) | kinetic-type | Kinetic typography starter |
| [`swiss-grid/`](swiss-grid/) | swiss-grid | Swiss editorial grid starter |
| [`blank-starter/`](blank-starter/) | blank | Clean slate for custom work |

## Quick Start

```bash
# Install dependencies
npm install

# Install AI coding skills (teaches Claude / Cursor / Codex the HyperFrames patterns)
npx hyperframes skills

# Preview a project in browser (live reload)
cd main-video && npm run dev

# Lint + validate + inspect
cd main-video && npm run check

# Render to MP4 (requires FFmpeg)
cd main-video && npm run render
```

**Requirements:** Node.js ≥ 22, FFmpeg

## How HyperFrames works

HyperFrames is an open-source video rendering framework by HeyGen. Compositions are plain HTML files:

```html
<div data-composition-id="my-video" data-width="1920" data-height="1080" data-start="0" data-duration="10">
  <div class="scene clip" id="s1" data-start="0" data-duration="3.5" data-track-index="0">
    <h1 id="title">Hello World</h1>
  </div>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.from("#title", { y: 60, autoAlpha: 0, duration: 0.6, ease: "expo.out" }, 0.2);
  window.__timelines["my-video"] = tl;
</script>
```

The CLI renders the HTML to MP4 using Puppeteer + FFmpeg: `npx hyperframes render`

## Catalog blocks installed in `main-video/`

| Block | What it provides |
|---|---|
| `flash-through-white` | High-energy flash transition |
| `data-chart` | Animated data visualization |
| `cinematic-zoom` | WebGL cinematic zoom shader |
| `instagram-follow` | Social media follow overlay |

Add more: `npx hyperframes add <block-name>` — browse at [hyperframes.heygen.com/catalog](https://hyperframes.heygen.com/catalog/blocks/data-chart)

## WebGL Shader Transitions (14 built-in)

`domain-warp` · `ridged-burn` · `whip-pan` · `sdf-iris` · `ripple-waves` · `gravitational-lens` · `cinematic-zoom` · `chromatic-split` · `swirl-vortex` · `thermal-distortion` · `flash-through-white` · `cross-warp-morph` · `light-leak` · `glitch`

## Links

- [HyperFrames docs](https://hyperframes.heygen.com)
- [Quickstart](https://hyperframes.heygen.com/quickstart)
- [Catalog](https://hyperframes.heygen.com/catalog/blocks/data-chart)
- [GitHub repo](https://github.com/heygen-com/hyperframes)
- [HeyGen Help: HyperFrames](https://help.heygen.com/en/articles/15001510-hyperframes-x-heygen)
