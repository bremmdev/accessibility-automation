import puppeteer, { Browser } from '@cloudflare/puppeteer';
import { formatAccessibilityResults, isValidUrl, performAccessibilityTest, setupPage } from './utils';

interface Env {
	MYBROWSER: Fetcher;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', {
				status: 405,
				headers: {
					Allow: 'POST',
					'Content-Type': 'text/plain',
				},
			});
		}

		const input = (await request.json()) as Input;
		const targetUrl = input.url;

		if (typeof targetUrl !== 'string' || !isValidUrl(targetUrl)) {
			return new Response('Invalid URL format.', {
				status: 400,
			});
		}

		const browser = await puppeteer.launch(env.MYBROWSER);

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

		return new Response(
			JSON.stringify(
				{ desktop: formatAccessibilityResults(accessibilityResults), mobile: formatAccessibilityResults(accessibilityResultsMobile) },
				null,
				2
			),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 200,
			}
		);
	},
} satisfies ExportedHandler<Env>;
