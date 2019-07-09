import React from "react";
//import Select from "react-select";
import NumberInput from "./NumberInput";
import styled from "styled-components";
import { useSpring, animated, useTransition } from "react-spring";
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputBase from "@material-ui/core/InputBase";
import { ExpandMore } from "@material-ui/icons";

const Input = withStyles(theme => ({
	input: {
		boxSizing: "border-box",
		borderRadius: 6,
		position: "relative",
		backgroundColor: theme.palette.background.paper,
		border: "1px solid #ced4da",
		fontSize: 16,
		padding: "10px 26px 10px 12px",
		fontFamily: "Nunito",
		width: "10rem",
		transition: theme.transitions.create(["box-shadow"]),
		"&:focus": {
			borderRadius: 4,
			boxShadow: "0 0 4px 2px #2684ff",
			backgroundColor: "#fff"
		},
		"&:hover": {
			boxShadow: "0 0 12px -1px #2684ff"
		}
	}
}))(InputBase);

const Separator = styled.p`
	margin: 0 0.5rem;
`;

const FlexColumn = styled(animated.div)`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
	width: 100%;
`;

const FlexRow = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: center;
	margin: 0.75rem 0;
	position: relative;
`;

const AnimatedFlexRow = styled(animated.div)`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: center;
	position: absolute;
	right: -3.25rem;
`;

const MovingFlexRow = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: center;
	transition: transform 600ms ease;
	position: relative;
	transform: ${props =>
		["sumTargetValueBetween", "sumTargetValueNotBetween"].includes(
			props.sumTargetValueType
		)
			? "translateX(-3.5rem)"
			: "translateX(0)"};
`;

const DiceSums = ({
	inputCallback,
	sumTargetValueOne,
	sumTargetValueTwo,
	sumTargetValueType
}) => {
	const handleChange = e => {
		const selectName = e.target.name;
		const newValue = e.target.value;
		inputCallback({ [selectName]: newValue });
	};

	const dropUp = useSpring({
		from: { transform: "translateY(100%)", opacity: 0, zIndex: 10 },
		to: { transform: "translateY(0)", opacity: 1, zIndex: 10 },
		config: { mass: 1, tension: 235, friction: 55 }
	});

	const isBetween = sumTargetValueType.indexOf("Between") > -1;

	const SumDiceBetween = useTransition(isBetween, null, {
		from: { transform: "translateY(-30px)", opacity: 0 },
		enter: { transform: "translateY(0)", opacity: 1 },
		leave: { transform: "translateY(-30px)", opacity: 0 }
	});

	return (
		<FlexColumn style={dropUp}>
			<p>where the sum of the dice</p>
			<FlexRow>
				<MovingFlexRow sumTargetValueType={sumTargetValueType}>
					<FormControl>
						<Select
							value={sumTargetValueType}
							onChange={handleChange}
							input={<Input name="sumTargetValueType" />}
							IconComponent={ExpandMore}
						>
							<MenuItem
								style={{ minWidth: "10rem" }}
								value={"sumTargetValueExactly"}
							>
								is exactly
							</MenuItem>
							<MenuItem
								style={{ minWidth: "10rem" }}
								value={"sumTargetValueAtLeast"}
							>
								is at least
							</MenuItem>
							<MenuItem
								style={{ minWidth: "10rem" }}
								value={"sumTargetValueAtMost"}
							>
								is at most
							</MenuItem>
							<MenuItem
								style={{ minWidth: "10rem" }}
								value={"sumTargetValueBetween"}
							>
								is between
							</MenuItem>
							<MenuItem
								style={{ minWidth: "10rem" }}
								value={"sumTargetValueNotBetween"}
							>
								is not between
							</MenuItem>
						</Select>
					</FormControl>
					<NumberInput
						min={"1"}
						inputCallback={inputCallback}
						inputValue={sumTargetValueOne}
						name={"sumTargetValueOne"}
						margin={"0 0 0 0.75rem"}
					/>
				</MovingFlexRow>
				{SumDiceBetween.map(
					({ item, key, props }) =>
						item && (
							<AnimatedFlexRow key={key} style={props}>
								<Separator>and</Separator>
								<NumberInput
									min={"1"}
									inputCallback={inputCallback}
									inputValue={sumTargetValueTwo}
									name={"sumTargetValueTwo"}
								/>
							</AnimatedFlexRow>
						)
				)}
			</FlexRow>
		</FlexColumn>
	);
};

export default DiceSums;
