import React from "react";
import diceLib from "./diceLib";
import _ from "lodash";

const DiceInput = props => {
	const handleChange = e => {
		let newValue = e.target.value;
		let inputName = e.target.name;
		props.inputCallback({ [inputName]: newValue });
	};

	const handleBlur = e => {
		const regex1 = /[^d^+^\d]/gi;
		const regex2 = /(\+){2,}/g;
		const regex3 = /(\+)$/g;
		const regex4 = /(d){2,}/;
		const regexArr = [regex1, regex2, regex3, regex4];
		const replaceValues = ["", "+", "", "d"];
		let newValue = e.target.value;
		const inputName = e.target.name;
		let totalDice;
		let diceObj;

		regexArr.forEach((x, i) => {
			newValue = newValue.replace(x, replaceValues[i]);
		});

		if (newValue !== "") {
			newValue = newValue.split("+");
			diceObj = diceLib.createDiceObject(newValue);

			_.isEmpty(diceObj)
				? (totalDice = 0)
				: (totalDice = Object.values(diceObj).reduce(
						(acc, curr) => acc + curr
				  ));

			if (newValue[0] !== "") {
				newValue = diceLib.sortDiceInput(newValue);
			}

			newValue = newValue.join("+");
		}

		props.setTotalDice(totalDice);
		props.setDiceCounts(diceObj);
		props.inputCallback({ [inputName]: newValue });
	};

	return (
		<input
			type="text"
			className={props.className}
			name={props.name}
			value={props.value}
			onChange={handleChange}
			onBlur={handleBlur}
			placeholder={props.placeholder}
		/>
	);
};

export default DiceInput;
