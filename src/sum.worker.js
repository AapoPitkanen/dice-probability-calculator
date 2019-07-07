import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const diceArr = e.data.diceArr;
	const sumTargetValueOne = e.data.sumTargetValueOne;
	const sumTargetValueTwo = e.data.sumTargetValueTwo;
	const sumTargetValueType = e.data.sumTargetValueType;
	const polyDice = diceLib
		.splitDice(diceArr)
		.map(dice => diceLib.createDicePolynomial(dice));

	const expectedValue = diceArr
		.map(dice => {
			const diceCount = parseInt(dice.slice(0, dice.indexOf("d")));
			const sides = parseInt(dice.slice(dice.indexOf("d") + 1));
			return diceLib.expectedSum(diceCount, sides);
		})
		.reduce((acc, cur) => acc + cur);

	const distribution = diceLib.createSumDistribution(polyDice).coeff;
	const sums = Object.keys(distribution).map(sum => parseInt(sum));
	const probabilities = Object.values(distribution);

	/*
	const sumDistribution = {
		sums: sums,
		probabilities: probabilities
	};
	*/

	const sumDistribution = sums.map((sum, index) => {
		return { sum: sum, probability: (probabilities[index] * 100).toFixed(2) };
	});

	const filteredDistribution =
		sumTargetValueType === "sumTargetValueAtLeast"
			? sumDistribution.filter(obj => obj.sum >= sumTargetValueOne)
			: sumTargetValueType === "sumTargetValueAtMost"
			? sumDistribution.filter(obj => obj.sum <= sumTargetValueOne)
			: sumTargetValueType === "sumTargetValueBetween"
			? sumDistribution.filter(
					obj => obj.sum >= sumTargetValueOne || obj.sum <= sumTargetValueTwo
			  )
			: sumDistribution.filter(
					obj => obj.sum < sumTargetValueOne || obj.sum > sumTargetValueTwo
			  );

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
		probabilityValue: probabilityValue,
		sumDistribution: filteredDistribution
	};

	self.postMessage(message);
});
