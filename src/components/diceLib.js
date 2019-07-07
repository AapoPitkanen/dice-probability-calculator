import Polynomial from "polynomial";
import math from "mathjs";
import _ from "lodash";

const diceLib = {
	// Not written by me, found on math.stackexchange.com for finding only the n-sized unique combinations from a specific set
	UniqueCombinations(set, n) {
		let combinations = [];
		let props = Object.getOwnPropertyNames(set);
		for (let p = 0, l = props.length; p < l; p++) {
			for (let i = Math.min(set[props[p]], n); i > 0; i--) {
				if (n - i > 0) {
					let rest = this.UniqueCombinations(
						_.pick(set, props.slice(p + 1)),
						n - i
					);
					for (let c = 0; c < rest.length; c++) {
						let combination = {};
						if (i > 0) combination[props[p]] = i;
						Object.assign(combination, rest[c]);
						combinations.push(combination);
					}
				} else {
					let combination = {};
					combination[props[p]] = i;
					combinations.push(combination);
				}
			}
		}
		return combinations;
	},

	/* This function sorts the input dice to check all possible unique ways to roll the specified successes with the dice. 
    After sorting the dice, the binomial distributions can be calculated from the dice combinations. */
	sortUniqueDiceCombinations(
		target,
		successes,
		diceArr,
		targetType,
		target2
	) {
		const sortedDiceArr = [];
		const diceTypes = diceArr.map(dice => dice.slice(dice.indexOf("d")));
		const isAtLeastExactlyBetween = [
			"faceTargetValueAtLeast",
			"faceTargetValueExactly",
			"faceTargetValueBetween"
		].includes(targetType);
		let diceKeys;
		let diceValues;
		let filteredArr;
		/* Return zeroes for each dice if the user specifies 0 successes rolled or if the target cannot be rolled with any of the dice (when calculating "exactly" or "at least" probabilities).
        The only combination then is that none of the dice roll a success */
		if (
			successes === 0 ||
			(isAtLeastExactlyBetween &&
				diceArr.every(
					dice => parseInt(dice.slice(dice.indexOf("d") + 1)) < target
				))
		) {
			let tempArr = [];
			diceArr.forEach(dice => {
				tempArr.push(`0${dice.slice(dice.indexOf("d"))}`);
			});
			sortedDiceArr.push(tempArr);
			return sortedDiceArr;
		}

		/* Before creating the combinations it's sometimes needed to filter out some dice from the input, depending on what the face target values are.
		For example, if you're calculating probabilities where the face target has to be exactly 7, all d6 dice have to be filtered out before creating
		the combinations (as a d6 can never roll a 7). 
		*/

		if (targetType === "faceTargetValueNotBetween" && target === 1) {
			filteredArr = diceArr.filter(
				dice => parseInt(dice.slice(dice.indexOf("d") + 1)) > target2
			);
		}

		if (isAtLeastExactlyBetween) {
			filteredArr = diceArr.filter(
				dice => parseInt(dice.slice(dice.indexOf("d") + 1)) >= target
			);

			diceKeys =
				diceArr.every(dice =>
					parseInt(dice.slice(dice.indexOf("d") + 1))
				) >= target
					? diceArr.map(dice => dice.slice(dice.indexOf("d")))
					: filteredArr.map(dice => dice.slice(dice.indexOf("d")));

			diceValues =
				diceArr.every(dice =>
					parseInt(dice.slice(dice.indexOf("d") + 1))
				) >= target
					? diceArr.map(dice =>
							parseInt(dice.slice(0, dice.indexOf("d")))
					  )
					: filteredArr.map(dice =>
							parseInt(dice.slice(0, dice.indexOf("d")))
					  );
		}

		if (targetType === "faceTargetValueAtMost") {
			diceKeys = diceArr.map(dice => dice.slice(dice.indexOf("d")));
			diceValues = diceArr.map(dice =>
				parseInt(dice.slice(0, dice.indexOf("d")))
			);
		}

		if (targetType === "faceTargetValueNotBetween") {
			diceKeys =
				target === 1
					? filteredArr.map(dice => dice.slice(dice.indexOf("d")))
					: diceArr.map(dice => dice.slice(dice.indexOf("d")));
			diceValues =
				target === 1
					? filteredArr.map(dice =>
							parseInt(dice.slice(0, dice.indexOf("d")))
					  )
					: diceArr.map(dice =>
							parseInt(dice.slice(0, dice.indexOf("d")))
					  );
		}

		const diceObj = _.zipObject(diceKeys, diceValues);

		const sortedDiceObjArr = this.UniqueCombinations(diceObj, successes);

		sortedDiceObjArr.forEach(dice => {
			const diceCounts = Object.values(dice);
			const keys = Object.keys(dice);
			const singularDiceCounts = [];
			const diceCombination = [];
			keys.forEach((dice, i) => {
				for (let j = 0; j < diceCounts[i]; j++) {
					singularDiceCounts.push(dice);
				}
			});
			diceTypes.forEach(dice => {
				diceCombination.push(this.countDice(dice, singularDiceCounts));
			});
			sortedDiceArr.push(diceCombination);
		});
		/* When calculating "target at most" probabilties, we'll have to filter out the combinations
		that do not contain the mandatory number of successes (in the specific case that some dice will always roll a success) */
		if (targetType === "faceTargetValueAtMost") {
			const mandatorySuccesses = diceArr.filter(
				dice => parseInt(dice.slice(dice.indexOf("d") + 1)) < target
			);
			const filteredSortedDiceArr = sortedDiceArr.filter(dice =>
				this.findElements(dice, mandatorySuccesses)
			);
			return filteredSortedDiceArr;
		}
		console.log(sortedDiceArr);
		return sortedDiceArr;
	},

	// Counts duplicate dice and adds them together, returning a sorted array of dice e.g. [1d6, 1d6, 2d8, 1d4, 1d6] => [3d6, 2d8, 1d4]
	sortDiceInput(dice) {
		dice = this.splitDice(dice);
		let diceTypes = [];
		let sortedDice = [];

		dice.forEach(
			el =>
				diceTypes.indexOf(el.slice(el.indexOf("d"))) < 0 &&
				diceTypes.push(el)
		);
		diceTypes.forEach(el =>
			sortedDice.push(this.countDice(el.slice(el.indexOf("d")), dice))
		);
		return sortedDice;
	},

	// Splits an array of multiple dice to an array containing the respective singular dice e.g. ["2d6", "1d8"] => ["d6", "d6", "d8"]
	splitDice(diceArr) {
		return diceArr
			.map(dice => {
				const diceCount = parseInt(dice.slice(0, dice.indexOf("d")));
				const diceType = dice.slice(dice.indexOf("d"));
				return Array(diceCount).fill(diceType);
			})
			.flat();
	},

	countDice(diceType, dice) {
		return `${
			dice.filter(singleDice => singleDice === diceType).length
		}${diceType}`;
	},

	createDiceObject(dice) {
		dice = this.splitDice(dice);
		const diceObj = {};
		dice.forEach(el => (diceObj[el] = (diceObj[el] || 0) + 1));
		return diceObj;
	},

	// Helper function to create a polynomial from a single dice e.g. d6 => 1/6x^1+1/6x^2+1/6x^3+1/6x^4+1/6x^5+1/6x^6
	createDicePolynomial(dice) {
		let polyStr = "";
		const sides = parseInt(dice.slice(dice.indexOf("d") + 1));
		for (let exponent = 1; exponent <= sides; exponent++) {
			polyStr += `+1/${sides}x^${exponent}`;
		}
		// Won't be a proper polynomial if the first character is a +-sign :-)
		return new Polynomial(polyStr.replace("+", ""));
	},

	diceObjToArray(diceObj) {
		let entries = Object.entries(diceObj);
		return entries.map(el => el.reduce((acc, curr) => `${curr}${acc}`));
	},

	/* Helper function for filtering dice when calculating "at most" probabilities, if the target value 
	exceeds the sides, the dice must always roll a success. We can use this to filter out the dice combinations
	that do not contain the right amount of successes */
	findElements(array, targetArray) {
		return targetArray.every(element => array.includes(element));
	},

	// Used to calculate expected values
	triangularNumber(num) {
		return num === 0 ? 0 : num + this.triangularNumber(num - 1);
	},

	expectedSum(diceCount, sides) {
		const expectedValue = this.triangularNumber(sides) / sides;
		return diceCount * expectedValue;
	},

	calculateBinomialProbability(
		target,
		successes,
		dice,
		target2 = 0,
		successes2 = 0,
		successType,
		targetType
	) {
		let totalProbability = 0;
		let currentProbability = 1;

		const sortedArr = this.sortUniqueDiceCombinations(
			target,
			successes,
			dice,
			targetType,
			target2
		);

		sortedArr.forEach(diceArr => {
			diceArr.forEach((singleDice, i) => {
				const originalDice = dice[i];
				const diceCount = parseInt(
					originalDice.slice(0, originalDice.indexOf("d"))
				);
				const sides = parseInt(
					singleDice.slice(singleDice.indexOf("d") + 1)
				);
				const diceSuccessCount = parseInt(
					singleDice.slice(0, singleDice.indexOf("d"))
				);
				currentProbability *=
					targetType === "faceTargetValueExactly"
						? this.binomialDiceTargetExactly(
								target,
								sides,
								diceCount,
								diceSuccessCount
						  )
						: targetType === "faceTargetValueAtLeast"
						? this.binomialDiceTargetAtLeast(
								target,
								sides,
								diceCount,
								diceSuccessCount
						  )
						: targetType === "faceTargetValueAtMost"
						? this.binomialDiceTargetAtMost(
								target,
								sides,
								diceCount,
								diceSuccessCount
						  )
						: targetType === "faceTargetValueBetween"
						? this.binomialDiceTargetBetween(
								target,
								sides,
								diceCount,
								diceSuccessCount,
								target2
						  )
						: this.binomialDiceTargetNotBetween(
								target,
								sides,
								diceCount,
								diceSuccessCount,
								target2
						  );
			});
			totalProbability += currentProbability;
			currentProbability = 1;
		});

		if (successType === "faceTargetDiceCountExactly") {
			return totalProbability;
		}

		if (successType === "faceTargetDiceCountAtLeast") {
			const maxSuccesses = dice
				.filter(dice => {
					let sides = parseInt(dice.slice(dice.indexOf("d") + 1));
					return sides >= target;
				})
				.map(dice => parseInt(dice.slice(0, dice.indexOf("d"))))
				.reduce((acc, curr) => acc + curr, 0);

			if (maxSuccesses === 0) {
				return 0;
			}

			return successes === maxSuccesses
				? totalProbability
				: (totalProbability += this.calculateBinomialProbability(
						target,
						successes + 1,
						dice,
						target2,
						successes2,
						successType,
						targetType
				  ));
		}

		if (successType === "faceTargetDiceCountAtMost") {
			return successes === 0
				? totalProbability
				: (totalProbability += this.calculateBinomialProbability(
						target,
						successes - 1,
						dice,
						target2,
						successes2,
						successType,
						targetType
				  ));
		}

		if (successType === "faceTargetDiceCountBetween") {
			return successes === successes2
				? totalProbability
				: (totalProbability += this.calculateBinomialProbability(
						target,
						successes + 1,
						dice,
						target2,
						successes2,
						successType,
						targetType
				  ));
		}

		if (successType === "faceTargetDiceCountNotBetween") {
			return successes === successes2
				? totalProbability - 1
				: (totalProbability += this.calculateBinomialProbability(
						target,
						successes + 1,
						dice,
						target2,
						successes2,
						successType,
						targetType
				  ));
		}
	},

	binomialDiceTargetExactly(target, sides, trials, successes) {
		const psuccess = target <= sides ? 1 / sides : 0;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtLeast(target, sides, trials, successes) {
		const psuccess = target <= sides ? (sides - target + 1) / sides : 0;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtMost(target, sides, trials, successes) {
		const psuccess = target <= sides ? target / sides : 1;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetBetween(target1, sides, trials, successes, target2) {
		const psuccess =
			target2 < sides
				? (target2 - target1 + 1) / sides
				: sides < target1
				? 0
				: (sides - target1 + 1) / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetNotBetween(target1, sides, trials, successes, target2) {
		const psuccess =
			target2 < sides
				? (sides - (target2 - target1 + 1)) / sides
				: sides < target1
				? 1
				: (sides - (sides - target1 + 1)) / sides;

		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	// The final polynomial will contain all possible sums and sum probabilities
	createSumDistribution(polyDice) {
		let distribution = polyDice[0];

		polyDice.slice(1).forEach(polynomial => {
			distribution = distribution.mul(polynomial);
		});

		return distribution;
	},

	// Multiplying the polynomials together will give the correct probability distribution
	calculateDiceSumProbability(polyDice, target, target2, sumType) {
		const distribution = this.createSumDistribution(polyDice);

		const sumValues = Object.keys(distribution.coeff).map(sum =>
			parseInt(sum)
		);
		const probabilityValues = Object.values(distribution.coeff);

		if (sumType === "sumTargetValueExactly") {
			return distribution.coeff[target];
		}

		if (sumType === "sumTargetValueAtLeast") {
			return probabilityValues
				.slice(sumValues.indexOf(target))
				.reduce((acc, cur) => acc + cur, 0);
		}

		if (sumType === "sumTargetValueAtMost") {
			return probabilityValues
				.slice(0, sumValues.indexOf(target))
				.reduce((acc, cur) => acc + cur, 0);
		}

		if (sumType === "sumTargetValueBetween") {
			return probabilityValues
				.slice(
					sumValues.indexOf(target),
					sumValues.indexOf(target2) + 1
				)
				.reduce((acc, cur) => acc + cur, 0);
		}

		if (sumType === "sumTargetValueNotBetween") {
			return (
				1 -
				probabilityValues
					.slice(
						sumValues.indexOf(target),
						sumValues.indexOf(target2) + 1
					)
					.reduce((acc, cur) => acc + cur, 0)
			);
		}
	}
};

export default diceLib;
