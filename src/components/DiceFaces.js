import React from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";
import styled from "styled-components";

const Separator = styled.p`
	margin: 0;
`;

const DiceCount = styled.p`
	position: absolute;
	right: -30px;
	margin: 0;
	text-align: center;

	@media (min-width: 320px) and (max-width: 480px) {
		position: relative;
		right: 0;
	}
`;

const FlexColumn = styled.div`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
`;

const FlexRow = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: center;
	position: relative;

	@media (min-width: 320px) and (max-width: 480px) {
		flex-flow: column wrap;
		margin: 1rem 0;
	}
`;

const DiceFaces = props => {
	const handleSelectChange = (newValue, actionMeta) => {
		const selectName = actionMeta.name;
		props.inputCallback({ [selectName]: newValue });
	};

	const faceTargetValueOptions = [
		{ value: "faceTargetValueExactly", label: "is exactly" },
		{ value: "faceTargetValueAtLeast", label: "is at least" },
		{ value: "faceTargetValueAtMost", label: "is at most" },
		{ value: "faceTargetValueBetween", label: "is between" },
		{ value: "faceTargetValueNotBetween", label: "is not between" }
	];

	const faceTargetDiceCountOptions = [
		{ value: "faceTargetDiceCountExactly", label: "exactly" },
		{ value: "faceTargetDiceCountAtLeast", label: "at least" },
		{ value: "faceTargetDiceCountAtMost", label: "at most" },
		{ value: "faceTargetDiceCountBetween", label: "between" },
		{
			value: "faceTargetDiceCountNotBetween",
			label: "outside of range"
		}
	];

	return (
		<FlexColumn>
			<p>and I want to roll</p>
			<FlexRow>
				<Select
					name="faceTargetDiceCountType"
					onChange={handleSelectChange}
					value={props.faceTargetDiceCountType}
					className="select-face-target-count select-input"
					options={faceTargetDiceCountOptions}
				/>
				<NumberInput
					min={"0"}
					inputCallback={props.inputCallback}
					inputValue={props.faceTargetDiceCountOne}
					name={"faceTargetDiceCountOne"}
				/>
				{(props.faceTargetDiceCountType.value ===
					"faceTargetDiceCountBetween" ||
					props.faceTargetDiceCountType.value ===
						"faceTargetDiceCountNotBetween") && (
					<React.Fragment>
						<Separator>and</Separator>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.faceTargetDiceCountTwo}
							name={"faceTargetDiceCountTwo"}
						/>
					</React.Fragment>
				)}
				<DiceCount>dice</DiceCount>
			</FlexRow>

			<p>where the face value</p>
			<FlexRow desktop>
				<Select
					name="faceTargetValueType"
					onChange={handleSelectChange}
					value={props.faceTargetValueType}
					className="select-face-target select-input"
					options={faceTargetValueOptions}
				/>
				<NumberInput
					min={"1"}
					inputCallback={props.inputCallback}
					inputValue={props.faceTargetValueOne}
					name={"faceTargetValueOne"}
				/>
				{(props.faceTargetValueType.value ===
					"faceTargetValueBetween" ||
					props.faceTargetValueType.value ===
						"faceTargetValueNotBetween") && (
					<React.Fragment>
						<Separator>and</Separator>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.faceTargetValueTwo}
							name={"faceTargetValueTwo"}
						/>
					</React.Fragment>
				)}
			</FlexRow>
		</FlexColumn>
	);
};

export default DiceFaces;
