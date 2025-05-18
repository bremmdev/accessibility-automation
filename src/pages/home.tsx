import AccessibilityTestForm from '../components/AccessibilityTestForm';

export default function Home() {
	return (
		<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 class="text-4xl font-bold mb-4">Accessibility Testing</h1>
			<AccessibilityTestForm />
			<div id="results"></div>
		</div>
	);
}
