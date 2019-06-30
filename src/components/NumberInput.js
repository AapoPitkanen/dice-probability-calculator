import React from "react";

const NumberInput = props => {
	const handleChange = e => {
		const newValue = e.target.value;
		const inputName = e.target.name;
		props.inputCallback({ [inputName]: newValue });
	};
	return (
		<input
			type="number"
			min={props.min}
			className={props.className}
			name={props.name}
			value={props.inputValue}
			onChange={handleChange}
			placeholder={props.placeholder}
		/>
	);
};

export default NumberInput;
