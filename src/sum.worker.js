import diceLib from "./components/diceLib";
import Polynomial from "polynomial";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const data = e.data;
	let targetType;
	let output;
	let probabilityValue;
	let message;

	const polyDice = data.diceList.map(dice => diceLib.createDicePolynomial(dice));
	
	const calculationTypes = {
		sumTargetValueExactly(polyDice, sumTargetValueOne) {
			const probabilityValue = diceLib.diceSumExactly(polyDice, sumTargetValueOne);
			message = {
				output: `The probability of rolling exactly ${sumTargetValueOne} with the dice `,
				probabilityValue: probabilityValue,
			}
		},
		sumTargetValueAtLeast(sumTargetValueOne, polyDice) {
		},
		sumTargetValueAtMost(sumTargetValueOne, polyDice) {
		},
		sumTargetValueBetween(sumTargetValueOne, sumTargetValueTwo, polyDice) {
		},
		sumTargetValueNotBetween(sumTargetValueOne, sumTargetValueTwo, polyDice) {
		}
	}

	//options[data.sumTargetValueType](data.sumTargetValueOne, data.sumTargetValueTwo, polyDice)

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
	const message = {
		output: output,
		probabilityValue: probabilityValue
	};

	self.postMessage(message);
});
