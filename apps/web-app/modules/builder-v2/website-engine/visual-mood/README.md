# Visual Mood Engine

Phase 26C adds an inert, deterministic, local-only Visual Mood Engine.

## Scope

The Visual Mood Engine answers how a website should feel visually. It produces descriptive metadata only. It does not create designs, generate images, generate CSS, create Builder nodes, select components, call providers, call LLMs, use a database, use the network, implement Higgsfield MCP, implement Media Intelligence, or wire into production.

## Output

`runVisualMoodEngine()` returns `EngineResult<VisualMoodProfile>` with primary and secondary emotion, lighting, camera language, depth, materials, textures, atmosphere, contrast, color temperature, image style, luxury, energy, realism, cinematic level, recommended season, recommended weather, rendering style, photography style, illustration style, warnings, confidence, and trace metadata.

## Dimensions

- Emotion: calm, luxurious, energetic, playful, clinical, trustworthy, adventurous, elegant, inspiring, technical.
- Lighting: daylight, golden hour, twilight, overcast, studio, interior ambient, dramatic, soft.
- Camera: architectural wide, cinematic, human eye, documentary, product close-up, drone, macro, editorial.
- Materials: glass, wood, concrete, marble, travertine, steel, greenery, fabric, leather.
- Textures: smooth, matte, polished, natural, industrial, premium, handcrafted.
- Image style: editorial, product, lifestyle, architectural, documentary, luxury, hospitality, healthcare, automotive, commercial.

## Verification

```ts
import { runVisualMoodVerification } from "./visual-mood";

const result = runVisualMoodVerification();
```
