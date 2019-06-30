import React, { useEffect, useState, useReducer } from "react";
import "./App.css";
import DiceInput from "./components/DiceInput";
import SumWorker from "./sum.worker";
import FaceWorker from "./face.worker";
import { CSSTransition } from "react-transition-group";
import DiceImages from "./components/DiceImages";
import DiceSums from "./components/DiceSums";
import DiceFaces from "./components/DiceFaces";
import CalculationTypes from "./components/CalculationTypes";

const sumWorker = new SumWorker();
const faceWorker = new FaceWorker();

const App = () => {
	const [totalDice, setTotalDice] = useState(0);

	const [diceCounts, setDiceCounts] = useState({});

	const [error, setError] = useState(false);

	const [calculating, setCalculating] = useState(false);

	const [calculationFinished, setCalculationFinished] = useState(true);

	const [errorText, setErrorText] = useState("");

	const [probability, setProbability] = useState("");

	const [probabilityText, setProbabilityText] = useState("");

	const initialInputValues = {
		calculationType: { value: "diceSums", label: "Dice sums" },
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

	const reducer = (state, newState) => ({ ...state, ...newState });

	const [inputValues, setInputValues] = useReducer(
		reducer,
		initialInputValues
	);

	const inputCallback = childData => setInputValues(childData);

	const handleWorkerMessage = e => {
		const data = e.data;
		setCalculating(false);
		setCalculationFinished(true);
		setProbabilityText(data.probabilityText);
		setProbability(`${data.probabilityValue}%`);
	};

	useEffect(() => {
		sumWorker.addEventListener("message", handleWorkerMessage);
		faceWorker.addEventListener("message", handleWorkerMessage);
		return () => {
			sumWorker.removeEventListener("message", handleWorkerMessage);
			faceWorker.removeEventListener("message", handleWorkerMessage);
		};
	});

	const calculateFaceProbability = () => {
		const diceInput = inputValues.diceInput;
		const diceArr = diceInput.split("+");
		const faceTargetDiceCountOne = parseInt(
			inputValues.faceTargetDiceCountOne
		);
		const faceTargetDiceCountTwo = parseInt(
			inputValues.faceTargetDiceCountTwo
		);
		const faceTargetDiceCountType =
			inputValues.faceTargetDiceCountType.value;
		const faceTargetValueOne = parseInt(inputValues.faceTargetValueOne);
		const faceTargetValueTwo = parseInt(inputValues.faceTargetValueTwo);
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
					[
						"faceTargetValueBetween",
						"faceTargetValueNotBetween"
					].includes(faceTargetValueType) &&
					faceTargetValueTwo === "",
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Empty faceTargetDiceCountTwo input",
				errorState:
					[
						"faceTargetDiceCountBetween",
						"faceTargetDiceCountNotBetween"
					].includes(faceTargetDiceCountType) &&
					faceTargetDiceCountTwo === "",
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Too many successes",
				errorState: [
					faceTargetDiceCountOne,
					faceTargetDiceCountTwo
				].some(value => value > maxSuccesses),
				errorText: "Cannot roll more successes than the number of dice"
			}
		];

		if (potentialErrors.some(error => error.errorState)) {
			const errorIndex = potentialErrors.findIndex(
				error => error.errorState === true
			);

			const errorText = potentialErrors[errorIndex].errorText;

			setError(true);

			setErrorText(errorText);

			setTimeout(() => {
				setError(false);
				setErrorText("");
			}, 3000);

			return;
		}

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
		let sumTargetValueOne = !inputValues.sumTargetValueOne
			? inputValues.sumTargetValueOne
			: parseInt(inputValues.sumTargetValueOne);
		let sumTargetValueTwo = !inputValues.sumTargetValueTwo
			? inputValues.sumTargetValueTwo
			: parseInt(inputValues.sumTargetValueTwo);

		const diceCountValues = diceCounts ? Object.values(diceCounts) : [];
		const entries = Object.entries(diceCounts).map(item =>
			item.map(el =>
				typeof el === "string" ? parseInt(el.slice(1)) : el
			)
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

		const potentialErrors = [
			{
				errorName: "Empty input",
				errorState: [
					(diceInput, sumTargetValueOne, sumTargetValueType)
				].some(value => !value),
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Empty sumTargetValueTwo input",
				errorState:
					[
						"sumTargetValueBetween",
						"sumTargetValueNotBetween"
					].includes(sumTargetValueType) && sumTargetValueTwo === "",
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Sum too large",
				errorState: [sumTargetValueOne, sumTargetValueTwo].some(
					value => value > maxSum
				),
				errorText:
					"Sum cannot be greater than the maximum sum of the dice"
			},
			{
				errorName: "Sum too small",
				errorState: sumTargetValueOne < minSum,
				errorText: "Sum cannot be less than the minimum sum of the dice"
			}
		];
		// Of course if some inputs are empty and the sum is too large or small, only the empty input's error text will be visible, but I think this still works as empty input errors should be prioritized.
		if (potentialErrors.some(error => error.errorState)) {
			const errorIndex = potentialErrors.findIndex(
				error => error.errorState === true
			);

			const errorText = potentialErrors[errorIndex].errorText;

			setError(true);
			setErrorText(errorText);

			setTimeout(() => {
				setError(false);
				setErrorText("");
			}, 3000);

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
		setCalculating(true);
		setCalculationFinished(false);

		sumWorker.postMessage(message);
	};

	return (
		<div className="probability-calculator-wrapper">
			<CalculationTypes
				value={inputValues.calculationType}
				inputCallback={inputCallback}
			/>
			<DiceImages
				inputCallback={inputCallback}
				totalDice={totalDice}
				setTotalDice={setTotalDice}
				diceCounts={diceCounts}
				setDiceCounts={setDiceCounts}
			/>
			<div className="dice-input-wrapper">
				<p>with the dice</p>
				<DiceInput
					inputCallback={inputCallback}
					value={inputValues.diceInput}
					setTotalDice={setTotalDice}
					setDiceCounts={setDiceCounts}
					name={"diceInput"}
					placeholder={
						"Enter dice here as addition (e.g. 2d6+1d8)..."
					}
					className={"dice-input"}
				/>

				{inputValues.calculationType.value === "diceSums" && (
					<DiceSums
						inputCallback={inputCallback}
						sumTargetValueOne={inputValues.sumTargetValueOne}
						sumTargetValueTwo={inputValues.sumTargetValueTwo}
						sumTargetValueType={inputValues.sumTargetValueType}
						calculateSumProbability={calculateSumProbability}
					/>
				)}

				{inputValues.calculationType.value === "diceFaces" && (
					<DiceFaces
						inputCallback={inputCallback}
						faceTargetDiceCountType={
							inputValues.faceTargetDiceCountType
						}
						faceTargetDiceCountOne={
							inputValues.faceTargetDiceCountOne
						}
						faceTargetDiceCountTwo={
							inputValues.faceTargetDiceCountTwo
						}
						faceTargetValueType={inputValues.faceTargetValueType}
						faceTargetValueOne={inputValues.faceTargetValueOne}
						faceTargetValueTwo={inputValues.faceTargetValueTwo}
						calculateFaceProbability={calculateFaceProbability}
					/>
				)}
			</div>
			<CSSTransition
				key="error"
				unmountOnExit
				timeout={500}
				classNames="error"
				in={error}
			>
				<div className="error-message">{errorText}</div>
			</CSSTransition>

			<CSSTransition
				key="loader"
				timeout={500}
				classNames="spin-loader"
				in={calculating}
			>
				<div className="loader">Calculating...</div>
			</CSSTransition>
			<CSSTransition
				key="output"
				unmountOnExit
				timeout={600}
				classNames="output"
				in={calculationFinished}
			>
				<div className="output-wrapper">
					<div className="output-text">{probabilityText}</div>
					<div className="probability-value">{probability}</div>
				</div>
			</CSSTransition>
		</div>
	);
};

export default App;
