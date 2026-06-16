// All prompts the app sends to Gemini live here, as pure functions.
//
// Pulling them out of the generation flow keeps `GenerateContent.mjs` readable,
// makes the prompts independently testable, and means prompt-tuning is a
// localised change that never touches control flow.

import { MAX_TOPICS, MAX_QUIZ_QUESTIONS } from "./config.mjs";

/**
 * Ask for a learning roadmap: a list of lesson topics for a master topic.
 * @param {string} masterTopic
 * @param {string} level - "beginner" | "intermediate" | "advanced"
 */
export function lessonsPrompt(masterTopic, level) {
	return `
		Give me a roadmap to learn about this topic: ${masterTopic}.
		Divide it into lessons.
		The lessons should be ${level} level.
		Order the lessons from foundational to advanced.
		Response should follow this template:
		{ "topics": ["lesson 1", "lesson 2", ...] }
		ONLY RETURN A VALID JSON OBJECT. GENERATE AT MOST ${MAX_TOPICS} TOPICS.
	`.trim();
}

/**
 * Ask for the full, textbook-style content of a single lesson.
 * @param {string} topic - the lesson title
 * @param {string} masterTopic - the overarching skill, for context
 * @param {string} level
 */
export function lessonContentPrompt(topic, masterTopic, level) {
	return `
		Explain everything there is to know about this topic: "${topic}" in this
		context: "${masterTopic}". The content should be ${level} level. Be
		verbose. Return textbook-like data formatted in Markdown.
	`.trim();
}

/**
 * Ask for a multiple-choice quiz that spans every lesson topic.
 * @param {string[]} topics
 * @param {string} level
 */
export function quizPrompt(topics, level) {
	const topicList = topics.map((t) => `"${t}"`).join(", ");
	return `
		Generate a quiz on these topics: [${topicList}]. The questions should be
		${level} level.
		Return the data in this format:
		[ { "question": "", "options": ["", ""], "solution": "" } ]
		ONLY RETURN A VALID JSON ARRAY. THE FIELD "solution" MUST MATCH ONE OF THE
		"options". YOU CAN RETURN AT MOST ${MAX_QUIZ_QUESTIONS} QUESTIONS.
	`.trim();
}
