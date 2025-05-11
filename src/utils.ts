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
