import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Image, Linking } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function GetAPIKey({ reload }) {
	const [text, setText] = useState("");
	const [checking, setChecking] = useState(false);

	const redirect = () => {
		Linking.openURL("https://aistudio.google.com/app/apikey");
	};

	const submit = async () => {
		setChecking(true);
		const genAI = new GoogleGenerativeAI(text);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		let success = true;
		try {
			await model.generateContent("Hi");
		} catch (e) {
			success = false;
			alert("Invalid API Key!");
		} finally {
			if (success) {
				await AsyncStorage.setItem("API_KEY", text);
				reload();
			}
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
