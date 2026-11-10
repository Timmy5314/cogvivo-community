// Checks every translation file against English: same keys, same {placeholders},
// no links, no HTML and no very long texts. Runs on every pull request.
import { readFileSync, readdirSync } from 'node:fs';

const problems = [];
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|link|click|ly)\b)/i;
const HTML = /<[a-z!/][^>]*>|javascript:|&#|\\u00?3c/i;
const placeholders = (s) => [...String(s).matchAll(/\{([^{}]+)\}/g)].map((m) => m[1]).sort().join(',');

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch (e) {
		problems.push(`${path}: not valid JSON (${e.message})`);
		return null;
	}
}

function compare(path, english, translation, textsOf) {
	for (const key of Object.keys(translation)) {
		if (key === '$schema' || key === '_about') continue;
		if (!(key in english)) {
			problems.push(`${path}: key "${key}" does not exist in en.json`);
			continue;
		}
		const texts = textsOf(translation[key]);
		const base = textsOf(english[key]);
		if (!texts) {
			problems.push(`${path}: "${key}" has the wrong shape`);
			continue;
		}
		texts.forEach((text, i) => {
			if (typeof text !== 'string') return problems.push(`${path}: "${key}" must be text`);
			if (text.length > 1200) problems.push(`${path}: "${key}" is too long`);
			if (LINK.test(text) && !LINK.test(base[i] ?? '')) problems.push(`${path}: "${key}" contains a link`);
			if (HTML.test(text)) problems.push(`${path}: "${key}" contains HTML or code`);
			if (placeholders(text) !== placeholders(base[i] ?? ''))
				problems.push(`${path}: "${key}" must keep the {placeholders} of English: ${placeholders(base[i] ?? '') || 'none'}`);
		});
	}
}

for (const [dir, textsOf] of [
	['translations/app', (v) => (typeof v === 'string' ? [v] : null)],
	['translations/challenges', (v) => (Array.isArray(v) && v.length === 3 ? v : null)]
]) {
	const english = readJson(`${dir}/en.json`);
	if (!english) continue;
	for (const file of readdirSync(dir)) {
		if (!file.endsWith('.json') || file === 'en.json') continue;
		if (!/^[a-z]{2,3}(-[A-Z]{2})?\.json$/.test(file)) {
			problems.push(`${dir}/${file}: name the file after the language code, for example ko.json or pt-BR.json`);
			continue;
		}
		const translation = readJson(`${dir}/${file}`);
		if (translation && typeof translation === 'object') compare(`${dir}/${file}`, english, translation, textsOf);
	}
}

if (problems.length) {
	console.log(`Found ${problems.length} problem(s):\n`);
	for (const p of problems.slice(0, 200)) console.log(`- ${p}`);
	process.exit(1);
}
console.log('All translations look good. Thank you!');
