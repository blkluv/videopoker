export const APT_DECIMALS = 100000000;

/**
 * Parses a decimal number into a bigint.
 *
 * @throws {SyntaxError} When the input contains invalid characters or the format is invalid.
 */
export function toBigInt(value: string): bigint {
	return BigInt(Math.floor(+value * APT_DECIMALS));
}

/**
 * Formats an integer used by the network into a decimal representation without
 * losing precision.
 */
export function formatNumber(amount: string | bigint | number): string {
	const formatEnd = (str: string) => str.replace(/0+$/, "");
	const str = amount.toString();
	if(str === "0") {
		return str;
	} else if(str.length > 8) {
		// greater than 1 eth
		const start = str.slice(0, -8);
		const end = formatEnd(str.substr(str.length - 8));
		return end === "" ? start : `${start}.${end}`;
	} else {
		return `0.${formatEnd(str.padStart(8, "0"))}`
	}
}

export function formatDate(date: Date): string {
	const year = date.getFullYear().toString().padStart(4, "0");
	const month = pad2(date.getMonth() + 1);
	const day = pad2(date.getDate());
	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());
	const seconds = pad2(date.getSeconds());
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function pad2(value: number): string {
	return value.toString().padStart(2, "0");
}
