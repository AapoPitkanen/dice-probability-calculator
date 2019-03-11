import React, { Component } from "react";
import styled from "C:/Code/React_projects/dice_probability_calculator/node_modules/styled-components";

const Paragraph = styled.p`
	font-size: 2em;
	text-align: center;
	color: ${props => (props.primary ? "blue" : "white")};
	border-radius: 8px;
	background-color: ${props => (props.primary ? "white" : "blue")};
	width: 15rem;
`;

export default class StyledTest extends Component {
	render() {
		return <Paragraph primary={this.props.primary}>{this.props.text}</Paragraph>;
	}
}
