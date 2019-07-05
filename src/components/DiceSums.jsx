import React from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";

const Separator = styled.p`
	margin: 0;
`;

const FlexColumn = styled(animated.div)`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
	width: 100%;
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
	const dropUp = useSpring({
		from: { transform: "translateY(100%)", opacity: 0, zIndex: 10 },
		to: { transform: "translateY(0)", opacity: 1, zIndex: 10 },
		config: { mass: 1, tension: 235, friction: 55 }
	});

	return (
		<FlexColumn style={dropUp}>
			<p>where the sum of the dice</p>
			<FlexRow>
				<Select
					name="sumTargetValueType"
					onChange={handleSelectChange}
					value={props.sumTargetValueType}
					className="select-sum-target select-input"
					options={sumTargetValueOptions}
					isSearchable={false}
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
	);
};

export default DiceSums;
