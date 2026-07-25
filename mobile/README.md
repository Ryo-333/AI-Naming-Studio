# AI Naming Studio — mobile (Capacitor)

Native iOS and Android shells that load the live product (`https://ai-naming-studio.vercel.app`, set in `capacitor.config.json`). One codebase, three platforms: ship web updates and the apps get them instantly — no store re-review for content changes.

## Prerequisites

- **Android:** Android Studio (any OS). Free.
- **iOS:** Xcode on a Mac + Apple Developer Program ($99/yr). No Mac? Use a cloud build service (Ionic Appflow, Codemagic).

## Build & run

```bash
cd mobile
npm install
npx cap sync            # refresh native projects after config changes

# Android
npx cap open android    # opens Android Studio → Run ▶ on emulator/device
# Release: Build → Generate Signed App Bundle (.aab) → upload to Play Console

# iOS
npx cap open ios        # opens Xcode → set your Team under Signing → Run ▶
# Release: Product → Archive → Distribute via App Store Connect
```

## Icons & splash screens

Put a 1024×1024 `icon.png` (and optional 2732×2732 `splash.png`) in `mobile/assets/`, then:

```bash
npx @capacitor/assets generate
```

This fills in every required size for both platforms. Use the aurora "N" mark from `app/public/icon.svg` rendered to PNG.

## Store submission notes

- Privacy policy URL: `https://ai-naming-studio.vercel.app/privacy` (already live).
- Support URL: the GitHub repo, or an email address.
- Both stores flag "web wrapper" apps that add no native value — before submission we should add a few native touches (haptics on swipe, push notifications, share sheet) via Capacitor plugins to clear Apple's guideline 4.2. Track this in the launch checklist (docs/03-architecture.md §7).
- When a custom domain exists: update `server.url` in `capacitor.config.json`, then configure Universal Links / App Links against that domain.
