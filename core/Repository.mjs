// This file contains functions that interact with the sqlite db

import * as SQLite from "expo-sqlite";

/* 
	TODO: 
	Currently, all the data is stored in a single table and this table is loaded into memory.
	This will be fine for small amounts of data, but the app is bound to start lagging if the user 
	generates a lot of content. 

	- Need to split data into multiple tables and paginate the fetch calls.
*/

export async function createTable() {
	const db = await SQLite.openDatabaseAsync("GURU-G");
	const CREATE_TABLE = `
    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill TEXT,
        content TEXT,
        quiz TEXT,
        highScore FLOAT DEFAULT 0
    );`;

	await db.execAsync(CREATE_TABLE);
	db.closeAsync();
	console.log("CREATED the skills TABLE!");
}

export async function deleteTable() {
	const db = await SQLite.openDatabaseAsync("GURU-G");
	const DELETE_TABLE = `DROP TABLE skills;`;

	await db.execAsync(DELETE_TABLE);
	db.closeAsync();
	console.log("Deleted the skills TABLE!");
}

export async function getAllSkills() {
	const db = await SQLite.openDatabaseAsync("GURU-G", {
		useNewConnection: true,
	});
	const GET_ALL_SKILLS = `
    SELECT id, skill, content, quiz, highScore FROM skills;
    `;
	console.log("FETCHED all the skills");
	const res = await db.getAllAsync(GET_ALL_SKILLS);
	db.closeAsync();
	return res;
}

export async function addNewSkill(skill, content, quiz) {
	const db = await SQLite.openDatabaseAsync("GURU-G");

	// SQL injection who?
	const prepStmt = await db.prepareAsync(`
        INSERT INTO skills (skill, content, quiz) VALUES 
        ($skill, $content, $quiz);
    `);

	const res = await prepStmt.executeAsync({
		$skill: skill,
		$content: content,
		$quiz: quiz,
	});

	await prepStmt.finalizeAsync();
	console.log("NEW SKILL INSERTED IN THE DB");
	return res;
}

export async function updateBestScore(id, highScore) {
	const db = await SQLite.openDatabaseAsync("GURU-G");
	const UPDATE_HIGH_SCORE = `
    UPDATE skills SET highScore = ${highScore} WHERE id = ${id}
    `;
	await db.runAsync(UPDATE_HIGH_SCORE);
	db.closeAsync();
	console.log("UPDATED HIGH SCORE IN DB");
}

export async function deleteSkill(id) {
	const db = await SQLite.openDatabaseAsync("GURU-G");
	const DELETE_SKILL = `
    DELETE FROM skills WHERE id = ${id}
    `;
	await db.runAsync(DELETE_SKILL);
	db.closeAsync();
	console.log("DELETED A SKILL");
}
