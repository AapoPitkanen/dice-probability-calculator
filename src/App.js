import React, { Component } from "react";
import "./App.css";
import DiceInput from "./components/DiceInput";
import NumberInput from "./components/NumberInput";
import Select from "react-select";
import diceLib from "./components/diceLib";
import d4 from "./img/d4-small.png";
import d6 from "./img/d6-small.png";
import d8 from "./img/d8-small.png";
import d10 from "./img/d10-small.png";
import d12 from "./img/d12-small.png";
import d20 from "./img/d20-small.png";
import sumWorker from "./sum.worker";
import faceWorker from "./face.worker";
import {
	CSSTransition,
	TransitionGroup
} from "../node_modules/react-transition-group";

class App extends Component {
	constructor(props) {
		super(props);
		this.calculateSumProbability = this.calculateSumProbability.bind(this);
		this.calculateFaceProbability = this.calculateFaceProbability.bind(this);
		this.inputCallback = this.inputCallback.bind(this);
		this.handleSelectChange = this.handleSelectChange.bind(this);
		this.handleClickDiceImage = this.handleClickDiceImage.bind(this);
		this.handleCalculationTypeSelectChange = this.handleCalculationTypeSelectChange.bind(
			this
		);

		this.state = {
			calculating: false,
			calculationFinished: false,
			calculationType: { value: "diceSums", label: "Dice sums" },
			data: {},
			diceCounts: {},
			diceInput: "",
			error: false,
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
		let selectName = actionMeta.name;
		this.setState({
			[selectName]: newValue
		});
	}

	handleCalculationTypeSelectChange(newValue, actionMeta) {
		let selectName = actionMeta.name;
		this.setState({
			[selectName]: newValue,
			probabilityText: "",
			probability: ""
		});
	}

	handleClickDiceImage(event) {
		if (event.target.dataset.diceType) {
			let diceType = event.target.dataset.diceType;
			let diceObj = { ...this.state.diceCounts };
			diceObj[diceType] =
				diceObj[diceType] === undefined ? 1 : diceObj[diceType] + 1;
			let diceArr = diceLib.diceObjToArray(diceObj).join("+");
			this.setState({
				diceCounts: diceObj,
				diceInput: diceArr,
				totalDice: this.state.totalDice + 1
			});
		}
	}

	inputCallback(childData, childName) {
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

		if (
			sumType === "sumTargetValueNotBetween" ||
			sumType === "sumTargetValueBetween"
		) {
			if ([diceInput, num1, num2].some(value => value === "")) {
				console.log("parameters missing");
				this.setState({
					error: true
				});
				setTimeout(() => {
					this.setState({
						error: false
					});
				}, 3000);
				return;
			}
		} else if (
			[diceInput, sumType, num1].some(
				value => value === "" || value === undefined
			)
		) {
			this.setState({
				error: true
			});
			setTimeout(() => {
				this.setState({
					error: false
				});
			}, 5000);
			console.log("parameters missing");
			return;
		}

		const diceCounts = Object.values(this.state.diceCounts);
		const entries = Object.entries(this.state.diceCounts).map(item =>
			item.map(el => (typeof el === "string" ? parseInt(el.slice(1)) : el))
		);
		const maxSum = entries.reduce(
			(acc, curr) => acc + curr.reduce((acc, curr) => acc * curr),
			0
		);
		const totalDice = diceCounts.reduce((acc, curr) => acc + curr);
		const diceList = diceLib.splitDice(
			diceLib.diceObjToArray(this.state.diceCounts)
		);

		if (num2 && num1 > num2) {
			[num1, num2] = [num2, num1];
		}

		if ([num1, num2].some(value => value > maxSum)) {
			console.log("Sum cannot be larger than maximum sum of dice");
			return;
		}

		const message = {
			diceArr: diceArr,
			diceList: diceList,
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
		const calculationTypeOptions = [
			{ value: "diceSums", label: "Dice sums" },
			{ value: "diceFaces", label: "Dice face values" }
		];

		const sumTargetValueOptions = [
			{ value: "sumTargetValueExactly", label: "is exactly" },
			{ value: "sumTargetValueAtLeast", label: "is at least" },
			{ value: "sumTargetValueAtMost", label: "is at most" },
			{ value: "sumTargetValueBetween", label: "is between" },
			{ value: "sumTargetValueNotBetween", label: "is not between" }
		];

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
			{ value: "faceTargetDiceCountNotBetween", label: "outside of range" }
		];

		return (
			<div className="probability-calculator-wrapper">
				<h2>Dice probability calculator</h2>

				<p>
					Here you can calculate the probability of getting specific sums with
					different kinds of dice, such as d4, d6, d8, d10 etc. Non-standard
					dice (such as d5 and d7) are also supported. To use this application,
					enter your desired comparison value and the dice which are used to
					calculate the sums.
				</p>

				<p>I want to calculate</p>
				<Select
					name="calculationType"
					onChange={this.handleCalculationTypeSelectChange}
					value={this.state.calculationType}
					className="select-calculation-type select-input"
					options={calculationTypeOptions}
				/>

				<div className="dice-image-wrapper" onClick={this.handleClickDiceImage}>
					<img
						src={d4}
						alt="d4 dice"
						className="dice-image"
						data-dice-type="d4"
					/>
					<img
						src={d6}
						alt="d6 dice"
						className="dice-image"
						data-dice-type="d6"
					/>
					<img
						src={d8}
						alt="d8 dice"
						className="dice-image"
						data-dice-type="d8"
					/>
					<img
						src={d10}
						alt="d10 dice"
						className="dice-image"
						data-dice-type="d10"
					/>
					<img
						src={d12}
						alt="d12 dice"
						className="dice-image"
						data-dice-type="d12"
					/>
					<img
						src={d20}
						alt="d20 dice"
						className="dice-image"
						data-dice-type="d20"
					/>
				</div>
				<div className="dice-input-wrapper">
					<p>with the dice</p>
					<DiceInput
						callback={this.inputCallback}
						inputValue={this.state.diceInput}
						name={"diceInput"}
						placeholder={"Enter dice here as addition (e.g. 2d6+1d8)..."}
						className={"dice-input"}
					/>

					{this.state.calculationType.value === "diceSums" && (
						<div className="dice-sums-input-wrapper" ref="sums">
							<p>where the sum of the dice</p>
							<div className="dice-sums-target-wrapper">
								<Select
									name="sumTargetValueType"
									onChange={this.handleSelectChange}
									value={this.state.sumTargetValueType}
									className="select-sum-target select-input"
									options={sumTargetValueOptions}
								/>
								<NumberInput
									callback={this.inputCallback}
									inputValue={this.state.sumTargetValueOne}
									name={"sumTargetValueOne"}
									className={"number-input"}
								/>
								{(this.state.sumTargetValueType.value ===
									"sumTargetValueBetween" ||
									this.state.sumTargetValueType.value ===
										"sumTargetValueNotBetween") && (
									<React.Fragment>
										<p>and</p>
										<NumberInput
											callback={this.inputCallback}
											inputValue={this.state.sumTargetValueTwo}
											name={"sumTargetValueTwo"}
											className={"number-input"}
										/>
									</React.Fragment>
								)}
							</div>
						</div>
					)}

					{this.state.calculationType.value === "diceFaces" && (
						<div className="dice-faces-input-wrapper" ref="faces">
							<p>and I want to roll</p>
							<div className="face-target-count-wrapper">
								<Select
									name="faceTargetDiceCountType"
									onChange={this.handleSelectChange}
									value={this.state.faceTargetDiceCountType}
									className="select-face-target-count select-input"
									options={faceTargetDiceCountOptions}
								/>
								<NumberInput
									callback={this.inputCallback}
									inputValue={this.state.faceTargetDiceCountOne}
									name={"faceTargetDiceCountOne"}
									className="number-input count-input"
								/>
								{(this.state.faceTargetDiceCountType.value ===
									"faceTargetDiceCountBetween" ||
									this.state.faceTargetDiceCountType.value ===
										"faceTargetDiceCountNotBetween") && (
									<React.Fragment>
										<p>and</p>
										<NumberInput
											callback={this.inputCallback}
											inputValue={this.state.faceTargetDiceCountTwo}
											name={"faceTargetDiceCountTwo"}
											className="number-input count-input"
										/>
									</React.Fragment>
								)}
								<p className="face-target-count-name">dice</p>
							</div>
							<p>where the face value</p>
							<div className="dice-faces-target-wrapper">
								<Select
									name="faceTargetValueType"
									onChange={this.handleSelectChange}
									value={this.state.faceTargetValueType}
									className="select-face-target select-input"
									options={faceTargetValueOptions}
								/>
								<NumberInput
									callback={this.inputCallback}
									inputValue={this.state.faceTargetValueOne}
									name={"faceTargetValueOne"}
									className={"number-input"}
								/>
								{(this.state.faceTargetValueType.value ===
									"faceTargetValueBetween" ||
									this.state.faceTargetValueType.value ===
										"faceTargetValueNotBetween") && (
									<React.Fragment>
										<p>and</p>
										<NumberInput
											callback={this.inputCallback}
											inputValue={this.state.faceTargetValueTwo}
											name={"faceTargetValueTwo"}
											className={"number-input"}
										/>
									</React.Fragment>
								)}
							</div>
						</div>
					)}
				</div>
				{this.state.calculationType.value === "diceSums" && (
					<button
						onClick={this.calculateSumProbability}
						className="calculate-sums-button"
					>
						Calculate!
					</button>
				)}

				{this.state.calculationType.value === "diceFaces" && (
					<button
						onClick={this.calculateFaceProbability}
						className="calculate-faces-button"
					>
						Calculate!
					</button>
				)}

				<CSSTransition
					key="error"
					unmountOnExit
					timeout={500}
					classNames="error"
					in={this.state.error}
				>
					<div className="error-message">
						Please fill in all the required fields
					</div>
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
						<div className="outputText">{this.state.probabilityText}</div>
						<div className="probabilityValue">{this.state.probability}</div>
					</div>
				</CSSTransition>
			</div>
		);
	}
}

export default App;
