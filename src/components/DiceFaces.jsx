import React from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";

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

const FlexColumn = styled(animated.div)`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
	width: 100%;
	z-index: 2;
`;

const FlexRow = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: center;
	position: relative;
	margin: 0.75rem;

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

	const dropDown = useSpring({
		from: { transform: "translateY(-50%)", opacity: 0, zIndex: 10 },
		to: { transform: "translateY(0)", opacity: 1, zIndex: 10 },
		config: { mass: 1, tension: 235, friction: 55 }
	});

	return (
		<FlexColumn style={dropDown}>
			<p>and I want to roll</p>
			<FlexRow>
				<Select
					name="faceTargetDiceCountType"
					onChange={handleSelectChange}
					value={props.faceTargetDiceCountType}
					className="select-face-target-count select-input"
					options={faceTargetDiceCountOptions}
					isSearchable={false}
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
					<>
						<Separator>and</Separator>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.faceTargetDiceCountTwo}
							name={"faceTargetDiceCountTwo"}
						/>
					</>
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
					isSearchable={false}
				/>
				<NumberInput
					min={"1"}
					inputCallback={props.inputCallback}
					inputValue={props.faceTargetValueOne}
					name={"faceTargetValueOne"}
				/>
				{(props.faceTargetValueType.value === "faceTargetValueBetween" ||
					props.faceTargetValueType.value === "faceTargetValueNotBetween") && (
					<>
						<Separator>and</Separator>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.faceTargetValueTwo}
							name={"faceTargetValueTwo"}
						/>
					</>
				)}
			</FlexRow>
		</FlexColumn>
	);
};

export default DiceFaces;
