import {useDatetimeContext} from "../contexts/datetime";
import {DateSettings, TimeSettings} from "../utils/datetime";

export default function FormatDateTime({ date, ...settings }: { date: Date } & DateSettings & TimeSettings) {

	const { formatDateTime } = useDatetimeContext();

	return <>{formatDateTime(date, settings)}</>
}

export function FormatDate({ date, ...settings }: { date: Date } & DateSettings) {

	const { formatDate } = useDatetimeContext();

	return <>{formatDate(date, settings)}</>
}

export function FormatTime({ date, ...settings }: { date: Date } & TimeSettings) {

	const { formatTime } = useDatetimeContext();

	return <>{formatTime(date, settings)}</>
}
