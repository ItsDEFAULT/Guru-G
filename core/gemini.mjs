// Thin wrapper around the Google Generative AI SDK.
//
// Both content generation and the initial API-key check used to instantiate the
// client and hard-code the model name independently. Centralising it here means
// there is a single source of truth for "how we talk to Gemini".

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "./config.mjs";

/**
 * Build a Gemini model client for the given API key.
 * @param {string} apiKey
 */
export function createModel(apiKey) {
	const genAI = new GoogleGenerativeAI(apiKey);
	return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

/**
 * Verify an API key by issuing a trivial request.
 * @param {string} apiKey
 * @returns {Promise<boolean>} true when the key works, false otherwise.
 */
export async function validateApiKey(apiKey) {
	if (!apiKey || !apiKey.trim()) return false;
	try {
		await createModel(apiKey).generateContent("Hi");
		return true;
	} catch {
		return false;
	}
}
