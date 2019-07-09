import React from "react";
import diceLib from "./diceLib";
import _ from "lodash";
import styled from "styled-components";

const Input = styled.input`
	width: 18rem;
	height: auto;
	border-radius: 6px;
	padding: 0.5rem;
	font-family: Nunito;
	color: #282c34;
	margin: 1rem 0;
	transition: box-shadow 300ms ease-in-out;

	&:focus {
		outline: 0;
		box-shadow: 0 0 6px 2px #2684ff;
	}

	&:hover {
		box-shadow: 0 0 8px 1px #2684ff;
	}
`;

const DiceInput = props => {
	const handleChange = e => {
		const newValue = e.target.value;
		const inputName = e.target.name;
		props.inputCallback({ [inputName]: newValue });
	};

	const handleBlur = e => {
		const replacerRegex = /(\d+d\d+)|(\+\d+d\d+)/g;
		const newValue = e.target.value;
		const inputName = e.target.name;

		const matchedInput =
			newValue && replacerRegex.test(newValue)
				? newValue.match(replacerRegex)
				: [];
		const diceObj = newValue ? diceLib.createDiceObject(matchedInput) : {};
		const totalDice = _.isEmpty(diceObj)
			? 0
			: Object.values(diceObj).reduce((acc, cur) => acc + cur, 0);
		const sortedInput = newValue
			? diceLib.sortDiceInput(matchedInput).join("+")
			: "";

		props.setTotalDice(totalDice);
		props.setDiceCounts(diceObj);
		props.inputCallback({ [inputName]: sortedInput });
	};

	return (
		<Input
			type="text"
			name={props.name}
			value={props.value}
			onChange={handleChange}
			onBlur={handleBlur}
			placeholder={props.placeholder}
		/>
	);
};

export default DiceInput;
