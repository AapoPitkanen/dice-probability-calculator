import React, { Component } from "react";
import Select from "react-select";
import NumberInput from "./NumberInput";

export class DiceSums extends Component {
	render() {
		const sumTargetValueOptions = [
			{ value: "sumTargetValueExactly", label: "is exactly" },
			{ value: "sumTargetValueAtLeast", label: "is at least" },
			{ value: "sumTargetValueAtMost", label: "is at most" },
			{ value: "sumTargetValueBetween", label: "is between" },
			{ value: "sumTargetValueNotBetween", label: "is not between" }
		];

		return (
			<div className="dice-sums-input-wrapper">
				<p>where the sum of the dice</p>
				<div className="dice-sums-target-wrapper">
					<Select
						name="sumTargetValueType"
						onChange={this.props.handleSelectChange}
						value={this.props.sumTargetValueType}
						className="select-sum-target select-input"
						options={sumTargetValueOptions}
					/>
					<NumberInput
						min={"1"}
						callback={this.props.callback}
						inputValue={this.props.sumTargetValueOne}
						name={"sumTargetValueOne"}
						className={"number-input"}
					/>
					{(this.props.sumTargetValueType.value ===
						"sumTargetValueBetween" ||
						this.props.sumTargetValueType.value ===
							"sumTargetValueNotBetween") && (
						<React.Fragment>
							<p>and</p>
							<NumberInput
								min={"1"}
								callback={this.props.callback}
								inputValue={this.props.sumTargetValueTwo}
								name={"sumTargetValueTwo"}
								className={"number-input"}
							/>
						</React.Fragment>
					)}
				</div>
				<button
					onClick={this.props.onClick}
					className="calculate-sums-button"
				>
					Calculate!
				</button>
			</div>
		);
	}
}

export default DiceSums;
