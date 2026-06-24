import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { SkillContext } from "../components/SkillContext";
import { Pressable, ScrollView, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Quiz() {
	const { openSkill } = useContext(SkillContext);
	const [data, setData] = useState(null);
	const [attempted, setAttempted] = useState(new Set());

	// Attempts are scoped per-skill. Previously every quiz shared one global
	// "quizAttempts" key, so answers from one skill bled into every other quiz.
	const storageKey = openSkill ? `quizAttempts:${openSkill.id}` : null;

	useEffect(() => {
		if (!openSkill) return;
		setData(openSkill.quiz);
		(async () => {
			try {
				const raw = await AsyncStorage.getItem(storageKey);
				setAttempted(new Set(raw ? JSON.parse(raw) : []));
			} catch (e) {
				console.warn("Failed to load quiz attempts", e);
				setAttempted(new Set());
			}
		})();
	}, [openSkill]);

	if (!openSkill) return <Text>Select a skill first.</Text>;

	return !data ? (
		<Text>Loading...</Text>
	) : (
		<ScrollView>
			{data.map((question, idx) => (
				<React.Fragment key={idx}>
					<View style={{ padding: 10 }}>
						<Text variant="bodyLarge">
							{idx + 1 + ". " + question.question}
						</Text>
						{question.options.map((ans, ansIdx) => {
							const attemptKey = `${idx}:${ans}`;
							return (
								<Pressable
									key={ansIdx}
									style={{
										borderWidth: 1,
										borderRadius: 3,
										padding: 10,
										margin: 5,
										backgroundColor: attempted.has(attemptKey)
											? question.solution == ans
												? "#90EE90"
												: "#ff0033"
											: "#ccc",
									}}
									onPress={() => {
										const temp = new Set(attempted);
										if (temp.has(attemptKey)) {
											temp.delete(attemptKey);
										} else {
											temp.add(attemptKey);
										}
										setAttempted(temp);
										AsyncStorage.setItem(
											storageKey,
											JSON.stringify([...temp])
										);
									}}
								>
									<Text variant="bodyMedium">{ans}</Text>
								</Pressable>
							);
						})}
					</View>
					<Divider />
				</React.Fragment>
			))}
		</ScrollView>
	);
}
