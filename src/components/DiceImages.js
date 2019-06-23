import React, { Component } from "react";
import d4 from "../img/d4-small.png";
import d6 from "../img/d6-small.png";
import d8 from "../img/d8-small.png";
import d10 from "../img/d10-small.png";
import d12 from "../img/d12-small.png";
import d20 from "../img/d20-small.png";
import diceLib from "./diceLib";

export class DiceImages extends Component {
	constructor(props) {
		super(props);
		this.handleClickDiceImage = this.handleClickDiceImage.bind(this);
	}

	handleClickDiceImage(event) {
		if (event.target.dataset.diceType) {
			const diceType = event.target.dataset.diceType;
			const diceObj = { ...this.props.diceCounts };
			diceObj[diceType] =
				diceObj[diceType] === undefined ? 1 : diceObj[diceType] + 1;
			const diceArr = diceLib.diceObjToArray(diceObj).join("+");
			this.props.callback(diceObj, "diceCounts");
			this.props.callback(diceArr, "diceInput");
			this.props.callback(this.props.totalDice + 1, "totalDice");
		}
	}
	render() {
		return (
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
		);
	}
}

export default DiceImages;
