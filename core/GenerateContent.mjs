// This file is responsible for the generation of learning material for the user - based on the topic they provide

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as repo from "./Repository.mjs";
import { extractJson } from "./extractJson.mjs";

export default async function generateContent(
	masterTopic,
	apiKey,
	setGenProgress,
	level
) {
	if (!apiKey) throw new Error("Missing Gemini API key");
	if (!masterTopic || !masterTopic.trim()) {
		throw new Error("A topic is required to generate content");
	}

	const genAI = new GoogleGenerativeAI(apiKey);
	const promptToGenerateLessons = `
        Give me a roadmap to learn about this topic: ${masterTopic}.
        Divide it into lessons.
		The lessons should be ${level} level
        Response should follow this template:
        {
        topics: ["lesson 1", "lesson 2"...]
        }
        ONLY RETURN A VALID JSON OBJECT. GENERATE ATMOST 10 TOPICS
    `;

	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

	const result = await model.generateContent(promptToGenerateLessons);
	const response = await result.response;
	setGenProgress(10);

	const parsed = extractJson(response.text());
	const topics = Array.isArray(parsed?.topics) ? parsed.topics : null;
	if (!topics || topics.length === 0) {
		throw new Error("The model did not return any lesson topics");
	}

	console.log(topics);

	// Generate every lesson concurrently. We use allSettled (not Promise.all) so
	// a single failed lesson no longer aborts the entire generation. The results
	// array preserves the order of `topics`, so the lessons are already sorted by
	// the roadmap order -- no fragile parse-the-number-out-of-the-title sort.
	const lessonResults = await Promise.allSettled(
		topics.map(async (topic) => {
			const promptToGenerateLessonContent = `
			Explain everything there is know about this topic: "${topic}" in this context: "${masterTopic}". The content should be ${level} level. Be verbose. Return textbook like data.
		`;
			const lessonContent = await model.generateContent(
				promptToGenerateLessonContent
			);
			setGenProgress((p) => Math.min(p + 5, 90));
			return { topic, content: lessonContent.response.text() };
		})
	);

	const lessons = lessonResults
		.filter((r) => r.status === "fulfilled")
		.map((r) => r.value);

	if (lessons.length === 0) {
		throw new Error("Failed to generate any lesson content");
	}

	const quizTopics = topics.map((topic) => `"${topic}", `);
	console.log(quizTopics);
	const promptToGenerateQuiz = `
			Generate a quiz on these topics: [${quizTopics}]. The questions should be ${level} level.
			Return the data in this format:
			 [
				{
					question: "",
					options: [""],
					solution: "",
				}
			]
			ONLY RETURN A VALID JSON OBJECT. THE FIELD "SOLUTION" MUST MATCH ONE OF THE "OPTIONS". YOU CAN RETURN ATMOST 50 QUESTIONS.
		`;
	const quiz = await model.generateContent(promptToGenerateQuiz);
	const quizParsed = extractJson(quiz.response.text());
	const quizzes = Array.isArray(quizParsed) ? quizParsed : [];
	setGenProgress(95);

	await repo.addNewSkill(
		masterTopic,
		JSON.stringify(lessons),
		JSON.stringify(quizzes)
	);
	setGenProgress(100);
}
