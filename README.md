# Darkfront: Last Stand

Expo 54 / React Native prototype of an auto battler inspired by Super Auto Pets.

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
