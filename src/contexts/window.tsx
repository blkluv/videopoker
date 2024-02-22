import {useState} from "react";
import {createContainer} from "unstated-next";

export const WindowContainer = createContainer(() => {

	const [ width, setWidth ] = useState<number | null>(null);

	function setTitle(title?: string | string[], description?: string) {
		document.title = title ? (Array.isArray(title) ? title.join(" - ") : title) + " - Snype" : "Snype - Discover Aptos NFTs";
	}

	function resetWindow() {
		setTitle();
		setWidth(null);
	}

	return { width, setWidth, setTitle, resetWindow };
});

export const useWindowContext = () => WindowContainer.useContainer();
