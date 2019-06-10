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
	faceCombinationOptions: math.setCartesian(faceTargetDiceCountOptions, faceTargetValueOptions),

	/* Not written by me, found on math.stackexchange.com for finding only the n-sized unique combinations from a set */
	UniqueCombinations(set, n) {
		let combinations = [];
		let props = Object.getOwnPropertyNames(set);
		for (let p = 0, l = props.length; p < l; p++) {
			for (let i = Math.min(set[props[p]], n); i > 0; i--) {
				if (n - i > 0) {
					let rest = this.UniqueCombinations(_.pick(set, props.slice(p + 1)), n - i);
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
	sortUniqueDiceCombinations(target, successes, dice) {
		let sortedDice = [];
		let diceTypes = dice.map(el => el.slice(el.indexOf("d")));
		let keys;
		let values;
		/* We'll just return zeroes for each dice if the user specifies 0 successes rolled or if the target cannot be rolled with any of the dice.
        The only combination then is that none of the dice roll a success */
		if (successes === 0 || dice.every(el => parseInt(el.slice(el.indexOf("d") + 1)) < target)) {
			let tempArr = [];
			dice.forEach(el => {
				tempArr.push(`0${el.slice(el.indexOf("d"))}`);
			});
			sortedDice.push(tempArr);
			return sortedDice;
		}

		// Remove any dice that cannot roll successes if needed, e.g. a d6 cannot roll a 7 so it has to be filtered out when creating the combinations
		if (dice.some(el => parseInt(el.slice(el.indexOf("d") + 1)) < target)) {
			let filtered = dice.filter(el => parseInt(el.slice(el.indexOf("d") + 1)) >= target);
			keys = filtered.map(el => el.slice(el.indexOf("d")));
			values = filtered.map(el => el.slice(0, el.indexOf("d")));
		} else {
			keys = dice.map(el => el.slice(el.indexOf("d")));
			values = dice.map(el => el.slice(0, el.indexOf("d")));
		}
		let diceObj = _.zipObject(keys, values);
		let sortedObj = this.UniqueCombinations(diceObj, successes);

		sortedObj.forEach(el => {
			let diceCounts = Object.values(el);
			keys = Object.keys(el);
			let singularDiceCounts = [];
			let mapped = [];
			keys.forEach((el, i) => {
				for (let j = 0; j < diceCounts[i]; j++) {
					singularDiceCounts.push(el);
				}
			});

			diceTypes.forEach(el => {
				mapped.push(this.countDice(el, singularDiceCounts));
			});

			sortedDice.push(mapped);
		});
		return sortedDice;
	},

	// Counts duplicate dice and adds them together, returning a sorted array of dice e.g. [1d6, 1d6, 2d8, 1d4, 1d6] => [3d6, 2d8, 1d4]
	sortDiceInput(dice) {
		dice = this.splitDice(dice);
		let diceTypes = [];
		let sortedDice = [];

		dice.forEach(el => diceTypes.indexOf(el.slice(el.indexOf("d"))) < 0 && diceTypes.push(el));
		diceTypes.forEach(el => sortedDice.push(this.countDice(el.slice(el.indexOf("d")), dice)));
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
		return `${dice.filter(el => el === diceType).length}${diceType}`;
	},

	createDiceObject(dice) {
		dice = this.splitDice(dice);
		let diceObj = {};
		dice.forEach(el => (diceObj[el] = (diceObj[el] || 0) + 1));
		return diceObj;
	},

	// Helper function to create a polynomial from a single dice e.g. d6 => 1/6x^1+1/6x^2+1/6x^3+1/6x^4+1/6x^5+1/6x^6
	createDicePolynomial(dice) {
		let polyStr = "";
		const sides = parseInt(dice.slice(dice.indexOf('d') + 1))
		for (let exponent = 1; exponent <= sides; exponent++) {
			polyStr += `+1/${sides}x^${exponent}`
		}
		// replace the first +-sign from the string so the Polynomial object can be created
		return new Polynomial(polyStr.replace('+', ''));
	},

	diceObjToArray(diceObj) {
		let entries = Object.entries(diceObj);
		return entries.map(el => el.reduce((acc, curr) => `${curr}${acc}`));
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
		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(target, successes, dice);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(x => {
			x.forEach((y, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(y.slice(y.indexOf("d") + 1));
				diceSuccessCount = parseInt(y.slice(0, y.indexOf("d")));
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
		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(target, successes, dice);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(x => {
			x.forEach((y, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(y.slice(y.indexOf("d") + 1));
				diceSuccessCount = parseInt(y.slice(0, y.indexOf("d")));
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
		let sortedArr = this.sortUniqueDiceCombinations(target, successes, dice);
		let diceCount;
		let sides;
		let diceSuccessCount;
		sortedArr.forEach(x => {
			x.forEach((y, i) => {
				diceCount = parseInt(dice[i].slice(0, dice[i].indexOf("d")));
				sides = parseInt(y.slice(y.indexOf("d") + 1));
				diceSuccessCount = parseInt(y.slice(0, y.indexOf("d")));
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

	binomialProbabilityDCALTVAL(target, successes, dice, diceObj) {
		let maxSuccesses = 0;
		let probability = 0;
		let values = Object.values(diceObj);
		maxSuccesses = values.reduce((acc, curr) => acc + curr);
		while (successes <= maxSuccesses) {
			probability += this.binomialProbabilityDCETVAL(target, successes, dice);
			successes++;
		}
		return probability;
	},

	binomialDiceTargetExactly(sides, trials, successes) {
		const psuccess = 1 / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtLeast(target, sides, trials, successes) {
		const psuccess = (sides - target + 1) / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtMost(target, sides, trials, successes) {
		const psuccess = target / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetBetween(target1, target2, sides, trials, successes) {
		const psuccess = (target2 - target1 + 1) / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetNotBetween(target1, target2, sides, trials, successes) {
		const psuccess = 1 - (target2 - target1 + 1) / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialSingleDiceTypeAtLeast(target, sides, trials, successes) {
		let probability = 0;
		while (successes <= trials) {
			probability += this.binomialDiceTargetAtLeast(target, sides, trials, successes);
			successes++;
		}
		return probability;
	},

	binomialSingleDiceTypeAtMost(target, sides, trials, successes) {
		let probability = 0;
		while (successes >= 0) {
			probability += this.binomialDiceTargetAtMost(target, sides, trials, successes);
			successes--;
		}
		return probability;
	},

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
		let j = polyDice.length;
		for (let i = 1; i < j; i++) {
			input = input.mul(polyDice[i]);
		}
		const keys = Object.keys(input.coeff).map(x => parseInt(x));
		const values = Object.values(input.coeff);
		j = values.length;
		for (let i = keys.indexOf(num); i < j; i++) {
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
		for (let i = keys.indexOf(num); i <= keys.indexOf(num2); i++) {
			probability += values[i];
		}
		return probability;
	},

	diceSumNotBetween(polyDice, num, num2) {
		return 1 - this.diceSumBetween(num, num2, polyDice);
	}
};

export default diceLib;
