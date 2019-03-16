import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const data = e.data;
	console.log(data);
	console.log(diceLib.binomialProbabilityDCETVAL(data.faceTargetValueOne, data.faceTargetDiceCountOne, data.diceList));
	const str = "face calculation sent to parent"
	const message = {
		str: str
	};
	self.postMessage(message);
});