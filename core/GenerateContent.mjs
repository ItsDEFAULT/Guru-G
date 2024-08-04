// This file is responsible for the generation of learning material for the user - based on the topic they provide

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as repo from "./Repository.mjs";

export default async function generateContent(
	masterTopic,
	apiKey,
	setGenProgress,
	level
) {
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

	// Hack-y way to do it.. Might not always work.. but.. WE BALL XD
	const text = response.text().replace("```json", "").replace("```", "");

	const topics = JSON.parse(text).topics;
	const lessons = [];
	const quizzes = [];

	console.log(topics);

	// Generates the content for all the lessons
	await Promise.all(
		topics.map(async (topic) => {
			const promptToGenerateLessonContent = `
			Explain everything there is know about this topic: "${topic}" in this context: "${masterTopic}". The content should be ${level} level. Be verbose. Return textbook like data.
		`;
			const lessonContent = await model.generateContent(
				promptToGenerateLessonContent
			);
			lessons.push({
				topic,
				content: lessonContent.response.text(),
			});
			setGenProgress((p) => p + 5);
		})
	);

	lessons.sort((a, b) => {
		const numA = parseInt(a.topic.match(/\d+/)[0], 10);
		const numB = parseInt(b.topic.match(/\d+/)[0], 10);

		return numA - numB;
	});

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
	const quizObj = quiz.response
		.text()
		.replace("```json", "")
		.replace("```", "");
	quizzes.push(...JSON.parse(quizObj));
	setGenProgress(95);

	// const finalRes = {
	// 	skill: masterTopic,
	// 	lessons,
	// 	quiz: quizzes,
	// };

	// console.log(finalRes);

	await repo.addNewSkill(
		masterTopic,
		JSON.stringify(lessons),
		JSON.stringify(quizzes)
	);
	setGenProgress(100);
}
