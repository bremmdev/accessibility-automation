import { Browser, Page } from '@cloudflare/puppeteer';

export function isValidUrl(url: string): boolean {
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
export async function setupPage({ browser, isMobile, blocklist }: { browser: Browser; isMobile: boolean; blocklist?: string[] }) {
	const page = await browser.newPage();

	if (isMobile) {
		await page.setUserAgent(
			'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
		);
		await page.setViewport({
			width: 375,
			height: 812,
			deviceScaleFactor: 2,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		});
	} else {
		page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
		page.setViewport({
			width: 1920,
			height: 1080,
			deviceScaleFactor: 1,
			isMobile: false,
			hasTouch: false,
			isLandscape: true,
		});
	}

	// Bypass Content Security Policy (CSP) for the page, often necessary to allow injected scripts like axe-core to run
	await page.setBypassCSP(true);

	// Block scripts to prevent loading of unnecessary resources and blocking cookie consent scripts etc
	if (Array.isArray(blocklist) && blocklist.length > 0) {
		await blockScripts(page, blocklist);
	}

	return page;
}

//block specific script from loading, useful for blocking cookie consent scripts etc
//blocklist: array of urls, domain names or files names to match against the request URL
export async function blockScripts(page: Page, blocklist: string[] = []) {
	await page.setRequestInterception(true);
	page.on('request', (request) => {
		if (request.resourceType() === 'script' && blocklist.some((url) => request.url().includes(url))) {
			request.abort();
		} else {
			request.continue();
		}
	});
}

export async function performAccessibilityTest(page: Page, targetUrl: string, id: string, KV: KVNamespace) {
	const axeScriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js';
	await page.goto(targetUrl, {
		waitUntil: 'networkidle0', // Wait until network activity is idle, indicating the page has loaded
		timeout: 20000,
	});
	await updateTestStatus(KV, id, 'navigated to page');
	await page.addScriptTag({ url: axeScriptUrl });
	await page.waitForFunction('window.axe !== undefined', {
		timeout: 15000,
	});
	const accessibilityResults = await page.evaluate(async () => {
		// window.axe.configure({ })

		// @ts-ignore // Tell TypeScript to ignore that 'axe' is not defined in Worker's scope
		return await window.axe.run();
		// To scan specific parts of the page, you can pass a context:
		// return await window.axe.run(document.body, { /* options */ });
	});
	await updateTestStatus(KV, id, 'obtained results');
	return accessibilityResults;
}

export async function updateTestStatus(KV: KVNamespace, id: string, status: string) {
	// Update the status of the test in the database or any other storage
	// This is a placeholder function, implement your own logic here
	console.log(`Test ID: ${id}, Status: ${status}`);
	await KV.put(id, status);
}
