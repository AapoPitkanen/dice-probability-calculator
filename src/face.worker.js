import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const diceArr = e.data.diceArr
	const diceObj = e.data.diceObj
	const successes = e.data.faceTargetDiceCountOne
	const successes2 = e.data.faceTargetDiceCountTwo
	const target = e.data.faceTargetValueOne
	const target2 = e.data.faceTargetValueTwo
	const calculationType = `${e.data.faceTargetDiceCountType}${e.data.faceTargetValueType}`;
	let probabilityValue;
	let probabilityText;

	/*
    0: "faceTargetDiceCountAtLeast,faceTargetValueAtLeast"
    1: "faceTargetDiceCountAtLeast,faceTargetValueAtMost"
    2: "faceTargetDiceCountAtLeast,faceTargetValueBetween"
    3: "faceTargetDiceCountAtLeast,faceTargetValueExactly"
    4: "faceTargetDiceCountAtLeast,faceTargetValueNotBetween"
    5: "faceTargetDiceCountAtMost,faceTargetValueAtLeast"
    6: "faceTargetDiceCountAtMost,faceTargetValueAtMost"
    7: "faceTargetDiceCountAtMost,faceTargetValueBetween"
    8: "faceTargetDiceCountAtMost,faceTargetValueExactly"
    9: "faceTargetDiceCountAtMost,faceTargetValueNotBetween"
    10: "faceTargetDiceCountBetween,faceTargetValueAtLeast"
    11: "faceTargetDiceCountBetween,faceTargetValueAtMost"
    12: "faceTargetDiceCountBetween,faceTargetValueBetween"
    13: "faceTargetDiceCountBetween,faceTargetValueExactly"
    14: "faceTargetDiceCountBetween,faceTargetValueNotBetween"
    15: "faceTargetDiceCountExactly,faceTargetValueAtLeast"
    16: "faceTargetDiceCountExactly,faceTargetValueAtMost"
    17: "faceTargetDiceCountExactly,faceTargetValueBetween"
    18: "faceTargetDiceCountExactly,faceTargetValueExactly"
    19: "faceTargetDiceCountExactly,faceTargetValueNotBetween"
    20: "faceTargetDiceCountNotBetween,faceTargetValueAtLeast"
    21: "faceTargetDiceCountNotBetween,faceTargetValueAtMost"
    22: "faceTargetDiceCountNotBetween,faceTargetValueBetween"
    23: "faceTargetDiceCountNotBetween,faceTargetValueExactly"
    24: "faceTargetDiceCountNotBetween,faceTargetValueNotBetween"
    */
	const calculationOptions = {
		faceTargetDiceCountAtLeastfaceTargetValueAtLeast() {
			probabilityValue = diceLib.binomialProbabilityDCALTVAL(target, successes, diceArr, diceObj)
			probabilityText = `The probability of rolling at least ${successes} dice where the face value is at least ${target} is `
		},
		faceTargetDiceCountAtLeastfaceTargetValueAtMost() {

		},
		faceTargetDiceCountAtLeastfaceTargetValueBetween() {

		},
		faceTargetDiceCountAtLeastfaceTargetValueExactly() {

		},
		faceTargetDiceCountAtLeastfaceTargetValueNotBetween() {

		},
		faceTargetDiceCountAtMostfaceTargetValueAtLeast() {

		},
		faceTargetDiceCountAtMostfaceTargetValueAtMost() {

		},
		faceTargetDiceCountAtMostfaceTargetValueBetween() {

		},
		faceTargetDiceCountAtMostfaceTargetValueExactly() {

		},
		faceTargetDiceCountAtMostfaceTargetValueNotBetween() {

		},
		faceTargetDiceCountBetweenfaceTargetValueAtLeast() {

		},
		faceTargetDiceCountBetweenfaceTargetValueAtMost() {

		},
		faceTargetDiceCountBetweenfaceTargetValueBetween() {

		},
		faceTargetDiceCountBetweenfaceTargetValueExactly() {

		},
		faceTargetDiceCountBetweenfaceTargetValueNotBetween() {

		},
		faceTargetDiceCountExactlyfaceTargetValueAtLeast() {
			probabilityValue = diceLib.binomialProbabilityDCETVAL(target, successes, diceArr)
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is at least ${target} is `
		},
		faceTargetDiceCountExactlyfaceTargetValueAtMost() {
			probabilityValue = diceLib.binomialProbabilityDCETVAM(target, successes, diceArr)
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is at most ${target} is `
		},
		faceTargetDiceCountExactlyfaceTargetValueBetween() {

		},
		faceTargetDiceCountExactlyfaceTargetValueExactly() {
			probabilityValue = diceLib.binomialProbabilityDCETVE(target, successes, diceArr)
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is exactly ${target} is `
		},
		faceTargetDiceCountExactlyfaceTargetValueNotBetween() {

		},
		faceTargetDiceCountNotBetweenfaceTargetValueAtLeast() {

		},
		faceTargetDiceCountNotBetweenfaceTargetValueAtMost() {

		},
		faceTargetDiceCountNotBetweenfaceTargetValueBetween() {

		},
		faceTargetDiceCountNotBetweenfaceTargetValueExactly() {

		},
		faceTargetDiceCountNotBetweenfaceTargetValueNotBetween() {

		}
	}

	calculationOptions[calculationType](target, successes, diceArr, diceObj)

	const message = {
		probabilityText: probabilityText,
		probabilityValue: probabilityValue
	};
	self.postMessage(message);
});
