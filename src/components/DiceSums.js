import React from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";

const DiceSums = props => {
	const handleSelectChange = (newValue, actionMeta) => {
		const selectName = actionMeta.name;
		props.inputCallback({ [selectName]: newValue });
	};

	const sumTargetValueOptions = [
		{ value: "sumTargetValueExactly", label: "is exactly" },
		{ value: "sumTargetValueAtLeast", label: "is at least" },
		{ value: "sumTargetValueAtMost", label: "is at most" },
		{ value: "sumTargetValueBetween", label: "is between" },
		{ value: "sumTargetValueNotBetween", label: "is not between" }
	];

	return (
		<div className="dice-sums-input-wrapper">
			<p>where the sum of the dice</p>
			<div className="dice-sums-target-wrapper">
				<Select
					name="sumTargetValueType"
					onChange={handleSelectChange}
					value={props.sumTargetValueType}
					className="select-sum-target select-input"
					options={sumTargetValueOptions}
				/>
				<NumberInput
					min={"1"}
					inputCallback={props.inputCallback}
					inputValue={props.sumTargetValueOne}
					name={"sumTargetValueOne"}
				/>
				{(props.sumTargetValueType.value === "sumTargetValueBetween" ||
					props.sumTargetValueType.value ===
						"sumTargetValueNotBetween") && (
					<React.Fragment>
						<p>and</p>
						<NumberInput
							min={"1"}
							inputCallback={props.inputCallback}
							inputValue={props.sumTargetValueTwo}
							name={"sumTargetValueTwo"}
						/>
					</React.Fragment>
				)}
			</div>
		</div>
	);
};

export default DiceSums;
