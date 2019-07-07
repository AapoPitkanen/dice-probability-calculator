import React from "react";
import styled from "styled-components";
import { useSpring, animated, config } from "react-spring";

const ProbabilityTextOutput = styled(animated.div)`
	font-size: 1rem;
`;

const ProbabilityValueOutput = styled(animated.div)`
	font-size: 1.25rem;
`;

const OutputWrapper = styled(animated.div)`
	display: flex;
	justify-content: center;
	flex-direction: column
	align-items: center;
	width: 100%;
	border-radius: 0 0 8px 8px;
	background-color: #282c34;
	padding: 0 2rem;
	z-index: 1;
	position: absolute;
	height: 10%;
	bottom: -10%;
`;

const Output = ({ probabilityText, probability }) => {
	const dropDown = useSpring({
		from: { transform: "translateY(-100%)" },
		to: { transform: "translateY(0)" },
		config: config.slow
	});

	const fadeIn = useSpring({
		from: { opacity: 0 },
		to: { opacity: 1 },
		config: config.slow,
		delay: 300
	});

	return (
		<OutputWrapper style={dropDown}>
			<ProbabilityTextOutput style={fadeIn}>
				{probabilityText}
			</ProbabilityTextOutput>
			<ProbabilityValueOutput style={fadeIn}>
				{probability}
			</ProbabilityValueOutput>
		</OutputWrapper>
	);
};

export default Output;
