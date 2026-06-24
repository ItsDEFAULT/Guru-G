// This file contains functions that interact with the sqlite db

import * as SQLite from "expo-sqlite";

/*
	TODO:
	Currently, all the data is stored in a single table and this table is loaded into memory.
	This will be fine for small amounts of data, but the app is bound to start lagging if the user
	generates a lot of content.

	- Need to split data into multiple tables and paginate the fetch calls.
*/

const DB_NAME = "GURU-G";

// Memoized "the table exists" promise. Every query awaits this first so we no
// longer race the fire-and-forget createTable() that used to run at import time
// (which could surface as a "no such table: skills" error on a cold start).
let tableReady = null;

export function createTable() {
	if (!tableReady) {
		tableReady = (async () => {
			const db = await SQLite.openDatabaseAsync(DB_NAME);
			try {
				await db.execAsync(`
		    CREATE TABLE IF NOT EXISTS skills (
		        id INTEGER PRIMARY KEY AUTOINCREMENT,
		        skill TEXT,
		        content TEXT,
		        quiz TEXT,
		        highScore FLOAT DEFAULT 0
		    );`);
				console.log("CREATED the skills TABLE!");
			} finally {
				await db.closeAsync();
			}
		})().catch((err) => {
			// Reset so a later call can retry instead of caching a failure forever.
			tableReady = null;
			throw err;
		});
	}
	return tableReady;
}

export async function deleteTable() {
	const db = await SQLite.openDatabaseAsync(DB_NAME);
	try {
		await db.execAsync(`DROP TABLE IF EXISTS skills;`);
		console.log("Deleted the skills TABLE!");
	} finally {
		await db.closeAsync();
		tableReady = null;
	}
}

export async function getAllSkills() {
	await createTable();
	const db = await SQLite.openDatabaseAsync(DB_NAME, {
		useNewConnection: true,
	});
	try {
		const res = await db.getAllAsync(
			`SELECT id, skill, content, quiz, highScore FROM skills;`
		);
		console.log("FETCHED all the skills");
		return res;
	} finally {
		await db.closeAsync();
	}
}

export async function addNewSkill(skill, content, quiz) {
	await createTable();
	const db = await SQLite.openDatabaseAsync(DB_NAME);
	const prepStmt = await db.prepareAsync(`
        INSERT INTO skills (skill, content, quiz) VALUES
        ($skill, $content, $quiz);
    `);
	try {
		const res = await prepStmt.executeAsync({
			$skill: skill,
			$content: content,
			$quiz: quiz,
		});
		console.log("NEW SKILL INSERTED IN THE DB");
		return res;
	} finally {
		await prepStmt.finalizeAsync();
		await db.closeAsync();
	}
}

export async function updateBestScore(id, highScore) {
	await createTable();
	const db = await SQLite.openDatabaseAsync(DB_NAME);
	try {
		// Parameterized to avoid SQL injection / breakage on odd values.
		await db.runAsync(`UPDATE skills SET highScore = ? WHERE id = ?;`, [
			highScore,
			id,
		]);
		console.log("UPDATED HIGH SCORE IN DB");
	} finally {
		await db.closeAsync();
	}
}

export async function deleteSkill(id) {
	await createTable();
	const db = await SQLite.openDatabaseAsync(DB_NAME);
	try {
		await db.runAsync(`DELETE FROM skills WHERE id = ?;`, [id]);
		console.log("DELETED A SKILL");
	} finally {
		await db.closeAsync();
	}
}
