import styled, { createGlobalStyle } from "styled-components";
import { animated } from "react-spring";

// If you're wondering why there's the same background color for multiple elements and not only for the root element,
// it's because of animation trickery with z-index and transform.

const GlobalStyle = createGlobalStyle`
	html {
  		scroll-behavior: smooth;
	}

	@media (prefers-reduced-motion: reduce) {
  		html {
    		scroll-behavior: auto;
  		}
	}

	* {
		box-sizing: border-box;
		margin: 0;
		border: 0;
	}

	body {
		font-family: Nunito, Arial, Helvetica, sans-serif;
		line-height: 1.4;
		background-color: #fff;
		font-size: 100%;
	}
`;

const GlobalWrapper = styled.div`
	display: flex;
	flex-flow: column wrap;
	justify-content: center;
	align-items: center;
	color: #fff;
	background-color: #282c34;
	border-radius: 8px;
	box-shadow: 0 0 35px 2px rgba(0, 0, 0, 0.2);
	max-width: 35rem;
	position: relative;
	z-index: 10;
`;

const CalculateButton = styled.button`
	height: 3rem;
	width: 10rem;
	cursor: pointer;
	border-radius: 1.5rem;
	color: #fff;
	background-color: #3f51b5;
	font-family: "Nunito";
	transition: background-color 0.15s ease-in, box-shadow 300ms ease-in-out;
	font-size: 1rem;
	margin: 1rem;

	&:hover {
		background-color: #4a5bbf;
	}

	&:focus {
		outline: 0;
		box-shadow: 0 0 6px 3px #2a3679;
	}
`;

const ErrorMessage = styled(animated.div)`
	transform: translateX(-50%) translateY(-50%);
	box-sizing: border-box;
	box-shadow: 2px 2px 20px -2px rgba(0, 0, 0, 0.75);
	position: fixed;
	padding: 16px;
	border-radius: 16px;
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 20rem;
	height: 4rem;
	background-color: #ba3636;
	color: #fff;
	z-index: 20;
	bottom: 33%;
`;

const InputWrapper = styled.div`
	display: flex;
	flex-flow: column wrap;
	align-items: center;
	width: 100%;
	justify-content: space-around;
	background-color: #282c34;
	z-index: 10;
`;

const HeightWrapper = styled.div`
	height: ${props => props.height}px;
	transition: height 800ms ease;
	width: 100%;
	will-change: height;
`;

const FlexRow = styled.div`
	z-index: 9;
	display: flex;
	width: 100%;
	justify-content: center;
	background-color: #282c34;
	position: relative;
	padding-bottom: ${props => (props.isCalculationFinished ? "0" : "1rem")}
	border-radius: ${props => (props.isCalculationFinished ? "0" : "0 0 8px 8px")};
`;

export {
	GlobalStyle,
	GlobalWrapper,
	CalculateButton,
	ErrorMessage,
	InputWrapper,
	HeightWrapper,
	FlexRow
};
