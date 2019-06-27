import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const diceArr = e.data.diceArr;
	const sumTargetValueOne = e.data.sumTargetValueOne;
	const sumTargetValueTwo = e.data.sumTargetValueTwo;
	const sumTargetValueType = e.data.sumTargetValueType;
	const splitDice = diceLib.splitDice(diceArr);
	const polyDice = splitDice.map(dice => diceLib.createDicePolynomial(dice));

	const expectedValue = diceArr
		.map(dice => {
			const diceCount = parseInt(dice.slice(0, dice.indexOf("d")));
			const sides = parseInt(dice.slice(dice.indexOf("d") + 1));
			return diceLib.expectedSum(diceCount, sides);
		})
		.reduce((acc, curr) => acc + curr);

	const textOptions = {
		sumTargetValueExactly: `The probability of rolling exactly ${sumTargetValueOne} with the dice ${diceArr.join(
			", "
		)} is `,
		sumTargetValueAtLeast: `The probability of rolling at least ${sumTargetValueOne} with the dice ${diceArr.join(
			", "
		)} is `,
		sumTargetValueAtMost: `The probability of rolling at most ${sumTargetValueOne} with the dice ${diceArr.join(
			", "
		)} is `,
		sumTargetValueBetween: `The probability of rolling between ${sumTargetValueOne} and ${sumTargetValueTwo} with the dice ${diceArr.join(
			", "
		)} is `,
		sumTargetValueNotBetween: `The probability of not rolling between ${sumTargetValueOne} and ${sumTargetValueTwo} with the dice ${diceArr.join(
			", "
		)} is `
	};

	const probabilityValue = (
		diceLib.calculateDiceSumProbability(
			polyDice,
			sumTargetValueOne,
			sumTargetValueTwo,
			sumTargetValueType
		) * 100
	).toFixed(2);

	const probabilityText = textOptions[sumTargetValueType];

	console.log(expectedValue);

	const message = {
		probabilityText: probabilityText,
		probabilityValue: probabilityValue
	};

	self.postMessage(message);
});
