import {useState} from "react";

export function useLocalStorage<T>(key: string, defaultValue: T): [ T, (value: T) => void ] {

	const [ value, setValueImpl ] = useState(() => {
		if(typeof window !== "undefined") {
			const item = window.localStorage.getItem(key);
			if(item) {
				return JSON.parse(item) as T;
			}
		}
		return defaultValue;
	});

	const setValue = (value: T) => {
		window.localStorage.setItem(key, JSON.stringify(value));
		setValueImpl(value);
	};

	return [ value, setValue ];
}
