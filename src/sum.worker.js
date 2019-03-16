import diceLib from "./components/diceLib";
import Polynomial from "polynomial";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const data = e.data;
	let targetType;
	let output;
	let probabilityValue;

	const createDicePolynomial = dice => {
		let polyDiceArr = [];
		for (let i = 0, l = dice.length; i < l; i++) {
			for (let j = 0; j < parseInt(dice[i].slice(0, dice[i].indexOf("d"))); j++) {
				let polyStr = "";
				for (let k = 0; k < parseInt(dice[i].slice(dice[i].indexOf("d") + 1)); k++) {
					polyStr === ""
						? (polyStr += `1/${dice[i].slice(dice[i].indexOf("d") + 1)}x^${k + 1}`)
						: (polyStr += `+1/${dice[i].slice(dice[i].indexOf("d") + 1)}x^${k + 1}`);
				}
				polyDiceArr.push(new Polynomial(polyStr));
			}
		}
		return polyDiceArr;
	};
	console.time('probability');
	const polyDice = createDicePolynomial(data.diceList);
	switch (data.sumTargetValueType) {
		case "sumTargetValueExactly":
			targetType = "exactly";
			output = `The probability of rolling ${targetType} ${
				data.sumTargetValueOne
				} with the dice ${data.diceList.join(", ")} is`;
			probabilityValue = (
				diceLib.diceSumExactly(data.sumTargetValueOne, polyDice) * 100
			).toFixed(2);
			break;
		case "sumTargetValueAtLeast":
			targetType = "at least";
			output = `The probability of rolling ${targetType} ${
				data.sumTargetValueOne
				} with the dice ${data.diceList.join(", ")} is`;
			probabilityValue = (
				diceLib.diceSumAtLeast(data.sumTargetValueOne, polyDice) * 100
			).toFixed(2);
			break;
		case "sumTargetValueAtMost":
			targetType = "at most";
			output = `The probability of rolling ${targetType} ${
				data.sumTargetValueOne
				} with the dice ${data.diceList.join(", ")} is`;
			probabilityValue = (
				diceLib.diceSumAtMost(data.sumTargetValueOne, polyDice) * 100
			).toFixed(2);
			break;
		case "sumTargetValueBetween":
			targetType = "between";
			output = `The probability of rolling ${targetType} ${data.sumTargetValueOne} and ${
				data.sumTargetValueTwo
				} with the dice ${data.diceList.join(", ")} is`;
			probabilityValue = (
				diceLib.diceSumBetween(data.sumTargetValueOne, data.sumTargetValueTwo, polyDice) *
				100
			).toFixed(2);
			break;
		case "sumTargetValueNotBetween":
			targetType = "between";
			output = `The probability of not rolling ${targetType} ${data.sumTargetValueOne} and ${
				data.sumTargetValueTwo
				} with the dice ${data.diceList.join(", ")} is`;
			probabilityValue = (
				diceLib.diceSumNotBetween(
					data.sumTargetValueOne,
					data.sumTargetValueTwo,
					polyDice
				) * 100
			).toFixed(2);
			break;
		default:
	}
	console.timeEnd('probability');
	const message = {
		output: output,
		probabilityValue: probabilityValue
	};

	self.postMessage(message);
});
