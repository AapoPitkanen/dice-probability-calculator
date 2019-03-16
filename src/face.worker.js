import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	const data = e.data;
	const str = "face calculation sent to parent"
	const message = {
		str: str
	};
	self.postMessage(message);
});