import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { SkillContext } from "../components/SkillContext";
import { Pressable, ScrollView, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../core/config.mjs";

export default function Quiz() {
	const { openSkill } = useContext(SkillContext);
	const [data, setData] = useState(null);
	const [attempted, setAttempted] = useState(new Set());

	// Attempts are namespaced per skill so two skills can't clobber each other's
	// answers, and so they can be cleaned up when a skill is deleted.
	const attemptsKey = `${STORAGE_KEYS.quizAttempts}:${openSkill.id}`;

	const prepareData = () => {
		setData(openSkill.quiz);
		(async () => {
			const stored = await AsyncStorage.getItem(attemptsKey);
			setAttempted(new Set(stored ? JSON.parse(stored) : []));
		})();
	};

	useEffect(prepareData, []);

	const toggleAnswer = (question, answer) => {
		const optionKey = question.question + answer;
		const next = new Set(attempted);
		if (next.has(optionKey)) {
			next.delete(optionKey);
		} else {
			next.add(optionKey);
		}
		setAttempted(next);
		AsyncStorage.setItem(attemptsKey, JSON.stringify([...next]));
	};

	const optionColor = (question, answer) => {
		if (!attempted.has(question.question + answer)) return "#ccc";
		return question.solution == answer ? "#90EE90" : "#ff0033";
	};

	return !data ? (
		<Text>Loading...</Text>
	) : (
		<ScrollView>
			{data.map((question, idx) => (
				<View key={idx}>
					<View style={{ padding: 10 }}>
						<Text variant="bodyLarge">
							{idx + 1 + ". " + question.question}
						</Text>
						{question.options.map((answer, ansIdx) => (
							<Pressable
								key={ansIdx}
								style={{
									borderWidth: 1,
									borderRadius: 3,
									padding: 10,
									margin: 5,
									backgroundColor: optionColor(question, answer),
								}}
								onPress={() => toggleAnswer(question, answer)}
							>
								<Text variant="bodyMedium">{answer}</Text>
							</Pressable>
						))}
					</View>
					<Divider />
				</View>
			))}
		</ScrollView>
	);
}
