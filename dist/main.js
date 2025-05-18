const accessibilityForm = document.querySelector('#accessibility-form');

// Use configRequest event to modify the request before it is sent and convert textarea input to JSON
document.body.addEventListener('htmx:configRequest', function (event) {
	if (event.detail.elt.id === 'accessibility-form') {
		console.log(event);
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
	}
});
