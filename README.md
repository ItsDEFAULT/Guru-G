# Guru-G 📚

An AI-powered learning companion built with [Expo](https://expo.dev) / React Native.
Give it a topic and your Gemini API key, and it generates a structured roadmap of
lessons plus a quiz, stored locally on-device with SQLite.

## How it works

1. On first launch you enter a free [Gemini API key](https://aistudio.google.com/app/apikey)
   (validated, then stored in `AsyncStorage`).
2. "New Skill" → enter a topic and level → `core/GenerateContent.mjs` asks Gemini for a
   lesson roadmap, generates each lesson's content, and builds a quiz.
3. Skills are persisted via `core/Repository.mjs` (expo-sqlite). Tap a skill to read its
   lessons, or open its quiz.

### Key files
- `app/_layout.jsx` — root layout, API-key gate, navigation stack.
- `app/index.jsx` — skill list / home screen.
- `app/skill.jsx`, `app/quiz.jsx` — lesson reader and quiz.
- `core/GenerateContent.mjs` — Gemini prompting + content generation.
- `core/extractJson.mjs` — robust JSON extraction from LLM responses.
- `core/Repository.mjs` — SQLite data access layer.

---

## RUNBOOK

> Requires Node.js 18+ and npm. For a device/emulator you also need the
> [Expo Go](https://expo.dev/go) app or an Android/iOS emulator.

### Install
```bash
npm install
```

### Run (development)
```bash
npm start          # Expo dev server + QR code (open in Expo Go)
# or target a platform directly:
npm run android    # Android emulator / device
npm run ios        # iOS simulator (macOS only)
npm run web        # run in a browser
```
On first run, paste a Gemini API key when prompted
(get one free at https://aistudio.google.com/app/apikey).

### Test
```bash
npm test           # jest (watch mode, per package.json)
npm test -- --watchAll=false   # single CI-style run
```
Tests live in `**/__tests__/*-test.{js,tsx}`. `core/__tests__/extractJson-test.js`
covers the LLM-response JSON parser.

### Lint
```bash
npm run lint       # expo lint
```

---

## Recent hardening

This app was prototyped quickly; the following reliability issues were fixed:

- **Robust LLM JSON parsing** — replaced the brittle
  `.replace("```json", "")` hack with `core/extractJson.mjs`, which handles fenced
  blocks, bare JSON, and JSON embedded in prose (covered by unit tests).
- **No more crash sorting lessons** — removed the `topic.match(/\d+/)[0]` sort that
  threw a `TypeError` whenever a lesson title had no digit. Lesson order now follows
  the roadmap order returned by the model.
- **Resilient generation** — a single failed lesson no longer aborts the whole batch
  (`Promise.allSettled`); generation only fails if nothing succeeds.
- **Parameterized SQL** — `updateBestScore` / `deleteSkill` no longer interpolate
  values into SQL strings.
- **DB lifecycle** — connections are always awaited/closed, and table creation is
  guarded so queries can no longer race a not-yet-created table.
- **Per-skill quiz progress** — quiz attempts are now keyed per skill instead of a
  single global bucket that leaked answers across quizzes.
- **Safer UI** — corrupt DB rows are skipped instead of crashing the list, screens
  guard against a missing selected skill, and React list keys were fixed.
