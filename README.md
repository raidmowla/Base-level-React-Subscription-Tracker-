## A base-level React Native (Expo) app for Android that helps solve subscription
fatigue — the problem of losing track of recurring charges (Netflix, Spotify,
gym memberships, SaaS tools, etc.) and getting surprised by renewals.

## Features
- Add and edit subscriptions with name, cost, billing cycle
  (monthly/yearl), renewal date (via a real date picker), and category
- See total monthly spend at a glance (yearly plans are normalized to a
  monthly figure)
- List sorted by soonest renewal, with color-coded badges (green/yellow/red)
- Local push notification reminder before each renewal — **lead time is
  configurable** (1/2/3/5/7 days) in Settings
- **Insights screen** with a spend-by-category breakdown and your most
  expensive subscription
- Settings screen for reminder lead time and currency symbol
  ($/€ /£/¥)
- Data persists on-device via AsyncStorage — works fully offline
- Delete a subscription (also cancels its scheduled reminder)



## Install Node.js (LTS) and the expo CLI:
npm install -g expo-cli

## Install dependencies
cd subscription-tracker
npm install

## Install the Expo Go app on your Android phone from the Play Store, then run:
npx expo start

## Scan the QR code shown in the terminal with the Expo Go app.
## Run the emulator
npx expo run:android

## A lot of recurring subscriptions are being paid over time when those subscriptions are never actually used or well document used of "suibscription fatigue". This app gives a simple,
private (fully offline), at-a-glance way to stay on top of tha

