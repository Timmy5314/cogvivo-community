// Checks every translation file against English: same keys, same {placeholders},
// no links, no HTML and no very long texts. Runs on every pull request.
import { readFileSync, readdirSync } from 'node:fs';

const fouten = [];
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|link|click|ly)\b)/i;
const HTML = /<[a-z!/][^>]*>|javascript:|&#|\\u00?3c/i;
const plekken = (s) => [...String(s).matchAll(/\{([^{}]+)\}/g)].map((m) => m[1]).sort().join(',');

function leesJson(pad) {
	try {
		return JSON.parse(readFileSync(pad, 'utf8'));
	} catch (e) {
		fouten.push(`${pad}: not valid JSON (${e.message})`);
		return null;
	}
}

function vergelijk(pad, en, taal, tekstenVan) {
	for (const k of Object.keys(taal)) {
		if (k === '$schema' || k === '_about') continue;
		if (!(k in en)) {
			fouten.push(`${pad}: key "${k}" does not exist in en.json`);
			continue;
		}
		const nu = tekstenVan(taal[k]);
		const basis = tekstenVan(en[k]);
		if (!nu) {
			fouten.push(`${pad}: "${k}" has the wrong shape`);
			continue;
		}
		nu.forEach((t, i) => {
			if (typeof t !== 'string') return fouten.push(`${pad}: "${k}" must be text`);
			if (t.length > 1200) fouten.push(`${pad}: "${k}" is too long`);
			if (LINK.test(t) && !LINK.test(basis[i] ?? '')) fouten.push(`${pad}: "${k}" contains a link`);
			if (HTML.test(t)) fouten.push(`${pad}: "${k}" contains HTML or code`);
			if (plekken(t) !== plekken(basis[i] ?? '')) fouten.push(`${pad}: "${k}" must keep the {placeholders} of English: ${plekken(basis[i] ?? '') || 'none'}`);
		});
	}
}

for (const [map, tekstenVan] of [
	['translations/app', (v) => (typeof v === 'string' ? [v] : null)],
	['translations/challenges', (v) => (Array.isArray(v) && v.length === 3 ? v : null)]
]) {
	const en = leesJson(`${map}/en.json`);
	if (!en) continue;
	for (const f of readdirSync(map)) {
		if (!f.endsWith('.json') || f === 'en.json') continue;
		if (!/^[a-z]{2,3}(-[A-Z]{2})?\.json$/.test(f)) {
			fouten.push(`${map}/${f}: name the file after the language code, for example ko.json or pt-BR.json`);
			continue;
		}
		const taal = leesJson(`${map}/${f}`);
		if (taal && typeof taal === 'object') vergelijk(`${map}/${f}`, en, taal, tekstenVan);
	}
}

if (fouten.length) {
	console.log(`Found ${fouten.length} problem(s):\n`);
	for (const f of fouten.slice(0, 200)) console.log(`- ${f}`);
	process.exit(1);
}
console.log('All translations look good. Thank you!');
