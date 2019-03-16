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
	UniqueCombinations: function (set, n) {
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
	sortUniqueDiceCombinations: function (target, successes, dice) {
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

	sortDiceInput: function (dice) {
		dice = this.splitDice(dice);
		let diceTypes = [];
		let sortedDice = [];

		dice.forEach(el => diceTypes.indexOf(el.slice(el.indexOf("d"))) < 0 && diceTypes.push(el));
		diceTypes.forEach(el => sortedDice.push(this.countDice(el.slice(el.indexOf("d")), dice)));
		return sortedDice;
	},

	splitDice: function (dice) {
		let splitDice = [];
		dice.forEach(el => {
			for (let i = 0, l = parseInt(el.slice(0, el.indexOf("d"))); i < l; i++) {
				splitDice.push(el.slice(el.indexOf("d")));
			}
		});
		return splitDice;
	},

	countDice: function (diceType, dice) {
		return `${dice.filter(el => el === diceType).length}${diceType}`;
	},

	createDiceObject: function (dice) {
		dice = this.splitDice(dice);
		let diceObj = {};
		dice.forEach(el => (diceObj[el] = (diceObj[el] || 0) + 1));
		return diceObj;
	},

	diceObjToArray: function (diceObj) {
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

	binomialProbabilityDCETVE: function (target, successes, dice) {
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

	binomialProbabilityDCETVAL: function (target, successes, dice) {
		let totalProbability = 0;
		let currentProbability = 1;
		let sortedArr = this.sortUniqueDiceCombinations(target, successes, dice);
		console.log(sortedArr);
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

	binomialProbabilityDCETVAM: function (target, successes, dice) {
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

	binomialProbabilityDCALTVAL: function (target, successes, dice) {
		dice = dice.split("+");
		let maxSuccesses = 0;
		let probability = 0;
		dice.forEach(el => {
			maxSuccesses += parseInt(el.slice(0, el.indexOf("d")));
		});
		dice = dice.join("+");
		while (successes <= maxSuccesses) {
			probability += this.binomialProbabilityDCETVAL(
				target,
				successes,
				dice
			);
			successes++;
		}
		return probability;
	},

	binomialDiceTargetExactly: function (sides, trials, successes) {
		const psuccess = 1 / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtLeast: function (target, sides, trials, successes) {
		const psuccess = (sides - target + 1) / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtMost: function (target, sides, trials, successes) {
		const psuccess = target / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetBetween: function (target1, target2, sides, trials, successes) {
		let arr = [];
		arr.push(target1, target2);
		for (let i = target1 + 1; i < target2; i++) {
			arr.push(i);
		}
		const psuccess = arr.length / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetNotBetween: function (target1, target2, sides, trials, successes) {
		let arr = [];
		arr.push(target1, target2);
		for (let i = target1 + 1; i < target2; i++) {
			arr.push(i);
		}
		const psuccess = 1 - arr.length / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialSingleDiceTypeAtLeast: function (target, sides, trials, successes) {
		let probability = 0;
		while (successes <= trials) {
			probability += this.binomialDiceTargetAtLeast(target, sides, trials, successes);
			successes++;
		}
		return probability;
	},

	binomialSingleDiceTypeAtMost: function (target, sides, trials, successes) {
		let probability = 0;
		while (successes >= 0) {
			probability += this.binomialDiceTargetAtMost(target, sides, trials, successes);
			successes--;
		}
		return probability;
	},

	findDiceCount: function (diceType, dice) {
		let match = dice.find(el => el.slice(el.indexOf("d")) === diceType);
		return parseInt(match.slice(0, match.indexOf("d")));
	},

	updateDiceCount: function (diceCount, diceType, dice) {
		let index = dice.findIndex(el => el.indexOf(diceType) >= 0);
		dice[index] = `${diceCount}${diceType}`;
		return dice;
	},

	diceSumExactly: function (num, polyDice) {
		let input = polyDice[0];
		for (let i = 1, j = polyDice.length; i < j; i++) {
			input = input.mul(polyDice[i]);
		}
		const keys = Object.keys(input.coeff).map(x => parseInt(x));
		const values = Object.values(input.coeff);
		const probability = values[keys.indexOf(num)];
		return probability;
	},

	diceSumAtLeast: function (num, polyDice) {
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

	diceSumAtMost: function (num, polyDice) {
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

	diceSumBetween: function (num, num2, polyDice) {
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

	diceSumNotBetween: function (num, num2, polyDice) {
		return 1 - this.diceSumBetween(num, num2, polyDice);
	},

	createDicePolynomial: function (dice) {
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
	}
};

export default diceLib;