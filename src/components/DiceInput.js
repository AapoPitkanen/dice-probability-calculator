import React, { Component } from "react";
import diceLib from "./diceLib";

class DiceInput extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	handleChange(event) {
		let inputValue = event.target.value;
		let inputName = event.target.name;
		this.props.callback(inputValue, inputName);
	}

	handleBlur(event) {
		let regex1 = /[^d^+^\d]/gi;
		let regex2 = /(\+){2,}/g;
		let regex3 = /(\+)$/g;
		let regex4 = /(d){2,}/;
		let regexArr = [regex1, regex2, regex3, regex4];
		let replaceValues = ["", "+", "", "d"];
		let inputValue = event.target.value;
		let inputName = event.target.name;

		regexArr.forEach((x, i) => {
			inputValue = inputValue.replace(x, replaceValues[i]);
		});

		inputValue = inputValue.split("+");
		inputValue = diceLib.sortDiceInput(inputValue);
		inputValue = inputValue.join("+");

		this.props.callback(inputValue, inputName);
	}

	render() {
		return (
			<input
				type="text"
				className={this.props.className}
				name={this.props.name}
				value={this.props.inputValue}
				onChange={this.handleChange}
				onBlur={this.handleBlur}
				placeholder={this.props.placeholder}
			/>
		);
	}
}

export default DiceInput;
