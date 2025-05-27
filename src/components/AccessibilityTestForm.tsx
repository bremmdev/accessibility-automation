type Props = {
	url?: string;
	blocklist?: string[];
	error?: string;
};

export default function AccessibilityTestForm({ url, blocklist, error }: Props) {
	return (
		<div class="py-12 sm:py-16 px-4" id="accessibility-form-container">
			<div class="p-6 sm:p-8 md:p-10">
				<h2 class="text-3xl lg:text-4xl font-medium text-gray-800 text-center mb-8">Scan your website</h2>

				<form
					id="accessibility-form"
					hx-post="/api/accessibility"
					hx-target="#results"
					hx-swap="innerHTML"
					hx-ext="json-enc"
					class="w-full space-y-6 group"
				>
					<div>
						<label for="url" class="block text-sm font-medium text-gray-700 mb-1">
							URL
						</label>
						<input
							type="text"
							name="url"
							id="url"
							class="border border-gray-300 p-3 rounded-md w-full shadow-sm focus:ring-blue-primary focus:border-blue-primary"
							placeholder="Enter URL to test"
							value={url ?? ''}
						/>
					</div>

					<div>
						<label for="blocklist" class="block text-sm font-medium text-gray-700 mb-1">
							Blocklist (optional)
						</label>
						<textarea
							name="blocklist"
							id="blocklist"
							class="border border-gray-300 p-3 rounded-md w-full shadow-sm focus:ring-blue-primary focus:border-blue-primary"
							placeholder="Enter blocklist (one per line)"
							rows={7}
						>
							{blocklist?.join('\n') ?? ''}
						</textarea>
					</div>

					<div class="pt-2 text-center">
						<button
							type="submit"
							class="bg-blue-primary text-white px-8 py-3 rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:bg-blue-primary/80 focus:ring-blue-primary font-semibold text-base relative disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
						>
							Start Accessibility Test
							{/* Spinner Overlay: shown when form has 'htmx-request' class */}
							<span class="absolute inset-0 bg-blue-primary hidden group-[.htmx-request]:flex items-center justify-center z-10 rounded-lg">
								<span class="animate-spin rounded-full border-2 border-white/50 border-t-2 border-t-white size-6"></span>
							</span>
						</button>
						<span id="accessibility-form-status" class="block mt-3 text-gray-600"></span>
					</div>

					{error && (
						<div
							id="accessibility-form-error"
							class="empty:hidden text-red-600 mt-4 p-4 bg-red-50 rounded-md border border-red-300 text-center"
						>
							{error}
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
