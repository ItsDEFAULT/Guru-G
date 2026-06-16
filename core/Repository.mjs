// Data-access layer for the on-device SQLite database.
//
// Every query is parameterised — values are never interpolated into SQL
// strings — and every connection is closed in a `finally` so a failed query
// can't leak a handle.
//
// TODO (scaling): all skills live in one table that is read fully into memory.
// Fine for a personal learning app; if a user generates a great deal of
// content we should paginate `getAllSkills` and lazy-load lesson/quiz bodies.

import * as SQLite from "expo-sqlite";
import { DB_NAME } from "./config.mjs";

/**
 * Open the database, run `fn` with it, and guarantee the handle is closed.
 * @template T
 * @param {(db: import("expo-sqlite").SQLiteDatabase) => Promise<T>} fn
 * @param {object} [options] - forwarded to openDatabaseAsync
 * @returns {Promise<T>}
 */
async function withDb(fn, options) {
	const db = await SQLite.openDatabaseAsync(DB_NAME, options);
	try {
		return await fn(db);
	} finally {
		await db.closeAsync();
	}
}

export async function createTable() {
	await withDb((db) =>
		db.execAsync(`
			CREATE TABLE IF NOT EXISTS skills (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				skill TEXT,
				content TEXT,
				quiz TEXT,
				highScore FLOAT DEFAULT 0
			);
		`)
	);
	console.log("Ensured the skills table exists.");
}

export async function deleteTable() {
	await withDb((db) => db.execAsync(`DROP TABLE IF EXISTS skills;`));
	console.log("Dropped the skills table.");
}

export async function getAllSkills() {
	const rows = await withDb(
		(db) =>
			db.getAllAsync(
				`SELECT id, skill, content, quiz, highScore FROM skills;`
			),
		{ useNewConnection: true }
	);
	console.log(`Fetched ${rows.length} skill(s).`);
	return rows;
}

export async function addNewSkill(skill, content, quiz) {
	return withDb((db) =>
		db.runAsync(
			`INSERT INTO skills (skill, content, quiz) VALUES (?, ?, ?);`,
			[skill, content, quiz]
		)
	);
}

export async function updateBestScore(id, highScore) {
	await withDb((db) =>
		db.runAsync(`UPDATE skills SET highScore = ? WHERE id = ?;`, [
			highScore,
			id,
		])
	);
	console.log(`Updated high score for skill ${id}.`);
}

export async function deleteSkill(id) {
	await withDb((db) =>
		db.runAsync(`DELETE FROM skills WHERE id = ?;`, [id])
	);
	console.log(`Deleted skill ${id}.`);
}
