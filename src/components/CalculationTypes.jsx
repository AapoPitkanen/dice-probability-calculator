import React from "react";
import Select from "react-select";
import styled from "styled-components";

const SelectWrapper = styled.div`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
`;

const CalculationTypeWrapper = styled.div`
	display: flex;
	flex-flow: column wrap;
	justify-content: space-between;
	align-items: center;
	height: 35rem;
	text-align: justify;
	padding: 2rem 2rem 0 2rem;

	@media (min-width: 320px) and (max-width: 480px) {
		height: 45rem;
	}
`;

const Header = styled.h2`
	font-weight: normal;
`;
const CalculationTypes = props => {
	const [setProbability, setProbabilityText] = props.setStates;

	const handleSelectChange = (newValue, actionMeta) => {
		const selectName = actionMeta.name;
		props.inputCallback({ [selectName]: newValue });
		props.callback(setProbability, "");
		props.callback(setProbabilityText, "");
	};

	const calculationTypeOptions = [
		{ value: "diceSums", label: "Dice sums" },
		{ value: "diceFaces", label: "Dice face values" }
	];

	return (
		<CalculationTypeWrapper>
			<Header>Dice probability calculator</Header>
			<p>
				With this application you can calculate the probability of getting
				specific sums with different kinds of dice, such as d4, d6, d8, d10 etc.
				Non-standard dice (such as d5 and d7) are also supported.
			</p>
			<p>
				You can also calculate probabilites of rolling specific number of dice
				with certain face values, such as the probability of rolling at least
				two 6s when rolling three standard d6 dice.
			</p>

			<p>
				To use this application, first select your desired calculation type
				(dice sums or dice face values). Next, add the dice with which you want
				to roll. You can click the dice images below to add the dice to the
				input field, or write them directly to the field.
			</p>

			<p>
				After selecting the calculation type and the dice with which you want to
				roll, select the probability type, enter the target value what you want
				to roll and click Calculate!
			</p>
			<SelectWrapper>
				<p>I want to calculate</p>
				<Select
					name="calculationType"
					onChange={handleSelectChange}
					value={props.value}
					className="select-calculation-type select-input"
					options={calculationTypeOptions}
					defaultValue={props.value}
				/>
			</SelectWrapper>
		</CalculationTypeWrapper>
	);
};

export default CalculationTypes;
