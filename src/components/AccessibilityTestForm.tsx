type Props = {
	url?: string;
	blocklist?: string[];
	error?: string;
};

export default function AccessibilityTestForm({ url, blocklist, error }: Props) {
	return (
		<form
			id="accessibility-form"
			hx-post="/api/accessibility"
			hx-target="#results"
			hx-swap="innerHTML"
			hx-indicator=".spinner"
			hx-ext="json-enc"
			className="w-full"
		>
			<label for="url" class="block text-gray-700 mb-2">
				url
			</label>
			<input
				type="text"
				name="url"
				id="url"
				class="border border-gray-300 p-2 rounded mb-4 w-full"
				placeholder="Enter URL to test"
				value={url ?? ''}
			/>
			<label for="blocklist" class="block text-gray-700 mb-2">
				Blocklist (optional)
			</label>
			<textarea
				name="blocklist"
				id="blocklist"
				class="border border-gray-300 p-2 rounded mb-4 w-full"
				placeholder="Enter blocklist (one per line)"
				rows={10}
			>
				{blocklist?.join('\n') ?? ''}
			</textarea>

			<button
				type="submit"
				class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 relative disabled:opacity-70 disabled:cursor-not-allowed"
			>
				Start Accessibility Test{' '}
				<span
					id="accessibility-form-spinner"
					className="absolute inset-0 bg-blue-500 hidden items-center justify-items-center z-10 rounded has-[.htmx-request]:grid"
				>
					<span className="spinner animate-spin rounded-full border-2 border-t-2 border-t-blue-500 border-gray-200 size-6"></span>
				</span>
			</button>
			<span id="accessibility-form-status" className="ml-2"></span>

			{error && (
				<div id="accessibility-form-error" className="text-red-500 mt-4">
					{error}
				</div>
			)}
		</form>
	);
}
