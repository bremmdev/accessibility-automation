import puppeteer, { Browser } from '@cloudflare/puppeteer';
import { formatAccessibilityResults, isValidUrl, setupPage } from './utils';

interface Env {
	MYBROWSER: Fetcher;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const axeScriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js';

		const { searchParams } = new URL(request.url);
		let targetUrl = searchParams.get('url');

		if (!isValidUrl(targetUrl)) {
			return new Response('Invalid URL format.', {
				status: 400,
			});
		} else {
			targetUrl = targetUrl!.trim() as string;
		}

		const browser = await puppeteer.launch(env.MYBROWSER);
		const page = await setupPage(browser);

		let accessibilityResults;

		// go to url and inject axe-core script and wait for it to load
		try {
			await page.goto(targetUrl, {
				waitUntil: 'networkidle0', // Wait until network activity is idle, indicating the page has loaded
				timeout: 10000,
			});
			await page.addScriptTag({ url: axeScriptUrl });
			await page.waitForFunction('window.axe !== undefined', {
				timeout: 15000,
			});
			accessibilityResults = await page.evaluate(async () => {
				// window.axe.configure({ })

				// @ts-ignore // Tell TypeScript to ignore that 'axe' is not defined in Worker's scope
				return await window.axe.run();
				// To scan specific parts of the page, you can pass a context:
				// return await window.axe.run(document.body, { /* options */ });
			});
		} catch (e: any) {
			if (browser) await browser.close();
			return new Response(`Error during execution: ${e.message}`, {
				status: 500,
			});
		}

		return new Response(JSON.stringify(formatAccessibilityResults(accessibilityResults), null, 2), {
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		});
	},
} satisfies ExportedHandler<Env>;
