import {
	lessonsPrompt,
	lessonContentPrompt,
	quizPrompt,
} from "../prompts.mjs";
import { MAX_TOPICS, MAX_QUIZ_QUESTIONS } from "../config.mjs";

describe("lessonsPrompt", () => {
	it("includes the topic, the level and the topic cap", () => {
		const p = lessonsPrompt("Algebra", "beginner");
		expect(p).toContain("Algebra");
		expect(p).toContain("beginner");
		expect(p).toContain(String(MAX_TOPICS));
	});
});

describe("lessonContentPrompt", () => {
	it("includes the lesson topic, master topic and level", () => {
		const p = lessonContentPrompt("Vectors", "Linear Algebra", "advanced");
		expect(p).toContain("Vectors");
		expect(p).toContain("Linear Algebra");
		expect(p).toContain("advanced");
	});
});

describe("quizPrompt", () => {
	it("lists every topic and the question cap", () => {
		const p = quizPrompt(["A", "B"], "intermediate");
		expect(p).toContain('"A"');
		expect(p).toContain('"B"');
		expect(p).toContain("intermediate");
		expect(p).toContain(String(MAX_QUIZ_QUESTIONS));
	});
});
