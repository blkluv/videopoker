export type DateFormat = "iso" | "ymd" | "mdy" | "dmy";

export type TimeFormat = "24" | "12";

export interface DateSettings {
	utc?: boolean
}

export interface TimeSettings {
	utc?: boolean,
	seconds?: boolean
}

const m = (n: number) => n.toString().padStart(2, "0");

const y = (n: number) => n.toString().padStart(4, "0");

const z = (n: number) => n === 0 ? 12 : n;

export function formatDate(date: Date, format: DateFormat, { utc = false }: DateSettings = {}) {
	const yy = y(utc ? date.getUTCFullYear() : date.getFullYear());
	const mm = m((utc ? date.getUTCMonth() : date.getMonth()) + 1);
	const dd = m(utc ? date.getUTCDate() : date.getDate());
	switch(format) {
		case "ymd": return `${yy}/${mm}/${dd}`;
		case "mdy": return `${mm}/${dd}/${yy}`;
		case "dmy": return `${dd}/${mm}/${yy}`;
		default: return `${yy}-${mm}-${dd}`;
	}
}

export function formatTime(date: Date, format: TimeFormat, { utc = false, seconds = true }: TimeSettings = {}) {
	const is12 = format === "12";
	const hh = utc ? date.getUTCHours() : date.getHours();
	const mm = utc ? date.getUTCMinutes() : date.getMinutes();
	const ss = utc ? date.getUTCSeconds() : date.getSeconds();
	return `${m(is12 ? z(hh % 12) : hh)}:${m(mm)}${seconds ? ":" + m(ss) : ""}${is12 ? hh >= 12 ? " PM" : " AM" : ""}`;
}

export function formatDateTime(date: Date, dateFormat: DateFormat, timeFormat: TimeFormat, settings: DateSettings & TimeSettings = {}) {
	return formatDate(date, dateFormat, settings) + "T" + formatTime(date, timeFormat, settings);
}
