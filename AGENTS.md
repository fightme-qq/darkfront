# AGENTS.md

This document explains how agents should work with `Darkfront: Last Stand`.

## 1. Core Intent

This project is an `Expo 54` / `React Native` prototype of a `Super Auto Pets`-inspired auto battler.

The long-term architectural goal is:

- `simulation first`
- `presentation second`

That means gameplay rules should gradually move toward deterministic, testable domain logic that does not depend on React or UI concerns.

Important: not every target-state rule in this document already exists in code today. Agents should distinguish between:

- `current project truth`
- `target architecture`
- `critical rules` that must be preserved right now

## 2. Current Project Truth

As of now, the repository is in an early MVP prototype state.

### Stack

- `Expo 54`
- `React 19.1`
- `React Native 0.81`
- `react-native-web 0.21`
- `zustand 5`
- `TypeScript` with `strict: true`
- `npm` with `package-lock.json`

### Runtime and Tooling

- Recommended local runtime: `Node 20 LTS`
- Current repo `engines` requests `>=20 <21`
- The project has also been observed running on `Node 22`; treat Node 20 as preferred, not as a reason to block work unless a dependency actually breaks
- Use `npm`, not `pnpm` or `yarn`, unless explicitly requested

### Current App Characteristics

- The app is currently landscape-oriented
- The project is `mobile-first`; mobile landscape UX is the primary target platform
- Orientation is locked in `App.tsx`
- Web preview works through Expo web
- Phone preview is expected to work through Expo Go

### Current Architecture in Practice

- `src/data/` contains content data
- `src/domain/` contains isolated gameplay helpers like seeded RNG, shop logic, and the current temporary mock battle resolver
- `src/stores/gameStore.ts` currently contains most application orchestration and state transitions
- `src/components/` and `src/screens/` contain UI/presentation

### What Does NOT Exist Yet

Agents must not assume these are already implemented:

- full battle engine
- event-driven combat log
- merge/experience resolver
- level-up reward system
- food system
- mana system
- toys
- ailments
- separate infrastructure layer
- automated tests

## 3. Target Architecture

This is the intended direction, not a guarantee that it already exists.

### Desired Layers

- `Content layer`
  - declarative content definitions
  - units, food, tags, tiers, balance data
- `Domain layer`
  - battle engine
  - shop engine
  - merge/experience rules
  - deterministic RNG
  - event queue / resolution logic
- `Application layer`
  - use-cases such as `startRun`, `buyUnit`, `sellUnit`, `rollShop`, `startBattle`
- `Infrastructure layer`
  - persistence, telemetry, external integration
- `Presentation layer`
  - screens, components, interactions, animation, view state

### Architectural Direction

Agents should move the project toward:

- deterministic simulation
- clearer separation between domain and UI
- more declarative content definitions
- reduced gameplay logic inside React components

## 4. Critical Rules

These are the rules agents should treat as mandatory unless the user explicitly asks otherwise.

### 4.1. Do Not Put Gameplay Rules Into UI

React components should render state and dispatch actions.

Avoid putting battle, shop, targeting, or resolution logic directly into:

- `src/components/`
- `src/screens/`

### 4.2. Keep Domain Logic Deterministic

For gameplay randomness:

- use the seeded RNG in `src/domain/rng.ts`
- do not introduce `Math.random()` into domain logic

Same input plus same seed should trend toward same output.

### 4.3. Prefer Declarative Content Over Hardcoded Unit Cases

Avoid patterns like:

- `if (unit.name === "...")`
- `switch (unit.id)` everywhere in combat code

It is acceptable to use temporary glue code in prototypes, but new gameplay systems should aim toward declarative data models.

### 4.4. Preserve Expo Compatibility

For Expo / React Native related dependencies:

- prefer `npx expo install <package>`

For pure JavaScript utilities:

- `npm install` is acceptable

Do not arbitrarily migrate the repo to another package manager.

### 4.5. Respect MVP Scope

Do not silently expand the game into systems outside current MVP intent.

Out of scope unless explicitly requested:

- real-time PvP
- meta progression
- mana-heavy Unicorn-style systems
- toys / hard mode toys
- grid combat
- multiple advanced game modes

### 4.6. Mobile First Wins

This project should be implemented for mobile first and web second.

Treat these rules as critical:

- prefer touch-first interaction design over mouse-first interaction design
- if a UX pattern works on web but is awkward on phone, redesign it for phone
- Expo / React Native runtime behavior is more important than browser convenience
- web preview is a supporting tool, not the primary product target
- new gameplay interaction patterns should be validated against mobile landscape constraints first

### 4.7. Approved Work Should Reach Git

If the user reviews a result and explicitly says it is good or approved, agents should treat that as permission to persist the accepted state unless the user asks to keep it local-only.

Default behavior after approval:

- commit the accepted changes
- push them to the main remote repository

This keeps GitHub aligned with the approved working state instead of leaving good changes only in the local workspace.

## 5. Flexible Rules

These rules are useful defaults, but they are not absolute. Break them if there is a strong reason.

### File Size

- Prefer small focused files
- If a file starts mixing multiple responsibilities, split it
- A file being over `200` lines is not automatically a problem

### Folder Layout

Current layout:

- `src/app/`
- `src/screens/`
- `src/components/game/`
- `src/domain/`
- `src/data/`
- `src/stores/`
- `src/constants/`

Agents should generally follow this layout unless there is a clear structural improvement.

### Imports

- Prefer relative imports inside `src/`
- Do not introduce path alias complexity unless the project meaningfully grows

## 6. Gameplay Implementation Guidance

When implementing new gameplay systems, prefer this order of thought:

1. Define the rule in domain terms
2. Decide what state the rule needs
3. Decide what deterministic inputs and outputs it should have
4. Only then connect it to store orchestration
5. Only then expose it through UI

When designing unit content, prefer a structure like:

- `role`
- `trigger`
- `target`
- `effect`
- `numbers`
- `flavor`

This is aligned with the project design docs and should be preferred over flavor-first implementation.

## 7. Testing Expectations

There is no test suite yet.

Agents should not pretend tests exist when they do not.

When the project starts adding deeper domain logic, the most valuable first tests are:

- seeded RNG determinism
- shop roll and freeze behavior
- merge / experience progression
- battle resolution order
- start-of-battle triggers
- faint chains
- draw / win / loss edge cases

For now:

- `npm run typecheck` is the minimum required validation step after technical changes

## 8. Vibe-Specific Notes

These notes are workflow-specific and should not be confused with core architecture.

- The repo is expected to run as an Expo project
- Web preview should use Expo web
- Phone preview should use Expo Go
- If native build metadata is later required, `android.package` and `ios.bundleIdentifier` may need to be added to `app.json`

These are operational concerns, not gameplay architecture.

## 9. Agent Behavior Summary

Agents working in this repo should:

- be honest about current implementation state
- avoid inventing systems that do not exist yet
- preserve deterministic domain direction
- keep UI thin when possible
- prefer incremental, realistic architecture improvements over sweeping rewrites
- enforce only the rules that are actually critical

When a rule in this file conflicts with a direct user request, the direct user request wins unless it would break the project in a substantial way.
