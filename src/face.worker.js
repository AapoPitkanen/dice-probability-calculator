import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const diceArr = e.data.diceArr;
	const diceObj = e.data.diceObj;
	const successes = e.data.faceTargetDiceCountOne;
	const successes2 = e.data.faceTargetDiceCountTwo;
	const target = e.data.faceTargetValueOne;
	const target2 = e.data.faceTargetValueTwo;
	const calculationType = `${e.data.faceTargetDiceCountType}${
		e.data.faceTargetValueType
	}`;
	let probabilityValue;
	let probabilityText;

	const calculationOptions = {
		faceTargetDiceCountAtLeastfaceTargetValueAtLeast(
			target,
			successes,
			diceArr
		) {
			probabilityValue = (
				diceLib.binomialProbabilityDCALTVAL(target, successes, diceArr) * 100
			).toFixed(2);
			probabilityText = `The probability of rolling at least ${successes} dice where the face value is at least ${target} is `;
		},
		faceTargetDiceCountAtLeastfaceTargetValueAtMost() {},
		faceTargetDiceCountAtLeastfaceTargetValueBetween() {},
		faceTargetDiceCountAtLeastfaceTargetValueExactly() {},
		faceTargetDiceCountAtLeastfaceTargetValueNotBetween() {},
		faceTargetDiceCountAtMostfaceTargetValueAtLeast() {},
		faceTargetDiceCountAtMostfaceTargetValueAtMost() {},
		faceTargetDiceCountAtMostfaceTargetValueBetween() {},
		faceTargetDiceCountAtMostfaceTargetValueExactly() {},
		faceTargetDiceCountAtMostfaceTargetValueNotBetween() {},
		faceTargetDiceCountBetweenfaceTargetValueAtLeast() {},
		faceTargetDiceCountBetweenfaceTargetValueAtMost() {},
		faceTargetDiceCountBetweenfaceTargetValueBetween() {},
		faceTargetDiceCountBetweenfaceTargetValueExactly() {},
		faceTargetDiceCountBetweenfaceTargetValueNotBetween() {},
		faceTargetDiceCountExactlyfaceTargetValueAtLeast(
			target,
			successes,
			diceArr
		) {
			probabilityValue = (
				diceLib.binomialProbabilityDCETVAL(target, successes, diceArr) * 100
			).toFixed(2);
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is at least ${target} is `;
		},
		faceTargetDiceCountExactlyfaceTargetValueAtMost(
			target,
			successes,
			diceArr
		) {
			probabilityValue = (
				diceLib.binomialProbabilityDCETVAM(target, successes, diceArr) * 100
			).toFixed(2);
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is at most ${target} is `;
		},
		faceTargetDiceCountExactlyfaceTargetValueBetween(
			target,
			successes,
			diceArr,
			target2
		) {
			probabilityValue = (
				diceLib.binomialProbabilityDCETVB(target, successes, diceArr, target2) *
				100
			).toFixed(2);
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is between ${target} and ${target2} is `;
		},
		faceTargetDiceCountExactlyfaceTargetValueExactly(
			target,
			successes,
			diceArr
		) {
			probabilityValue = (
				diceLib.binomialProbabilityDCETVE(target, successes, diceArr) * 100
			).toFixed(2);
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is exactly ${target} is `;
		},
		faceTargetDiceCountExactlyfaceTargetValueNotBetween(
			target,
			successes,
			diceArr,
			target2
		) {
			probabilityValue = (
				diceLib.binomialProbabilityDCETVNB(
					target,
					successes,
					diceArr,
					target2
				) * 100
			).toFixed(2);
			probabilityText = `The probability of rolling exactly ${successes} dice where the face value is not between ${target} and ${target2} is `;
		},
		faceTargetDiceCountNotBetweenfaceTargetValueAtLeast() {},
		faceTargetDiceCountNotBetweenfaceTargetValueAtMost() {},
		faceTargetDiceCountNotBetweenfaceTargetValueBetween() {},
		faceTargetDiceCountNotBetweenfaceTargetValueExactly() {},
		faceTargetDiceCountNotBetweenfaceTargetValueNotBetween() {}
	};

	calculationOptions[calculationType](target, successes, diceArr, target2);

	const message = {
		probabilityText: probabilityText,
		probabilityValue: probabilityValue
	};
	self.postMessage(message);
});
