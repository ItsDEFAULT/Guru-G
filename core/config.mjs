// Central place for every tunable constant in the app.
//
// Keeping these here (instead of sprinkling string literals across files) means
// swapping the model, renaming the database, or adding a new difficulty level is
// a one-line change that the rest of the codebase picks up automatically.

/** Gemini model used for both content generation and API-key validation. */
export const GEMINI_MODEL = "gemini-1.5-flash";

/** Name of the on-device SQLite database. */
export const DB_NAME = "GURU-G";

/** Keys used with AsyncStorage. Centralised so they can never drift apart. */
export const STORAGE_KEYS = {
	apiKey: "API_KEY",
	// Quiz attempts are namespaced per-skill: `${quizAttempts}:${skillId}`.
	quizAttempts: "quizAttempts",
};

/** Difficulty levels offered when generating a new skill. Drives the UI radios. */
export const LEVELS = [
	{ value: "beginner", label: "Beginner" },
	{ value: "intermediate", label: "Intermediate" },
	{ value: "advanced", label: "Advanced" },
];

export const DEFAULT_LEVEL = LEVELS[0].value;

/** Upper bounds we ask the model to respect. */
export const MAX_TOPICS = 10;
export const MAX_QUIZ_QUESTIONS = 50;
