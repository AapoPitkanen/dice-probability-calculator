import React, { useEffect, useState, useReducer, useRef } from "react";
import "./App.css";
import DiceInput from "./components/DiceInput";
import SumWorker from "./sum.worker";
import FaceWorker from "./face.worker";
import DiceImages from "./components/DiceImages";
import DiceSums from "./components/DiceSums";
import DiceFaces from "./components/DiceFaces";
import CalculationTypes from "./components/CalculationTypes";
import { Transition, Spring } from "react-spring/renderprops";
import { easeCubicInOut } from "d3-ease";
import {
	GlobalStyle,
	GlobalWrapper,
	CalculateButton,
	ErrorMessage,
	Loader,
	InputWrapper,
	HeightWrapper,
	FlexRow
} from "./styles";
import Output from "./components/Output";

const sumWorker = new SumWorker();
const faceWorker = new FaceWorker();

const App = () => {
	const [totalDice, setTotalDice] = useState(0);
	const [diceCounts, setDiceCounts] = useState({});
	const [error, setError] = useState(false);
	const [calculating, setCalculating] = useState(false);
	const [calculationFinished, setCalculationFinished] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [probability, setProbability] = useState("");
	const [probabilityText, setProbabilityText] = useState("");
	const [sumDistribution, setSumDistribution] = useState({
		sums: [],
		probabilities: []
	});
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
	const calculationRef = useRef(null);
	const [wrapperHeight, setWrapperHeight] = useState("auto");

	const reducer = (state, newState) => ({ ...state, ...newState });
	const [inputValues, setInputValues] = useReducer(reducer, initialInputValues);
	const inputCallback = childData => setInputValues(childData);
	const childCallback = (callback, value) => callback(value);
	const handleFaceWorkerMessage = e => {
		const data = e.data;
		setCalculating(false);
		setCalculationFinished(true);
		setProbabilityText(data.probabilityText);
		setProbability(`${data.probabilityValue}%`);
	};

	const handleSumWorkerMessage = e => {
		const data = e.data;
		setCalculating(false);
		setCalculationFinished(true);
		setSumDistribution(data.sumDistribution);
		setProbabilityText(data.probabilityText);
		setProbability(`${data.probabilityValue}%`);

		setTimeout(() => {
			window.scroll(0, document.body.scrollHeight);
		}, 500);
	};

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
		inputValues.faceTargetValueType
	]);

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

	const calculateFaceProbability = () => {
		const diceInput = inputValues.diceInput;
		const diceArr = diceInput.split("+");
		const faceTargetDiceCountOne = inputValues.faceTargetDiceCountOne;
		const faceTargetDiceCountTwo = inputValues.faceTargetDiceCountTwo;
		const faceTargetDiceCountType = inputValues.faceTargetDiceCountType.value;
		const faceTargetValueOne = inputValues.faceTargetValueOne;
		const faceTargetValueTwo = inputValues.faceTargetValueTwo;
		const faceTargetValueType = inputValues.faceTargetValueType.value;
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
		setCalculating(true);
		setCalculationFinished(false);
	};

	const calculateSumProbability = () => {
		const diceInput = inputValues.diceInput;
		const diceArr = diceInput.split("+");
		const sumTargetValueType = inputValues.sumTargetValueType.value;
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
		setCalculationFinished(false);

		totalDice >= 200 ? setCalculating(true) : setCalculating(false);

		sumWorker.postMessage(message);
	};

	return (
		<>
			{console.log("rendering App")}
			<GlobalStyle />
			<GlobalWrapper>
				<CalculationTypes
					value={inputValues.calculationType}
					inputCallback={inputCallback}
					callback={childCallback}
					setStates={[
						setProbability,
						setProbabilityText,
						setCalculationFinished
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
								inputCallback={inputCallback}
								faceTargetDiceCountType={inputValues.faceTargetDiceCountType}
								faceTargetDiceCountOne={inputValues.faceTargetDiceCountOne}
								faceTargetDiceCountTwo={inputValues.faceTargetDiceCountTwo}
								faceTargetValueType={inputValues.faceTargetValueType}
								faceTargetValueOne={inputValues.faceTargetValueOne}
								faceTargetValueTwo={inputValues.faceTargetValueTwo}
							/>
						)}
					</InputWrapper>
				</HeightWrapper>
				<FlexRow calculationFinished={calculationFinished}>
					<CalculateButton
						onClick={
							inputValues.calculationType === "diceSums"
								? calculateSumProbability
								: calculateFaceProbability
						}
					>
						Calculate!
					</CalculateButton>
				</FlexRow>
				{calculationFinished && (
					<Output probabilityText={probabilityText} probability={probability} />
				)}
				<Transition
					items={calculating}
					from={{ opacity: 0, maxHeight: "0px" }}
					enter={{ opacity: 1, maxHeight: "200px" }}
					leave={{ opacity: 0, maxHeight: "0px" }}
					config={{ duration: 700, easing: easeCubicInOut }}
				>
					{calculationFinished =>
						calculationFinished &&
						(props => (
							<div style={props}>
								<Loader>Calculating...</Loader>
							</div>
						))
					}
				</Transition>
				<Transition
					items={error}
					from={{
						left: "50%",
						bottom: "33%",
						position: "fixed",
						opacity: 0,
						transform: "Translate3d(0, -60px, 0)",
						zIndex: 15
					}}
					enter={{
						left: "50%",
						bottom: "33%",
						position: "fixed",
						opacity: 1,
						transform: "Translate3d(0, 0px, 0)",
						zIndex: 15
					}}
					leave={{
						left: "50%",
						bottom: "33%",
						position: "fixed",
						opacity: 0,
						transform: "Translate3d(0, -60px, 0)",
						zIndex: 15
					}}
					config={{ duration: 800, easing: easeCubicInOut }}
				>
					{error =>
						error &&
						(props => (
							<div style={props}>
								<ErrorMessage>{errorText}</ErrorMessage>
							</div>
						))
					}
				</Transition>
			</GlobalWrapper>
		</>
	);
};

export default App;
