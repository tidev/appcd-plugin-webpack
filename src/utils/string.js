export function first(arr) {
	return arr[0];
}

export function last(arr) {
	return arr.length ? arr[arr.length - 1] : null;
}

export function firstMatch(regex, str) {
	const m = regex.exec(str);
	return m ? m[0] : null;
}

export function hasValue(s) {
	return s && s.length;
}

export function removeAfter(delimiter, str) {
	return first(str.split(delimiter)) || '';
}

export function removeBefore(delimiter, str) {
	return last(str.split(delimiter)) || '';
}

const camelizeRE = /-(\w)/g;
export function camelize(str) {
	return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
}

export function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const hyphenateRE = /\B([A-Z])/g;
export function hyphenate(str) {
	return str.replace(hyphenateRE, '-$1').toLowerCase();
}
