// Generates a full learning pack (lessons + quiz) for a topic and persists it.
//
// Flow:
//   1. Ask Gemini for a roadmap of lesson topics.
//   2. Generate the content for every lesson in parallel.
//   3. Generate one quiz spanning all topics.
//   4. Store the result as a new skill.
//
// `setProgress` is called throughout with a 0-100 value so the UI can show a
// progress bar.

import { createModel } from "./gemini.mjs";
import { parseModelJson } from "./json.mjs";
import { lessonsPrompt, lessonContentPrompt, quizPrompt } from "./prompts.mjs";
import * as repo from "./Repository.mjs";

// Progress budget (must sum to 100). Splitting the bar into named segments keeps
// the magic numbers out of the control flow.
const PROGRESS = {
	roadmap: 10, // after the topic roadmap comes back
	lessons: 75, // distributed across all lesson generations
	quiz: 15, // generating the quiz
};

/**
 * @param {string} masterTopic - what the user wants to learn
 * @param {string} apiKey - Gemini API key
 * @param {(value: number) => void} setProgress - 0-100 progress reporter
 * @param {string} level - "beginner" | "intermediate" | "advanced"
 */
export default async function generateContent(
	masterTopic,
	apiKey,
	setProgress,
	level
) {
	const model = createModel(apiKey);

	// 1. Roadmap of lesson topics.
	const roadmap = await model.generateContent(
		lessonsPrompt(masterTopic, level)
	);
	const topics = parseModelJson(roadmap.response.text()).topics;
	if (!Array.isArray(topics) || topics.length === 0) {
		throw new Error("Model returned no lesson topics.");
	}
	setProgress(PROGRESS.roadmap);

	// 2. Lesson content, generated in parallel. Promise.all preserves the input
	//    order, so `lessons` comes back in roadmap order with no fragile sorting.
	const perLesson = PROGRESS.lessons / topics.length;
	const lessons = await Promise.all(
		topics.map(async (topic) => {
			const result = await model.generateContent(
				lessonContentPrompt(topic, masterTopic, level)
			);
			setProgress((p) => p + perLesson);
			return { topic, content: result.response.text() };
		})
	);

	// 3. Quiz spanning every topic.
	const quizResult = await model.generateContent(quizPrompt(topics, level));
	const quiz = parseModelJson(quizResult.response.text());

	// 4. Persist.
	await repo.addNewSkill(
		masterTopic,
		JSON.stringify(lessons),
		JSON.stringify(quiz)
	);
	setProgress(100);
}
