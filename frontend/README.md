# Farm Connect Frontend (Expo + TypeScript)

React Native app following the provided HTML prototypes (see Prototype/). Uses React Navigation and functional components.

## Setup
1. Install dependencies: `npm install` (or `pnpm install`, `yarn install`).
2. Start dev server: `npx expo start`.
3. Choose platform: press `a` for Android emulator, `w` for web, or scan QR for device.

## Project layout
- app/ — screens, components, navigation, services, hooks, types
- assets/ — images/fonts (placeholder)
- app.config.js — Expo config

## Next steps
- Wire navigation (stack + tabs) for RoleSelect, BuyerHome, SellerDashboard, AdminDashboard.
- Implement API calls in app/services/ to the FastAPI backend.
- Replace placeholder UI with React Native equivalents of the HTML prototypes.
