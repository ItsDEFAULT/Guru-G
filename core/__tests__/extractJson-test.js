import { extractJson } from "../extractJson.mjs";

describe("extractJson", () => {
	it("parses bare JSON objects", () => {
		expect(extractJson('{"topics": ["a", "b"]}')).toEqual({
			topics: ["a", "b"],
		});
	});

	it("parses bare JSON arrays", () => {
		expect(extractJson('[{"question": "q"}]')).toEqual([{ question: "q" }]);
	});

	it("strips ```json fences", () => {
		const raw = '```json\n{"topics": ["x"]}\n```';
		expect(extractJson(raw)).toEqual({ topics: ["x"] });
	});

	it("strips plain ``` fences", () => {
		const raw = '```\n{"ok": true}\n```';
		expect(extractJson(raw)).toEqual({ ok: true });
	});

	it("recovers JSON wrapped in surrounding prose", () => {
		const raw = 'Sure! Here is your data:\n{"topics": ["only"]}\nHope that helps.';
		expect(extractJson(raw)).toEqual({ topics: ["only"] });
	});

	it("recovers an array wrapped in prose", () => {
		const raw = "Here you go: [1, 2, 3] cheers";
		expect(extractJson(raw)).toEqual([1, 2, 3]);
	});

	it("throws a descriptive error when there is no JSON", () => {
		expect(() => extractJson("no json here")).toThrow(
			"Response did not contain valid JSON"
		);
	});

	it("throws on non-string input", () => {
		expect(() => extractJson(null)).toThrow("non-string response");
	});
});
