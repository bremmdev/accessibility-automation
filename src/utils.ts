import { Browser } from '@cloudflare/puppeteer';

export function isValidUrl(url: string | null): boolean {
	if (!url) {
		return false;
	}

	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}

export function formatAccessibilityResults(results: any) {
	const formattedResults = {
		violations: [],
	};

	if (results && results.violations) {
		formattedResults.violations = results.violations.map((violation: any) => ({
			id: violation.id,
			description: violation.description,
			impact: violation.impact,
			elements: violation.nodes.map((node: any) => ({
				html: node.html,
				target: node.target,
				failureSummary: node.failureSummary,
			})),
		}));
	}

	return formattedResults;
}

// Setup a new page with specific user agent and viewport settings to simulate a desktop browser
export async function setupPage(browser: Browser) {
	const page = await browser.newPage();
	page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
	page.setViewport({
		width: 1920,
		height: 1080,
		deviceScaleFactor: 1,
		isMobile: false,
		hasTouch: false,
		isLandscape: true,
	});

	// Bypass Content Security Policy (CSP) for the page, often necessary to allow injected scripts like axe-core to run
	await page.setBypassCSP(true);
	return page;
}
