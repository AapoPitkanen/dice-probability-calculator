import React, { useEffect, useState, useReducer, useRef } from "react";
import "./DiceProbabilityCalculator.css";
import DiceInput from "./components/DiceInput";
import SumWorker from "./sum.worker";
import FaceWorker from "./face.worker";
import DiceImages from "./components/DiceImages";
import DiceSums from "./components/DiceSums";
import DiceFaces from "./components/DiceFaces";
import CalculationTypes from "./components/CalculationTypes";
import { useTransition, animated, config } from "react-spring";
import { easeCubicInOut } from "d3-ease";
import {
	GlobalStyle,
	GlobalWrapper,
	CalculateButton,
	ErrorMessage,
	InputWrapper,
	HeightWrapper,
	FlexRow
} from "./styles";
import Output from "./components/Output";
import styled, { keyframes } from "styled-components";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer
} from "recharts";

const sumWorker = new SumWorker();
const faceWorker = new FaceWorker();

const pulsate = keyframes`
	0% {
		opacity: 0;
	}

	15% {
		opacity: 0;
	}

	50% {
		opacity: 1;
	}

	85 % {
		opacity: 0;
	}

	100% {
		opacity: 0;
	}
`;

const fadeIn = keyframes`
	0% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
`;

const CalculatingText = styled.p`
	color: #fff;
	animation-name: ${pulsate};
	animation-timing-function: ease-in-out;
	animation-iteration-count: infinite;
	animation-duration: 1800ms;
	position: absolute;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
`;

const CalculateText = styled.p`
	color: #fff;
	transition: opacity 600ms ease;
	opacity: ${props => (props.isCalculating ? 0 : 1)};
	position: absolute;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
`;

const AnimatedProbabilityTextOutput = styled.p`
	opacity: 0;
	font-size: 1rem;
	animation: ${fadeIn} 800ms ease-in-out 200ms 1 forwards;
`;

const AnimatedProbabilityValueOutput = styled.p`
	opacity: 0;
	font-size: 1.25rem;
	animation: ${fadeIn} 800ms ease-in-out 200ms 1 forwards;
`;

const AnimatedOutputWrapper = styled(animated.div)`
	display: flex;
	justify-content: center;
	flex-direction: column
	align-items: center;
	width: 100%;
	border-radius: 0 0 8px 8px;
	background-color: #282c34;
	padding: 0 2rem;
	z-index: 1;
	position: absolute;
	height: 10%;
	bottom: -9.9%;
`;

const DiceProbabilityCalculator = () => {
	// Check if mobile device, some animations need tweaking if on mobile

	const mobileBooleans = [
		window.navigator.maxTouchPoints > 0,
		window.navigator.msMaxTouchPoints > 0,
		!!window.matchMedia("(pointer:coarse)").matches,
		"orientation" in window
	];
	const isMobile = mobileBooleans.some(value => value) ? true : false;

	// App level state

	const [totalDice, setTotalDice] = useState(0);
	const [diceCounts, setDiceCounts] = useState({});
	const [error, setError] = useState(false);
	const [isCalculating, setIsCalculating] = useState(false);
	const [isCalculationFinished, setIsCalculationFinished] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [probability, setProbability] = useState("");
	const [probabilityText, setProbabilityText] = useState("");
	const [sumDistribution, setSumDistribution] = useState([]);
	const [toggleChart, setToggleChart] = useState(false);
	const initialInputValues = {
		calculationType: "diceSums",
		diceInput: "",
		faceTargetDiceCountType: "",
		faceTargetDiceCountOne: "",
		faceTargetDiceCountTwo: "",
		faceTargetValueType: "",
		faceTargetValueOne: "",
		faceTargetValueTwo: "",
		sumTargetValueType: "",
		sumTargetValueOne: "",
		sumTargetValueTwo: ""
	};
	const [wrapperHeight, setWrapperHeight] = useState("auto");

	// Refs used for isCalculating correct height for animation

	const calculationRef = useRef(null);

	// Helper functions

	const reducer = (state, newState) => ({ ...state, ...newState });
	const [inputValues, setInputValues] = useReducer(reducer, initialInputValues);
	const inputCallback = childData => setInputValues(childData);
	const childCallback = (callback, value) => callback(value);

	const checkErrors = errors => {
		if (errors.some(error => error.errorState)) {
			const errorIndex = errors.findIndex(error => error.errorState === true);

			const errorText = errors[errorIndex].errorText;

			setError(true);

			setErrorText(errorText);

			setTimeout(() => {
				setError(false);
			}, 3000);
			return true;
		}
		return false;
	};

	// Event handlers

	const handleFaceWorkerMessage = e => {
		const data = e.data;
		setIsCalculating(false);
		setIsCalculationFinished(true);
		setProbabilityText(data.probabilityText);
		setProbability(`${data.probabilityValue}%`);
	};

	const handleSumWorkerMessage = e => {
		const data = e.data;
		setIsCalculating(false);
		setIsCalculationFinished(true);
		setSumDistribution(data.sumDistribution);
		setProbabilityText(data.probabilityText);
		setProbability(`${data.probabilityValue}%`);

		setTimeout(() => {
			window.scroll(0, document.body.scrollHeight);
		}, 1000);
	};

	const handleDistribution = () => {
		setToggleChart(!toggleChart);
	};

	// Effects

	useEffect(() => {
		sumWorker.addEventListener("message", handleSumWorkerMessage);
		faceWorker.addEventListener("message", handleFaceWorkerMessage);
		return () => {
			sumWorker.removeEventListener("message", handleSumWorkerMessage);
			faceWorker.removeEventListener("message", handleFaceWorkerMessage);
		};
	});

	useEffect(() => {
		setWrapperHeight(calculationRef.current.clientHeight);
	}, [
		inputValues.calculationType,
		inputValues.faceTargetDiceCountType,
		inputValues.faceTargetValueType,
		toggleChart,
		isCalculationFinished
	]);

	// Animations

	const ErrorTransition = useTransition(error, null, {
		from: { transform: "translateY(-100%)", opacity: 0 },
		enter: { transform: "translateY(0)", opacity: 1 },
		leave: { transform: "translateY(-100%)", opacity: 0 },
		config: { duration: 700, easing: easeCubicInOut }
	});

	const OutputTransition = useTransition(isCalculationFinished, null, {
		from: { transform: "translateY(-100%)" },
		enter: { transform: "translateY(0)" },
		leave: { transform: "translateY(-100%)" },
		config: config.slow
	});

	// Probability calculations

	const calculateFaceProbability = () => {
		const diceInput = inputValues.diceInput;
		const diceArr = diceInput.split("+");
		const faceTargetDiceCountOne = inputValues.faceTargetDiceCountOne;
		const faceTargetDiceCountTwo = inputValues.faceTargetDiceCountTwo;
		const faceTargetDiceCountType = inputValues.faceTargetDiceCountType;
		const faceTargetValueOne = inputValues.faceTargetValueOne;
		const faceTargetValueTwo = inputValues.faceTargetValueTwo;
		const faceTargetValueType = inputValues.faceTargetValueType;
		const maxSuccesses = totalDice;

		const potentialErrors = [
			{
				errorName: "Empty input",
				errorState: [
					diceInput,
					faceTargetDiceCountOne,
					faceTargetDiceCountType,
					faceTargetValueOne,
					faceTargetValueType
				].some(value => !value),
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Empty faceTargetValueTwo input",
				errorState:
					["faceTargetValueBetween", "faceTargetValueNotBetween"].includes(
						faceTargetValueType
					) && faceTargetValueTwo === "",
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Empty faceTargetDiceCountTwo input",
				errorState:
					[
						"faceTargetDiceCountBetween",
						"faceTargetDiceCountNotBetween"
					].includes(faceTargetDiceCountType) && faceTargetDiceCountTwo === "",
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Too many successes",
				errorState: [faceTargetDiceCountOne, faceTargetDiceCountTwo].some(
					value => value > maxSuccesses
				),
				errorText: "Cannot roll more successes than the number of dice"
			}
		];

		checkErrors(potentialErrors);

		const message = {
			diceArr: diceArr,
			diceObj: diceCounts,
			faceTargetDiceCountOne: faceTargetDiceCountOne,
			faceTargetDiceCountTwo: faceTargetDiceCountTwo,
			faceTargetDiceCountType: faceTargetDiceCountType,
			faceTargetValueOne: faceTargetValueOne,
			faceTargetValueTwo: faceTargetValueTwo,
			faceTargetValueType: faceTargetValueType
		};

		faceWorker.postMessage(message);

		setError(false);
		setProbability("");
		setProbabilityText("");
		setIsCalculationFinished(false);

		totalDice >= 200 && setIsCalculating(true);
	};

	const calculateSumProbability = () => {
		const diceInput = inputValues.diceInput;
		const diceArr = diceInput.split("+");
		const sumTargetValueType = inputValues.sumTargetValueType;
		let sumTargetValueOne = inputValues.sumTargetValueOne;
		let sumTargetValueTwo = inputValues.sumTargetValueTwo;

		const inputErrors = [
			{
				errorName: "Empty input",
				errorState: [(diceInput, sumTargetValueOne, sumTargetValueType)].some(
					value => !value
				),
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Empty sumTargetValueTwo input",
				errorState:
					["sumTargetValueBetween", "sumTargetValueNotBetween"].includes(
						sumTargetValueType
					) && sumTargetValueTwo === "",
				errorText: "Please fill in all the required fields"
			}
		];

		if (checkErrors(inputErrors)) {
			return;
		}

		const diceCountValues = diceCounts ? Object.values(diceCounts) : [];
		const entries = Object.entries(diceCounts).map(item =>
			item.map(el => (typeof el === "string" ? parseInt(el.slice(1)) : el))
		);

		const maxSum = diceInput
			? entries.reduce(
					(acc, curr) => acc + curr.reduce((acc, curr) => acc * curr),
					0
			  )
			: null;

		const totalDice = diceCountValues.length
			? diceCountValues.reduce((acc, curr) => acc + curr)
			: null;

		const minSum = totalDice ? totalDice : null;

		// Lazy fix, faster to just swap the numbers so the calculation can be run even though the numbers are reversed in the input fields
		if (sumTargetValueTwo && sumTargetValueOne > sumTargetValueTwo) {
			[sumTargetValueOne, sumTargetValueTwo] = [
				sumTargetValueTwo,
				sumTargetValueOne
			];
		}

		const valueErrors = [
			{
				errorName: "Sum too large",
				errorState: [sumTargetValueOne, sumTargetValueTwo].some(
					value => value > maxSum
				),
				errorText: "Sum cannot be greater than the maximum sum of the dice"
			},
			{
				errorName: "Sum too small",
				errorState: sumTargetValueOne < minSum,
				errorText: "Sum cannot be less than the minimum sum of the dice"
			}
		];

		if (checkErrors(valueErrors)) {
			return;
		}

		const message = {
			diceArr: diceArr,
			sumTargetValueType: sumTargetValueType,
			sumTargetValueOne: sumTargetValueOne,
			sumTargetValueTwo: sumTargetValueTwo
		};

		setError(false);
		setProbabilityText("");
		setProbability("");
		setIsCalculationFinished(false);

		totalDice >= 200 && setIsCalculating(true);

		sumWorker.postMessage(message);
	};

	console.log(sumDistribution);

	return (
		<>
			<GlobalStyle />
			<GlobalWrapper>
				<CalculationTypes
					value={inputValues.calculationType}
					inputCallback={inputCallback}
					callback={childCallback}
					setStates={[
						setProbability,
						setProbabilityText,
						setIsCalculationFinished
					]}
				/>
				<HeightWrapper height={wrapperHeight}>
					<InputWrapper ref={calculationRef}>
						<DiceImages
							inputCallback={inputCallback}
							totalDice={totalDice}
							setTotalDice={setTotalDice}
							diceCounts={diceCounts}
							setDiceCounts={setDiceCounts}
						/>
						<p>with the dice</p>
						<DiceInput
							inputCallback={inputCallback}
							value={inputValues.diceInput}
							setTotalDice={setTotalDice}
							setDiceCounts={setDiceCounts}
							name={"diceInput"}
							placeholder={"Enter dice here as addition (e.g. 2d6+1d8)..."}
						/>

						{inputValues.calculationType === "diceSums" && (
							<DiceSums
								inputCallback={inputCallback}
								sumTargetValueOne={inputValues.sumTargetValueOne}
								sumTargetValueTwo={inputValues.sumTargetValueTwo}
								sumTargetValueType={inputValues.sumTargetValueType}
							/>
						)}
						{inputValues.calculationType === "diceFaces" && (
							<DiceFaces
								totalDice={totalDice}
								inputCallback={inputCallback}
								faceTargetDiceCountType={inputValues.faceTargetDiceCountType}
								faceTargetDiceCountOne={inputValues.faceTargetDiceCountOne}
								faceTargetDiceCountTwo={inputValues.faceTargetDiceCountTwo}
								faceTargetValueType={inputValues.faceTargetValueType}
								faceTargetValueOne={inputValues.faceTargetValueOne}
								faceTargetValueTwo={inputValues.faceTargetValueTwo}
							/>
						)}
						{/* isCalculationFinished && (
							<CalculateButton onClick={handleDistribution}>
								Show distribution
							</CalculateButton>
						) */}

						{/* isCalculationFinished && toggleChart && (
							<ResponsiveContainer width="90%" height={300}>
								<LineChart
									data={sumDistribution}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5
									}}
								>
									<XAxis dataKey="sum" />
									<YAxis dataKey="probability" />
									<Legend />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="probability"
										stroke="#8884d8"
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						) */}
					</InputWrapper>
				</HeightWrapper>
				<FlexRow isCalculationFinished={isCalculationFinished}>
					<CalculateButton
						onClick={
							inputValues.calculationType === "diceSums"
								? calculateSumProbability
								: calculateFaceProbability
						}
					>
						<CalculateText isCalculating={isCalculating}>
							Calculate!
						</CalculateText>
						{isCalculating && (
							<CalculatingText isCalculating={isCalculating}>
								Calculating...
							</CalculatingText>
						)}
					</CalculateButton>
				</FlexRow>
				{OutputTransition.map(
					({ item, key, props }) =>
						item && (
							<AnimatedOutputWrapper key={key} style={props}>
								<AnimatedProbabilityTextOutput>
									{probabilityText}
								</AnimatedProbabilityTextOutput>
								<AnimatedProbabilityValueOutput>
									{probability}
								</AnimatedProbabilityValueOutput>
							</AnimatedOutputWrapper>
						)
				)}
				{/* isCalculationFinished && !isMobile && (
					<Output probabilityText={probabilityText} probability={probability} />
				) */}
				{ErrorTransition.map(
					({ item, key, props }) =>
						item && (
							<ErrorMessage key={key} style={props}>
								{errorText}
							</ErrorMessage>
						)
				)}
			</GlobalWrapper>
		</>
	);
};

export default DiceProbabilityCalculator;
