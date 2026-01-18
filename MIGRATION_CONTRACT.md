# Migration Contract: PWA → React Native

> **Related Documentation:**
> - [Full Analysis](docs/MIGRATION_ANALYSIS.md) - Comprehensive comparison of PWA and RN codebases
> - [Checklist](docs/MIGRATION_CHECKLIST.md) - Quick reference for parity checks

---

## Non-negotiables
- React Native behavior must match PWA exactly unless documented
- All auth, navigation, and forms must behave identically
- No feature regressions allowed
- iOS and Android parity required

## Explicit constraints
- No DOM APIs (window, document)
- No web-only CSS assumptions
- No Expo Go–incompatible features without Dev Client note

## Success criteria
- All PWA flows reproducible on iOS + Android
- No disabled inputs, ghost touches, or focus issues
- No platform-specific hacks unless unavoidable
