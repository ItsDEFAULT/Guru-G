import React, { useContext, useState } from "react";
import { ScrollView, View } from "react-native";
import { List } from "react-native-paper";
import { SkillContext } from "@/components/SkillContext";
import Markdown from "react-native-markdown-display";

export default function Skill() {
	const { openSkill } = useContext(SkillContext);
	const [selectedLesson, setSelectedLesson] = useState(null);
	const [expanded, setExpanded] = React.useState(true);

	const handlePress = () => setExpanded(!expanded);

	return (
		<View>
			<List.Section>
				<List.Accordion
					title={selectedLesson ? selectedLesson.topic : "Select a Lesson"}
					left={(props) => <List.Icon {...props} icon="folder" />}
					expanded={expanded}
					onPress={handlePress}
				>
					{openSkill.content.map((lesson) => (
						<List.Item
							key={lesson.topic}
							title={lesson.topic}
							onPress={() => {
								setSelectedLesson(lesson);
								handlePress();
							}}
						/>
					))}
				</List.Accordion>
			</List.Section>
			{selectedLesson && (
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					style={{ height: "88%", padding: 10 }}
				>
					<Markdown>{selectedLesson.content}</Markdown>
				</ScrollView>
			)}
		</View>
	);
}
