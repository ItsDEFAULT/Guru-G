import { useEffect, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { FAB, Modal, PaperProvider, Portal } from "react-native-paper";
import AddNewSkill from "../components/AddNewSkill";
import SkillCard from "../components/SkillCard";
import * as repo from "../core/Repository.mjs";

export default function Index() {
	const [visible, setVisible] = useState(false);
	const [skills, setSkills] = useState([]);
	const [generating, setGenerating] = useState(false);

	const showModal = () => setVisible(true);
	const hideModal = () => {
		if (generating) return;
		setVisible(false);
		loadData();
	};
	const containerStyle = { backgroundColor: "white", padding: 20 };
	const [loading, setLoading] = useState(false);

	const handleDelete = (id) => {
		// TODO: data is never removed from `AsyncStorage.getItem("quizAttempts")` - should be fine for small data, but it will cause issues down the line. - Need to delete data when a skill is deleted.
		repo.deleteSkill(id);
		loadData();
	};

	const loadData = () => {
		setLoading(true);
		repo
			.getAllSkills()
			.then((data) => {
				if (!data) {
					console.log("No SKILLS stored in DB");
					return;
				}
				setSkills(
					data.map((row) => ({
						skill: row.skill,
						id: row.id,
						content: JSON.parse(row.content),
						quiz: JSON.parse(row.quiz),
						highScore: row.highScore,
					}))
				);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		loadData();
	}, []);

	return (
		<PaperProvider>
			{skills.length === 0 && (
				<View
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						marginTop: 100,
					}}
				>
					<Text>Add new skills to start learning!</Text>
				</View>
			)}
			{skills.length !== 0 && (
				<ScrollView
					style={{
						width: "100%",
						padding: 10,
					}}
					refreshControl={
						<RefreshControl refreshing={loading} onRefresh={loadData} />
					}
				>
					{skills.map((skill, index) => (
						<SkillCard
							skill={skill}
							key={index}
							handleDelete={handleDelete}
							isLastEle={index === skills.length - 1}
						/>
					))}
				</ScrollView>
			)}
			<Portal>
				<Modal
					visible={visible}
					onDismiss={hideModal}
					contentContainerStyle={containerStyle}
					style={{ padding: 25 }}
				>
					<AddNewSkill
						closeModal={hideModal}
						generating={generating}
						setGenerating={setGenerating}
					/>
				</Modal>
			</Portal>
			<View
				style={{
					flex: 1,
					alignItems: "center",
				}}
			>
				<FAB
					icon="plus"
					style={styles.fab}
					onPress={showModal}
					size="medium"
					label="New Skill"
				/>
			</View>
		</PaperProvider>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

