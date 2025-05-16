import { Hono } from 'hono';
import puppeteer, { Browser } from '@cloudflare/puppeteer';
import { formatAccessibilityResults, isValidUrl, performAccessibilityTest, setupPage } from './utils';

interface Env {
	MYBROWSER: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// FRONTEND

app.get('/', (c) => c.text('Hello Cloudflare Workers!'));

// ACCESSIBILITY TESTING

app.post('api/accessibility', async (c) => {
	const input = (await c.req.json()) as Input;
	const targetUrl = input.url;

	if (typeof targetUrl !== 'string' || !isValidUrl(targetUrl)) {
		return new Response('Invalid URL format.', {
			status: 400,
		});
	}

	const browser = await puppeteer.launch(c.env.MYBROWSER);

	const pageConfig = {
		browser,
		blocklist: input.blocklist || [],
	};

	const page = await setupPage({ ...pageConfig, isMobile: false });
	const mobilePage = await setupPage({ ...pageConfig, isMobile: true });

	let [accessibilityResults, accessibilityResultsMobile] = [null, null];

	// go to url, inject axe-core script, run it on both desktop and mobile
	try {
		[accessibilityResults, accessibilityResultsMobile] = await Promise.all([
			performAccessibilityTest(page, targetUrl),
			performAccessibilityTest(mobilePage, targetUrl),
		]);
	} catch (e: any) {
		if (browser) await browser.close();
		return new Response(`Error during execution: ${e.message}`, {
			status: 500,
		});
	}

	return c.json({
		desktop: formatAccessibilityResults(accessibilityResults),
		mobile: formatAccessibilityResults(accessibilityResultsMobile),
	});
});

export default app;
