export function prettyTime(ms) {
	const parsed = {
		hours: Math.floor(ms / 3600000) % 24,
		minutes: Math.floor(ms / 60000) % 60,
		seconds: Math.floor(ms / 1000) % 60
	};

	const parts = [];
	if (parsed.hours > 0) {
		parts.push(`${parsed.hours}h`);
	}
	if (parsed.minutes > 0) {
		parts.push(`${parsed.minutes}m`);
	}
	if (parsed.seconds > 0) {
		parts.push(`${parsed.seconds}m`);
	}

	return parts.join(' ');
}
