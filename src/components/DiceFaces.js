import React, { Component } from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";

export class DiceFaces extends Component {
	render() {
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
			{
				value: "faceTargetDiceCountNotBetween",
				label: "outside of range"
			}
		];

		return (
			<div className="dice-faces-input-wrapper" ref="faces">
				<p>and I want to roll</p>
				<div className="face-target-count-wrapper">
					<Select
						name="faceTargetDiceCountType"
						onChange={this.props.handleSelectChange}
						value={this.props.faceTargetDiceCountType}
						className="select-face-target-count select-input"
						options={faceTargetDiceCountOptions}
					/>
					<NumberInput
						min={"0"}
						callback={this.props.callback}
						inputValue={this.props.faceTargetDiceCountOne}
						name={"faceTargetDiceCountOne"}
						className="number-input count-input"
					/>
					{(this.props.faceTargetDiceCountType.value ===
						"faceTargetDiceCountBetween" ||
						this.props.faceTargetDiceCountType.value ===
							"faceTargetDiceCountNotBetween") && (
						<React.Fragment>
							<p>and</p>
							<NumberInput
								min={"1"}
								callback={this.props.callback}
								inputValue={this.props.faceTargetDiceCountTwo}
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
						onChange={this.props.handleSelectChange}
						value={this.props.faceTargetValueType}
						className="select-face-target select-input"
						options={faceTargetValueOptions}
					/>
					<NumberInput
						min={"1"}
						callback={this.props.callback}
						inputValue={this.props.faceTargetValueOne}
						name={"faceTargetValueOne"}
						className={"number-input"}
					/>
					{(this.props.faceTargetValueType.value ===
						"faceTargetValueBetween" ||
						this.props.faceTargetValueType.value ===
							"faceTargetValueNotBetween") && (
						<React.Fragment>
							<p>and</p>
							<NumberInput
								min={"1"}
								callback={this.props.callback}
								inputValue={this.props.faceTargetValueTwo}
								name={"faceTargetValueTwo"}
								className={"number-input"}
							/>
						</React.Fragment>
					)}
				</div>
				<button
					onClick={this.props.onClick}
					className="calculate-faces-button"
				>
					Calculate!
				</button>
			</div>
		);
	}
}

export default DiceFaces;
