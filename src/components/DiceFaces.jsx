import React from "react";
// import Select from "react-select";
import NumberInput from "./NumberInput";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";
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

const DiceCount = styled.p`
	position: absolute;
	right: -35px;
	margin: 0;
	text-align: center;
	transition: opacity 400ms ease;
	opacity: ${props => (props.totalDice > 0 ? "1" : "0")};

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
	const handleChange = e => {
		const selectName = e.target.name;
		const newValue = e.target.value;
		props.inputCallback({ [selectName]: newValue });
	};

	const dropDown = useSpring({
		from: { transform: "translateY(-50%)", opacity: 0, zIndex: 10 },
		to: { transform: "translateY(0)", opacity: 1, zIndex: 10 },
		config: { mass: 1, tension: 235, friction: 55 }
	});

	return (
		<FlexColumn style={dropDown}>
			<p>and I want to roll</p>
			<FlexRow>
				<FormControl>
					<Select
						value={props.faceTargetDiceCountType}
						onChange={handleChange}
						input={<Input name="faceTargetDiceCountType" />}
						IconComponent={ExpandMore}
					>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetDiceCountExactly"}
						>
							exactly
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetDiceCountAtLeast"}
						>
							at least
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetDiceCountAtMost"}
						>
							at most
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetDiceCountBetween"}
						>
							between
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetDiceCountNotBetween"}
						>
							outside of range
						</MenuItem>
					</Select>
				</FormControl>
				<NumberInput
					min={"0"}
					inputCallback={props.inputCallback}
					inputValue={props.faceTargetDiceCountOne}
					name={"faceTargetDiceCountOne"}
				/>
				{(props.faceTargetDiceCountType === "faceTargetDiceCountBetween" ||
					props.faceTargetDiceCountType ===
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
				<DiceCount totalDice={props.totalDice}>dice</DiceCount>
			</FlexRow>

			<p>where the face value</p>
			<FlexRow desktop>
				<FormControl>
					<Select
						value={props.faceTargetValueType}
						onChange={handleChange}
						input={<Input name="faceTargetValueType" />}
						IconComponent={ExpandMore}
					>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetDiceValueExactly"}
						>
							is exactly
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetValueAtLeast"}
						>
							is at least
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetValueAtMost"}
						>
							is at most
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetValueBetween"}
						>
							is between
						</MenuItem>
						<MenuItem
							style={{ minWidth: "10rem" }}
							value={"faceTargetValueNotBetween"}
						>
							is not between
						</MenuItem>
					</Select>
				</FormControl>
				<NumberInput
					min={"1"}
					inputCallback={props.inputCallback}
					inputValue={props.faceTargetValueOne}
					name={"faceTargetValueOne"}
				/>
				{(props.faceTargetValueType === "faceTargetValueBetween" ||
					props.faceTargetValueType === "faceTargetValueNotBetween") && (
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
