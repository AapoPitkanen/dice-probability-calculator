import React from "react";
import ReactDOM from "react-dom";
import DiceProbabilityCalculator from "./DiceProbabilityCalculator";

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<DiceProbabilityCalculator />, div);
	ReactDOM.unmountComponentAtNode(div);
});
