import React from "react";
import styled from "styled-components";

const Input = styled.input`
	width: 4rem;
	height: auto;
	border-radius: 8px;
	padding: 0.5rem;
	font-family: Nunito;
	color: #282c34;
	margin: 0.5rem;
	transition: box-shadow 300ms ease-in-out;

	&:focus {
		outline: 0;
		box-shadow: 0 0 5px 2px #2684ff;
	}
`;

const NumberInput = props => {
	console.log("rendering numberInput");
	const handleChange = e => {
		const newValue = e.target.value ? parseInt(e.target.value) : e.target.value;
		const inputName = e.target.name;
		props.inputCallback({ [inputName]: newValue });
	};
	return (
		<Input
			type="number"
			min={props.min}
			name={props.name}
			value={props.inputValue}
			onChange={handleChange}
			placeholder={props.placeholder}
		/>
	);
};

export default NumberInput;
