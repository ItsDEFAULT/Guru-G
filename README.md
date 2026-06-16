# Guru-G 📚

An AI-powered, mobile learning companion. Tell Guru-G what you want to learn and
it uses Google Gemini to generate a structured course — a roadmap of lessons with
full Markdown content, plus a multiple-choice quiz — and stores it on-device so
you can study offline afterwards.

Built with [Expo](https://expo.dev) / React Native and [file-based routing](https://docs.expo.dev/router/introduction).

---

## RUNBOOK

Exact commands to install, run, and test the project. Requires **Node.js 18+** and
npm. A Gemini API key is needed at runtime (enter it in-app on first launch; get a
free key at <https://aistudio.google.com/app/apikey>).

### Install

```bash
npm install
```

### Run (development)

```bash
npm start          # start the Expo dev server (then choose a target)
# or target a platform directly:
npm run android    # Android emulator / device
npm run ios        # iOS simulator (macOS only)
npm run web        # run in the browser
```

The first screen asks for your Gemini API key. It is validated against the API and
then stored locally on the device (via `AsyncStorage`) — it never leaves the device
except to call Gemini.

### Test

```bash
npm test           # run the Jest suite once (CI-friendly, exits when done)
npm run test:watch # re-run on change during development
```

### Lint

```bash
npm run lint
```

---

## How it works

1. **API key** — on first launch you enter a Gemini key; it is validated and saved.
2. **Add a skill** — enter a topic and pick a difficulty (Beginner / Intermediate /
   Advanced). Guru-G asks Gemini for a lesson roadmap, generates each lesson's
   content in parallel, then generates a quiz covering all of it.
3. **Learn** — browse lessons rendered as Markdown.
4. **Quiz** — answer multiple-choice questions; your selections are saved per-skill.

Generated skills persist in an on-device SQLite database, so they remain available
without regenerating.

## Architecture

The app is split into a UI layer (`app/`, `components/`) and a framework-agnostic
core (`core/`). The core has no React dependencies, which keeps it easy to reason
about and unit-test.

```
app/                       Expo Router screens
  _layout.jsx              Root navigator + API-key gate
  index.jsx                Skill list (home)
  skill.jsx                Lesson viewer
  quiz.jsx                 Quiz screen
components/
  AddNewSkill.jsx          "Generate a new skill" form
  SkillCard.jsx            A skill row (open / quiz / delete)
  GetAPIKey.jsx            First-run API-key entry
  SkillContext.js          Shares the selected skill + API key across screens
core/                      Pure, testable logic (no React)
  config.mjs               Single source of truth for every constant
  gemini.mjs               Gemini client factory + API-key validation
  prompts.mjs              Prompt builders (one per generation step)
  json.mjs                 Robust JSON extraction from model responses
  GenerateContent.mjs      Orchestrates roadmap -> lessons -> quiz -> persist
  Repository.mjs           SQLite data access (parameterised queries)
  __tests__/               Unit tests for the pure helpers
```

### Why it's structured this way (extensibility)

- **Everything tunable lives in `core/config.mjs`** — the model name, database name,
  storage keys, difficulty levels, and generation caps. Adding a difficulty level or
  swapping the model is a one-line change; the UI and prompts pick it up
  automatically (the difficulty radios are rendered from `config.LEVELS`).
- **Prompts are pure functions in `core/prompts.mjs`** — prompt tuning never touches
  control flow, and each prompt is unit-tested.
- **Model access is centralised in `core/gemini.mjs`** — one place knows how to talk
  to Gemini, used by both generation and key validation.
- **Model responses are parsed defensively** (`core/json.mjs`) — it strips Markdown
  code fences and recovers JSON embedded in prose, instead of relying on fragile
  string replacement.
- **The data layer is isolated** (`core/Repository.mjs`) — all queries are
  parameterised and every connection is closed in a `finally`.

## Tech stack

Expo · expo-router · React Native · react-native-paper (UI) · expo-sqlite (storage)
· @react-native-async-storage/async-storage (key/value) · @google/generative-ai
(Gemini) · react-native-markdown-display · Jest + jest-expo (tests).
