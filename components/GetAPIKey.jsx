import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Image, Linking } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { validateApiKey } from "../core/gemini.mjs";
import { STORAGE_KEYS } from "../core/config.mjs";

export default function GetAPIKey({ reload }) {
	const [text, setText] = useState("");
	const [checking, setChecking] = useState(false);

	const redirect = () => {
		Linking.openURL("https://aistudio.google.com/app/apikey");
	};

	const submit = async () => {
		setChecking(true);
		try {
			if (await validateApiKey(text)) {
				await AsyncStorage.setItem(STORAGE_KEYS.apiKey, text);
				reload();
			} else {
				alert("Invalid API Key!");
			}
		} finally {
			setChecking(false);
		}
	};

	return (
		<View
			style={{
				height: "100%",
				display: "flex",
				padding: 20,
			}}
		>
			<View style={{ margin: 80, marginBottom: 100, alignSelf: "center" }}>
				<Image
					source={require("../assets/images/icon.png")}
					style={{
						width: 100,
						height: 100,
						alignSelf: "center",
					}}
				/>
				<Text variant="displaySmall">Guru - G</Text>
			</View>
			<Text>You need a Gemini API key to use this app</Text>
			<Text style={{ marginBottom: 10 }}>
				Your API key will be stored securely on your device
			</Text>
			<TextInput
				label="Enter your Gemini API Key"
				value={text}
				onChangeText={(text) => setText(text)}
			/>
			<Button
				mode="contained"
				style={{ margin: 10 }}
				onPress={submit}
				loading={checking}
			>
				Submit
			</Button>

			<Button style={{ marginTop: 50 }} onPress={redirect}>
				Don't have an API Key? Generate a FREE key here
			</Button>
		</View>
	);
}
