import Polynomial from "polynomial";
import math from "mathjs";
import BigInt from "big-integer";
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
	UniqueCombinations: function(set, n) {
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

	sortUniqueDiceCombinations: function(target, successes, dice) {
		let sortedDice = [];
		let diceTypes = dice.map(el => el.slice(el.indexOf("d")));
		let keys;
		let values;
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

	sortDiceInput: function(dice) {
		dice = this.splitDice(dice);
		let diceTypes = [];
		let sortedDice = [];

		dice.forEach(el => diceTypes.indexOf(el.slice(el.indexOf("d"))) < 0 && diceTypes.push(el));
		diceTypes.forEach(el => sortedDice.push(this.countDice(el.slice(el.indexOf("d")), dice)));
		return sortedDice;
	},

	splitDice: function(dice) {
		let splitDice = [];
		dice.forEach(el => {
			for (let i = 0, l = parseInt(el.slice(0, el.indexOf("d"))); i < l; i++) {
				splitDice.push(el.slice(el.indexOf("d")));
			}
		});
		return splitDice;
	},

	countDice: function(diceType, dice) {
		return `${dice.filter(el => el === diceType).length}${diceType}`;
	},

	createDiceObject: function(dice) {
		dice = this.splitDice(dice);
		let diceObj = {};
		dice.forEach(el => (diceObj[el] = (diceObj[el] || 0) + 1));
		return diceObj;
	},

	diceObjToArray: function(diceObj) {
		let entries = Object.entries(diceObj);
		return entries.map(el => el.reduce((acc, curr) => `${curr}${acc}`));
	},

	binomialProbabilityDiceCountExactlyTargetValueAtLeast: function(target, successes, dice) {
		dice = dice.split("+");
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

	binomialProbabilityDiceCountAtLeastTargetValueAtLeast: function(target, successes, dice) {
		dice = dice.split("+");
		let maxSuccesses = 0;
		let probability = 0;
		dice.forEach(el => {
			maxSuccesses += parseInt(el.slice(0, el.indexOf("d")));
		});
		dice = dice.join("+");
		while (successes <= maxSuccesses) {
			probability += this.binomialProbabilityDiceCountExactlyTargetValueAtLeast(
				target,
				successes,
				dice
			);
			successes++;
		}
		return probability;
	},

	binomialDiceTargetExactly: function(sides, trials, successes) {
		const psuccess = 1 / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtLeast: function(target, sides, trials, successes) {
		const psuccess = (sides - target + 1) / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetAtMost: function(target, sides, trials, successes) {
		const psuccess = target / sides;
		return (
			math.combinations(trials, successes) *
			math.pow(psuccess, successes) *
			math.pow(1 - psuccess, trials - successes)
		);
	},

	binomialDiceTargetBetween: function(target1, target2, sides, trials, successes) {
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

	binomialDiceTargetNotBetween: function(target1, target2, sides, trials, successes) {
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

	binomialDiceAtLeast: function(target, sides, trials, successes) {
		let probability = 0;
		while (successes <= trials) {
			probability += this.binomialDiceTargetAtLeast(target, sides, trials, successes);
			successes++;
		}
		return probability;
	},

	binomialDiceAtMost: function(target, sides, trials, successes) {
		let probability = 0;
		while (successes >= 0) {
			probability += this.binomialDiceTargetAtMost(target, sides, trials, successes);
			successes--;
		}
		return probability;
	},

	findDiceCount: function(diceType, dice) {
		let match = dice.find(el => el.slice(el.indexOf("d")) === diceType);
		return parseInt(match.slice(0, match.indexOf("d")));
	},

	updateDiceCount: function(diceCount, diceType, dice) {
		let index = dice.findIndex(el => el.indexOf(diceType) >= 0);
		dice[index] = `${diceCount}${diceType}`;
		return dice;
	},

	diceSumExactly: function(num, polyDice) {
		let input = polyDice[0];
		for (let i = 1, j = polyDice.length; i < j; i++) {
			input = input.mul(polyDice[i]);
		}
		const keys = Object.keys(input.coeff).map(x => parseInt(x));
		const values = Object.values(input.coeff);
		const probability = values[keys.indexOf(num)];
		return probability;
	},

	diceSumAtLeast: function(num, polyDice) {
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

	diceSumAtMost: function(num, polyDice) {
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

	diceSumBetween: function(num, num2, polyDice) {
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

	diceSumNotBetween: function(num, num2, polyDice) {
		return 1 - this.diceSumBetween(num, num2, polyDice);
	},

	createDicePolynomial: function(dice) {
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

/*

entries.forEach(el => {
    for (let i = 0; i < el[1]; i++) {
	    let polyStr = "";
	    for (let j = 0; j < parseInt(el[0].slice(1)); j++) {
		    polyStr += `1/${el[0].slice(1)}x^${el[0].slice(1)}+`;
            }
	    polyDiceArr.push(polyStr);
    }	
});

*/

/*
const diceAlgorithmAtMost = (p, n, s) => {
  let probability = 0;
  while (p > 0) {
    probability += diceAlgorithmExactly(p, n, s);
    p--;
  }
  return probability;
};

const diceAlgorithmAtLeast = (p, n, s) => {
  let probability = 0;
  let max = n * s;
  while (max > p) {
    probability += diceAlgorithmExactly(max, n, s);
    max--;
  }
  return probability;
};

const diceAlgorithmExactly = (p, n, s) => {
  let combinations = 0;
  let sum = 0;
  const coefficient = 1 / Math.pow(s, n);
  for (let k = 0; k <= Math.floor((p - n) / s); k++) {
    if (k === 0) {
      sum = math.combinations(p - 1, n - 1);
    } else {
      sum =
        Math.pow(-1, k) * math.combinations(n, k) * math.combinations(p - s * k - 1, n - 1);
    }
    combinations += sum;
  }
  return coefficient * combinations;
};

const diceAlgorithmBetween = (p, p2, n, s) => {
  let probability = 0;
  for (p; p <= p2; p++) {
    probability += diceAlgorithmExactly(p, n, s);
  }
  return probability;
}

const diceAlgorithmNotBetween = (p, p2, n, s) => 1 - diceAlgorithmBetween(p, p2, n, s);
*/

/*
$(".calculate").addEventListener("click", e => {
	const diceArr = [];
	const diceList = $("#dice").value.split("+");
	let num = parseInt($("#evaluator-number-one").value);
	let totalDice = 0;
	let maxSum = 0;
	let num2;

	for (let i = 0, j = diceList.length; i < j; i++) {
		totalDice += parseInt(diceList[i].slice(0, diceList[i].indexOf("d")));
		maxSum +=
			parseInt(diceList[i].slice(diceList[i].indexOf("d") + 1)) *
			parseInt(diceList[i].slice(0, diceList[i].indexOf("d")));
	}

	if ($("#evaluator-number-one").value === "" || $("#dice").value === "") {
		$(".output").innerText = "Please fill all the input fields.";
		fadeIn($(".output"));
		return false;
	}

	if (num < totalDice) {
		$(".error-message").innerText = "Sum cannot be less than the number of dice";
		fadeInOut($(".error-message"));
		return false;
	} else if (num > maxSum) {
		$(".error-message").innerText = "Sum cannot be greater than the maximum sum of dice";
		fadeInOut($(".error-message"));
		return false;
	}

	for (let i = 0, l = diceList.length; i < l; i++) {
		for (let j = 0; j < parseInt(diceList[i].slice(0, diceList[i].indexOf("d"))); j++) {
			let polyStr = "";
			for (let k = 0; k < parseInt(diceList[i].slice(diceList[i].indexOf("d") + 1)); k++) {
				polyStr += `1/${diceList[i].slice(diceList[i].indexOf("d") + 1)}x^${k + 1}+`;
			}
			polyStr[polyStr.length - 1] = "";
			diceArr.push(new Polynomial(polyStr));
		}
	}

	switch ($("#evaluator-select").value) {
		case "exactly":
			$(
				".output"
			).innerText = `The probability of rolling exactly ${num} with the dice ${diceList.join(
				", "
			)} is ${(diceExactly(num, ...diceArr) * 100).toFixed(2)}%`;
			break;
		case "atleast":
			$(
				".output"
			).innerText = `The probability of rolling at least ${num} with the dice ${diceList.join(
				", "
			)} is ${(diceAtLeast(num, ...diceArr) * 100).toFixed(2)}%`;
			break;
		case "atmost":
			$(
				".output"
			).innerText = `The probability of rolling at most ${num} with the dice ${diceList.join(
				", "
			)} is ${(diceAtMost(num, ...diceArr) * 100).toFixed(2)}%`;
			break;
		case "between":
			num2 = parseInt($("#evaluator-number-two").value);
			$(
				".output"
			).innerText = `The probability of rolling between ${num} and ${num2} with the dice ${diceList.join(
				", "
			)} is ${(diceBetween(num, num2, ...diceArr) * 100).toFixed(2)}%`;
			break;
		case "notbetween":
			num2 = parseInt($("#evaluator-number-two").value);
			$(
				".output"
			).innerText = `The probability of not rolling between ${num} and ${num2} with the dice ${diceList.join(
				", "
			)} is ${(diceNotBetween(num, num2, ...diceArr) * 100).toFixed(2)}%`;
			break;
		default:
	}
});

$(".reset-button").addEventListener("click", e => {
	$("#evaluator-number-one").value = "";
	$("#evaluator-number-two").value = "";
	$("#dice").value = "";
	$(".output").innerText = "Resetting...";
	fadeInOutText($(".output"), 1500, 2500);
});

$(".dice-image-wrapper").addEventListener("click", e => {
	if (e.target.className === "dice-image") {
		let diceList;
		if ($("#dice").value === "") {
			diceList = [];
		} else {
			diceList = $("#dice").value.split("+");
		}
		let currentDiceCount;
		if ($("#dice").value.indexOf(e.target.dataset.diceType) < 0 && $("#dice").value === "") {
			currentDiceCount = 1;
			$("#dice").value += currentDiceCount + e.target.dataset.diceType;
		} else if (
			$("#dice").value.indexOf(e.target.dataset.diceType) < 0 &&
			$("#dice").value !== ""
		) {
			currentDiceCount = 1;
			$("#dice").value += "+" + currentDiceCount + e.target.dataset.diceType;
		} else {
			currentDiceCount = findDiceVal(e.target.dataset.diceType, diceList) + 1;
			updateDiceVal(currentDiceCount, e.target.dataset.diceType, diceList);
			$("#dice").value = diceList.join("+");
		}
	}
});
*/
export default diceLib;
