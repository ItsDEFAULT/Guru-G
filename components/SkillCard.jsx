import { router } from "expo-router";
import * as React from "react";
import { Card, IconButton, Menu } from "react-native-paper";
import { SkillContext } from "./SkillContext";

const SkillCard = ({ skill, handleDelete, isLastEle }) => {
	const [visible, setVisible] = React.useState(false);

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);
	const { setOpenSkill } = React.useContext(SkillContext);

	const handleOpenSkillPage = () => {
		setOpenSkill(skill);
		router.push("/skill");
	};

	const handleOpenQuizPage = () => {
		setOpenSkill(skill);
		closeMenu();
		router.push("/quiz");
	};

	return (
		<Card
			elevation={1}
			onPress={handleOpenSkillPage}
			style={{ margin: 5, marginBottom: isLastEle ? 150 : 5 }}
		>
			<Card.Title
				title={skill.skill}
				right={(props) => (
					<Menu
						visible={visible}
						onDismiss={closeMenu}
						anchor={
							<IconButton {...props} icon="dots-vertical" onPress={openMenu} />
						}
					>
						<Menu.Item onPress={handleOpenQuizPage} title="Quiz" />
						<Menu.Item
							onPress={() => {
								handleDelete(skill.id);
								closeMenu();
							}}
							title="Delete"
						/>
					</Menu>
				)}
				titleVariant="titleMedium"
			/>
		</Card>
	);
};

export default SkillCard;
