import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as repo from "../core/Repository.mjs";
import { SkillContext } from "../components/SkillContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetApiKey from "../components/GetAPIKey";
import { Alert, Button, Image } from "react-native";

repo.createTable();
export default function RootLayout() {
	const [openSkill, setOpenSkill] = useState(null);
	const [apiKey, setApiKey] = useState(null);
	const [refresh, setRefresh] = useState(false);

	useEffect(() => {
		async function GetAPIKey() {
			setApiKey(await AsyncStorage.getItem("API_KEY"));
		}
		GetAPIKey();
	}, [refresh]);

	const reload = () => {
		setRefresh((p) => !p);
	};

	const resetKey = () => {
		Alert.alert(
			"Reset API Key",
			"Are you sure you want to reset your API KEY?",
			[
				{
					text: "Yes",
					onPress: () => {
						AsyncStorage.clear(reload);
					},
					style: "default",
				},
				{
					text: "No",
					style: "cancel",
				},
			]
		);
	};

	return !apiKey ? (
		<GetApiKey reload={reload} />
	) : (
		<SkillContext.Provider value={{ openSkill, setOpenSkill, apiKey }}>
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						headerTitle: "Guru-G",
						headerRight: () => (
							<Button title="Reset API KEY" onPress={resetKey} />
						),
						headerLeft: () => (
							<Image
								source={require("../assets/images/icon.png")}
								style={{
									width: 40,
									height: 40,
									alignSelf: "center",
									marginRight: 10,
									borderRadius: 5,
								}}
							/>
						),
					}}
				/>
				<Stack.Screen
					name="skill"
					options={{
						headerTitle: openSkill ? openSkill.skill : "Select a Skill",
					}}
				/>
				<Stack.Screen
					name="quiz"
					options={{
						headerTitle: openSkill
							? "Quiz - " + openSkill.skill
							: "Select a Skill",
					}}
				/>
			</Stack>
		</SkillContext.Provider>
	);
}

