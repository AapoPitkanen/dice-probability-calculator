import React from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";

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
		<div className="dice-faces-input-wrapper">
			<p>and I want to roll</p>
			<div className="face-target-count-wrapper">
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
						<p>and</p>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.faceTargetDiceCountTwo}
							name={"faceTargetDiceCountTwo"}
						/>
					</React.Fragment>
				)}
				<p className="face-target-count-name">dice</p>
			</div>
			<p>where the face value</p>
			<div className="dice-faces-target-wrapper">
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
						<p>and</p>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.faceTargetValueTwo}
							name={"faceTargetValueTwo"}
						/>
					</React.Fragment>
				)}
			</div>
		</div>
	);
};

export default DiceFaces;
