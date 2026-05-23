# cladedesigns — HeyGen HyperFrames Workspace

This repo contains multiple HyperFrames video compositions. Each sub-directory is an independent project.

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
| `main-video/` | warm-grain | HeyGen HyperFrames product launch video (8 scenes, 28s, 3 shader transitions) |
| `product-promo/` | product-promo | Product promo template |
| `kinetic-type/` | kinetic-type | Kinetic typography template |
| `swiss-grid/` | swiss-grid | Swiss design grid template |
| `blank-starter/` | blank | Blank starting point for custom compositions |

## Dev Loop

```bash
# Preview a project (long-running — use run_in_background)
cd main-video && npm run dev

# Lint all projects
npm run lint:all

# Lint single project
cd main-video && npm run check

# Render
cd main-video && npm run render

# Install / update skills
npx hyperframes skills
```

## Key Rules

1. Every timed element needs `data-start`, `data-duration`, `data-track-index`
2. Timed elements must have `class="clip"`
3. Timelines: `{ paused: true }` + registered on `window.__timelines["composition-id"]`
4. No `Math.random()`, `Date.now()`, or network fetches — compositions must be deterministic
5. Run `npm run check` after every composition edit before considering task done

## HyperShader Transitions (14 built-in)

`domain-warp`, `ridged-burn`, `whip-pan`, `sdf-iris`, `ripple-waves`, `gravitational-lens`,
`cinematic-zoom`, `chromatic-split`, `swirl-vortex`, `thermal-distortion`,
`flash-through-white`, `cross-warp-morph`, `light-leak`, `glitch`
