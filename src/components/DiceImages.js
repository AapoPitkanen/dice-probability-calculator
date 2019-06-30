import React from "react";
import d4 from "../img/d4-small.png";
import d6 from "../img/d6-small.png";
import d8 from "../img/d8-small.png";
import d10 from "../img/d10-small.png";
import d12 from "../img/d12-small.png";
import d20 from "../img/d20-small.png";
import diceLib from "./diceLib";
import styled from "styled-components";

const DiceImage = styled.img`
	height: 75px;
	width: auto;
	border-radius: 50%;
	cursor: pointer;
	opacity: 1;
	filter: invert(0%);
	box-shadow: 2px 2px 20px 2px rgba(0, 0, 0, 0.3);
	transition: filter 0.5s ease-in-out;

	&:hover {
		filter: invert(90%) brightness(110%);
	}
`;

const DiceImageWrapper = styled.div`
	display: grid;
	grid-template: 75px / 75px 75px 75px;
	justify-content: center;
	margin: 1rem 0;
	grid-gap: 0.5rem;
`;

const DiceImages = props => {
	const handleClickDiceImage = e => {
		if (e.target.dataset.diceType) {
			const diceType = e.target.dataset.diceType;
			const diceObj = { ...props.diceCounts };
			diceObj[diceType] =
				diceObj[diceType] === undefined ? 1 : diceObj[diceType] + 1;
			const diceArr = diceLib.diceObjToArray(diceObj).join("+");
			props.inputCallback({ diceInput: diceArr });
			props.setDiceCounts(diceObj);
			props.setTotalDice(props.totalDice + 1);
		}
	};

	return (
		<DiceImageWrapper onClick={handleClickDiceImage}>
			<DiceImage src={d4} alt="d4 dice" data-dice-type="d4" />
			<DiceImage src={d6} alt="d6 dice" data-dice-type="d6" />
			<DiceImage src={d8} alt="d8 dice" data-dice-type="d8" />
			<DiceImage src={d10} alt="d10 dice" data-dice-type="d10" />
			<DiceImage src={d12} alt="d12 dice" data-dice-type="d12" />
			<DiceImage src={d20} alt="d20 dice" data-dice-type="d20" />
		</DiceImageWrapper>
	);
};

export default DiceImages;
