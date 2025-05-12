import puppeteer, { Browser } from '@cloudflare/puppeteer';
import { formatAccessibilityResults, isValidUrl, performAccessibilityTest, setupPage } from './utils';

interface Env {
	MYBROWSER: Fetcher;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
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
		const page = await setupPage({ browser, isMobile: false });
		const mobilePage = await setupPage({ browser, isMobile: true });

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
