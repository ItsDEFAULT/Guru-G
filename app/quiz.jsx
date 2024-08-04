import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { SkillContext } from "../components/SkillContext";
import { Pressable, ScrollView, View } from "react-native";
import { Button, Divider, Text, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Quiz() {
	const { openSkill } = useContext(SkillContext);
	const [data, setData] = useState(null);
	const [attempted, setAttempted] = useState(new Set());

	const prepareData = () => {
		setData(openSkill.quiz);
		(async () => {
			const temp = new Set(
				JSON.parse(await AsyncStorage.getItem("quizAttempts"))
			);
			setAttempted(temp);
		})();
	};

	useEffect(prepareData, []);

	return !data ? (
		<Text>Loading...</Text>
	) : (
		<ScrollView>
			{data.map((question, idx) => (
				<>
					<View style={{ padding: 10 }}>
						<Text variant="bodyLarge">
							{idx + 1 + ". " + question.question}
						</Text>
						{question.options.map((ans) => (
							<Pressable
								style={{
									borderWidth: 1,
									borderRadius: 3,
									padding: 10,
									margin: 5,
									backgroundColor: attempted.has(question.question + ans)
										? question.solution == ans
											? "#90EE90"
											: "#ff0033"
										: "#ccc",
								}}
								onPress={() => {
									const temp = new Set(attempted);
									if (attempted.has(question.question + ans)) {
										temp.delete(question.question + ans);
									} else {
										temp.add(question.question + ans);
									}
									setAttempted(temp);
									AsyncStorage.setItem(
										"quizAttempts",
										JSON.stringify([...temp])
									);
								}}
							>
								<Text variant="bodyMedium">{ans}</Text>
							</Pressable>
						))}
					</View>
					<Divider />
				</>
			))}
		</ScrollView>
	);
}
