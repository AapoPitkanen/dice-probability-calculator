import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const data = e.data;
	const calculationType = `${data.faceTargetDiceCountType},${data.faceTargetValueType}`;
	const calculationOptions = diceLib.faceCombinationOptions.map(el => el.join(","));
	console.log(data);
	console.log(calculationOptions.indexOf(calculationType));

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

	switch (calculationOptions.indexOf(calculationType)) {
		case 0:
			console.log("faceTargetDiceCountAtLeast,faceTargetValueAtLeast");
			break;
		case 1:
			console.log("faceTargetDiceCountAtLeast,faceTargetValueAtMost");
			break;
		case 2:
			console.log("faceTargetDiceCountAtLeast,faceTargetValueBetween");
			break;
		case 3:
			console.log("faceTargetDiceCountAtLeast,faceTargetValueExactly");
			break;
		case 4:
			console.log("faceTargetDiceCountAtLeast,faceTargetValueNotBetween");
			break;
		case 5:
			console.log("faceTargetDiceCountAtMost,faceTargetValueAtLeast");
			break;
		case 6:
			console.log("faceTargetDiceCountAtMost,faceTargetValueAtMost");
			break;
		case 7:
			console.log("faceTargetDiceCountAtMost,faceTargetValueBetween");
			break;
		case 8:
			console.log("faceTargetDiceCountAtMost,faceTargetValueExactly");
			break;
		case 9:
			console.log("faceTargetDiceCountAtMost,faceTargetValueNotBetween");
			break;
		case 10:
			console.log("faceTargetDiceCountBetween,faceTargetValueAtLeast");
			break;
		case 11:
			console.log("faceTargetDiceCountBetween,faceTargetValueAtMost");
			break;
		case 12:
			console.log("faceTargetDiceCountBetween,faceTargetValueBetween");
			break;
		case 13:
			console.log("faceTargetDiceCountBetween,faceTargetValueExactly");
			break;
		case 14:
			console.log("faceTargetDiceCountBetween,faceTargetValueNotBetween");
			break;
		case 15:
			console.log("faceTargetDiceCountExactly,faceTargetValueAtLeast");
			break;
		case 16:
			console.log("faceTargetDiceCountExactly,faceTargetValueAtMost");
			break;
		case 17:
			console.log("faceTargetDiceCountExactly,faceTargetValueBetween");
			break;
		case 18:
			console.log("faceTargetDiceCountExactly,faceTargetValueExactly");
			break;
		case 19:
			console.log("faceTargetDiceCountExactly,faceTargetValueNotBetween");
			break;
		case 20:
			console.log("faceTargetDiceCountNotBetween,faceTargetValueAtLeast");
			break;
		case 21:
			console.log("faceTargetDiceCountNotBetween,faceTargetValueAtMost");
			break;
		case 22:
			console.log("faceTargetDiceCountNotBetween,faceTargetValueBetween");
			break;
		case 23:
			console.log("faceTargetDiceCountNotBetween,faceTargetValueExactly");
			break;
		case 24:
			console.log("faceTargetDiceCountNotBetween,faceTargetValueNotBetween");
			break;
		default:
	}
	const str = "face calculation sent to parent";
	const message = {
		str: str
	};
	self.postMessage(message);
});
