import Polynomial from "polynomial";
import math from "mathjs";
import _ from "lodash";

const faceTargetValueOptions = [
	"faceTargetValueExactly",
	"faceTargetValueAtLeast",
	"faceTargetValueAtMost",
	"faceTargetValueBetween",
	"faceTargetValueNotBetween"
];

const faceTargetDiceCountOptions = [
	"faceTargetDiceCountExactly",
	"faceTargetDiceCountAtLeast",
	"faceTargetDiceCountAtMost",
	"faceTargetDiceCountBetween",
	"faceTargetDiceCountNotBetween"
];

const diceLib = {
	faceCombinationOptions: math.setCartesian(
		faceTargetDiceCountOptions,
		faceTargetValueOptions
	),

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
	sortUniqueDiceCombinations(target, successes, diceArr, type) {
		const sortedDiceArr = [];
		const diceTypes = diceArr.map(dice => dice.slice(dice.indexOf("d")));
		let diceKeys;
		let diceValues;
		/* Return zeroes for each dice if the user specifies 0 successes rolled or if the target cannot be rolled with any of the dice (when calculating "exactly" or "at least" probabilities).
        The only combination then is that none of the dice roll a success */
		if (
			(type === "exactly" || type === "atleast") &&
			(successes === 0 ||
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

		// Remove any dice that cannot roll successes if needed, e.g. a d6 cannot roll a 7 (when calculating "exactly" or "at least" probabilities) so it has to be filtered out when creating the combinations
		const filteredArr = diceArr.filter(
			dice => parseInt(dice.slice(dice.indexOf("d") + 1)) >= target
		);

		if (type === "atleast" || type === "exactly" || type === "between") {
			diceKeys =
				diceArr.every(dice => parseInt(dice.slice(dice.indexOf("d") + 1))) >=
				target
					? diceArr.map(dice => dice.slice(dice.indexOf("d")))
					: filteredArr.map(dice => dice.slice(dice.indexOf("d")));

			diceValues =
				diceArr.every(dice => parseInt(dice.slice(dice.indexOf("d") + 1))) >=
				target
					? diceArr.map(dice => parseInt(dice.slice(0, dice.indexOf("d"))))
					: filteredArr.map(dice => parseInt(dice.slice(0, dice.indexOf("d"))));
		}

		if (type === "atmost") {
			diceKeys = diceArr.map(dice => dice.slice(dice.indexOf("d")));
			diceValues = diceArr.map(dice =>
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

		if (type === "atmost") {
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
				diceTypes.indexOf(el.slice(el.indexOf("d"))) < 0 && diceTypes.push(el)
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

	/*
	DCE = Dice Count Exactly, diceCountTargetType is exactly
	DCAL = Dice Count At Least, diceCountTargetType is at least
	DCAM = Dice Count At Most, diceCountTargetType is at most
	DCB = Dice Count Between, diceCountTargetType is between
	DCNB = Dice Count Not Between, diceCountTargetType is not between

	TVE = Target Value Exactly, faceTargetType is exactly
	TVAL = Target Value At Least, faceTargetType is at least
	TVAM = Target Value At Most, faceTargetType is at most
	TVB = Target Value Between, faceTargetType is between
	TVNB = Target Value Not Between, faceTargetType is not between

	SDT = Single Dice Type, only one type of dice exists in the input field
	*/

	binomialProbabilityDCETVE(target, successes, dice) {
		if (dice.every(die => parseInt(die.slice(die.indexOf("d") + 1))) < target) {
			return 0;
		}

		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(
			target,
			successes,
			dice,
			"exactly"
		);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(diceArr => {
			diceArr.forEach((singleDice, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(singleDice.slice(singleDice.indexOf("d") + 1));
				diceSuccessCount = parseInt(
					singleDice.slice(0, singleDice.indexOf("d"))
				);
				currentProbability *= this.binomialDiceTargetExactly(
					target,
					sides,
					diceCount,
					diceSuccessCount
				);
			});
			totalProbability += currentProbability;
			currentProbability = 1;
		});
		return totalProbability;
	},

	binomialProbabilityDCETVAL(target, successes, dice) {
		if (dice.every(die => parseInt(die.slice(die.indexOf("d") + 1)) < target)) {
			return 0;
		}

		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(
			target,
			successes,
			dice,
			"atleast"
		);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(diceArr => {
			diceArr.forEach((singleDice, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(singleDice.slice(singleDice.indexOf("d") + 1));
				diceSuccessCount = parseInt(
					singleDice.slice(0, singleDice.indexOf("d"))
				);
				currentProbability *= this.binomialDiceTargetAtLeast(
					target,
					sides,
					diceCount,
					diceSuccessCount
				);
			});
			totalProbability += currentProbability;
			currentProbability = 1;
		});
		return totalProbability;
	},

	binomialProbabilityDCETVAM(target, successes, dice) {
		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(
			target,
			successes,
			dice,
			"atmost"
		);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(diceArr => {
			diceArr.forEach((singleDice, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(singleDice.slice(singleDice.indexOf("d") + 1));
				diceSuccessCount = parseInt(
					singleDice.slice(0, singleDice.indexOf("d"))
				);
				currentProbability *= this.binomialDiceTargetAtMost(
					target,
					sides,
					diceCount,
					diceSuccessCount
				);
			});
			totalProbability += currentProbability;
			currentProbability = 1;
		});
		return totalProbability;
	},

	binomialProbabilityDCETVB(target, successes, dice, target2) {
		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(
			target,
			successes,
			dice,
			"between"
		);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(diceArr => {
			diceArr.forEach((singleDice, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(singleDice.slice(singleDice.indexOf("d") + 1));
				diceSuccessCount = parseInt(
					singleDice.slice(0, singleDice.indexOf("d"))
				);
				currentProbability *= this.binomialDiceTargetBetween(
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
		return totalProbability;
	},

	binomialProbabilityDCETVNB(target, successes, dice, target2) {
		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(
			target,
			successes,
			dice,
			"between"
		);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(diceArr => {
			diceArr.forEach((singleDice, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(singleDice.slice(singleDice.indexOf("d") + 1));
				diceSuccessCount = parseInt(
					singleDice.slice(0, singleDice.indexOf("d"))
				);
				currentProbability *= this.binomialDiceTargetNotBetween(
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
		return totalProbability;
	},

	binomialProbabilityDCALTVAL(target, successes, dice) {
		let probability = 0;
		const maxSuccesses = dice
			.filter(dice => {
				let sides = parseInt(dice.slice(dice.indexOf("d") + 1));
				return sides >= target;
			})
			.map(dice => parseInt(dice.slice(0, dice.indexOf("d"))))
			.reduce((acc, curr) => acc + curr);
		while (successes <= maxSuccesses) {
			probability += this.binomialProbabilityDCETVAL(
				target,
				successes,
				dice,
				"atleast"
			);
			successes++;
		}
		return probability;
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
				: (sides - (sides - target1 + 1)) / sides;

		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialSingleDiceTypeAtLeast(target, sides, trials, successes) {
		let probability = 0;
		while (successes <= trials) {
			probability += this.binomialDiceTargetAtLeast(
				target,
				sides,
				trials,
				successes
			);
			successes++;
		}
		return probability;
	},

	binomialSingleDiceTypeAtMost(target, sides, trials, successes) {
		let probability = 0;
		while (successes >= 0) {
			probability += this.binomialDiceTargetAtMost(
				target,
				sides,
				trials,
				successes
			);
			successes--;
		}
		return probability;
	},

	// In the diceSum functions multiplying the polynomials together will give the correct probability distribution

	diceSumExactly(polyDice, num) {
		let input = polyDice[0];
		for (let i = 1, j = polyDice.length; i < j; i++) {
			input = input.mul(polyDice[i]);
		}
		const keys = Object.keys(input.coeff).map(x => parseInt(x));
		const values = Object.values(input.coeff);
		const probability = values[keys.indexOf(num)];
		return probability;
	},

	diceSumAtLeast(polyDice, num) {
		let input = polyDice[0];
		let probability = 0;
		for (let i = 1, j = polyDice.length; i < j; i++) {
			input = input.mul(polyDice[i]);
		}
		const keys = Object.keys(input.coeff).map(x => parseInt(x));
		const values = Object.values(input.coeff);

		for (let i = keys.indexOf(num), j = values.length; i < j; i++) {
			probability += values[i];
		}
		return probability;
	},

	diceSumAtMost(polyDice, num) {
		let polynomial = polyDice[0];
		let probability = 0;
		for (let i = 1, j = polyDice.length; i < j; i++) {
			polynomial = polynomial.mul(polyDice[i]);
		}
		const keys = Object.keys(polynomial.coeff).map(x => parseInt(x));
		const values = Object.values(polynomial.coeff);
		for (let i = keys.indexOf(num), j = 0; i >= j; i--) {
			probability += values[i];
		}
		return probability;
	},

	diceSumBetween(polyDice, num, num2) {
		let input = polyDice[0];
		let probability = 0;
		for (let i = 1, j = polyDice.length; i < j; i++) {
			input = input.mul(polyDice[i]);
		}
		const keys = Object.keys(input.coeff).map(x => parseInt(x));
		const values = Object.values(input.coeff);
		for (let i = keys.indexOf(num), j = keys.indexOf(num2); i <= j; i++) {
			probability += values[i];
		}
		return probability;
	},

	diceSumNotBetween(polyDice, num, num2) {
		return 1 - this.diceSumBetween(polyDice, num, num2);
	}
};

export default diceLib;
