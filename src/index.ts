import puppeteer from '@cloudflare/puppeteer';
import { formatAccessibilityResults, isValidUrl } from './utils';

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
		const page = await browser.newPage();

		// Bypass Content Security Policy (CSP) for the page, often necessary to allow injected scripts like axe-core to run
		await page.setBypassCSP(true);

		try {
			await page.goto(targetUrl, {
				waitUntil: 'networkidle0', // Wait until network activity is idle, indicating the page has loaded
				timeout: 10000,
			});
		} catch (e: any) {
			console.error(`Error navigating to ${targetUrl}: ${e.message}`);
			if (browser) await browser.close();
			return new Response(`Failed to navigate to URL: ${e.message}`, {
				status: 500,
			});
		}

		// inject the axe-core script into the page
		try {
			await page.addScriptTag({ url: axeScriptUrl });
		} catch (e: any) {
			if (browser) await browser.close();
			return new Response(`Failed to inject axe-core: ${e.message}`, {
				status: 500,
			});
		}

		// Wait for the `axe` object to be defined on the window object in the page's context.
		try {
			await page.waitForFunction('window.axe !== undefined', {
				timeout: 15000, // 15-second timeout
			});
		} catch (e: any) {
			if (browser) await browser.close();
			return new Response('axe-core script did not load correctly in the page context.', { status: 500 });
		}

		const accessibilityResults = await page.evaluate(async () => {
			// You can configure axe before running if needed:
			// window.axe.configure({ rules: [ { id: 'color-contrast', enabled: true } ] });

			// @ts-ignore // Tell TypeScript to ignore that 'axe' is not defined in Worker's scope
			return await window.axe.run();
			// To scan specific parts of the page, you can pass a context:
			// return await window.axe.run(document.body, { /* options */ });
		});

		return new Response(JSON.stringify(formatAccessibilityResults(accessibilityResults), null, 2), {
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		});
	},
} satisfies ExportedHandler<Env>;
