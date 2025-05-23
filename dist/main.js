const ACCESSBILITY_FORM = 'accessibility-form';

const accessibilityForm = document.querySelector(`#${ACCESSBILITY_FORM}`);

document.body.addEventListener('htmx:beforeRequest', function (event) {
	if (event.detail.elt.id === ACCESSBILITY_FORM) {
		const submitButton = event.detail.elt.querySelector('button[type="submit"]');
		if (submitButton) {
			submitButton.setAttribute('disabled', 'disabled');
		}
		clearFormOnSubmit();
	}
});

// Use configRequest event to modify the request before it is sent and convert textarea input to JSON
document.body.addEventListener('htmx:configRequest', function (event) {
	if (event.detail.elt.id === ACCESSBILITY_FORM) {
		// Get current value of 'blocklist' from the form submission
		const blocklistText = event.detail.parameters.blocklist;

		let processedBlocklistPayload;

		// Check if blocklistText is a string and not just whitespace
		if (typeof blocklistText === 'string' && blocklistText.trim() !== '') {
			processedBlocklistPayload = blocklistText
				.split('\n')
				.map((item) => item.trim())
				.filter((item) => item !== '');
		} else {
			// If blocklistText is not a string or is empty, set it to an empty array
			processedBlocklistPayload = [];
		}

		// Update the 'blocklist' parameter that will be sent to the server
		event.detail.parameters.blocklist = JSON.stringify(processedBlocklistPayload);

		// Add unique ID to the form submission for tracking status
		const id = crypto.randomUUID();
		event.detail.parameters.id = id;

		// Set up SSE to receive status updates from server
		addPollingAttributes(id);
	}
});

document.body.addEventListener('htmx:afterRequest', function (event) {
	// remove the status polling
	if (event.detail.elt.id === ACCESSBILITY_FORM) {
		const submitButton = event.detail.elt.querySelector('button[type="submit"]');
		if (submitButton) {
			submitButton.removeAttribute('disabled');
		}
	}
});

function clearFormOnSubmit() {
	// Clear the form on submit
	const formError = document.querySelector('#accessibility-form-error');
	if (formError) {
		formError.innerHTML = '';
	}
	document.querySelector('#results').innerHTML = '';
	document.querySelector('#accessibility-form-status').innerHTML = '';
}

function addPollingAttributes(id) {
	const statusPoller = document.querySelector('#accessibility-form-status');

	if (!statusPoller) return;

	statusPoller.setAttribute('hx-ext', 'sse');
	statusPoller.setAttribute('sse-connect', `/api/accessibility/status/${id}`);
	statusPoller.setAttribute('sse-swap', 'status-update');
	statusPoller.setAttribute('sse-close', 'fulfilled');
	statusPoller.setAttribute('hx-target', '#accessibility-form-status');

	// Force HTMX to process the new attributes
	htmx.process(statusPoller);
}
