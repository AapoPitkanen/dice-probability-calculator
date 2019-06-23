import React, { Component } from "react";

class NumberInput extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		let inputValue = event.target.value;
		inputValue !== "" && (inputValue = parseInt(inputValue));
		let inputName = event.target.name;
		this.props.callback(inputValue, inputName);
	}

	render() {
		return (
			<input
				type="number"
				min={this.props.min}
				className={this.props.className}
				name={this.props.name}
				value={this.props.inputValue}
				onChange={this.handleChange}
				placeholder={this.props.placeholder}
			/>
		);
	}
}

export default NumberInput;
