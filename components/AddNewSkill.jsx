import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, RadioButton } from "react-native-paper";
import generateContent from "../core/GenerateContent.mjs";
import { SkillContext } from "./SkillContext";

const placeholders = [
	"Algebra",
	"Calculus",
	"Statistics",
	"Physics",
	"Chemistry",
	"Biology",
	"Computer Programming",
	"Machine Learning",
	"Data Science",
	"Economics",
	"Accounting",
	"Marketing",
	"Business Management",
	"Project Management",
	"Creative Writing",
	"Literature Analysis",
	"Philosophy",
	"Psychology",
	"Sociology",
	"Political Science",
	"History",
	"Geography",
	"Environmental Science",
	"Astronomy",
	"Art History",
	"Music Theory",
	"Graphic Design",
	"Web Development",
	"Networking",
	"Cybersecurity",
	"Public Speaking",
	"Technical Writing",
	"Critical Thinking",
	"Research Methods",
	"Ethics",
	"Nutrition",
	"Culinary Arts",
	"Fashion Design",
	"Interior Design",
	"Engineering Mechanics",
	"Thermodynamics",
	"Circuit Analysis",
	"Robotics",
	"Artificial Intelligence",
	"Game Development",
	"Photography",
	"Film Studies",
];

const AddNewSkill = ({ closeModal, setGenerating, generating }) => {
	const [skill, setSkill] = useState("");
	const [genProgress, setGenProgress] = useState(0);
	const [level, setLevel] = useState("beginner");
	const [placeholder, setPlaceholder] = useState(null);
	const { apiKey } = useContext(SkillContext);

	const handleSubmit = async () => {
		if (skill.trim() === "" || generating) return;
		setGenerating(true);
		console.log("Skill:", skill);
		let success = true;
		try {
			await generateContent(skill, apiKey, setGenProgress, level);
			alert("Your lessons are ready!");
		} catch (e) {
			success = false;
			console.log(e);
			setGenProgress(0);
			alert("There was an error generating content, please try again.");
		} finally {
			setGenerating(false);
		}
		if (success) closeModal();
	};

	useEffect(() => {
		const id = setInterval(() => {
			setPlaceholder(
				placeholders[Math.floor(Math.random() * placeholders.length)]
			);
		}, 2000);

		return () => clearInterval(id);
	}, []);

	return (
		<View style={{ padding: 10 }}>
			<Text variant="headlineSmall" style={{ color: "#000" }}>
				Learn a new skill
			</Text>
			<TextInput
				label="What would you like to learn?"
				value={skill}
				onChangeText={setSkill}
				style={{ marginTop: 20 }}
				placeholder={placeholder}
			/>
			<RadioButton.Group
				onValueChange={(level) => setLevel(level)}
				value={level}
			>
				<RadioButton.Item
					label="Beginner"
					value="beginner"
					uncheckedColor="#666"
					color="rgba(103, 80, 164, 1)"
					labelStyle={{
						color: "#000",
					}}
				/>
				<RadioButton.Item
					label="Intermediate"
					value="intermediate"
					uncheckedColor="#666"
					color="rgba(103, 80, 164, 1)"
					labelStyle={{
						color: "#000",
					}}
				/>
				<RadioButton.Item
					label="Advanced"
					value="advanced"
					uncheckedColor="#666"
					color="rgba(103, 80, 164, 1)"
					labelStyle={{
						color: "#000",
					}}
				/>
			</RadioButton.Group>
			<Button
				mode="contained"
				loading={generating}
				onPress={handleSubmit}
				style={{ marginTop: 20 }}
			>
				{generating ? `Cooking your lessons...${genProgress}%` : "Submit"}
			</Button>
		</View>
	);
};

export default AddNewSkill;
