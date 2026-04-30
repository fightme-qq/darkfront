# Darkfront: Last Stand

Expo 54 / React Native prototype of an auto battler inspired by Super Auto Pets.

## Project Map

- [AGENTS.md](/g:/vs/auto pets/AGENTS.md:1) - machine-facing project rules and architecture guardrails
- [docs/onboarding/START-HERE.md](/g:/vs/auto pets/docs/onboarding/START-HERE.md:1) - human-friendly onboarding entrypoint for a new chat
- [docs/design/GDD-MVP.md](/g:/vs/auto pets/docs/design/GDD-MVP.md:1) - product and MVP design document
- [docs/design/SAP-UNITS.md](/g:/vs/auto pets/docs/design/SAP-UNITS.md:1) - content grammar and SAP reference
- [docs/architecture/CLAUDE.md](/g:/vs/auto pets/docs/architecture/CLAUDE.md:1) - technical direction and architecture notes
- [skills/project-onboarding.md](/g:/vs/auto pets/skills/project-onboarding.md:1) - short reusable prompt for an empty-context chat

## Recommended Local Stack

- Node.js `20 LTS`
- npm `10+`
- Git

Optional:

- `Expo Go` on a phone for device testing
- `Android Studio` only if you want a local Android emulator

## First Run

```bash
npm install
npm start
```

Expo controls in the terminal:

- `w` -> open web preview
- `a` -> open Android emulator
- `i` -> open iOS simulator on macOS
- `r` -> reload the app

## Web Preview

```bash
npm run web
```

If Expo asks for another port because `8081` is busy, accept the suggested port and open the URL shown in the terminal.

## Device Preview Shell

To test the web build inside a reusable local phone/tablet frame with landscape presets:

```bash
npm run preview:device
```

Defaults:

- preview shell: `http://localhost:3200`
- target app: `http://localhost:8082`

Custom target example:

```bash
npm run preview:device -- --target http://localhost:3000
```

Use this when you want a local approximation of a hosted preview panel with device presets, rotate support, and quick landscape checks.

## Real Phone Preview

1. Install `Expo Go` on your phone.
2. Connect the phone and computer to the same Wi-Fi network.
3. Run `npm start`.
4. Scan the QR code from the Expo terminal.

Note: the app is currently locked to landscape orientation in [App.tsx](/g:/vs/auto pets/App.tsx:1).

## Useful Checks

```bash
npm run typecheck
```

## Project Notes

- The project uses `npm` because the repo is locked with `package-lock.json`.
- No global React Native CLI is required.
- Native build toolchains are not required for normal Expo development.
