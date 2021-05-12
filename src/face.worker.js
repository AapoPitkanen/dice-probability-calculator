import diceLib from './components/diceLib';

/* eslint-disable no-restricted-globals */
self.addEventListener('message', (e) => {
  const diceArr = e.data.diceArr;
  const successes = e.data.faceTargetDiceCountOne;
  const successes2 = e.data.faceTargetDiceCountTwo;
  const target = e.data.faceTargetValueOne;
  const target2 = e.data.faceTargetValueTwo;
  const faceTargetDiceCountType = e.data.faceTargetDiceCountType;
  const faceTargetValueType = e.data.faceTargetValueType;

  const textOptions = {
    faceTargetDiceCountExactly: 'exactly',
    faceTargetDiceCountAtLeast: 'at least',
    faceTargetDiceCountAtMost: 'at most',
    faceTargetDiceCountBetween: 'between',
    faceTargetDiceCountNotBetween: 'outside of range',
    faceTargetValueExactly: 'exactly',
    faceTargetValueAtLeast: 'at least',
    faceTargetValueAtMost: 'at most',
    faceTargetValueBetween: 'between',
    faceTargetValueNotBetween: 'not between',
  };

  let probabilityValue = diceLib.calculateBinomialProbability(
    target,
    successes,
    diceArr,
    target2,
    successes2,
    faceTargetDiceCountType,
    faceTargetValueType
  );

  /* 
  	For some reason the recursive "dice count not between" calculations return the wrong probability if the standard complement (1 - P) is used, 
	but the correct probability if it's in the form (P - 1). When the complement is calculated as (P - 1), the resulting probability will have the wrong sign, 
	we'll just change that here.
	*/
  probabilityValue =
    faceTargetDiceCountType === 'faceTargetDiceCountNotBetween'
      ? (-probabilityValue * 100).toFixed(2)
      : (probabilityValue * 100).toFixed(2);

  const probabilityTextDiceCount = [
    'faceTargetDiceCountBetween',
    'faceTargetDiceCountNotBetween',
  ].includes(faceTargetDiceCountType)
    ? `The probability of rolling ${textOptions[faceTargetDiceCountType]} ${successes} to ${successes2} dice where`
    : `The probability of rolling ${textOptions[faceTargetDiceCountType]} ${successes} dice where`;

  const probabilityTextTargetValue = [
    'faceTargetValueBetween',
    'faceTargetValueNotBetween',
  ].includes(faceTargetValueType)
    ? `the face value is ${textOptions[faceTargetValueType]} ${target} and ${target2} is `
    : `the face value is ${textOptions[faceTargetValueType]} ${target} is `;

  const probabilityText = `${probabilityTextDiceCount} ${probabilityTextTargetValue}`;

  const message = {
    probabilityText: probabilityText,
    probabilityValue: probabilityValue,
  };

  self.postMessage(message);
});
