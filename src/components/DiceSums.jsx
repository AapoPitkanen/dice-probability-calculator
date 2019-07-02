import React from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";
import styled from "styled-components";

const Separator = styled.p`
	margin: 0;
`;

const FlexColumn = styled.div`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
`;

const FlexRow = styled.div`
	display: flex;
	flex-flow: row-wrap;
	justify-content: center;
	align-items: center;
	margin: 0.75rem;
`;

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
		<React.Fragment>
			<FlexColumn>
				<p>where the sum of the dice</p>
				<FlexRow>
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
						props.sumTargetValueType.value === "sumTargetValueNotBetween") && (
						<React.Fragment>
							<Separator>and</Separator>
							<NumberInput
								min={"1"}
								inputCallback={props.inputCallback}
								inputValue={props.sumTargetValueTwo}
								name={"sumTargetValueTwo"}
							/>
						</React.Fragment>
					)}
				</FlexRow>
			</FlexColumn>
		</React.Fragment>
	);
};

export default DiceSums;
