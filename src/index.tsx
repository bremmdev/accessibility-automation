import { Hono } from 'hono';
import puppeteer from '@cloudflare/puppeteer';
import { formatAccessibilityResults, isValidUrl, performAccessibilityTest, setupPage, updateTestStatus } from './utils';
import { renderer } from './renderer';
import Home from './pages/home';
import AccessibilityTestForm from './components/AccessibilityTestForm';

interface Env {
	MYBROWSER: Fetcher;
	KV: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();
app.use(renderer);

// FRONTEND

app.get('/', (c) => c.render(<Home />));

// ACCESSIBILITY TESTING

app.get('/api/accessibility/:id', async (c) => {
	const id = c.req.param('id');

	const status = await c.env.KV.get(id);

	if (status?.includes('failed')) {
		return c.html(<span></span>);
	}

	return c.html(<span>{`${status}...`}</span>);
});

app.post('api/accessibility', async (c) => {
	const input = (await c.req.json()) as Input;
	const isHTMXRequest = c.req.header('HX-Request') === 'true';
	const targetUrl = input.url;
	const id = input.id;

	await updateTestStatus(c.env.KV, id, 'initialized');

	const blocklist = (input.blocklist ? JSON.parse(input.blocklist) : []) as string[];

	if (typeof targetUrl !== 'string' || !isValidUrl(targetUrl)) {
		await updateTestStatus(c.env.KV, id, 'failed - invalid url');
		if (!isHTMXRequest)
			return new Response('Invalid URL format.', {
				status: 400,
			});

		// If it's an HTMX request, return the form with an error message
		c.header('HX-Retarget', '#accessibility-form');
		c.header('HX-Reswap', 'outerHTML');
		return c.html(<AccessibilityTestForm error="Invalid URL format." url={targetUrl} blocklist={blocklist} />);
	}

	const browser = await puppeteer.launch(c.env.MYBROWSER);
	updateTestStatus(c.env.KV, id, 'remote browser launched');

	const pageConfig = {
		browser,
		blocklist,
	};

	const page = await setupPage({ ...pageConfig, isMobile: false });
	const mobilePage = await setupPage({ ...pageConfig, isMobile: true });

	let [accessibilityResults, accessibilityResultsMobile] = [null, null];

	// go to url, inject axe-core script, run it on both desktop and mobile
	try {
		[accessibilityResults, accessibilityResultsMobile] = await Promise.all([
			performAccessibilityTest(page, targetUrl, id, c.env.KV),
			performAccessibilityTest(mobilePage, targetUrl, id, c.env.KV),
		]);
	} catch (e: any) {
		await updateTestStatus(c.env.KV, id, `failed - ${e.message}`);
		if (browser) await browser.close();

		if (!isHTMXRequest)
			return new Response(`Error during execution: ${e.message}`, {
				status: 500,
			});

		// If it's an HTMX request, return the form with an error message
		c.header('HX-Retarget', '#accessibility-form');
		c.header('HX-Reswap', 'outerHTML');
		return c.html(<AccessibilityTestForm error={`Error during execution: ${e.message}`} url={targetUrl} blocklist={blocklist} />);
	}

	await updateTestStatus(c.env.KV, id, 'completed');

	return c.json({
		desktop: formatAccessibilityResults(accessibilityResults),
		mobile: formatAccessibilityResults(accessibilityResultsMobile),
	});
});

export default app;
