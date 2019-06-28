import React, { Component } from "react";
import "./App.css";
import DiceInput from "./components/DiceInput";
import diceLib from "./components/diceLib";
import sumWorker from "./sum.worker";
import faceWorker from "./face.worker";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import DiceImages from "./components/DiceImages";
import DiceSums from "./components/DiceSums";
import DiceFaces from "./components/DiceFaces";
import CalculationTypes from "./components/CalculationTypes";

class App extends Component {
	constructor(props) {
		super(props);
		this.calculateSumProbability = this.calculateSumProbability.bind(this);
		this.calculateFaceProbability = this.calculateFaceProbability.bind(
			this
		);
		this.childComponentCallback = this.childComponentCallback.bind(this);
		this.handleSelectChange = this.handleSelectChange.bind(this);
		this.handleCalculationTypeSelectChange = this.handleCalculationTypeSelectChange.bind(
			this
		);
		this.handleSelectChange = this.handleSelectChange.bind(this);

		this.state = {
			calculating: false,
			calculationFinished: false,
			calculationType: { value: "diceSums", label: "Dice sums" },
			data: {},
			diceCounts: {},
			diceInput: "",
			error: false,
			errorText: "",
			faceTargetDiceCountType: "",
			faceTargetDiceCountOne: "",
			faceTargetDiceCountTwo: "",
			faceTargetValueType: "",
			faceTargetValueOne: "",
			faceTargetValueTwo: "",
			probabilityText: "",
			probability: "",
			sumTargetValueType: "",
			sumTargetValueOne: "",
			sumTargetValueTwo: "",
			totalDice: 0
		};
	}

	componentDidMount() {
		this.sumWorker = new sumWorker();
		this.faceWorker = new faceWorker();
		this.sumWorker.addEventListener("message", e => {
			const data = e.data;
			this.setState({
				calculating: false,
				calculationFinished: true,
				probabilityText: data.probabilityText,
				probability: `${data.probabilityValue}%`
			});
		});

		this.faceWorker.addEventListener("message", e => {
			const data = e.data;

			this.setState({
				calculating: false,
				calculationFinished: true,
				probabilityText: data.probabilityText,
				probability: `${data.probabilityValue}%`
			});

			console.log(data);
		});
	}

	handleSelectChange(newValue, actionMeta) {
		const selectName = actionMeta.name;
		this.setState({
			[selectName]: newValue
		});
	}

	handleCalculationTypeSelectChange(newValue, actionMeta) {
		const selectName = actionMeta.name;
		this.setState({
			[selectName]: newValue,
			probabilityText: "",
			probability: ""
		});
	}

	childComponentCallback(childData, childName) {
		this.setState({
			[childName]: childData
		});
	}

	calculateFaceProbability() {
		const message = {
			diceArr: diceLib.diceObjToArray(this.state.diceCounts),
			diceObj: this.state.diceCounts,
			faceTargetDiceCountOne: this.state.faceTargetDiceCountOne,
			faceTargetDiceCountTwo: this.state.faceTargetDiceCountTwo,
			faceTargetDiceCountType: this.state.faceTargetDiceCountType.value,
			faceTargetValueOne: this.state.faceTargetValueOne,
			faceTargetValueTwo: this.state.faceTargetValueTwo,
			faceTargetValueType: this.state.faceTargetValueType.value
		};
		this.faceWorker.postMessage(message);
		this.setState({
			error: false,
			probability: "",
			probabilityText: "",
			calculating: true,
			calculationFinished: false
		});
	}

	calculateSumProbability() {
		const diceInput = this.state.diceInput;
		const diceArr = diceInput.split("+");
		const sumType = this.state.sumTargetValueType.value;
		let num1 = this.state.sumTargetValueOne;
		let num2 = this.state.sumTargetValueTwo;
		const diceCounts = this.state.diceCounts
			? Object.values(this.state.diceCounts)
			: [];
		const entries = Object.entries(this.state.diceCounts).map(item =>
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

		const totalDice = diceCounts.length
			? diceCounts.reduce((acc, curr) => acc + curr)
			: null;

		const minSum = totalDice ? totalDice : null;

		// Lazy fix, faster to just swap the numbers so the calculation can be run even though the numbers are reversed in the input fields
		if (num2 && num1 > num2) {
			[num1, num2] = [num2, num1];
		}
		console.log(diceCounts);
		console.log(num1);

		const potentialErrors = [
			{
				errorName: "Empty input",
				errorState: [(diceInput, num1, sumType)].some(value => !value),
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Empty num2 input",
				errorState:
					[
						"sumTargetValueBetween",
						"sumTargetValueNotBetween"
					].includes(sumType) && num2 === "",
				errorText: "Please fill in all the required fields"
			},
			{
				errorName: "Sum too large",
				errorState: [num1, num2].some(value => value > maxSum),
				errorText:
					"Sum cannot be greater than the maximum sum of the dice"
			},
			{
				errorName: "Sum too small",
				errorState: num1 < minSum,
				errorText: "Sum cannot be less than the minimum sum of the dice"
			}
		];
		// Of course if some inputs are empty and the sum is too large or small, only the empty input's error text will be visible, but I think this still works as empty input errors should be prioritized.
		if (potentialErrors.some(error => error.errorState)) {
			const errorIndex = potentialErrors.findIndex(
				error => error.errorState === true
			);

			const errorText = potentialErrors[errorIndex].errorText;

			this.setState({
				error: true,
				errorText: errorText
			});

			setTimeout(() => {
				this.setState({
					error: false,
					errorText: ""
				});
			}, 3000);

			return;
		}

		const message = {
			diceArr: diceArr,
			sumTargetValueType: sumType,
			sumTargetValueOne: num1,
			sumTargetValueTwo: num2,
			totalDice: totalDice
		};

		totalDice >= 200
			? this.setState({
					error: false,
					probabilityText: "",
					probability: "",
					calculating: true,
					calculationFinished: false
			  })
			: this.setState({
					error: false,
					probabilityText: "",
					probability: "",
					calculationFinished: false
			  });

		this.sumWorker.postMessage(message);
	}

	render() {
		return (
			<div className="probability-calculator-wrapper">
				<CalculationTypes
					handleSelectChange={this.handleCalculationTypeSelectChange}
					value={this.state.calculationType}
					calculationType={this.state.calculationType}
				/>
				<DiceImages
					callback={this.childComponentCallback}
					totalDice={this.state.totalDice}
					diceCounts={this.state.diceCounts}
				/>
				<div className="dice-input-wrapper">
					<p>with the dice</p>
					<DiceInput
						callback={this.childComponentCallback}
						inputValue={this.state.diceInput}
						name={"diceInput"}
						placeholder={
							"Enter dice here as addition (e.g. 2d6+1d8)..."
						}
						className={"dice-input"}
					/>

					{this.state.calculationType.value === "diceSums" && (
						<DiceSums
							callback={this.childComponentCallback}
							handleSelectChange={this.handleSelectChange}
							sumTargetValueOne={this.state.sumTargetValueOne}
							sumTargetValueTwo={this.state.sumTargetValueTwo}
							sumTargetValueType={this.state.sumTargetValueType}
							onClick={this.calculateSumProbability}
						/>
					)}

					{this.state.calculationType.value === "diceFaces" && (
						<DiceFaces
							callback={this.childComponentCallback}
							handleSelectChange={this.handleSelectChange}
							faceTargetDiceCountType={
								this.state.faceTargetDiceCountType
							}
							faceTargetDiceCountOne={
								this.state.faceTargetDiceCountOne
							}
							faceTargetDiceCountTwo={
								this.state.faceTargetDiceCountTwo
							}
							faceTargetValueType={this.state.faceTargetValueType}
							faceTargetValueOne={this.state.faceTargetValueOne}
							faceTargetValueTwo={this.state.faceTargetValueTwo}
							onClick={this.calculateFaceProbability}
						/>
					)}
				</div>
				<CSSTransition
					key="error"
					unmountOnExit
					timeout={500}
					classNames="error"
					in={this.state.error}
				>
					<div className="error-message">{this.state.errorText}</div>
				</CSSTransition>

				<CSSTransition
					key="loader"
					timeout={500}
					classNames="spin-loader"
					in={this.state.calculating}
				>
					<div className="loader">Calculating...</div>
				</CSSTransition>
				<CSSTransition
					key="output"
					unmountOnExit
					timeout={600}
					classNames="output"
					in={this.state.calculationFinished}
				>
					<div className="output-wrapper">
						<div className="output-text">
							{this.state.probabilityText}
						</div>
						<div className="probability-value">
							{this.state.probability}
						</div>
					</div>
				</CSSTransition>
			</div>
		);
	}
}

export default App;
