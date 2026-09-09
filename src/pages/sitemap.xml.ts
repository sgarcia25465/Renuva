import type { APIRoute } from 'astro';

// Every page route, picked up straight from src/pages so a new page is listed
// without anyone remembering to edit the sitemap.
const routes = Object.keys(import.meta.glob('./**/*.astro'))
	.map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, ''))
	// Trailing slash: the host redirects /finishes to /finishes/, so the
	// sitemap lists the URL that answers 200 rather than the one that hops.
	.map((name) => (name === 'index' ? '' : `${name}/`))
	.sort();

export const GET: APIRoute = ({ site }) => {
	const urls = routes
		.map((route) => `\t<url><loc>${new URL(route, site).href}</loc></url>`)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
