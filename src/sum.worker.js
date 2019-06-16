import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {

	const data = e.data;
	const polyDice = data.diceList.map(dice => diceLib.createDicePolynomial(dice));
	let probabilityText;
	let probabilityValue;

	const calculationTypes = {
		sumTargetValueExactly(polyDice, sumTargetValueOne) {
			probabilityValue = (diceLib.diceSumExactly(polyDice, sumTargetValueOne) * 100).toFixed(2);
			probabilityText = `The probability of rolling exactly ${sumTargetValueOne} with the dice ${data.diceArr.join(', ')} is`
		},
		sumTargetValueAtLeast(polyDice, sumTargetValueOne) {
			probabilityValue = (diceLib.diceSumAtLeast(polyDice, sumTargetValueOne) * 100).toFixed(2);
			probabilityText = `The probability of rolling at least ${sumTargetValueOne} with the dice ${data.diceArr.join(', ')} is`
		},
		sumTargetValueAtMost(polyDice, sumTargetValueOne) {
			probabilityValue = (diceLib.diceSumAtMost(polyDice, sumTargetValueOne) * 100).toFixed(2);
			probabilityText = `The probability of rolling at most ${sumTargetValueOne} with the dice ${data.diceArr.join(', ')} is`
		},
		sumTargetValueBetween(polyDice, sumTargetValueOne, sumTargetValueTwo) {
			probabilityValue = (diceLib.diceSumBetween(polyDice, sumTargetValueOne, sumTargetValueTwo) * 100).toFixed(2);
			probabilityText = `The probability of rolling between ${sumTargetValueOne} and ${sumTargetValueTwo} with the dice ${data.diceArr.join(', ')} is`
		},
		sumTargetValueNotBetween(polyDice, sumTargetValueOne, sumTargetValueTwo) {
			probabilityValue = (diceLib.diceSumNotBetween(polyDice, sumTargetValueOne, sumTargetValueTwo) * 100).toFixed(2);
			probabilityText = `The probability of not rolling between ${sumTargetValueOne} and ${sumTargetValueTwo} with the dice ${data.diceArr.join(', ')} is`
		}
	}

	calculationTypes[data.sumTargetValueType](polyDice, data.sumTargetValueOne, data.sumTargetValueTwo)

	const message = {
		probabilityText: probabilityText,
		probabilityValue: probabilityValue
	}

	self.postMessage(message);
});
