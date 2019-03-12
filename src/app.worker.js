import diceLib from "./components/diceLib"

export default () => {
	//eslint-disable-next-line
	self.addEventListener('message', e => {
		let data = e.data
		if (!e) return;

		let calculationType = data.calculationType;
		let polyDice = data.polyDice;
		let sumTargetValueOne = data.sumTargetValueOne;
		let sumTargetValueType = data.sumTargetValueType;
		console.log(calculationType);
		console.log(polyDice);
		console.log(sumTargetValueOne);
		console.log(sumTargetValueType);
		console.log(diceLib.diceSumExactly(sumTargetValueOne, polyDice));

		let str = "This is a message"

		let message = {
			string: str
		}
		postMessage(message);
	})
}