import diceLib from "./components/diceLib";

// eslint-disable-line no-restricted-globals
self.addEventListener("message", e => {
	console.log(e.data);
	console.log(diceLib);
	let message = {
		string: "This is a message from the worker"
	};
	self.postMessage(message);
});
