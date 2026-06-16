// Helpers for coaxing JSON out of a chat model's response.
//
// LLMs habitually wrap JSON in ```json ... ``` fences and occasionally add a
// stray sentence before or after. The previous implementation did a brittle
// `.replace("```json", "").replace("```", "")`, which broke the moment the
// fence label differed or extra prose was present. This is the robust version.

/**
 * Strip Markdown code fences from a model response, returning the inner text.
 * Handles ```json, ```JSON, plain ``` and missing fences alike.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripCodeFences(text) {
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	return (fenced ? fenced[1] : text).trim();
}

/**
 * Parse a JSON value out of a model response, tolerating code fences and
 * leading/trailing prose. Throws a descriptive error (including a snippet of
 * the offending text) when nothing parseable is found.
 *
 * @template T
 * @param {string} text - raw text returned by the model
 * @returns {T}
 */
export function parseModelJson(text) {
	const cleaned = stripCodeFences(text);

	// First try the cleaned string as-is.
	try {
		return JSON.parse(cleaned);
	} catch {
		// Fall back to extracting the outermost JSON object/array, in case the
		// model wrapped it in extra prose that survived fence stripping.
		const match = cleaned.match(/[[{][\s\S]*[\]}]/);
		if (match) {
			try {
				return JSON.parse(match[0]);
			} catch {
				/* fall through to the thrown error below */
			}
		}
	}

	const snippet = cleaned.slice(0, 200);
	throw new Error(`Model did not return valid JSON. Got: ${snippet}`);
}
