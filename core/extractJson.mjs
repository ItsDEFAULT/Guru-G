// Robust extraction of a JSON value from an LLM text response.
//
// Models are inconsistent: they wrap JSON in ```json ... ``` fences, add prose
// before/after, or return it bare. The old approach
// (`.replace("```json", "").replace("```", "")`) only handled one of those
// shapes and threw on the rest. This helper tries, in order:
//   1. a fenced ```json block,
//   2. a direct parse of the (trimmed) text,
//   3. the outermost { ... } or [ ... ] span found in the text.
// It throws a descriptive error only when none of those yield valid JSON.

function sliceOutermost(text, open, close) {
	const start = text.indexOf(open);
	const end = text.lastIndexOf(close);
	if (start === -1 || end === -1 || end <= start) return null;
	return text.slice(start, end + 1);
}

export function extractJson(raw) {
	if (typeof raw !== "string") {
		throw new Error("Cannot extract JSON from a non-string response");
	}

	let text = raw.trim();

	// Prefer the contents of a fenced code block when present.
	const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fence) text = fence[1].trim();

	const candidates = [text];
	const obj = sliceOutermost(text, "{", "}");
	if (obj) candidates.push(obj);
	const arr = sliceOutermost(text, "[", "]");
	if (arr) candidates.push(arr);

	for (const candidate of candidates) {
		try {
			return JSON.parse(candidate);
		} catch {
			// try the next candidate
		}
	}

	throw new Error("Response did not contain valid JSON");
}
