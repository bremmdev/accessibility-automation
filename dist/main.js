const accessibilityForm = document.querySelector('#accessibility-form');

function clearFormOnSubmit() {
	// Clear the form on submit
	const formError = document.querySelector('#accessibility-form-error');
	if (formError) {
		formError.innerHTML = '';
	}
	document.querySelector('#results').innerHTML = '';
}

// Use configRequest event to modify the request before it is sent and convert textarea input to JSON
document.body.addEventListener('htmx:configRequest', function (event) {
	if (event.detail.elt.id === 'accessibility-form') {
		clearFormOnSubmit();

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

		// Add
		const submitButton = accessibilityForm.querySelector('button[type="submit"]');
		if (submitButton) {
			submitButton.setAttribute('hx-get', `/api/accessibility/${id}`);
			submitButton.setAttribute('hx-trigger', 'every 1s');
			submitButton.setAttribute('hx-swap', 'innerHTML');
			submitButton.setAttribute('hx-target', '#accessibility-form-status');

			// Force HTMX to process the new attributes
			htmx.process(submitButton);

			submitButton.setAttribute('disabled', 'disabled');
		}
	}
});

document.body.addEventListener('htmx:afterRequest', function (event) {
	// remove the status polling
	if (event.detail.elt.id === 'accessibility-form') {
		const submitButton = accessibilityForm.querySelector('button[type="submit"]');
		if (submitButton) {
			submitButton.removeAttribute('hx-get');
			submitButton.removeAttribute('hx-trigger');
			submitButton.removeAttribute('hx-swap');
			submitButton.removeAttribute('hx-target');
			submitButton.removeAttribute('disabled');

			// Force HTMX to process the new attributes
			htmx.process(submitButton);
		}
		document.querySelector('#accessibility-form-status').innerHTML = '';
	}
});
