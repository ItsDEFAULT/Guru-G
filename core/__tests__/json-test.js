import { stripCodeFences, parseModelJson } from "../json.mjs";

describe("stripCodeFences", () => {
	it("removes ```json fences", () => {
		expect(stripCodeFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
	});

	it("removes plain ``` fences", () => {
		expect(stripCodeFences("```\n[1,2]\n```")).toBe("[1,2]");
	});

	it("is case-insensitive about the fence label", () => {
		expect(stripCodeFences('```JSON\n{"a":1}\n```')).toBe('{"a":1}');
	});

	it("leaves unfenced text untouched (trimmed)", () => {
		expect(stripCodeFences('  {"a":1}  ')).toBe('{"a":1}');
	});
});

describe("parseModelJson", () => {
	it("parses fenced JSON objects", () => {
		expect(parseModelJson('```json\n{"topics":["a","b"]}\n```')).toEqual({
			topics: ["a", "b"],
		});
	});

	it("parses fenced JSON arrays", () => {
		expect(parseModelJson("```\n[{\"q\":1}]\n```")).toEqual([{ q: 1 }]);
	});

	it("parses bare JSON without fences", () => {
		expect(parseModelJson('{"a":1}')).toEqual({ a: 1 });
	});

	it("recovers JSON wrapped in prose", () => {
		const text = 'Sure! Here you go:\n{"topics":["x"]}\nHope that helps.';
		expect(parseModelJson(text)).toEqual({ topics: ["x"] });
	});

	it("throws a descriptive error on unparseable input", () => {
		expect(() => parseModelJson("not json at all")).toThrow(
			/did not return valid JSON/
		);
	});
});
